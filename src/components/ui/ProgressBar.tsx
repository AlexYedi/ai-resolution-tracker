type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
};

export default function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-body text-text-body">{label}</span>
          <span className="text-sm font-mono text-text-muted">{percent}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-amber rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
