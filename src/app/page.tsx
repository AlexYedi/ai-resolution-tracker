import { getProjectsWithProgress } from "@/lib/data";
import { formatMinutes } from "@/lib/data";
import ProjectCard from "@/components/ui/ProjectCard";
import StatCard from "@/components/ui/StatCard";
import ProgressBar from "@/components/ui/ProgressBar";

export default async function HomePage() {
  const projects = await getProjectsWithProgress();

  // Compute stats (bonus weekend number=0 doesn't count toward 10)
  const mainProjects = projects.filter((p) => p.number !== 0);
  const completedProjects = mainProjects.filter(
    (p) => p.completedIterations > 0
  ).length;
  const activeProjects = mainProjects.filter(
    (p) => p.inProgressIterations > 0 && p.completedIterations === 0
  ).length;
  const remainingProjects = 10 - completedProjects - activeProjects;
  const totalMinutes = projects.reduce(
    (sum, p) => sum + p.totalTimeMinutes,
    0
  );
  const progressPercent = (completedProjects / 10) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-black text-text-primary mb-2">
          The 10-Weekend AI Resolution
        </h1>
        <p className="text-text-muted font-body text-lg mb-8">
          Building AI fluency, one project at a time.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard value={completedProjects} label="Complete" color="sage" />
          <StatCard value={activeProjects} label="Active" color="amber" />
          <StatCard value={remainingProjects} label="Remaining" />
          <StatCard
            value={formatMinutes(totalMinutes)}
            label="Time Spent"
            color="rose"
          />
        </div>

        <ProgressBar
          value={progressPercent}
          size="lg"
          showLabel
          className="mb-8"
        />

        <p className="font-display italic text-lg text-text-muted text-center max-w-2xl mx-auto">
          &ldquo;Over 10 weekends, I&rsquo;m building the AI workflows,
          automations, and tools that will define how I work.&rdquo;
        </p>
      </section>

      {/* Project Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
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
