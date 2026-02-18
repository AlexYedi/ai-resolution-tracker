type StatCardProps = {
  value: number | string;
  label: string;
  color?: "sage" | "amber" | "rose" | "default";
};

const colorMap = {
  sage: "text-sage",
  amber: "text-amber",
  rose: "text-rose",
  default: "text-text-primary",
};

export default function StatCard({
  value,
  label,
  color = "default",
}: StatCardProps) {
  return (
    <div className="bg-paper rounded-xl p-5 shadow-warm border border-border text-center">
      <p className={`font-display text-4xl font-bold ${colorMap[color]}`}>
        {value}
      </p>
      <p className="text-xs uppercase tracking-widest text-text-muted mt-1 font-body">
        {label}
      </p>
    </div>
  );
}
