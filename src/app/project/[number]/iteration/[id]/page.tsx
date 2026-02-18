import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getIterationWithDetails, formatMinutes } from "@/lib/data";
import Breadcrumb from "@/components/ui/Breadcrumb";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import type { ChecklistItem } from "@/lib/types";

type PageProps = {
  params: { number: string; id: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const iteration = await getIterationWithDetails(params.id);
  if (!iteration) return { title: "Iteration Not Found" };

  return {
    title: `${iteration.version_label} — ${iteration.project.title}`,
    description: `Iteration details for ${iteration.version_label} of Weekend ${iteration.project.number}: ${iteration.project.title}`,
  };
}

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

export default async function IterationDetailPage({ params }: PageProps) {
  const iteration = await getIterationWithDetails(params.id);

  if (!iteration) {
    notFound();
  }

  const project = iteration.project;
  const checklistItems = iteration.checklistItems;
  const timeLogs = iteration.timeLogs;

  const totalTasks = checklistItems.length;
  const completedTasks = checklistItems.filter((c) => c.is_checked).length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalLoggedMinutes = timeLogs.reduce(
    (sum, t) => sum + (t.duration_minutes || 0),
    0
  );
  const displayTime =
    iteration.time_spent_minutes > 0
      ? iteration.time_spent_minutes
      : totalLoggedMinutes;

  const phaseGroups = groupByPhase(checklistItems);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Projects", href: "/" },
          {
            label: `Weekend ${project.number}: ${project.title}`,
            href: `/project/${project.number}`,
          },
          { label: iteration.version_label },
        ]}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-amber text-xs font-medium uppercase tracking-widest">
            Weekend {project.number}
          </span>
          <StatusBadge status={iteration.status} />
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

      {/* The Plan */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text-primary mb-4">
          The Plan
        </h2>

        {phaseGroups.length > 0 ? (
          <div className="space-y-6">
            {phaseGroups.map((group) => (
              <div key={group.label}>
                <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-text-muted mb-3">
                  {group.label}
                </h3>
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
                      <span className="mt-0.5 flex-shrink-0">
                        {item.is_checked ? (
                          <svg
                            className="w-5 h-5 text-sage"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-text-caption"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <circle cx="12" cy="12" r="9" />
                          </svg>
                        )}
                      </span>
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
            ))}
          </div>
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
                        : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Total */}
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
    </div>
  );
}
