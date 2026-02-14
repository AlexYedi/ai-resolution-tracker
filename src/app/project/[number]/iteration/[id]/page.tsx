import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Iteration } from "@/lib/types";

export default async function IterationDetailPage({
  params,
}: {
  params: { number: string; id: string };
}) {
  const supabase = createClient();

  const { data: iteration } = await supabase
    .from("iterations")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!iteration) {
    notFound();
  }

  const typedIteration = iteration as Iteration;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-amber text-sm font-medium">
            Weekend {params.number}
          </span>
          <StatusBadge status={typedIteration.status} />
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {typedIteration.version_label}
        </h1>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-warm border border-border">
        <p className="text-text-muted font-body text-sm">
          Iteration detail view — full editing UI coming in Phase 3.
        </p>
        {typedIteration.plan_markdown && (
          <div className="mt-4 pt-4 border-t border-border">
            <h2 className="font-display text-base font-bold text-text-primary mb-2">
              Plan
            </h2>
            <pre className="text-sm text-text-body font-mono whitespace-pre-wrap bg-paper rounded-lg p-4">
              {typedIteration.plan_markdown}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
