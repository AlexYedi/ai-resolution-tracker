"use client";

import { useState, useCallback } from "react";
import { toggleChecklistItem } from "@/lib/actions";
import type { ChecklistItem } from "@/lib/types";

type Props = {
  items: ChecklistItem[];
  iterationId: string;
  isAdmin: boolean;
  onProgressChange?: (completed: number) => void;
};

function groupByPhase(items: ChecklistItem[]) {
  const groups: { label: string; items: ChecklistItem[] }[] = [];
  const map = new Map<string, ChecklistItem[]>();

  for (const item of items) {
    const key = item.phase_label ?? "Tasks";
    if (!map.has(key)) {
      map.set(key, []);
      groups.push({ label: key, items: map.get(key)! });
    }
    map.get(key)!.push(item);
  }

  return groups;
}

export default function InteractiveChecklist({
  items: initialItems,
  isAdmin,
  onProgressChange,
}: Props) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const handleToggle = useCallback(
    async (itemId: string) => {
      if (!isAdmin) return;

      // Optimistic update
      setItems((prev) => {
        const updated = prev.map((item) =>
          item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
        );
        // Notify parent of progress change
        const completed = updated.filter((i) => i.is_checked).length;
        onProgressChange?.(completed);
        return updated;
      });

      // Find current state before toggle
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const newChecked = !item.is_checked;
      const result = await toggleChecklistItem(itemId, newChecked);

      if ("error" in result) {
        // Revert on error
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, is_checked: item.is_checked } : i
          )
        );
        const reverted = items.filter((i) => i.is_checked).length;
        onProgressChange?.(reverted);
      }
    },
    [isAdmin, items, onProgressChange]
  );

  const phaseGroups = groupByPhase(items);

  if (phaseGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {phaseGroups.map((group) => {
        const groupCompleted = group.items.filter((i) => i.is_checked).length;
        const groupTotal = group.items.length;

        return (
          <div key={group.label}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-text-muted">
                {group.label}
              </h3>
              <span className="text-xs font-mono text-text-caption">
                {groupCompleted}/{groupTotal} complete
              </span>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {group.items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 px-4 py-3 ${
                    idx !== group.items.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    disabled={!isAdmin}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      item.is_checked
                        ? isAdmin
                          ? "bg-sage border-sage cursor-pointer"
                          : "bg-sage border-sage cursor-default"
                        : isAdmin
                        ? "border-amber cursor-pointer hover:border-amber-dark hover:bg-amber-wash"
                        : "border-text-caption cursor-default"
                    }`}
                    aria-label={`${item.is_checked ? "Uncheck" : "Check"}: ${item.label}`}
                  >
                    {item.is_checked && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Label */}
                  <span
                    className={`text-sm font-body ${
                      item.is_checked
                        ? "text-text-muted line-through"
                        : "text-text-body"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
