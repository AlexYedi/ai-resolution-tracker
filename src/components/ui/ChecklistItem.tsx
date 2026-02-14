"use client";

type ChecklistItemProps = {
  label: string;
  isChecked: boolean;
  onToggle?: () => void;
  disabled?: boolean;
};

export default function ChecklistItem({
  label,
  isChecked,
  onToggle,
  disabled = false,
}: ChecklistItemProps) {
  return (
    <label
      className={`flex items-start gap-3 py-2 ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onToggle}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 rounded border-border text-amber focus:ring-amber"
      />
      <span
        className={`text-sm font-body ${
          isChecked ? "text-text-caption line-through" : "text-text-body"
        }`}
      >
        {label}
      </span>
    </label>
  );
}
