import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getIterationWithDetails } from "@/lib/data";
import { getIsAdmin } from "@/lib/actions";
import Breadcrumb from "@/components/ui/Breadcrumb";
import IterationPageClient from "@/components/admin/IterationPageClient";

type PageProps = {
  params: { number: string; id: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const iteration = await getIterationWithDetails(params.id);
  if (!iteration) return { title: "Iteration Not Found" };

  return {
    title: `${iteration.version_label} — ${iteration.project.title}`,
    description: `Iteration details for ${iteration.version_label} of Weekend ${iteration.project.number}: ${iteration.project.title}`,
  };
}

export default async function IterationDetailPage({ params }: PageProps) {
  const iteration = await getIterationWithDetails(params.id);

  if (!iteration) {
    notFound();
  }

  const isAdmin = await getIsAdmin();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Projects", href: "/" },
          {
            label: `Weekend ${iteration.project.number}: ${iteration.project.title}`,
            href: `/project/${iteration.project.number}`,
          },
          { label: iteration.version_label },
        ]}
      />

      <IterationPageClient
        iteration={{
          id: iteration.id,
          project_id: iteration.project_id,
          version_label: iteration.version_label,
          plan_markdown: iteration.plan_markdown,
          learnings_raw: iteration.learnings_raw,
          learnings_summary: iteration.learnings_summary,
          status: iteration.status,
          time_spent_minutes: iteration.time_spent_minutes,
          sort_order: iteration.sort_order,
          created_at: iteration.created_at,
          updated_at: iteration.updated_at,
        }}
        project={iteration.project}
        checklistItems={iteration.checklistItems}
        timeLogs={iteration.timeLogs}
        assets={iteration.assets}
        isAdmin={isAdmin}
      />
    </div>
  );
}
