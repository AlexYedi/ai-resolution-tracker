import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getProjectByNumber } from "@/lib/data";
import { getIsAdmin } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import TimelineNode from "@/components/ui/TimelineNode";
import CreateIterationForm from "@/components/admin/CreateIterationForm";
import type { ChecklistItem } from "@/lib/types";

type Props = {
  params: { number: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectByNumber(Number(params.number));
  if (!project) return { title: "Project Not Found" };
  const label =
    project.number === 0 ? "Bonus" : `Weekend ${project.number}`;
  return {
    title: `${label}: ${project.title}`,
    description: project.deliverable || project.subtitle,
  };
}

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const projectNumber = parseInt(params.number, 10);
  const project = await getProjectByNumber(projectNumber);

  if (!project) {
    notFound();
  }

  // Get per-iteration checklist counts for timeline nodes
  const supabase = createClient();
  const iterationIds = project.iterations.map((i) => i.id);
  const checklistByIteration: Record<
    string,
    { total: number; completed: number }
  > = {};

  if (iterationIds.length > 0) {
    const { data: checklistItems } = await supabase
      .from("checklist_items")
      .select("*")
      .in("iteration_id", iterationIds);

    const items = (checklistItems ?? []) as ChecklistItem[];
    for (const id of iterationIds) {
      const iterItems = items.filter((c) => c.iteration_id === id);
      checklistByIteration[id] = {
        total: iterItems.length,
        completed: iterItems.filter((c) => c.is_checked).length,
      };
    }
  }

  const isAdmin = await getIsAdmin();
  const autoOpenNew = searchParams?.new === "1";

  const weekendLabel =
    project.number === 0 ? "BONUS" : `WEEKEND ${project.number}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Projects", href: "/" },
          {
            label:
              project.number === 0
                ? "Bonus"
                : `Weekend ${project.number}`,
          },
        ]}
      />

      {/* Hero illustration banner */}
      {project.illustration_url && (
        <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden mb-8">
          <Image
            src={project.illustration_url}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/60 to-transparent" />
        </div>
      )}

      {/* Header */}
      <section className="mb-10">
        <p className="text-xs uppercase tracking-widest text-amber font-semibold font-body mb-2">
          {weekendLabel}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-text-primary mb-2">
          {project.title}
        </h1>
        <p className="font-display text-xl text-text-muted mb-6">
          {project.subtitle}
        </p>

        {/* Deliverable card */}
        {project.deliverable && (
          <div className="bg-sage-wash border border-sage/20 rounded-xl p-6">
            <p className="text-xs uppercase tracking-widest text-sage-dark font-bold font-body mb-2">
              The Deliverable
            </p>
            <p className="font-display text-lg text-text-primary">
              {project.deliverable}
            </p>
          </div>
        )}
      </section>

      {/* Two-column content */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
        {/* Left column — wider */}
        <div className="lg:col-span-3 space-y-6">
          {project.description_work && (
            <div>
              <h2 className="font-display text-2xl font-bold text-text-primary mb-3">
                The Work
              </h2>
              <p className="text-text-body font-body leading-relaxed whitespace-pre-line">
                {project.description_work}
              </p>
            </div>
          )}

          {project.done_when && (
            <div className="bg-amber-wash border border-amber/20 rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-amber-dark font-bold font-body mb-2">
                Done When
              </p>
              <p className="text-text-body font-body leading-relaxed">
                {project.done_when}
              </p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {project.description_advanced && (
            <div className="bg-paper rounded-xl p-6 border border-border">
              <h2 className="text-xs uppercase tracking-widest text-text-muted font-bold font-body mb-3">
                Advanced
              </h2>
              <p className="text-text-body font-body leading-relaxed whitespace-pre-line">
                {project.description_advanced}
              </p>
            </div>
          )}

          {project.why_it_matters && (
            <div>
              <h2 className="text-xs uppercase tracking-widest text-text-muted font-bold font-body mb-3">
                Why It Matters
              </h2>
              <p className="font-display italic text-text-body leading-relaxed">
                {project.why_it_matters}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Iterations Timeline */}
      <section>
        <h2 className="font-display text-2xl font-bold text-text-primary mb-6">
          Iterations
        </h2>

        {project.iterations.length > 0 ? (
          <div className="ml-2">
            {project.iterations.map((iteration, index) => (
              <TimelineNode
                key={iteration.id}
                iteration={iteration}
                projectNumber={project.number}
                totalChecklistItems={
                  checklistByIteration[iteration.id]?.total ?? 0
                }
                completedChecklistItems={
                  checklistByIteration[iteration.id]?.completed ?? 0
                }
                isLast={index === project.iterations.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="bg-paper rounded-xl p-8 text-center border border-border">
            <p className="text-text-muted font-body">
              No iterations yet.
            </p>
            <p className="text-text-caption font-body text-sm mt-1">
              This project hasn&rsquo;t been started.
            </p>
          </div>
        )}

        {/* Admin: Create Iteration */}
        {isAdmin && (
          <div className="mt-6">
            <CreateIterationForm projectId={project.id} defaultOpen={autoOpenNew} />
          </div>
        )}
      </section>
    </div>
  );
}
