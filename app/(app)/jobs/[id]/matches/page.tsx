'use client';

import { useMemo, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  ArrowUpDown,
  Eye,
  X,
  Check,
  AlertCircle,
  Star,
  Ban,
  Clock,
  FileText,
  MessageSquare,
  Info,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatCard } from '@/components/shared/stat-card';
import { AvatarName } from '@/components/shared/avatar-name';
import { ScoreRing, ScoreBar } from '@/components/shared/score';
import { SkillTag, SkillTagList } from '@/components/shared/skill-tag';
import { MatchStatusBadge } from '@/components/shared/status-badges';
import { EmptyState } from '@/components/shared/page-elements';
import {
  getJobById,
  getCandidateById,
  getEvaluationsForJob,
} from '@/lib/mock-data';
import {
  formatDate,
  scoreBand,
  totalExperienceYears,
} from '@/lib/format';
import type { CandidateEvaluation, MatchEvaluationStatus } from '@/lib/types';

type SortKey = 'overall' | 'skills' | 'experience' | 'roleAlignment' | 'education' | 'location';

export default function MatchingResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const job = getJobById(id);

  if (!job) notFound();

  const baseEvaluations = getEvaluationsForJob(job.id);
  const [evaluations, setEvaluations] = useState<CandidateEvaluation[]>(baseEvaluations);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('overall');
  const [statusFilter, setStatusFilter] = useState<MatchEvaluationStatus | 'all'>('all');
  const [selected, setSelected] = useState<CandidateEvaluation | null>(null);
  const [noteDialog, setNoteDialog] = useState<CandidateEvaluation | null>(null);
  const [noteText, setNoteText] = useState('');

  const enriched = useMemo(
    () =>
      evaluations
        .map((e) => ({ eval: e, candidate: getCandidateById(e.candidateId) }))
        .filter((x) => x.candidate),
    [evaluations],
  );

  const filtered = useMemo(() => {
    let list = enriched.filter(({ candidate }) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        candidate!.name.toLowerCase().includes(q) ||
        candidate!.email.toLowerCase().includes(q) ||
        candidate!.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
    if (statusFilter !== 'all') {
      list = list.filter((x) => x.eval.status === statusFilter);
    }
    const sortFieldMap: Record<SortKey, keyof CandidateEvaluation> = {
      overall: 'overallScore',
      skills: 'skillsScore',
      experience: 'experienceScore',
      roleAlignment: 'roleAlignmentScore',
      education: 'educationScore',
      location: 'locationScore',
    };
    const field = sortFieldMap[sort];
    list = [...list].sort((a, b) => b.eval[field] - a.eval[field]);
    return list;
  }, [enriched, query, sort, statusFilter]);

  const stats = {
    evaluated: evaluations.length,
    strong: evaluations.filter((e) => e.overallScore >= 80).length,
    potential: evaluations.filter((e) => e.overallScore >= 60 && e.overallScore < 80).length,
    review: evaluations.filter((e) => e.overallScore < 60).length,
  };

  const updateStatus = (evalId: string, status: MatchEvaluationStatus, label: string) => {
    setEvaluations((prev) => prev.map((e) => (e.id === evalId ? { ...e, status } : e)));
    setSelected((prev) => (prev && prev.id === evalId ? { ...prev, status } : prev));
    toast.success(`Candidate ${label.toLowerCase()}`);
  };

  const addNote = () => {
    if (!noteDialog || !noteText.trim()) return;
    setEvaluations((prev) =>
      prev.map((e) =>
        e.id === noteDialog.id ? { ...e, reviewNotes: [...e.reviewNotes, noteText.trim()] } : e,
      ),
    );
    setSelected((prev) =>
      prev && prev.id === noteDialog.id
        ? { ...prev, reviewNotes: [...prev.reviewNotes, noteText.trim()] }
        : prev,
    );
    toast.success('Note added');
    setNoteText('');
    setNoteDialog(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/jobs/${job.id}`)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to job
        </Button>
        <span className="text-xs text-muted-foreground">
          Evaluation data is illustrative.
        </span>
      </div>

      {/* Job header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {evaluations.length} candidates evaluated · {formatDate(evaluations[0]?.evaluatedAt ?? new Date().toISOString())}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Candidates Evaluated" value={stats.evaluated} icon={Eye} />
        <StatCard label="Strong Matches" value={stats.strong} icon={Check} iconClassName="bg-success/10 text-success" />
        <StatCard label="Potential Matches" value={stats.potential} icon={Star} iconClassName="bg-primary/10 text-primary" />
        <StatCard label="Needs Review" value={stats.review} icon={AlertCircle} iconClassName="bg-warning/10 text-warning" />
      </div>

      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name, email, or skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MatchEvaluationStatus | 'all')}>
          <SelectTrigger className="w-[150px] shrink-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="EVALUATED">Evaluated</SelectItem>
            <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="NEEDS_REVIEW">Needs Review</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-[160px] shrink-0">
            <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overall">Overall score</SelectItem>
            <SelectItem value="skills">Skills</SelectItem>
            <SelectItem value="experience">Experience</SelectItem>
            <SelectItem value="roleAlignment">Role alignment</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="location">Location</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ranking table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="No matching candidates"
          description="Try adjusting your search or filters."
          action={<Button variant="outline" onClick={() => { setQuery(''); setStatusFilter('all'); }}>Clear filters</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">Rank</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead className="text-center">Overall</TableHead>
                <TableHead className="hidden md:table-cell text-center">Skills</TableHead>
                <TableHead className="hidden lg:table-cell text-center">Experience</TableHead>
                <TableHead className="hidden xl:table-cell text-center">Role</TableHead>
                <TableHead className="hidden xl:table-cell text-center">Education</TableHead>
                <TableHead className="hidden lg:table-cell text-center">Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px] text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ eval: e, candidate }, i) => {
                const band = scoreBand(e.overallScore);
                return (
                  <TableRow
                    key={e.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(e)}
                  >
                    <TableCell className="text-center font-semibold tabular-nums text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarName name={candidate!.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{candidate!.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{candidate!.location || 'Location unknown'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn('inline-flex rounded-md border px-2 py-0.5 text-sm font-semibold tabular-nums', band.className)}>
                        {e.overallScore}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center font-medium tabular-nums">{e.skillsScore}</TableCell>
                    <TableCell className="hidden lg:table-cell text-center font-medium tabular-nums">{e.experienceScore}</TableCell>
                    <TableCell className="hidden xl:table-cell text-center font-medium tabular-nums">{e.roleAlignmentScore}</TableCell>
                    <TableCell className="hidden xl:table-cell text-center font-medium tabular-nums">{e.educationScore}</TableCell>
                    <TableCell className="hidden lg:table-cell text-center font-medium tabular-nums">{e.locationScore}</TableCell>
                    <TableCell><MatchStatusBadge status={e.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(ev) => { ev.stopPropagation(); setSelected(e); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin">
          {selected && <EvaluationDetail evaluation={selected} onStatus={updateStatus} onAddNote={(e) => { setNoteDialog(e); setNoteText(''); }} />}
        </DialogContent>
      </Dialog>

      {/* Note dialog */}
      <Dialog open={!!noteDialog} onOpenChange={(open) => !open && setNoteDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a review note</DialogTitle>
            <DialogDescription>
              Notes are visible only to recruiters and help track evaluation decisions.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Write your note..."
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(null)}>Cancel</Button>
            <Button onClick={addNote}>Add note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EvaluationDetail({
  evaluation: e,
  onStatus,
  onAddNote,
}: {
  evaluation: CandidateEvaluation;
  onStatus: (id: string, status: MatchEvaluationStatus, label: string) => void;
  onAddNote: (e: CandidateEvaluation) => void;
}) {
  const candidate = getCandidateById(e.candidateId);
  if (!candidate) return null;
  const band = scoreBand(e.overallScore);
  const yrs = totalExperienceYears(candidate.experience);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <AvatarName name={candidate.name} size="md" />
          <div>
            <h2 className="text-lg font-semibold">{candidate.name}</h2>
            <p className="text-sm text-muted-foreground">{yrs} yrs · {candidate.location || 'Unknown'}</p>
          </div>
        </div>
        <ScoreRing score={e.overallScore} size={64} />
      </div>

      <div className="flex items-center gap-2">
        <MatchStatusBadge status={e.status} />
        <span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', band.className)}>{band.label} match</span>
        <a
          href={`mailto:${candidate.email}`}
          className="ml-auto text-sm text-primary hover:underline"
        >
          Contact
        </a>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onStatus(e.id, 'SHORTLISTED', 'Shortlisted')}>
          <Star className="mr-1.5 h-3.5 w-3.5" /> Shortlist
        </Button>
        <Button size="sm" variant="outline" onClick={() => onStatus(e.id, 'REJECTED', 'Rejected')}>
          <Ban className="mr-1.5 h-3.5 w-3.5" /> Reject
        </Button>
        <Button size="sm" variant="outline" onClick={() => onStatus(e.id, 'NEEDS_REVIEW', 'Marked for review')}>
          <Clock className="mr-1.5 h-3.5 w-3.5" /> Mark for Review
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAddNote(e)}>
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Add Note
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href={`/candidates/${candidate.id}`}>
            View profile <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Score breakdown */}
      <div className="rounded-lg border p-4">
        <p className="text-sm font-semibold">Score breakdown</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ScoreBar label="Skills" score={e.skillsScore} />
          <ScoreBar label="Experience" score={e.experienceScore} />
          <ScoreBar label="Role alignment" score={e.roleAlignmentScore} />
          <ScoreBar label="Education" score={e.educationScore} />
          <ScoreBar label="Location" score={e.locationScore} />
        </div>
      </div>

      {/* Skills analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm font-semibold text-success">Matching skills</p>
          <div className="mt-2">
            {e.matchingSkills.length > 0 ? (
              <SkillTagList skills={e.matchingSkills} variant="matched" max={20} />
            ) : (
              <p className="text-xs text-muted-foreground">No matching skills detected from resume.</p>
            )}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm font-semibold text-destructive">Missing required skills</p>
          <div className="mt-2">
            {e.missingRequiredSkills.length > 0 ? (
              <SkillTagList skills={e.missingRequiredSkills} variant="missing" max={20} />
            ) : (
              <p className="text-xs text-muted-foreground">No missing required skills.</p>
            )}
          </div>
        </div>
      </div>

      {e.preferredSkills.length > 0 && (
        <div className="rounded-lg border p-4">
          <p className="text-sm font-semibold text-primary">Preferred skills</p>
          <div className="mt-2">
            <SkillTagList skills={e.preferredSkills} variant="preferred" max={20} />
          </div>
        </div>
      )}

      {/* Relevant experience */}
      {e.relevantExperience.length > 0 && (
        <div className="rounded-lg border p-4">
          <p className="text-sm font-semibold">Relevant experience</p>
          <div className="mt-3 space-y-3">
            {e.relevantExperience.map((exp, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={cn(
                  'mt-1 h-2 w-2 shrink-0 rounded-full',
                  exp.relevance === 'high' && 'bg-success',
                  exp.relevance === 'medium' && 'bg-primary',
                  exp.relevance === 'low' && 'bg-muted-foreground',
                )} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{exp.position} · {exp.company}</p>
                  <p className="text-xs text-muted-foreground">{exp.duration}</p>
                  {exp.note && <p className="mt-0.5 text-xs text-muted-foreground">{exp.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education assessment */}
      <div className="rounded-lg border p-4">
        <p className="text-sm font-semibold">Education assessment</p>
        <div className="mt-2 flex items-center gap-2">
          {e.educationAssessment.meetsMinimum ? (
            <span className="flex items-center gap-1.5 text-sm text-success"><Check className="h-4 w-4" /> Meets minimum requirement</span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> Does not meet minimum requirement</span>
          )}
        </div>
        {e.educationAssessment.matchedDegrees.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">Matched degrees</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {e.educationAssessment.matchedDegrees.map((d, i) => <SkillTag key={i} name={d} variant="matched" />)}
            </div>
          </div>
        )}
        {e.educationAssessment.missingDegrees.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">Missing degrees</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {e.educationAssessment.missingDegrees.map((d, i) => <SkillTag key={i} name={d} variant="missing" />)}
            </div>
          </div>
        )}
        {e.educationAssessment.note && (
          <p className="mt-2 text-xs text-muted-foreground">{e.educationAssessment.note}</p>
        )}
      </div>

      {/* Resume evidence */}
      {e.resumeEvidence.length > 0 && (
        <div className="rounded-lg border p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Resume evidence
          </p>
          <div className="mt-3 space-y-2.5">
            {e.resumeEvidence.map((ev, i) => (
              <div key={i} className="rounded-md bg-muted/40 p-3">
                <p className="text-sm italic">&ldquo;{ev.snippet}&rdquo;</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{ev.source}</p>
                  <span className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
                    ev.relevance === 'high' && 'bg-success/10 text-success',
                    ev.relevance === 'medium' && 'bg-primary/10 text-primary',
                    ev.relevance === 'low' && 'bg-muted text-muted-foreground',
                  )}>
                    {ev.relevance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review notes */}
      {e.reviewNotes.length > 0 && (
        <div className="rounded-lg border p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Review notes
          </p>
          <div className="mt-3 space-y-2">
            {e.reviewNotes.map((note, i) => (
              <div key={i} className="rounded-md bg-muted/40 p-2.5 text-sm">{note}</div>
            ))}
          </div>
        </div>
      )}

      {/* Caveat */}
      <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        <p>
          Scores are illustrative and based on resume content only. Missing information on a resume
          does not prove a candidate lacks a skill. Always confirm qualifications directly.
        </p>
      </div>
    </div>
  );
}
