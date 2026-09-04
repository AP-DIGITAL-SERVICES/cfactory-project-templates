# Best Practices Guide — Static Site (React + Vite + shadcn/ui)

This guide covers component-level best practices for a static/landing site built with React, Vite, and shadcn/ui. Every team member and AI agent MUST follow these practices when implementing sections and pages.

---

## Table of Contents

- [1. Project Structure](#1-project-structure)
- [2. Sections & Composition](#2-sections--composition)
- [3. shadcn/ui + Tailwind](#3-shadcnui--tailwind)
- [4. Content & Data](#4-content--data)
- [5. Theming & Dark Mode](#5-theming--dark-mode)
- [6. Performance](#6-performance)
- [7. SEO & Metadata](#7-seo--metadata)
- [8. Accessibility](#8-accessibility)
- [9. Testing](#9-testing)
- [10. Deployment](#10-deployment)

---

## 1. Project Structure

**DO:**
- Organize by section/feature: `src/sections/hero/`, `src/sections/pricing/`, `src/components/ui/`
- Keep shared primitives in `src/components/ui/` (shadcn) and helpers in `src/lib/`
- Centralize content in typed modules (`src/content/*.ts`) so copy is easy to edit
- Use the `@/` alias for all internal imports

**DON'T:**
- Dump every section into a single `App.tsx`
- Hardcode marketing copy inline across many components
- Reach into `../../../` relative import chains

```text
src/
  components/
    ui/            # shadcn/ui primitives (button, card, badge, ...)
    theme-provider.tsx
    mode-toggle.tsx
  sections/
    hero/Hero.tsx
    features/Features.tsx
    cta/CallToAction.tsx
  content/
    features.ts    # typed content
  lib/utils.ts     # cn() helper
  App.tsx
  main.tsx
```

## 2. Sections & Composition

**DO:**
- Build each page from small, focused section components (< 200 lines of JSX)
- Give each section a single, clear primary call-to-action
- Compose shadcn primitives (`Card`, `Badge`, `Button`) instead of hand-rolling UI

**DON'T:**
- Create "god" components that render an entire page
- Build custom modals/dropdowns/tooltips — use shadcn's `<Dialog>`, `<DropdownMenu>`, `<Tooltip>`

```tsx
// GOOD: a section composed from typed content + shadcn primitives
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { features } from '@/content/features';

export function Features() {
  return (
    <section id="features" className="container grid gap-6 py-24 sm:grid-cols-2 lg:grid-cols-4">
      {features.map(({ icon: Icon, title, description }) => (
        <Card key={title} className="border-border/60">
          <CardHeader>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </section>
  );
}
```

## 3. shadcn/ui + Tailwind

**DO:**
- Use design tokens (`bg-primary`, `text-muted-foreground`, `border-border`) — they adapt to dark mode automatically
- Merge classes with `cn()` from `@/lib/utils`
- Customize components via Tailwind classes and variant props

**DON'T:**
- Use arbitrary values (`h-[600px]`) when a token exists (`h-96`, `h-screen`)
- Override shadcn internals with global CSS
- Import whole icon libraries — import individual Lucide icons: `import { ArrowRight } from 'lucide-react'`

## 4. Content & Data

**DO:**
- Keep copy, nav items, feature lists, and pricing tiers in typed `src/content/*.ts` modules
- Type every content structure; render by mapping over the data

**DON'T:**
- Scatter user-facing strings as literals throughout components
- Ship placeholder/lorem ipsum content to production

```ts
// GOOD: typed content module
import type { LucideIcon } from 'lucide-react';
import { Gauge, Palette, ShieldCheck } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  { icon: Palette, title: 'Designed to convert', description: '...' },
  { icon: Gauge, title: 'Fast & static', description: '...' },
  { icon: ShieldCheck, title: 'Accessible', description: '...' },
];
```

## 5. Theming & Dark Mode

**DO:**
- Wrap the app in `<ThemeProvider>` and expose a `<ModeToggle>` in the header
- Verify contrast and visual polish in BOTH light and dark themes
- Define brand colors as CSS variables in `index.css` so both themes stay in sync

**DON'T:**
- Hardcode hex colors in components (use tokens bound to CSS variables)
- Assume light mode only

## 6. Performance

**DO:**
- Keep the bundle lean; analyze with `npx vite-bundle-visualizer` before adding heavy deps
- Lazy-load below-the-fold images (`loading="lazy"`) with explicit `width`/`height` to avoid CLS
- Defer/lazy-load third-party scripts (analytics, chat widgets)
- Code-split routes with `React.lazy()` + `<Suspense>` once the site has multiple pages

**DON'T:**
- Add large UI/animation libraries for a single effect
- Block first paint on non-critical scripts
- Ship unoptimized PNG/JPEG hero images — prefer WebP/AVIF

## 7. SEO & Metadata

**DO:**
- Set a unique `<title>` and meta description per page
- Add Open Graph + Twitter Card tags for shareable pages
- Provide `robots.txt`, `sitemap.xml`, and canonical URLs for indexable sites
- Use one `<h1>` per page and semantic landmarks

**DON'T:**
- Rely on client-only rendering for critical SEO content without prerendering/SSG if indexing matters
- Skip descriptive `alt` text on meaningful images

## 8. Accessibility

**DO:**
- Preserve Radix/shadcn keyboard and ARIA behavior
- Add `aria-label` to icon-only buttons; keep visible focus states
- Maintain WCAG 2.1 AA contrast in both themes

**DON'T:**
- Use `<div onClick>` instead of `<Button>`
- Convey meaning with color alone

## 9. Testing

**DO:**
- Use Vitest + React Testing Library; query by role/text/label
- Smoke-test each page and assert the primary CTA renders
- Test the theme toggle and any interactive sections

**DON'T:**
- Assert on Tailwind class names or implementation details
- Snapshot-test volatile markup

```tsx
// GOOD: behavior-focused test
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders the primary call to action', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
});
```

## 10. Deployment

**DO:**
- Build with `npm run build` and deploy the `dist/` folder to a CDN/object store, or use the provided nginx container
- Serve an SPA fallback (`try_files ... /index.html`) and cache hashed assets with long TTLs
- Set security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) at the edge/nginx
- Run lint, tests, and build in CI on every pull request

**DON'T:**
- Serve the dev server in production
- Cache `index.html` aggressively (it must reflect new asset hashes on each deploy)
