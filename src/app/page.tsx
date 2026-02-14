import { createClient } from "@/lib/supabase/server";
import ProjectCard from "@/components/ui/ProjectCard";
import type { Project } from "@/lib/types";

export default async function HomePage() {
  const supabase = createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="mb-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-3">
          10-Weekend AI Resolution
        </h1>
        <p className="text-lg text-text-muted font-body max-w-2xl">
          A hands-on journey through AI fluency — one weekend project at a time.
        </p>
      </section>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(projects as Project[]).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="bg-paper rounded-xl p-12 text-center border border-border">
          <p className="text-text-muted font-body">
            No projects loaded yet. Seed the database to get started.
          </p>
        </div>
      )}
    </div>
  );
}
