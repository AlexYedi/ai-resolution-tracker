"use client";

type Props = {
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
};

export default function AdminBar({ onSave, onCancel, isPending }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex justify-end gap-3 z-30 shadow-warm">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="text-text-muted text-sm font-semibold hover:text-text-body transition-colors px-4 py-2"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={isPending}
        className="bg-amber text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
