import { createClient } from "@/lib/supabase/server";
import type {
  Project,
  Iteration,
  ChecklistItem,
  TimeLog,
  ProjectWithProgress,
  IterationWithDetails,
} from "@/lib/types";

export async function getProjectsWithProgress(): Promise<ProjectWithProgress[]> {
  const supabase = createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!projects) return [];

  const { data: iterations } = await supabase
    .from("iterations")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: checklistItems } = await supabase
    .from("checklist_items")
    .select("*");

  const allIterations = (iterations ?? []) as Iteration[];
  const allChecklist = (checklistItems ?? []) as ChecklistItem[];

  return (projects as Project[]).map((project) => {
    const projectIterations = allIterations.filter(
      (i) => i.project_id === project.id
    );
    const iterationIds = projectIterations.map((i) => i.id);
    const projectChecklist = allChecklist.filter((c) =>
      iterationIds.includes(c.iteration_id)
    );

    return {
      ...project,
      iterations: projectIterations,
      totalChecklistItems: projectChecklist.length,
      completedChecklistItems: projectChecklist.filter((c) => c.is_checked)
        .length,
      totalTimeMinutes: projectIterations.reduce(
        (sum, i) => sum + (i.time_spent_minutes || 0),
        0
      ),
      completedIterations: projectIterations.filter(
        (i) => i.status === "complete"
      ).length,
      inProgressIterations: projectIterations.filter(
        (i) => i.status === "in_progress"
      ).length,
    };
  });
}

export async function getProjectByNumber(
  number: number
): Promise<ProjectWithProgress | null> {
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("number", number)
    .single();

  if (!project) return null;

  const typedProject = project as Project;

  const { data: iterations } = await supabase
    .from("iterations")
    .select("*")
    .eq("project_id", typedProject.id)
    .order("sort_order", { ascending: true });

  const projectIterations = (iterations ?? []) as Iteration[];
  const iterationIds = projectIterations.map((i) => i.id);

  let projectChecklist: ChecklistItem[] = [];
  if (iterationIds.length > 0) {
    const { data: checklistItems } = await supabase
      .from("checklist_items")
      .select("*")
      .in("iteration_id", iterationIds);
    projectChecklist = (checklistItems ?? []) as ChecklistItem[];
  }

  return {
    ...typedProject,
    iterations: projectIterations,
    totalChecklistItems: projectChecklist.length,
    completedChecklistItems: projectChecklist.filter((c) => c.is_checked)
      .length,
    totalTimeMinutes: projectIterations.reduce(
      (sum, i) => sum + (i.time_spent_minutes || 0),
      0
    ),
    completedIterations: projectIterations.filter(
      (i) => i.status === "complete"
    ).length,
    inProgressIterations: projectIterations.filter(
      (i) => i.status === "in_progress"
    ).length,
  };
}

export async function getIterationWithDetails(
  id: string
): Promise<IterationWithDetails | null> {
  const supabase = createClient();

  const { data: iteration } = await supabase
    .from("iterations")
    .select("*")
    .eq("id", id)
    .single();

  if (!iteration) return null;

  const typedIteration = iteration as Iteration;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", typedIteration.project_id)
    .single();

  if (!project) return null;

  const { data: checklistItems } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("iteration_id", id)
    .order("sort_order", { ascending: true });

  const { data: timeLogs } = await supabase
    .from("time_logs")
    .select("*")
    .eq("iteration_id", id)
    .order("started_at", { ascending: true });

  return {
    ...typedIteration,
    project: project as Project,
    checklistItems: (checklistItems ?? []) as ChecklistItem[],
    timeLogs: (timeLogs ?? []) as TimeLog[],
  };
}

export function formatMinutes(minutes: number): string {
  if (minutes === 0) return "0 hrs";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs} hr${hrs !== 1 ? "s" : ""}`;
  return `${hrs}h ${mins}m`;
}
