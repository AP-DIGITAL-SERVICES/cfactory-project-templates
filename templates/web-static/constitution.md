# {{projectName}} Constitution — Static Site (React + Vite + shadcn/ui)

## Core Principles

### I. Static-First Architecture

- The project MUST build to fully static assets (HTML, CSS, JS) via Vite — no server runtime is required to serve it
- There is NO application backend; any dynamic data MUST come from third-party APIs called from the client or from build-time data sources
- Code MUST be organized by feature/section (e.g., `sections/hero`, `sections/pricing`), not by file type
- Pages/sections MUST be composable and independently editable so non-engineers can update copy safely
- Secrets MUST NEVER be embedded in client code (everything shipped is public); only publishable keys are allowed

### II. Type Safety (NON-NEGOTIABLE)

- TypeScript strict mode MUST be enabled (`"strict": true`) with zero type errors on build
- `any` is FORBIDDEN except in rare, documented cases with an inline comment explaining why
- All component props MUST be explicitly typed; prefer discriminated unions over optional-flag soup
- Content/data structures (nav items, feature lists, pricing tiers) MUST be typed and centralized

### III. Frontend Standards (React + shadcn/ui)

- The frontend MUST use React 18+ with TypeScript strict mode and functional components exclusively
- UI components MUST use shadcn/ui as the primary component library, built on Radix UI primitives
- Styling MUST use Tailwind CSS utility classes and design tokens; arbitrary values (e.g., `h-[600px]`) are DISCOURAGED
- shadcn/ui components MUST be imported from `@/components/ui/*` and customized via Tailwind, NOT by overriding internal styles
- Custom UI MUST compose shadcn/ui primitives rather than building modals/dropdowns/tooltips from scratch
- Icons MUST use Lucide React (`lucide-react`), the shadcn/ui default icon set — import individual icons only
- Class names MUST be merged via the `cn()` utility from `@/lib/utils`
- Local component state (`useState`) MUST be used for UI-only state; a global store is DISCOURAGED for a static site
- Routing (if multiple pages) MUST use React Router v6+; single-page landings SHOULD use in-page anchors
- Dark mode MUST be supported using shadcn/ui's theme system (CSS variables + `dark:` variant + a theme toggle)
- Responsive design MUST use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) and be verified on mobile

### IV. Design Quality & Content

- Every page MUST have a clear visual hierarchy: one primary call-to-action per section
- Layout MUST use the shared `container`, spacing scale, and typography tokens for consistency
- Imagery MUST be optimized (WebP/AVIF, explicit `width`/`height`, `loading="lazy"` below the fold)
- Copy MUST be kept in typed data/content modules, not scattered as string literals across components
- Empty/placeholder content MUST be replaced before launch (no lorem ipsum in production)

### V. Performance (NON-NEGOTIABLE for Landing Pages)

- Lighthouse scores MUST meet: Performance >= 90, Accessibility >= 95, Best Practices >= 95, SEO >= 95 on production builds
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Routes MUST be code-split with `React.lazy()` + `<Suspense>` when the site grows beyond a single page
- Third-party scripts MUST be loaded lazily/deferred and justified — each one is a performance cost
- The production JS bundle SHOULD stay small; analyze with `npx vite-bundle-visualizer` before adding heavy deps

### VI. SEO & Metadata

- Every page MUST set a unique `<title>` and meta description
- Open Graph and Twitter Card tags MUST be present for shareable pages
- Semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`) MUST be used
- A single `<h1>` per page MUST describe the page; heading levels MUST NOT skip
- Canonical URLs, `robots.txt`, and a `sitemap.xml` MUST be provided for indexable sites

### VII. Accessibility (WCAG 2.1 AA)

- Accessibility is built into shadcn/ui's Radix primitives but MUST be verified for custom components
- Color contrast MUST meet WCAG 2.1 AA (4.5:1 normal text, 3:1 large text) in BOTH light and dark themes
- All interactive elements MUST be keyboard accessible with visible focus states
- Icon-only buttons MUST have `aria-label`; images MUST have meaningful `alt` text (or empty `alt` if decorative)
- Color alone MUST NOT convey information (pair with text or icons)

### VIII. Code Organization & Style

- ESLint MUST pass with zero errors; Prettier/formatter output MUST be consistent
- Components MUST be small and focused (< 200 lines of JSX); split large sections into subcomponents
- The `@/` path alias MUST be used for internal imports (no deep `../../../` chains)
- Environment-specific values MUST use `import.meta.env` with `VITE_` prefixes; never hardcode

### IX. Testing

- Component tests MUST use Vitest + React Testing Library, testing behavior (what the user sees)
- Every page MUST have at least one render/smoke test and tests for its primary CTA(s)
- Minimum coverage target: 60% for components
- Tests MUST query by role/text/label, not by implementation details or Tailwind classes

### X. Infrastructure & Deployment

- The site MUST be deployable as static assets to any CDN/object store (S3+CloudFront, Netlify, Vercel, GitHub Pages) or via the provided nginx container
- The nginx container MUST serve an SPA fallback (`try_files ... /index.html`) and cache hashed assets aggressively
- CI MUST run lint, tests, and a production build on every pull request
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) MUST be configured at the edge/nginx

## Architectural Decision Requirements

- Every feature spec MUST reference `shared/architectural-decisions-guide.md`
- Any addition of a global store, backend, CMS, or heavy third-party dependency MUST be explicitly justified
- Analytics and marketing scripts MUST document their performance and privacy impact

## Governance

- This constitution supersedes all other development practices
- Amendments require: documented rationale, team review, migration plan for existing code
- All code reviews MUST verify compliance with these principles
- Exceptions MUST be documented inline with justification

**Version**: 1.0.0 | **Ratified**: [DATE] | **Last Amended**: [DATE]
