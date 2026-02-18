import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { Iteration } from "@/lib/types";

type TimelineNodeProps = {
  iteration: Iteration;
  projectNumber: number;
  totalChecklistItems: number;
  completedChecklistItems: number;
  isLast: boolean;
};

function formatTime(minutes: number): string {
  if (minutes === 0) return "0 hrs";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs} hr${hrs !== 1 ? "s" : ""}`;
  return `${hrs}h ${mins}m`;
}

export default function TimelineNode({
  iteration,
  projectNumber,
  totalChecklistItems,
  completedChecklistItems,
  isLast,
}: TimelineNodeProps) {
  const dotColor =
    iteration.status === "complete"
      ? "bg-sage"
      : iteration.status === "in_progress"
      ? "bg-amber"
      : "bg-border ring-2 ring-border";

  const pulseClass =
    iteration.status === "in_progress" ? "animate-pulse" : "";

  return (
    <div className={`relative pl-10 ${!isLast ? "pb-8" : ""}`}>
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-3 bottom-0 w-0.5 bg-border" />
      )}

      {/* Dot */}
      <div
        className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center ${pulseClass}`}
      >
        <div className={`w-3 h-3 rounded-full ${dotColor}`} />
      </div>

      {/* Content */}
      <div className="bg-card rounded-xl p-5 shadow-warm border border-border">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-display text-lg font-bold text-text-primary">
              {iteration.version_label}
            </h3>
            <p className="text-sm text-text-muted font-body mt-1">
              {totalChecklistItems > 0
                ? `${completedChecklistItems}/${totalChecklistItems} checklist items done`
                : "No checklist items"}{" "}
              &middot; {formatTime(iteration.time_spent_minutes)}
            </p>
          </div>
          <StatusBadge status={iteration.status} />
        </div>
        <Link
          href={`/project/${projectNumber}/iteration/${iteration.id}`}
          className="inline-block mt-3 text-amber hover:text-amber-dark text-sm font-semibold font-body transition-colors"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
