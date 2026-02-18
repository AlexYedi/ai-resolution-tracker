"use client";

import { useState, useTransition } from "react";
import { createIteration } from "@/lib/actions";
import type { IterationStatus } from "@/lib/types";

type Props = {
  projectId: string;
  defaultOpen?: boolean;
  onCreated?: () => void;
};

export default function CreateIterationForm({ projectId, defaultOpen = false, onCreated }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [versionLabel, setVersionLabel] = useState("");
  const [planMarkdown, setPlanMarkdown] = useState("");
  const [status, setStatus] = useState<IterationStatus>("not_started");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!versionLabel.trim()) {
      setError("Version label is required.");
      return;
    }

    startTransition(async () => {
      const result = await createIteration({
        projectId,
        versionLabel: versionLabel.trim(),
        planMarkdown: planMarkdown.trim() || undefined,
        status,
      });

      if ("error" in result) {
        setError(result.error);
      } else {
        // Reset form and close
        setVersionLabel("");
        setPlanMarkdown("");
        setStatus("not_started");
        setIsOpen(false);
        onCreated?.();
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-amber text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-amber-dark transition-colors shadow-warm"
      >
        + New Iteration
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper rounded-xl border border-border p-6 mt-4 shadow-warm"
    >
      <div className="space-y-5">
        {/* Version Label */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-muted font-semibold mb-1 font-body">
            Version Label
          </label>
          <input
            type="text"
            value={versionLabel}
            onChange={(e) => setVersionLabel(e.target.value)}
            placeholder='e.g., v1 — Lovable Build'
            required
            className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-text-body text-sm font-body focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
          />
        </div>

        {/* Plan Markdown */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-muted font-semibold mb-1 font-body">
            Plan Markdown
          </label>
          <textarea
            value={planMarkdown}
            onChange={(e) => setPlanMarkdown(e.target.value)}
            placeholder="Paste your project plan here. Use ## for phase headers and numbered lists for tasks."
            rows={8}
            className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-text-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber min-h-[200px]"
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

        {/* Error */}
        {error && (
          <p className="text-sm text-rose font-body">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="bg-amber text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating..." : "Create Iteration"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setError(null);
            }}
            className="text-text-muted text-sm font-semibold hover:text-text-body transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
