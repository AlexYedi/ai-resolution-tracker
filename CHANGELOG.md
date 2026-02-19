# Changelog

All notable changes to the 10-Weekend AI Resolution Tracker.

## [Unreleased]

### Added
- **Asset uploader** — drag-and-drop file uploads (PNG, JPG, GIF, WebP, PDF) on iteration pages
- Asset gallery on public iteration pages (read-only, click to open full-size)
- Per-asset captions (auto-save on blur)
- `iteration_assets` table with RLS (public read, admin write)
- `iteration-assets` Supabase Storage bucket (10MB limit, public read)

## [0.4.0] — 2026-02-18 (Phase 4: Deploy)

### Added
- Vercel deployment — live at `ai-resolution-tracker-seven.vercel.app`
- Custom domain support for yedibalian.com (DNS config required)
- PWA manifest + icons (installable on mobile)
- OpenGraph image for link previews (1200×630)
- Twitter card metadata
- Service worker via next-pwa

### Changed
- Root layout metadata: added `metadataBase`, viewport theme color, OG image, twitter card
- Replaced `next.config.mjs` with `next.config.js` (PWA plugin compatibility)

### Fixed
- Auth callback uses relative `origin` — no hardcoded localhost

## [0.3.0] — 2026-02-18 (Phase 3: Admin Editing UI)

### Added
- **Iteration CRUD** — create, edit, delete iterations from project pages
- **Markdown plan parser** — paste `##` headers + numbered/bulleted lists, auto-generates checklist items
- **Interactive checklist** — optimistic toggle with instant progress bar updates (admin only)
- **Learnings editor** — raw notes + AI-processed summary fields
- **Manual time tracking** — minutes input per iteration
- **Re-parse warning** — warns before overwriting checked items when plan changes
- Server Actions for all mutations (`createIteration`, `updateIteration`, `deleteIteration`, `toggleChecklistItem`)
- `getIsAdmin()` server-side auth check
- Admin components: `CreateIterationForm`, `EditIterationForm`, `InteractiveChecklist`, `DeleteIterationButton`, `AdminBar`, `IterationPageClient`
- Dashboard redesign with stats, per-project progress, quick iteration links

### Changed
- Iteration detail page split into server component + `IterationPageClient` wrapper
- `formatMinutes` extracted to `data-client.ts` for client component compatibility

## [0.2.0] — 2026-02-18 (Phase 2: Public Portfolio UI)

### Added
- **Progress dashboard hero** — stat cards (complete/active/remaining/hours), full-width progress bar
- **Project detail pages** — two-column layout with deliverable card, description, done-when, why-it-matters
- **Iteration timeline** — vertical timeline with status-colored dots on project pages
- **Iteration detail pages** — read-only checklist by phase, learnings summary + raw notes, time tracking display
- Shared components: `StatCard`, `TimelineNode`, `Breadcrumb`, `Skeleton`
- Loading skeletons for home and project pages
- Custom 404 page
- Dynamic metadata per page (title, description, OG)
- Sticky header with auth-aware navigation + mobile hamburger
- Responsive design at 3 breakpoints (mobile/tablet/desktop)
- `ProjectWithProgress` and `IterationWithDetails` enriched types
- `src/lib/data.ts` — server-side data fetching helpers

### Changed
- `ProgressBar` — new API (value 0-100), size prop, amber→sage gradient
- `StatusBadge` — dot indicator, size variants
- `ProjectCard` — full redesign with progress data and status dots
- Header — sticky positioning, backdrop blur, active link states

## [0.1.0] — 2026-02-18 (Phase 1: Foundation)

### Added
- Next.js 14 App Router + TypeScript + Tailwind CSS scaffold
- Supabase integration (Postgres, Auth, RLS)
- Database schema: `profiles`, `projects`, `iterations`, `checklist_items`, `time_logs`
- RLS policies: public read on projects/iterations/checklist_items, admin-only writes
- Email/password authentication with middleware-protected `/dashboard`
- Seed data: 11 projects (weekends 0-10)
- Design system: Playfair Display + Inter + JetBrains Mono, warm earth tone palette
- Paper grain overlay at 3% opacity
- Basic page structure: home grid, login, dashboard, project detail stub
