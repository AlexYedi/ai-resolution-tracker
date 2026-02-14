import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Project } from "@/lib/types";

export default async function ProjectDetailPage({
  params,
}: {
  params: { number: string };
}) {
  const supabase = createClient();
  const projectNumber = parseInt(params.number, 10);

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("number", projectNumber)
    .single();

  if (!project) {
    notFound();
  }

  const typedProject = project as Project;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <span className="font-mono text-amber text-sm font-medium">
          Weekend{" "}
          {typedProject.number === 0
            ? "Bonus"
            : String(typedProject.number).padStart(2, "0")}
        </span>
        <h1 className="font-display text-3xl font-bold text-text-primary mt-1 mb-2">
          {typedProject.title}
        </h1>
        <p className="text-lg text-text-muted font-body">
          {typedProject.subtitle}
        </p>
      </div>

      <div className="space-y-6">
        {typedProject.deliverable && (
          <div className="bg-card rounded-xl p-6 shadow-warm border border-border">
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              Deliverable
            </h2>
            <p className="text-text-body font-body">{typedProject.deliverable}</p>
          </div>
        )}

        {typedProject.done_when && (
          <div className="bg-sage-wash rounded-xl p-6 border border-sage/20">
            <h2 className="font-display text-lg font-bold text-sage-dark mb-2">
              Done When
            </h2>
            <p className="text-text-body font-body">{typedProject.done_when}</p>
          </div>
        )}

        {typedProject.why_it_matters && (
          <div className="bg-amber-wash rounded-xl p-6 border border-amber/20">
            <h2 className="font-display text-lg font-bold text-amber-dark mb-2">
              Why It Matters
            </h2>
            <p className="text-text-body font-body">
              {typedProject.why_it_matters}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
