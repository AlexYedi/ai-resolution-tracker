"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { parsePlanMarkdown } from "@/lib/parse-plan";
import type { IterationStatus } from "@/lib/types";

// ── Auth helper ──────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Not authorized");

  return { supabase, userId: user.id };
}

// ── Iteration CRUD ───────────────────────────────────────────────────

export async function createIteration(data: {
  projectId: string;
  versionLabel: string;
  planMarkdown?: string;
  status: IterationStatus;
}): Promise<{ id: string } | { error: string }> {
  try {
    const { supabase } = await requireAdmin();

    // Get next sort_order
    const { data: existing } = await supabase
      .from("iterations")
      .select("sort_order")
      .eq("project_id", data.projectId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextSortOrder =
      existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data: iteration, error } = await supabase
      .from("iterations")
      .insert({
        project_id: data.projectId,
        version_label: data.versionLabel,
        plan_markdown: data.planMarkdown || null,
        status: data.status,
        sort_order: nextSortOrder,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    if (!iteration) return { error: "Failed to create iteration" };

    // Parse plan markdown into checklist items
    if (data.planMarkdown) {
      const items = parsePlanMarkdown(data.planMarkdown);
      if (items.length > 0) {
        const rows = items.map((item) => ({
          iteration_id: iteration.id,
          phase_label: item.phase_label,
          label: item.label,
          sort_order: item.sort_order,
        }));
        await supabase.from("checklist_items").insert(rows);
      }
    }

    // Revalidate relevant pages
    revalidatePath("/");

    return { id: iteration.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateIteration(data: {
  id: string;
  versionLabel?: string;
  planMarkdown?: string;
  planMarkdownChanged?: boolean;
  learningsRaw?: string;
  learningsSummary?: string;
  status?: IterationStatus;
  timeSpentMinutes?: number;
}): Promise<{ success: boolean } | { error: string }> {
  try {
    const { supabase } = await requireAdmin();

    // Build update object — only include fields that are provided
    const update: Record<string, unknown> = {};
    if (data.versionLabel !== undefined) update.version_label = data.versionLabel;
    if (data.planMarkdown !== undefined) update.plan_markdown = data.planMarkdown;
    if (data.learningsRaw !== undefined) update.learnings_raw = data.learningsRaw;
    if (data.learningsSummary !== undefined)
      update.learnings_summary = data.learningsSummary;
    if (data.status !== undefined) update.status = data.status;
    if (data.timeSpentMinutes !== undefined)
      update.time_spent_minutes = data.timeSpentMinutes;

    const { error } = await supabase
      .from("iterations")
      .update(update)
      .eq("id", data.id);

    if (error) return { error: error.message };

    // Re-parse plan if changed
    if (data.planMarkdownChanged && data.planMarkdown !== undefined) {
      // If iteration was complete, adding new items should revert to in_progress
      // (unless the caller already set status explicitly)
      if (data.status === undefined) {
        const { data: currentIteration } = await supabase
          .from("iterations")
          .select("status")
          .eq("id", data.id)
          .single();
        if (currentIteration?.status === "complete") {
          await supabase
            .from("iterations")
            .update({ status: "in_progress" })
            .eq("id", data.id);
        }
      }

      // Delete existing checklist items
      await supabase
        .from("checklist_items")
        .delete()
        .eq("iteration_id", data.id);

      // Parse and insert new items
      if (data.planMarkdown) {
        const items = parsePlanMarkdown(data.planMarkdown);
        if (items.length > 0) {
          const rows = items.map((item) => ({
            iteration_id: data.id,
            phase_label: item.phase_label,
            label: item.label,
            sort_order: item.sort_order,
          }));
          await supabase.from("checklist_items").insert(rows);
        }
      }
    }

    // Revalidate
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteIteration(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("iterations")
      .delete()
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/");

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Checklist ────────────────────────────────────────────────────────

export async function toggleChecklistItem(
  itemId: string,
  checked: boolean
): Promise<{ success: boolean; newStatus?: IterationStatus } | { error: string }> {
  try {
    const { supabase, userId } = await requireAdmin();

    // Fetch the checklist item to get iteration_id
    const { data: item } = await supabase
      .from("checklist_items")
      .select("iteration_id")
      .eq("id", itemId)
      .single();

    if (!item) return { error: "Checklist item not found" };
    const iterationId = item.iteration_id as string;

    // Toggle the checkbox
    const { error: toggleError } = await supabase
      .from("checklist_items")
      .update({
        is_checked: checked,
        checked_by: checked ? userId : null,
        checked_at: checked ? new Date().toISOString() : null,
      })
      .eq("id", itemId);

    if (toggleError) return { error: toggleError.message };

    // Count total and checked items for this iteration (post-toggle)
    const { data: countData } = await supabase
      .from("checklist_items")
      .select("is_checked")
      .eq("iteration_id", iterationId);

    const allItems = countData ?? [];
    const total = allItems.length;
    const checkedCount = allItems.filter((i) => i.is_checked).length;

    // Fetch current iteration status
    const { data: iteration } = await supabase
      .from("iterations")
      .select("status")
      .eq("id", iterationId)
      .single();

    const currentStatus = iteration?.status as IterationStatus | undefined;

    // Apply auto-status rules
    let newStatus: IterationStatus | null = null;

    if (total === 0) {
      // No checklist items — no auto-change
    } else if (checkedCount === total) {
      // All checked → complete
      if (currentStatus !== "complete") {
        newStatus = "complete";
      }
    } else if (checkedCount > 0) {
      // Some checked
      if (currentStatus === "complete" || currentStatus === "not_started") {
        newStatus = "in_progress";
      }
    }
    // checkedCount === 0: don't revert to not_started

    if (newStatus) {
      console.error(
        `[toggleChecklistItem] Updating iteration ${iterationId} status: ${currentStatus} → ${newStatus} (${checkedCount}/${total} checked)`
      );
      await supabase
        .from("iterations")
        .update({ status: newStatus })
        .eq("id", iterationId);
    }

    revalidatePath("/");

    return { success: true, newStatus: newStatus ?? undefined };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Time logs ────────────────────────────────────────────────────────

export async function createTimeLog(data: {
  iterationId: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  note?: string;
}): Promise<{ success: boolean } | { error: string }> {
  try {
    const { supabase, userId } = await requireAdmin();

    const { error } = await supabase.from("time_logs").insert({
      iteration_id: data.iterationId,
      user_id: userId,
      started_at: data.startedAt,
      ended_at: data.endedAt || null,
      duration_minutes: data.durationMinutes || null,
      note: data.note || null,
    });

    if (error) return { error: error.message };

    revalidatePath("/");

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Iteration assets ─────────────────────────────────────────────────

export async function createIterationAsset(data: {
  iterationId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  caption?: string;
}): Promise<{ id: string } | { error: string }> {
  try {
    const { supabase } = await requireAdmin();

    // Get next sort_order
    const { data: existing } = await supabase
      .from("iteration_assets")
      .select("sort_order")
      .eq("iteration_id", data.iterationId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextSortOrder =
      existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data: asset, error } = await supabase
      .from("iteration_assets")
      .insert({
        iteration_id: data.iterationId,
        file_url: data.fileUrl,
        file_name: data.fileName,
        file_type: data.fileType,
        file_size: data.fileSize,
        caption: data.caption || null,
        sort_order: nextSortOrder,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    if (!asset) return { error: "Failed to create asset" };

    revalidatePath("/");
    return { id: asset.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateAssetCaption(
  assetId: string,
  caption: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("iteration_assets")
      .update({ caption })
      .eq("id", assetId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteIterationAsset(
  assetId: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const { supabase } = await requireAdmin();

    // Fetch asset to get file_url for storage deletion
    const { data: asset } = await supabase
      .from("iteration_assets")
      .select("file_url")
      .eq("id", assetId)
      .single();

    if (!asset) return { error: "Asset not found" };

    // Extract storage path from public URL
    // URL format: .../storage/v1/object/public/iteration-assets/{path}
    const urlParts = asset.file_url.split("/iteration-assets/");
    if (urlParts.length === 2) {
      const storagePath = urlParts[1];
      await supabase.storage.from("iteration-assets").remove([storagePath]);
    }

    // Delete the database row
    const { error } = await supabase
      .from("iteration_assets")
      .delete()
      .eq("id", assetId);

    if (error) return { error: error.message };

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Auth check helper (for server components) ────────────────────────

export async function getIsAdmin(): Promise<boolean> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}
