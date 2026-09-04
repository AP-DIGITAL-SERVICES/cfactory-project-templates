import { Routes, Route } from 'react-router-dom';
import { ArrowRight, BookOpen, Boxes, Code2, ShieldCheck, Sparkles, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';

const features = [
  {
    icon: ShieldCheck,
    title: 'Type-safe end to end',
    description:
      'Strict TypeScript on the client and typed contracts to the API — no implicit any, ever.',
  },
  {
    icon: Zap,
    title: 'Data layer ready',
    description:
      'Redux Toolkit and RTK Query are wired up so fetching, caching, and invalidation stay effortless.',
  },
  {
    icon: Sparkles,
    title: 'shadcn/ui + Tailwind',
    description:
      'Accessible Radix primitives, design tokens, and dark mode are included out of the box.',
  },
];

function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/40 to-background">
        <div className="container relative flex flex-col items-center gap-6 py-24 text-center">
          <Badge variant="secondary">
            <Boxes className="h-3.5 w-3.5" />
            Stack: <code className="font-mono">{{stack}}</code>
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Build your product,
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {' '}
              not your boilerplate.
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            The {{projectName}} starter, scaffolded by CFly Factory and running on the{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{{stack}}</code>{' '}
            stack — spec-driven, tested, and ready to ship.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg">
              Get started
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline">
              <BookOpen />
              Read the docs
            </Button>
          </div>
        </div>
      </section>

      <section className="container grid gap-6 py-20 md:grid-cols-3">
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
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            {{projectName}}
          </a>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="View on GitHub" asChild>
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
        <div className="container text-center text-sm text-muted-foreground">
          Generated with <span className="font-medium text-foreground">CFly Factory</span>
        </div>
      </footer>
    </div>
  );
}
