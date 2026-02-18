import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProgressBar from "@/components/ui/ProgressBar";
import StatCard from "@/components/ui/StatCard";
import { formatMinutes } from "@/lib/data";
import type { Metadata } from "next";
import type { Project, Iteration, ChecklistItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard",
};

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
    .select("*")
    .order("updated_at", { ascending: false });

  const { data: checklistItems } = await supabase
    .from("checklist_items")
    .select("*");

  const allProjects = (projects ?? []) as Project[];
  const allIterations = (iterations ?? []) as Iteration[];
  const allChecklist = (checklistItems ?? []) as ChecklistItem[];

  // Stats
  const completedIterations = allIterations.filter(
    (i) => i.status === "complete"
  ).length;
  const inProgressIterations = allIterations.filter(
    (i) => i.status === "in_progress"
  ).length;
  const totalTimeMinutes = allIterations.reduce(
    (sum, i) => sum + (i.time_spent_minutes || 0),
    0
  );
  const totalTasksCompleted = allChecklist.filter((c) => c.is_checked).length;
  const totalTasks = allChecklist.length;

  // Per-project iteration counts and progress
  const projectStats = allProjects.map((project) => {
    const projIterations = allIterations.filter(
      (i) => i.project_id === project.id
    );
    const iterationIds = projIterations.map((i) => i.id);
    const projChecklist = allChecklist.filter((c) =>
      iterationIds.includes(c.iteration_id)
    );
    const completed = projChecklist.filter((c) => c.is_checked).length;
    const total = projChecklist.length;
    const hasInProgress = projIterations.some(
      (i) => i.status === "in_progress"
    );
    const allComplete =
      projIterations.length > 0 &&
      projIterations.every((i) => i.status === "complete");

    return {
      project,
      iterationCount: projIterations.length,
      checklistCompleted: completed,
      checklistTotal: total,
      progressPercent: total > 0 ? (completed / total) * 100 : 0,
      status: allComplete
        ? "complete"
        : hasInProgress
        ? "in_progress"
        : "not_started",
    };
  });

  // Recent activity — 5 most recently updated iterations
  const recentIterations = allIterations.slice(0, 5).map((iteration) => {
    const project = allProjects.find((p) => p.id === iteration.project_id);
    return { iteration, project };
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="mb-10">
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
          Dashboard
        </h1>
        <p className="text-text-muted font-body">
          Admin command center for your 10-weekend resolution.
        </p>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          value={completedIterations}
          label="Iterations Complete"
          color="sage"
        />
        <StatCard
          value={inProgressIterations}
          label="In Progress"
          color="amber"
        />
        <StatCard
          value={`${totalTasksCompleted}/${totalTasks}`}
          label="Tasks Done"
          color="default"
        />
        <StatCard
          value={formatMinutes(totalTimeMinutes)}
          label="Time Spent"
          color="rose"
        />
      </div>

      {/* Overall Progress */}
      <div className="bg-card rounded-xl p-6 shadow-warm border border-border mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-body font-medium text-text-body">
            Overall Iteration Progress
          </span>
          <span className="text-sm font-mono text-text-muted">
            {completedIterations} / {allIterations.length} iterations
          </span>
        </div>
        <ProgressBar
          value={
            allIterations.length > 0
              ? (completedIterations / allIterations.length) * 100
              : 0
          }
          size="md"
          showLabel
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project List */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            Projects
          </h2>
          {projectStats.length > 0 ? (
            <div className="space-y-3">
              {projectStats.map(({ project, iterationCount, progressPercent, status }) => (
                <div
                  key={project.id}
                  className="bg-card rounded-xl p-5 shadow-warm border border-border"
                >
                  <div className="flex items-center gap-4">
                    {/* Weekend number */}
                    <span className="font-mono text-amber text-sm font-medium w-10 flex-shrink-0">
                      {project.number === 0
                        ? "B"
                        : String(project.number).padStart(2, "0")}
                    </span>

                    {/* Status dot */}
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        status === "complete"
                          ? "bg-sage"
                          : status === "in_progress"
                          ? "bg-amber animate-pulse"
                          : "bg-border"
                      }`}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/project/${project.number}`}
                        className="font-display text-base font-bold text-text-primary hover:text-amber transition-colors"
                      >
                        {project.title}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-text-muted font-body mt-0.5">
                        <span>{iterationCount} iteration{iterationCount !== 1 ? "s" : ""}</span>
                        {progressPercent > 0 && (
                          <span>{Math.round(progressPercent)}% complete</span>
                        )}
                      </div>
                    </div>

                    {/* Quick action */}
                    <Link
                      href={`/project/${project.number}?new=1`}
                      className="text-amber hover:text-amber-dark text-xs font-semibold transition-colors flex-shrink-0"
                    >
                      + Iteration
                    </Link>
                  </div>

                  {/* Mini progress bar */}
                  {progressPercent > 0 && (
                    <div className="mt-3 ml-14">
                      <ProgressBar value={progressPercent} size="sm" />
                    </div>
                  )}
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

        {/* Recent Activity */}
        <div>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            Recent Activity
          </h2>
          {recentIterations.length > 0 ? (
            <div className="space-y-3">
              {recentIterations.map(({ iteration, project }) => {
                if (!project) return null;
                const updated = new Date(iteration.updated_at);
                const now = new Date();
                const diffMs = now.getTime() - updated.getTime();
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffHours / 24);
                const timeAgo =
                  diffDays > 0
                    ? `${diffDays}d ago`
                    : diffHours > 0
                    ? `${diffHours}h ago`
                    : "Just now";

                return (
                  <Link
                    key={iteration.id}
                    href={`/project/${project.number}/iteration/${iteration.id}`}
                    className="block bg-card rounded-xl p-4 border border-border hover:shadow-warm transition-shadow"
                  >
                    <p className="text-sm font-semibold text-text-body font-body truncate">
                      {iteration.version_label}
                    </p>
                    <p className="text-xs text-text-muted font-body mt-0.5">
                      Weekend {project.number} &middot; {timeAgo}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-paper rounded-xl p-8 text-center border border-border">
              <p className="text-text-muted text-sm font-body">
                No iterations yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
