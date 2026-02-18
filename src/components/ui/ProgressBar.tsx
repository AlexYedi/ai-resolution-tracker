type ProgressBarProps = {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

const sizeMap = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export default function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={`flex items-center gap-3 w-full ${className}`}>
      <div
        className={`flex-1 bg-border rounded-full overflow-hidden ${sizeMap[size]}`}
      >
        <div
          className={`${sizeMap[size]} bg-gradient-to-r from-amber to-sage rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-mono text-text-muted whitespace-nowrap">
          {percent}%
        </span>
      )}
    </div>
  );
}
