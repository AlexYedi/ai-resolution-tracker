import type { IterationStatus } from "@/lib/types";

const statusConfig: Record<
  IterationStatus,
  { label: string; className: string }
> = {
  not_started: {
    label: "Not Started",
    className: "bg-border text-text-muted",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-wash text-amber-dark",
  },
  complete: {
    label: "Complete",
    className: "bg-sage-wash text-sage-dark",
  },
};

type StatusBadgeProps = {
  status: IterationStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body ${config.className}`}
    >
      {config.label}
    </span>
  );
}
