'use client';

import { useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Play,
  Ban,
  Gauge,
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap,
  Layers,
  ListChecks,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { JobStatusBadge } from '@/components/shared/status-badges';
import { SkillTag } from '@/components/shared/skill-tag';
import { EmptyState } from '@/components/shared/page-elements';
import { getJobById, mockCandidates, getEvaluationsForJob } from '@/lib/mock-data';
import {
  formatDate,
  skillGroupTypeLabel,
  skillGroupTypeHint,
  educationLevelLabel,
} from '@/lib/format';
import type { JobStatus } from '@/lib/types';

export default function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const job = getJobById(id);

  if (!job) notFound();

  const [showDelete, setShowDelete] = useState(false);
  const evaluations = getEvaluationsForJob(job.id);
  const evaluatedCandidateIds = new Set(evaluations.map((e) => e.candidateId));
  const poolCount = mockCandidates.length;

  const handleStatusChange = (newStatus: JobStatus) => {
    toast.success(`Job ${newStatus.toLowerCase()}`, { description: job.title });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/jobs')}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to jobs
        </Button>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/jobs/${job.id}/matches`}>
              <Gauge className="mr-2 h-4 w-4" />
              Evaluate Candidates
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => toast.info('Mock: edit job')}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              {job.status !== 'ACTIVE' && (
                <DropdownMenuItem onClick={() => handleStatusChange('ACTIVE')}>
                  <Play className="mr-2 h-4 w-4" /> Activate
                </DropdownMenuItem>
              )}
              {job.status !== 'CLOSED' && (
                <DropdownMenuItem onClick={() => handleStatusChange('CLOSED')}>
                  <Ban className="mr-2 h-4 w-4" /> Close
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">{job.title}</h1>
                <JobStatusBadge status={job.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {job.location && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                )}
                {(job.minExperience != null || job.maxExperience != null) && (
                  <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {job.minExperience ?? 0}–{job.maxExperience ?? '?'} yrs</span>
                )}
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>
          {job.description && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: responsibilities + description */}
        <div className="space-y-6 lg:col-span-2">
          {/* Responsibilities */}
          {job.jobResponsibility.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.jobResponsibility.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skill groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Skill requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.skillGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skill groups defined.</p>
              ) : (
                job.skillGroups.map((group) => (
                  <div key={group.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{group.category}</p>
                      <Badge variant="outline" className="text-xs">
                        {skillGroupTypeLabel[group.requirementType]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{skillGroupTypeHint[group.requirementType]}</p>
                    {group.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {group.skills.map((s) => (
                          <SkillTag key={s.id} name={s.name} />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: education + candidate pool */}
        <div className="space-y-6">
          {/* Education requirement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.educationRequirement ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Minimum level</span>
                    <span className="font-medium">{educationLevelLabel[job.educationRequirement.minEducationLevel]}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mandatory</span>
                    <span className="font-medium">{job.educationRequirement.isMandatory ? 'Yes' : 'No'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Related degrees</span>
                    <span className="font-medium">{job.educationRequirement.relatedDegreesAllowed ? 'Allowed' : 'Exact only'}</span>
                  </div>
                  {job.educationRequirement.relatedDegreeFieldsOfStudy.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">Related fields of study</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.educationRequirement.relatedDegreeFieldsOfStudy.map((f, i) => (
                            <SkillTag key={i} name={f} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {job.educationRequirement.acceptedDegrees.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Accepted degrees</p>
                        {job.educationRequirement.acceptedDegrees.map((d) => (
                          <div key={d.id} className="rounded-md border bg-card p-2.5 text-xs">
                            <p className="font-medium">{d.degreeName || 'Unnamed degree'}</p>
                            {d.acceptedFieldOfStudy && (
                              <p className="text-muted-foreground">Field: {d.acceptedFieldOfStudy}{d.isFieldOfStudyMandatory ? ' (mandatory)' : ''}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No education requirement set.</p>
              )}
            </CardContent>
          </Card>

          {/* Candidate pool */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-muted-foreground" />
                Candidate pool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <p className="text-2xl font-semibold tabular-nums">{poolCount}</p>
                <p className="text-xs text-muted-foreground">candidates available</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <p className="text-2xl font-semibold tabular-nums">{evaluatedCandidateIds.size}</p>
                <p className="text-xs text-muted-foreground">already evaluated</p>
              </div>
              <Button asChild className="w-full">
                <Link href={`/jobs/${job.id}/matches`}>
                  <Gauge className="mr-2 h-4 w-4" />
                  {evaluatedCandidateIds.size > 0 ? 'View matches' : 'Evaluate candidates'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{job.title}" and its associated evaluations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { toast.success('Job deleted', { description: job.title }); router.push('/jobs'); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
