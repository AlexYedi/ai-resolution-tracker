# 10-Weekend AI Resolution Tracker

A portfolio and progress tracker documenting 10 weekends of building AI fluency — from trackers to automations to AI-powered tools.

**Live**: [ai-resolution-tracker-seven.vercel.app](https://ai-resolution-tracker-seven.vercel.app)

## What This Is

Over 10 weekends, I'm building projects that explore different dimensions of working with AI. This app is both the **first project** (Weekend 1) and the **portfolio** that houses all of them.

**Public visitors** see a read-only portfolio: progress stats, project descriptions, iteration timelines, checklists, learnings, and uploaded screenshots.

**Admin** (me) gets a full editing UI: create iterations, paste markdown plans that auto-parse into checklists, toggle tasks, write learnings, upload files, track time.

## Stack

- **Framework**: Next.js 14 (App Router, React Server Components)
- **Database**: Supabase (Postgres + Auth + Storage + RLS)
- **Styling**: Tailwind CSS with custom design system
- **Hosting**: Vercel
- **Dev Tool**: Claude Code

## Design System

Aesthetic inspired by magical realism painters (Remedios Varo, Leonora Carrington, Roberto Matta):

- **Palette**: Canvas cream, amber accents, sage for progress, dusty rose for personality
- **Typography**: Playfair Display (headings), Inter (body), JetBrains Mono (code)
- **Texture**: Paper grain overlay, warm-tinted shadows

## Key Features

- **Progress dashboard** — live stats computed from actual project data
- **Markdown → checklist** — paste a numbered plan, get interactive checkboxes grouped by phase
- **Optimistic UI** — checkbox toggles feel instant, sync in background
- **Asset uploads** — drag-and-drop screenshots/PDFs per iteration
- **Vertical iteration timeline** — visual history of each build attempt
- **Auth-gated admin** — RLS enforces permissions at the database level
- **PWA** — installable on mobile

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Portfolio home (progress hero + project grid)
│   ├── dashboard/                # Admin dashboard
│   ├── login/                    # Auth
│   └── project/[number]/         # Project detail + iteration detail
├── components/
│   ├── admin/                    # Edit forms, checklist toggle, asset uploader
│   ├── layout/                   # Header, Footer
│   └── ui/                       # ProgressBar, StatusBadge, StatCard, etc.
└── lib/
    ├── actions.ts                # Server Actions (all mutations)
    ├── data.ts                   # Server-side data fetching
    ├── parse-plan.ts             # Markdown → checklist parser
    ├── supabase/                 # Supabase client setup
    └── types.ts                  # TypeScript interfaces
```

## Local Development

```bash
cp .env.local.example .env.local  # Add your Supabase credentials
npm install
npm run dev                       # http://localhost:3000
```

Requires a Supabase project with the schema applied (see migrations).

## Build Log

| Phase | What | Commit |
|-------|------|--------|
| 1 | Foundation — schema, auth, seed data, design system | `a16e489` |
| 2 | Public portfolio UI — read-only pages, timeline, empty states | `2324e5e` |
| 3 | Admin editing — iteration CRUD, checklists, learnings, time | `e209ebe` |
| 3.1 | Edit button visibility fix | `6db4791` |
| 4 | Deploy — Vercel, PWA, OG image, metadata | `fc4c381` |
| 4.1 | Asset uploader — drag-and-drop files per iteration | `abec0d9` |
