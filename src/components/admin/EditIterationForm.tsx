"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateIteration } from "@/lib/actions";
import AdminBar from "@/components/admin/AdminBar";
import DeleteIterationButton from "@/components/admin/DeleteIterationButton";
import AssetUploader from "@/components/admin/AssetUploader";
import type { IterationStatus, IterationAsset } from "@/lib/types";

type Props = {
  iterationId: string;
  projectNumber: number;
  initialValues: {
    versionLabel: string;
    status: IterationStatus;
    planMarkdown: string;
    learningsRaw: string;
    learningsSummary: string;
    timeSpentMinutes: number;
  };
  checkedItemCount: number;
  totalItemCount: number;
  assets: IterationAsset[];
  onCancel: () => void;
};

export default function EditIterationForm({
  iterationId,
  projectNumber,
  initialValues,
  checkedItemCount,
  totalItemCount,
  assets,
  onCancel,
}: Props) {
  const [versionLabel, setVersionLabel] = useState(initialValues.versionLabel);
  const [status, setStatus] = useState<IterationStatus>(initialValues.status);
  const [planMarkdown, setPlanMarkdown] = useState(initialValues.planMarkdown);
  const [learningsRaw, setLearningsRaw] = useState(initialValues.learningsRaw);
  const [learningsSummary, setLearningsSummary] = useState(
    initialValues.learningsSummary
  );
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(
    initialValues.timeSpentMinutes
  );
  const [confirmReparse, setConfirmReparse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const planChanged = planMarkdown !== initialValues.planMarkdown;
  const needsReparseWarning =
    planChanged && totalItemCount > 0 && checkedItemCount > 0;

  const hours = Math.floor(timeSpentMinutes / 60);
  const mins = timeSpentMinutes % 60;

  const handleSave = () => {
    setError(null);

    if (!versionLabel.trim()) {
      setError("Version label is required.");
      return;
    }

    if (needsReparseWarning && !confirmReparse) {
      setError(
        "Please confirm you want to replace the checklist items before saving."
      );
      return;
    }

    startTransition(async () => {
      const result = await updateIteration({
        id: iterationId,
        versionLabel: versionLabel.trim(),
        status,
        planMarkdown: planMarkdown,
        planMarkdownChanged: planChanged,
        learningsRaw: learningsRaw,
        learningsSummary: learningsSummary,
        timeSpentMinutes,
      });

      if ("error" in result) {
        setError(result.error);
      } else {
        onCancel(); // exit edit mode
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Version Label */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-text-muted font-semibold mb-1 font-body">
          Version Label
        </label>
        <input
          type="text"
          value={versionLabel}
          onChange={(e) => setVersionLabel(e.target.value)}
          className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-text-body text-sm font-body focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-text-muted font-semibold mb-1 font-body">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as IterationStatus)}
          className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-text-body text-sm font-body focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
        >
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      {/* Plan Markdown */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-text-muted font-semibold mb-1 font-body">
          Plan Markdown
        </label>
        <textarea
          value={planMarkdown}
          onChange={(e) => {
            setPlanMarkdown(e.target.value);
            setConfirmReparse(false);
          }}
          placeholder="Paste your project plan here. Use ## for phase headers and numbered lists for tasks."
          rows={10}
          className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-text-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber min-h-[200px]"
        />

        {/* Re-parse warning */}
        {needsReparseWarning && (
          <div className="mt-3 bg-rose-wash border border-rose/20 rounded-lg p-4">
            <p className="text-sm text-rose-dark font-body mb-2">
              Updating the plan will replace all checklist items.{" "}
              <strong>{checkedItemCount}</strong> items are currently checked.
              This cannot be undone.
            </p>
            <label className="flex items-center gap-2 text-sm text-text-body font-body cursor-pointer">
              <input
                type="checkbox"
                checked={confirmReparse}
                onChange={(e) => setConfirmReparse(e.target.checked)}
                className="w-4 h-4 rounded border-rose accent-rose"
              />
              I understand, replace checklist
            </label>
          </div>
        )}
      </div>

      {/* Learnings Raw */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-text-muted font-semibold mb-1 font-body">
          Raw Notes
        </label>
        <textarea
          value={learningsRaw}
          onChange={(e) => setLearningsRaw(e.target.value)}
          placeholder="Paste your raw notes, observations, and thoughts here."
          rows={8}
          className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-text-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber min-h-[200px]"
        />
      </div>

      {/* Learnings Summary */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-text-muted font-semibold mb-1 font-body">
          Processed Summary
        </label>
        <textarea
          value={learningsSummary}
          onChange={(e) => setLearningsSummary(e.target.value)}
          placeholder="Paste your AI-processed summary here (from Claude, ChatGPT, etc.)"
          rows={6}
          className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-text-body text-base font-display focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber min-h-[150px]"
        />
        <p className="text-xs text-text-caption font-body mt-1">
          Process your raw notes through an LLM and paste the cleaned summary
          here.
        </p>
      </div>

      {/* Attachments */}
      <AssetUploader iterationId={iterationId} existingAssets={assets} />

      {/* Time Spent */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-text-muted font-semibold mb-1 font-body">
          Total Time (Minutes)
        </label>
        <input
          type="number"
          value={timeSpentMinutes}
          onChange={(e) =>
            setTimeSpentMinutes(Math.max(0, parseInt(e.target.value) || 0))
          }
          min={0}
          className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-text-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
        />
        <p className="text-xs text-text-caption font-body mt-1">
          {hours > 0 ? `${hours} hour${hours !== 1 ? "s" : ""}` : ""}
          {hours > 0 && mins > 0 ? " " : ""}
          {mins > 0 ? `${mins} minute${mins !== 1 ? "s" : ""}` : ""}
          {hours === 0 && mins === 0 ? "0 minutes" : ""}
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-rose font-body">{error}</p>
      )}

      {/* Delete */}
      <div className="pt-4 border-t border-border">
        <DeleteIterationButton
          iterationId={iterationId}
          projectNumber={projectNumber}
        />
      </div>

      {/* Sticky save/cancel bar */}
      <AdminBar onSave={handleSave} onCancel={onCancel} isPending={isPending} />
    </div>
  );
}
