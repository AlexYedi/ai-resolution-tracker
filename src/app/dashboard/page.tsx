import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Project } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: iterations } = await supabase
    .from("iterations")
    .select("*");

  const completedCount = iterations
    ? iterations.filter((i) => i.status === "complete").length
    : 0;
  const totalIterations = iterations ? iterations.length : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="mb-10">
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
          Dashboard
        </h1>
        <p className="text-text-muted font-body">
          Track your progress across all 10 weekends.
        </p>
      </section>

      <div className="bg-card rounded-xl p-6 shadow-warm border border-border mb-8">
        <ProgressBar
          value={completedCount}
          max={totalIterations || 1}
          label="Overall Progress"
        />
      </div>

      {projects && projects.length > 0 ? (
        <div className="space-y-3">
          {(projects as Project[]).map((project) => (
            <div
              key={project.id}
              className="bg-card rounded-xl p-5 shadow-warm border border-border flex items-center gap-4"
            >
              <span className="font-mono text-amber text-sm font-medium w-10">
                {project.number === 0
                  ? "B"
                  : String(project.number).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <h3 className="font-display text-base font-bold text-text-primary">
                  {project.title}
                </h3>
                <p className="text-sm text-text-muted font-body">
                  {project.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-paper rounded-xl p-12 text-center border border-border">
          <p className="text-text-muted font-body">
            No projects yet. Run the seed script to populate data.
          </p>
        </div>
      )}
    </div>
  );
}
