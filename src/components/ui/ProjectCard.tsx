import Link from "next/link";
import ProgressBar from "./ProgressBar";
import type { ProjectWithProgress } from "@/lib/types";

type ProjectCardProps = {
  project: ProjectWithProgress;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const hasComplete = project.completedIterations > 0;
  const hasInProgress = project.inProgressIterations > 0;
  const statusDotColor = hasComplete
    ? "bg-sage"
    : hasInProgress
    ? "bg-amber"
    : "bg-border";

  const iterationCount = project.iterations.length;
  const checklistPercent =
    project.totalChecklistItems > 0
      ? (project.completedChecklistItems / project.totalChecklistItems) * 100
      : 0;

  return (
    <Link href={`/project/${project.number}`}>
      <div className="bg-card rounded-2xl p-6 shadow-warm hover:shadow-lg transition-shadow duration-200 border border-border h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          {project.number === 0 ? (
            <span className="bg-rose-wash text-rose-dark text-xs font-semibold px-2 py-0.5 rounded-full font-body">
              BONUS
            </span>
          ) : (
            <span className="bg-amber-wash text-amber-dark text-xs font-semibold px-2 py-0.5 rounded-full font-body">
              Weekend {project.number}
            </span>
          )}
          <span className={`w-2.5 h-2.5 rounded-full mt-1 ${statusDotColor}`} />
        </div>

        <h3 className="font-display text-xl font-bold text-text-primary mb-1">
          {project.title}
        </h3>
        <p className="text-sm text-text-muted font-body mb-3">
          {project.subtitle}
        </p>

        {project.deliverable && (
          <p className="text-sm text-text-body font-body line-clamp-2 mb-4 flex-1">
            {project.deliverable}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-caption font-body">
              {iterationCount > 0
                ? `${iterationCount} iteration${iterationCount !== 1 ? "s" : ""}`
                : "No iterations yet"}
            </span>
          </div>
          {iterationCount > 0 && project.totalChecklistItems > 0 && (
            <ProgressBar value={checklistPercent} size="sm" />
          )}
        </div>
      </div>
    </Link>
  );
}
