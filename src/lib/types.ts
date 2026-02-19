export type Profile = {
  id: string;
  display_name: string | null;
  role: "admin" | "viewer";
  avatar_url: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description_work: string | null;
  description_advanced: string | null;
  deliverable: string | null;
  done_when: string | null;
  why_it_matters: string | null;
  sort_order: number;
  created_at: string;
};

export type IterationStatus = "not_started" | "in_progress" | "complete";

export type Iteration = {
  id: string;
  project_id: string;
  version_label: string;
  plan_markdown: string | null;
  learnings_raw: string | null;
  learnings_summary: string | null;
  status: IterationStatus;
  time_spent_minutes: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ChecklistItem = {
  id: string;
  iteration_id: string;
  phase_label: string | null;
  label: string;
  sort_order: number;
  is_checked: boolean;
  checked_by: string | null;
  checked_at: string | null;
};

export type TimeLog = {
  id: string;
  iteration_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  note: string | null;
};

export type IterationAsset = {
  id: string;
  iteration_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

// Phase 2 enriched types

export interface ProjectWithProgress extends Project {
  iterations: Iteration[];
  totalChecklistItems: number;
  completedChecklistItems: number;
  totalTimeMinutes: number;
  completedIterations: number;
  inProgressIterations: number;
}

export interface IterationWithDetails extends Iteration {
  project: Project;
  checklistItems: ChecklistItem[];
  timeLogs: TimeLog[];
  assets: IterationAsset[];
}
