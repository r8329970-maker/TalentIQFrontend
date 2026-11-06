'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Download,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Calendar,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AvatarName } from '@/components/shared/avatar-name';
import { SkillTag, SkillTagList } from '@/components/shared/skill-tag';
import { ResumeStatusBadge } from '@/components/shared/status-badges';
import { EmptyState } from '@/components/shared/page-elements';
import {
  getCandidateById,
  getResumeForCandidate,
  mockEvaluations,
  mockJobs,
} from '@/lib/mock-data';
import {
  formatDate,
  formatDuration,
  totalExperienceYears,
  educationLevelLabel,
  gradeTypeLabel,
} from '@/lib/format';
import { scoreBand } from '@/lib/format';

export default function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const candidate = getCandidateById(id);

  if (!candidate) notFound();

  const resume = getResumeForCandidate(candidate.id);
  const yrs = totalExperienceYears(candidate.experience);
  const evaluations = mockEvaluations.filter((e) => e.candidateId === candidate.id);

  const sortedExperience = [...candidate.experience].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
  const sortedEducation = [...candidate.education].sort((a, b) => b.startYear - a.startYear);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/candidates">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to candidates
          </Link>
        </Button>
      </div>

      {/* Header card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <AvatarName name={candidate.name} size="lg" />
              <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight">{candidate.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {yrs} yrs experience · {candidate.location || 'Location unknown'}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
                  <a href={`mailto:${candidate.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                    <Mail className="h-3.5 w-3.5" /> {candidate.email}
                  </a>
                  {candidate.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {candidate.phone}
                    </span>
                  )}
                  {candidate.linkedIn && (
                    <a
                      href={`https://${candidate.linkedIn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Linkedin className="h-3.5 w-3.5" /> {candidate.linkedIn}
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {resume && (
                <>
                  <ResumeStatusBadge status={resume.status} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info(`Mock: download ${resume.fileName}`)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                </>
              )}
            </div>
          </div>

          {candidate.summary && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {candidate.summary}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: skills + evaluations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Primary skills</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillTagList skills={candidate.skills} max={20} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evaluations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {evaluations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No evaluations yet for this candidate.
                </p>
              ) : (
                evaluations.map((e, i) => {
                  const job = mockJobs.find((j) => j.id === e.jobId);
                  const band = scoreBand(e.overallScore);
                  return (
                    <div key={e.id}>
                      {i > 0 && <Separator className="my-1" />}
                      <Link
                        href={`/jobs/${e.jobId}/matches`}
                        className="flex items-center gap-3 rounded-md py-2.5 transition-colors hover:bg-muted/40 -mx-2 px-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{job?.title ?? 'Unknown job'}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(e.evaluatedAt)}</p>
                        </div>
                        <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums ${band.className}`}>
                          {e.overallScore}
                        </span>
                      </Link>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: experience, projects, education */}
        <div className="space-y-6 lg:col-span-2">
          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Work experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedExperience.length === 0 ? (
                <p className="text-sm text-muted-foreground">No experience listed.</p>
              ) : (
                <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
                  {sortedExperience.map((exp) => (
                    <div key={exp.id} className="relative pl-8">
                      <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">{exp.position}</p>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'} · {formatDuration(exp.startDate, exp.endDate)}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No projects listed.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {candidate.projects.map((p) => (
                    <div key={p.id} className="rounded-lg border bg-card p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{p.title}</p>
                        {p.projectUrl && (
                          <a
                            href={`https://${p.projectUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      {p.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.technologies.map((t) => (
                          <SkillTag key={t} name={t} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedEducation.length === 0 ? (
                <p className="text-sm text-muted-foreground">No education listed.</p>
              ) : (
                <div className="space-y-4">
                  {sortedEducation.map((edu) => (
                    <div key={edu.id} className="rounded-lg border bg-card p-4">
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">{edu.institution}</p>
                          <p className="text-sm text-muted-foreground">
                            {educationLevelLabel[edu.educationLevel]}
                            {edu.degree ? ` · ${edu.degree}` : ''}
                            {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {edu.startYear} — {edu.endYear ?? 'Present'}
                        </span>
                      </div>
                      {edu.grade && edu.gradeType && (
                        <p className="mt-2 text-sm">
                          <span className="text-muted-foreground">{gradeTypeLabel[edu.gradeType]}: </span>
                          <span className="font-medium">{edu.grade}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resume info */}
      {resume && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Resume file
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{resume.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  Added {formatDate(resume.createdAt)} · {resume.status}
                </p>
              </div>
              <ResumeStatusBadge status={resume.status} />
              <Button variant="outline" size="sm" onClick={() => toast.info(`Mock: download ${resume.fileName}`)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            {resume.errorMessage && (
              <p className="mt-2 text-sm text-destructive">{resume.errorMessage}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
