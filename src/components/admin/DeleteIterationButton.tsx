"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteIteration } from "@/lib/actions";

type Props = {
  iterationId: string;
  projectNumber: number;
};

export default function DeleteIterationButton({
  iterationId,
  projectNumber,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Delete this iteration? This cannot be undone."
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteIteration(iterationId);
      if ("error" in result) {
        alert(`Error: ${result.error}`);
      } else {
        router.push(`/project/${projectNumber}`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-rose hover:text-rose-dark text-sm font-semibold transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete Iteration"}
    </button>
  );
}
