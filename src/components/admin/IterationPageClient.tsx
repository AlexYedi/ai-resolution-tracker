"use client";

import { useState, useCallback } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import StatusBadge from "@/components/ui/StatusBadge";
import InteractiveChecklist from "@/components/admin/InteractiveChecklist";
import EditIterationForm from "@/components/admin/EditIterationForm";
import { formatMinutes } from "@/lib/data-client";
import type {
  ChecklistItem,
  TimeLog,
  Project,
  Iteration,
} from "@/lib/types";

type Props = {
  iteration: Iteration;
  project: Project;
  checklistItems: ChecklistItem[];
  timeLogs: TimeLog[];
  isAdmin: boolean;
};

export default function IterationPageClient({
  iteration,
  project,
  checklistItems,
  timeLogs,
  isAdmin,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const totalTasks = checklistItems.length;
  const initialCompleted = checklistItems.filter((c) => c.is_checked).length;
  const [completedTasks, setCompletedTasks] = useState(initialCompleted);

  const progressPercent =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalLoggedMinutes = timeLogs.reduce(
    (sum, t) => sum + (t.duration_minutes || 0),
    0
  );
  const displayTime =
    iteration.time_spent_minutes > 0
      ? iteration.time_spent_minutes
      : totalLoggedMinutes;

  const handleProgressChange = useCallback(
    (completed: number) => {
      setCompletedTasks(completed);
    },
    []
  );

  if (isEditing) {
    return (
      <EditIterationForm
        iterationId={iteration.id}
        projectNumber={project.number}
        initialValues={{
          versionLabel: iteration.version_label,
          status: iteration.status,
          planMarkdown: iteration.plan_markdown || "",
          learningsRaw: iteration.learnings_raw || "",
          learningsSummary: iteration.learnings_summary || "",
          timeSpentMinutes: iteration.time_spent_minutes,
        }}
        checkedItemCount={initialCompleted}
        totalItemCount={totalTasks}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-amber text-xs font-medium uppercase tracking-widest">
              Weekend {project.number}
            </span>
            <StatusBadge status={iteration.status} />
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-amber/10 text-amber hover:bg-amber/20 hover:text-amber-dark text-sm font-semibold transition-colors px-3 py-1 rounded-lg border border-amber/30"
            >
              Edit Iteration
            </button>
          )}
        </div>
        <h1 className="font-display text-3xl font-black text-text-primary mb-2">
          {iteration.version_label}
        </h1>

        {/* Stats line */}
        <div className="flex items-center gap-4 text-sm text-text-muted font-body">
          {totalTasks > 0 && (
            <span>
              <span className="font-semibold text-text-body">
                {completedTasks}
              </span>{" "}
              / {totalTasks} tasks
            </span>
          )}
          {displayTime > 0 && (
            <span>
              <span className="font-semibold text-text-body">
                {formatMinutes(displayTime)}
              </span>{" "}
              spent
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="mb-10">
          <ProgressBar value={progressPercent} size="md" showLabel />
        </div>
      )}

      {/* The Plan — Interactive Checklist */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text-primary mb-4">
          The Plan
        </h2>

        {checklistItems.length > 0 ? (
          <InteractiveChecklist
            items={checklistItems}
            iterationId={iteration.id}
            isAdmin={isAdmin}
            onProgressChange={handleProgressChange}
          />
        ) : iteration.plan_markdown ? (
          <div className="bg-card rounded-xl border border-border p-6">
            <pre className="text-sm text-text-body font-mono whitespace-pre-wrap leading-relaxed">
              {iteration.plan_markdown}
            </pre>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <p className="text-text-muted text-sm italic">
              No plan documented yet for this iteration.
            </p>
          </div>
        )}
      </section>

      {/* The Learnings */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text-primary mb-4">
          The Learnings
        </h2>

        {iteration.learnings_summary ? (
          <div className="bg-sage-wash rounded-xl border border-sage/20 p-6 mb-4">
            <p className="text-text-body font-body text-sm leading-relaxed">
              {iteration.learnings_summary}
            </p>
          </div>
        ) : (
          !iteration.learnings_raw && (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <p className="text-text-muted text-sm italic">
                No learnings captured yet.
              </p>
            </div>
          )
        )}

        {iteration.learnings_raw && (
          <details className="bg-card rounded-xl border border-border overflow-hidden">
            <summary className="px-6 py-4 cursor-pointer text-sm font-semibold text-text-body font-body hover:bg-paper/50 transition-colors select-none">
              Raw Notes
            </summary>
            <div className="px-6 pb-6 pt-2 border-t border-border">
              <pre className="text-xs text-text-muted font-mono whitespace-pre-wrap leading-relaxed">
                {iteration.learnings_raw}
              </pre>
            </div>
          </details>
        )}
      </section>

      {/* Time Tracking */}
      {timeLogs.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            Time Tracking
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {timeLogs.map((log) => {
                const start = new Date(log.started_at);
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-text-muted">
                        {start.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {log.note && (
                        <span className="text-sm text-text-body font-body">
                          {log.note}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-mono text-text-body font-medium">
                      {log.duration_minutes
                        ? formatMinutes(log.duration_minutes)
                        : "\u2014"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="bg-paper/50 px-4 py-3 border-t border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-text-body">
                Total
              </span>
              <span className="text-sm font-mono font-bold text-amber">
                {formatMinutes(totalLoggedMinutes)}
              </span>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
