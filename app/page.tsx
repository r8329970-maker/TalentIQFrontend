import Link from 'next/link';
import {
  ArrowRight,
  Upload,
  FileSearch,
  Briefcase,
  Users,
  Gauge,
  Lightbulb,
  Check,
  AlertTriangle,
  Clock,
  Layers,
  Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarketingNav, MarketingFooter } from '@/components/landing/marketing-nav';
import { ProductPreview } from '@/components/landing/product-preview';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
        <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="flex h-1.5 w-1.5 rounded-full bg-success" />
                AI-powered recruitment intelligence
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Hire smarter.{' '}
                <span className="text-primary">Discover the right talent.</span>
              </h1>
              <p className="text-balance max-w-xl text-lg text-muted-foreground">
                TalentIQ helps recruiters upload resumes, parse candidate data, create jobs with
                structured requirements, and evaluate candidates with explainable matching insights.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/#features">Explore Features</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success" /> Resume parsing
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success" /> Structured job requirements
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success" /> Explainable evaluation
                </span>
              </div>
            </div>
            <div className="animate-fade-in-up">
              <ProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Problem / solution */}
      <section className="border-b border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                The problem
              </h2>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Resume review at scale is slow and inconsistent
              </h3>
              <div className="mt-6 space-y-4">
                {[
                  {
                    icon: Clock,
                    title: 'Hours lost to manual screening',
                    desc: 'Recruiters read resumes one by one, often with inconsistent criteria across roles.',
                  },
                  {
                    icon: AlertTriangle,
                    title: 'Inconsistent job requirements',
                    desc: 'Job descriptions capture intent, not structured requirements, making evaluation subjective.',
                  },
                  {
                    icon: Eye,
                    title: 'No evidence for decisions',
                    desc: 'Without traceable reasoning, it is hard to explain why a candidate was advanced or passed on.',
                  },
                ].map((p) => (
                  <div key={p.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                The TalentIQ approach
              </h2>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Structured data and explainable evaluation
              </h3>
              <div className="mt-6 space-y-4">
                {[
                  {
                    icon: FileSearch,
                    title: 'Parse resumes into structured profiles',
                    desc: 'Candidate data — skills, experience, projects, education — is extracted for reuse across roles.',
                  },
                  {
                    icon: Layers,
                    title: 'Turn job descriptions into requirements',
                    desc: 'Skill groups, experience ranges, and education needs are extracted and remain editable.',
                  },
                  {
                    icon: Lightbulb,
                    title: 'Show the reasoning behind every score',
                    desc: 'Each evaluation surfaces matching skills, gaps, and resume evidence — not just a number.',
                  },
                ].map((p) => (
                  <div key={p.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to evaluate candidates
          </h2>
          <p className="mt-3 text-muted-foreground">
            A focused toolkit for recruiters — from resume upload to explainable evaluation.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Users,
              title: 'Candidate Pool',
              desc: 'Build a reusable pool of structured candidate profiles parsed from resumes. Search, filter, and return to profiles across roles.',
            },
            {
              icon: FileSearch,
              title: 'Resume Parsing',
              desc: 'Upload multiple PDF resumes at once. TalentIQ extracts skills, experience, projects, and education into structured data.',
            },
            {
              icon: Layers,
              title: 'Job Requirement Extraction',
              desc: 'Paste a job description and review extracted skill groups, experience ranges, responsibilities, and education requirements.',
            },
            {
              icon: Gauge,
              title: 'Candidate Evaluation',
              desc: 'Evaluate candidates against a job and review scores across skills, experience, role alignment, education, and location.',
            },
            {
              icon: Lightbulb,
              title: 'Explainable Hiring Insights',
              desc: 'Every evaluation shows matching skills, missing requirements, preferred skills, and resume evidence behind the score.',
            },
            {
              icon: Upload,
              title: 'Multi-Resume Upload',
              desc: 'Drag and drop several PDFs, track per-file processing status, and handle duplicates — all before any candidate is created.',
            },
          ].map((f) => (
            <Card key={f.title} className="p-6 transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              How TalentIQ works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Four steps from resume upload to explainable evaluation.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload resumes',
                desc: 'Drag and drop multiple PDF resumes. Processing happens per file with clear status tracking.',
              },
              {
                step: '02',
                icon: Briefcase,
                title: 'Create a job',
                desc: 'Add a job description and extract structured requirements — skill groups, experience, education.',
              },
              {
                step: '03',
                icon: Gauge,
                title: 'Evaluate candidates',
                desc: 'Run candidates against the job and review ranked results with category scores.',
              },
              {
                step: '04',
                icon: Lightbulb,
                title: 'Review insights',
                desc: 'Inspect matching skills, gaps, resume evidence, and notes to make informed decisions.',
              },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 3 && (
                  <div className="absolute left-full top-12 hidden h-px w-6 bg-border lg:block" />
                )}
                <Card className="h-full p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-semibold tabular-nums text-muted-foreground/30">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TalentIQ */}
      <section id="why-talentiq" className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Why TalentIQ
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built around the recruiter workflow — not a black box. Every score is traceable to
              resume evidence, and every requirement stays editable.
            </p>
            <div className="mt-8 space-y-5">
              {[
                'Candidate data is structured once and reused across every job evaluation.',
                'Job requirements are grouped and typed — ANY, ALL, or PREFERRED — not a flat list.',
                'Missing resume information is never treated as proof a candidate lacks a skill.',
                'Evaluation scores are illustrative and labeled as such, never presented as guarantees.',
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-3 w-3" />
                  </div>
                  <p className="text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-6">
              <p className="text-3xl font-semibold tabular-nums">6</p>
              <p className="mt-1 text-sm text-muted-foreground">Structured candidate profiles in your pool</p>
            </Card>
            <Card className="p-6">
              <p className="text-3xl font-semibold tabular-nums">4</p>
              <p className="mt-1 text-sm text-muted-foreground">Jobs with editable, structured requirements</p>
            </Card>
            <Card className="p-6">
              <p className="text-3xl font-semibold tabular-nums">5</p>
              <p className="mt-1 text-sm text-muted-foreground">Score categories per evaluation</p>
            </Card>
            <Card className="p-6">
              <p className="text-3xl font-semibold tabular-nums">100%</p>
              <p className="mt-1 text-sm text-muted-foreground">Evidence-backed score reasoning</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-12 text-center shadow-sm sm:px-12">
            <div className="absolute inset-0 -z-10 bg-dots opacity-30" />
            <div className="absolute inset-x-0 -top-20 -z-10 h-40 bg-gradient-to-b from-primary/10 to-transparent" />
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Start evaluating candidates with clarity
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Upload resumes, create jobs, and review explainable evaluations — all in one recruiter workspace.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/#features">Learn more</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
