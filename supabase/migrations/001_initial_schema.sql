-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles (auto-created on signup)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  role text check (role in ('admin', 'viewer')) default 'viewer',
  avatar_url text,
  created_at timestamptz default now()
);

-- Projects (the 10 weekends + bonus)
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  number int not null unique,
  title text not null,
  subtitle text not null,
  description_work text,
  description_advanced text,
  deliverable text,
  done_when text,
  why_it_matters text,
  sort_order int not null,
  created_at timestamptz default now()
);

-- Iterations (3+ per project)
create table public.iterations (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects on delete cascade not null,
  version_label text not null,
  plan_markdown text,
  learnings_raw text,
  learnings_summary text,
  status text check (status in ('not_started', 'in_progress', 'complete')) default 'not_started',
  time_spent_minutes int default 0,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Checklist items (parsed from plan_markdown)
create table public.checklist_items (
  id uuid default uuid_generate_v4() primary key,
  iteration_id uuid references public.iterations on delete cascade not null,
  phase_label text,
  label text not null,
  sort_order int not null,
  is_checked boolean default false,
  checked_by uuid references public.profiles,
  checked_at timestamptz
);

-- Time logs (optional per-session tracking)
create table public.time_logs (
  id uuid default uuid_generate_v4() primary key,
  iteration_id uuid references public.iterations on delete cascade not null,
  user_id uuid references public.profiles not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_minutes int,
  note text
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, new.raw_user_meta_data->>'display_name', 'admin');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger for iterations
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger iterations_updated_at
  before update on public.iterations
  for each row execute procedure public.update_updated_at();

-- ==========================================
-- ROW-LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.iterations enable row level security;
alter table public.checklist_items enable row level security;
alter table public.time_logs enable row level security;

-- Projects: public read, admin write
create policy "Projects are viewable by everyone"
  on public.projects for select using (true);

create policy "Admins can manage projects"
  on public.projects for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Iterations: public read, admin write
create policy "Iterations are viewable by everyone"
  on public.iterations for select using (true);

create policy "Admins can manage iterations"
  on public.iterations for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Checklist items: public read, admin write
create policy "Checklist items are viewable by everyone"
  on public.checklist_items for select using (true);

create policy "Admins can manage checklist items"
  on public.checklist_items for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Profiles: users can read all, update own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Time logs: only authenticated users
create policy "Users can view own time logs"
  on public.time_logs for select using (auth.uid() = user_id);

create policy "Users can manage own time logs"
  on public.time_logs for all using (auth.uid() = user_id);
