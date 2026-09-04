import { Routes, Route } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Code2,
  Gauge,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';

const features = [
  {
    icon: Workflow,
    title: 'Spec-driven by default',
    description:
      'Every screen traces back to a spec, so design intent survives contact with real engineering.',
  },
  {
    icon: Bot,
    title: 'Built for AI-native teams',
    description: 'Structured for agents and humans alike — clear contracts, predictable patterns.',
  },
  {
    icon: Gauge,
    title: 'Fast & static',
    description: 'A Vite build ships as static assets — deploy to any CDN or object store in seconds.',
  },
  {
    icon: ShieldCheck,
    title: 'Accessible by construction',
    description: 'Radix primitives under the hood give you keyboard navigation and ARIA out of the box.',
  },
];

const stats = [
  { value: '1.2M+', label: 'Specs generated' },
  { value: '67%', label: 'Less boilerplate' },
  { value: '+340%', label: 'Faster shipping' },
  { value: '4x', label: 'Fewer regressions' },
];

function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(328_100%_50%/0.18),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]"
        />
        <div className="container relative flex flex-col items-center gap-6 py-28 text-center">
          <Badge
            variant="secondary"
            className="border border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            React + Vite + shadcn/ui
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            A landing page that
            <span className="text-gradient-brand"> ships itself.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {{projectName}} is a static, spec-driven starter for landing pages and small marketing
            sites — beautiful, accessible, and ready to deploy anywhere.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600"
            >
              Get started
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">Explore features</a>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="container relative grid grid-cols-2 gap-6 border-t py-10 sm:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-gradient-brand text-3xl font-bold tracking-tight sm:text-4xl">
                {value}
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container grid gap-6 py-24 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="border-border/60 transition-colors hover:border-brand-500/40">
            <CardHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="container py-20">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-8 py-16 text-center text-white sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_80%_0%,rgba(255,255,255,0.25),transparent_70%)]"
            />
            <div className="relative flex flex-col items-center gap-6">
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Launch your next idea this afternoon.
              </h2>
              <p className="max-w-xl text-white/80">
                Edit a few sections, drop in your copy, and deploy. No backend required.
              </p>
              <Button size="lg" variant="secondary" className="bg-white text-brand-700 hover:bg-white/90">
                Start building
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-brand-600 to-brand-400 text-white">
              <Layers className="h-4 w-4" />
            </span>
            {{projectName}}
          </a>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
          </nav>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="View source" asChild>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Code2 className="h-5 w-5" />
              </a>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Generated with{' '}
            <span className="font-medium text-foreground">CFly Factory</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
