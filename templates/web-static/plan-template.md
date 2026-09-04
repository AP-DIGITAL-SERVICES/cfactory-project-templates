# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Summary

[Copy from spec.md → Business Proposition. Describe WHO the page/section is for, WHAT action it drives, and WHY it matters. Keep technical details in Technical Context below.]

## Technical Context

**Language/Version**: TypeScript 5.4+ (strict mode)
**Framework**: React 18+
**Build Tool**: Vite 6+
**UI Library**: shadcn/ui (Radix UI primitives)
**Styling**: Tailwind CSS 3+ with design tokens (CSS variables)
**Icons**: lucide-react
**Routing**: [React Router v6+ for multi-page / in-page anchors for single-page — choose one]
**Content Source**: [Typed content modules / headless CMS / Markdown — choose one]
**Testing**: Vitest + React Testing Library
**Linting/Formatting**: ESLint + Prettier
**Containerization**: Docker (nginx) — optional; static assets also deploy to any CDN
**CI/CD**: GitHub Actions
**Hosting Target**: [S3 + CloudFront / Netlify / Vercel / GitHub Pages / nginx container — choose one]
**Performance Goals**: Lighthouse Perf >= 90, LCP < 2.5s, CLS < 0.1, INP < 200ms
**Constraints**: [e.g., no backend, publishable keys only, < 200KB gzipped initial JS]
**Scale/Scope**: [e.g., 5 sections, 3 pages, 2 languages]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] TypeScript strict mode passes with zero errors (no `any`)
- [ ] UI composed from shadcn/ui primitives in `@/components/ui/*`
- [ ] Tailwind design tokens used (no unjustified arbitrary values)
- [ ] Dark mode supported via ThemeProvider + ModeToggle, verified in both themes
- [ ] Responsive layouts verified on mobile, tablet, desktop
- [ ] Content centralized in typed modules (no scattered string literals)
- [ ] SEO metadata (title, description, OG/Twitter) defined per page
- [ ] Accessibility: semantic landmarks, labeled controls, WCAG AA contrast
- [ ] Performance budget defined; heavy deps / third-party scripts justified
- [ ] ESLint passes; Vitest smoke + CTA tests present
- [ ] No backend/global store added without documented justification

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── theme-provider.tsx
│   │   └── mode-toggle.tsx
│   ├── sections/           # page sections (hero, features, pricing, cta, ...)
│   ├── content/            # typed content/copy modules
│   ├── lib/utils.ts        # cn() helper
│   ├── App.tsx
│   └── main.tsx
├── public/                 # static files (favicon, robots.txt, og image)
└── index.html              # <title> + meta tags
```

## Phase 0 — Research

- Confirm the hosting target and its constraints (routing/redirects, headers, build command)
- Decide content source (typed modules vs CMS) and i18n needs
- Identify required sections and the single primary CTA per section
- List any third-party scripts (analytics, forms) and their performance/privacy impact

## Phase 1 — Design

- Define the typed content model for each section
- Map the component tree (sections → shadcn primitives)
- Specify SEO metadata per page (title, description, OG/Twitter, canonical)
- Define the responsive behavior and the light/dark palette (CSS variables)

## Phase 2 — Tasks

- Break each section into build + test tasks
- Include an accessibility pass and a Lighthouse/performance pass as explicit tasks
- Include a deployment task for the chosen hosting target

## Complexity Tracking

| Decision | Why it adds complexity | Justification |
|----------|------------------------|---------------|
| [e.g., add headless CMS] | Extra build/runtime dependency | [why it's needed] |
| [e.g., add global store] | State beyond local UI | [why local state is insufficient] |
