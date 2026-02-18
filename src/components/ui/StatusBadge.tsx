import type { IterationStatus } from "@/lib/types";

const statusConfig: Record<
  IterationStatus,
  { label: string; className: string; dotColor: string }
> = {
  not_started: {
    label: "Not Started",
    className: "bg-border/50 text-text-muted",
    dotColor: "bg-text-caption",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-wash text-amber-dark",
    dotColor: "bg-amber",
  },
  complete: {
    label: "Complete",
    className: "bg-sage-wash text-sage-dark",
    dotColor: "bg-sage",
  },
};

type StatusBadgeProps = {
  status: IterationStatus;
  size?: "sm" | "md";
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold font-body ${sizeClass} ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
