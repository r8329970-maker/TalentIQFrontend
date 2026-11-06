'use client';

import Link from 'next/link';
import {
  Users,
  Briefcase,
  Loader2,
  Gauge,
  ArrowRight,
  Plus,
  Upload,
  Activity as ActivityIcon,
  FileText,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatCard } from '@/components/shared/stat-card';
import { AvatarName } from '@/components/shared/avatar-name';
import { SkillTag } from '@/components/shared/skill-tag';
import { JobStatusBadge } from '@/components/shared/status-badges';
import { ResumeUploadDialog } from '@/components/shared/resume-upload-dialog';
import {
  mockCandidates,
  mockJobs,
  mockResumes,
  mockActivity,
  mockEvaluations,
} from '@/lib/mock-data';
import { formatRelativeTime, totalExperienceYears, scoreBand } from '@/lib/format';
import type { ActivityItem } from '@/lib/types';

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'resume_uploaded': return FileText;
    case 'candidate_created': return Users;
    case 'job_created': return Briefcase;
    case 'evaluation_completed': return Gauge;
    case 'job_status_changed': return ActivityIcon;
    default: return FileText;
  }
}

export default function DashboardPage() {
  const totalCandidates = mockCandidates.length;
  const activeJobs = mockJobs.filter((j) => j.status === 'ACTIVE').length;
  const processing = mockResumes.filter((r) => r.status === 'PROCESSING' || r.status === 'PENDING').length;
  const evaluated = mockEvaluations.length;

  const recentCandidates = [...mockCandidates]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const recentJobs = [...mockJobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const evaluationsByBand = {
    strong: mockEvaluations.filter((e) => e.overallScore >= 80).length,
    potential: mockEvaluations.filter((e) => e.overallScore >= 60 && e.overallScore < 80).length,
    fair: mockEvaluations.filter((e) => e.overallScore >= 40 && e.overallScore < 60).length,
    review: mockEvaluations.filter((e) => e.overallScore < 40).length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Priya</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening in your recruiting pipeline today.
          </p>
        </div>
        <div className="flex gap-2">
          <ResumeUploadDialog>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Resumes
            </Button>
          </ResumeUploadDialog>
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Candidates" value={totalCandidates} icon={Users} hint="In your candidate pool" trend={{ value: '+2 this week', positive: true }} />
        <StatCard label="Active Jobs" value={activeJobs} icon={Briefcase} hint={`${mockJobs.length} total jobs`} />
        <StatCard label="Resumes Processing" value={processing} icon={Loader2} iconClassName="bg-primary/10 text-primary" hint="Awaiting parsing" />
        <StatCard label="Candidates Evaluated" value={evaluated} icon={Gauge} hint="Across all jobs" trend={{ value: '+6 latest run', positive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Evaluation overview</CardTitle>
            <p className="text-sm text-muted-foreground">Score distribution from your latest evaluation run.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <BandRow label="Strong matches" count={evaluationsByBand.strong} total={evaluated} barClass="bg-success" />
            <BandRow label="Potential matches" count={evaluationsByBand.potential} total={evaluated} barClass="bg-primary" />
            <BandRow label="Fair matches" count={evaluationsByBand.fair} total={evaluated} barClass="bg-warning" />
            <BandRow label="Needs review" count={evaluationsByBand.review} total={evaluated} barClass="bg-muted-foreground" />
            <Separator />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MiniStat label="Skills avg" value={avg(mockEvaluations.map((e) => e.skillsScore))} />
              <MiniStat label="Experience avg" value={avg(mockEvaluations.map((e) => e.experienceScore))} />
              <MiniStat label="Role align avg" value={avg(mockEvaluations.map((e) => e.roleAlignmentScore))} />
              <MiniStat label="Education avg" value={avg(mockEvaluations.map((e) => e.educationScore))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {mockActivity.slice(0, 5).map((a, i) => {
              const Icon = getActivityIcon(a.type);
              return (
                <div key={a.id}>
                  {i > 0 && <Separator className="my-1" />}
                  <div className="flex gap-3 py-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.description}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground/70">{formatRelativeTime(a.timestamp)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recently added candidates</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/candidates">View all<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentCandidates.map((c, i) => {
              const yrs = totalExperienceYears(c.experience);
              const evalRecord = mockEvaluations.find((e) => e.candidateId === c.id);
              const band = evalRecord ? scoreBand(evalRecord.overallScore) : null;
              return (
                <div key={c.id}>
                  {i > 0 && <Separator className="my-1" />}
                  <Link href={`/candidates/${c.id}`} className="flex items-center gap-3 rounded-md py-2.5 transition-colors hover:bg-muted/40 -mx-2 px-2">
                    <AvatarName name={c.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{yrs} yrs exp · {c.location || 'Location unknown'}</p>
                    </div>
                    <div className="hidden gap-1 sm:flex">
                      {c.skills.slice(0, 2).map((s) => (<SkillTag key={s} name={s} />))}
                    </div>
                    {evalRecord && band && (
                      <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums ${band.className}`}>{evalRecord.overallScore}</span>
                    )}
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent jobs</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/jobs">View all<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentJobs.map((j, i) => (
              <div key={j.id}>
                {i > 0 && <Separator className="my-1" />}
                <Link href={`/jobs/${j.id}`} className="flex items-center gap-3 rounded-md py-2.5 transition-colors hover:bg-muted/40 -mx-2 px-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{j.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{j.location || 'No location'} · {formatRelativeTime(j.createdAt)}</p>
                  </div>
                  <JobStatusBadge status={j.status} />
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BandRow({ label, count, total, barClass }: { label: string; count: number; total: number; barClass: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{count} <span className="text-muted-foreground">({pct}%)</span></span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-700 ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}
