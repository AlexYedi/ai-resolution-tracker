import Link from "next/link";
import type { Project } from "@/lib/types";

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${project.number}`}>
      <div className="bg-card rounded-xl p-6 shadow-warm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border border-border">
        <div className="flex items-start gap-4">
          <span className="font-mono text-amber text-sm font-medium">
            {project.number === 0
              ? "Bonus"
              : String(project.number).padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-bold text-text-primary mb-1 truncate">
              {project.title}
            </h3>
            <p className="text-sm text-text-muted font-body">
              {project.subtitle}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
