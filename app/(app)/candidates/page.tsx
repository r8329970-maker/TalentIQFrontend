'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Upload,
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { SkillTagList } from '@/components/shared/skill-tag';
import { ResumeStatusBadge } from '@/components/shared/status-badges';
import { EmptyState, PageHeader } from '@/components/shared/page-elements';
import { ResumeUploadDialog } from '@/components/shared/resume-upload-dialog';
import { mockCandidates, mockResumes } from '@/lib/mock-data';
import {
  formatDate,
  totalExperienceYears,
  resumeStatusLabel,
} from '@/lib/format';
import type { ResumeStatus } from '@/lib/types';

type SortKey = 'recent' | 'name' | 'experience';

const allLocations = Array.from(
  new Set(mockCandidates.map((c) => c.location).filter(Boolean) as string[]),
).sort();

const allSkills = Array.from(
  new Set(mockCandidates.flatMap((c) => c.skills)),
).sort();

export default function CandidatesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<ResumeStatus[]>([]);
  const [sort, setSort] = useState<SortKey>('recent');
  const [showFilters, setShowFilters] = useState(false);

  const resumeForCandidate = (candidateId: string) =>
    mockResumes.find((r) => r.candidateId === candidateId);

  const filtered = useMemo(() => {
    let list = mockCandidates.filter((c) => {
      if (query) {
        const q = query.toLowerCase();
        const match =
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (locationFilter.length > 0 && !locationFilter.includes(c.location ?? '')) return false;
      if (skillFilter.length > 0 && !skillFilter.some((s) => c.skills.includes(s))) return false;
      if (statusFilter.length > 0) {
        const resume = resumeForCandidate(c.id);
        if (!resume || !statusFilter.includes(resume.status)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'experience')
        return totalExperienceYears(b.experience) - totalExperienceYears(a.experience);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [query, locationFilter, skillFilter, statusFilter, sort]);

  const stats = {
    total: mockCandidates.length,
    completed: mockResumes.filter((r) => r.status === 'COMPLETED').length,
    processing: mockResumes.filter((r) => r.status === 'PROCESSING' || r.status === 'PENDING').length,
    failed: mockResumes.filter((r) => r.status === 'FAILED').length,
  };

  const toggleArr = <T,>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const activeFilterCount =
    locationFilter.length + skillFilter.length + statusFilter.length;

  const clearFilters = () => {
    setLocationFilter([]);
    setSkillFilter([]);
    setStatusFilter([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidates"
        description="Your reusable candidate pool — search, filter, and review parsed profiles."
        actions={
          <ResumeUploadDialog>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Resumes
            </Button>
          </ResumeUploadDialog>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Candidates" value={stats.total} icon={Users} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} iconClassName="bg-success/10 text-success" />
        <StatCard label="Processing" value={stats.processing} icon={Loader2} iconClassName="bg-primary/10 text-primary" />
        <StatCard label="Failed" value={stats.failed} icon={AlertCircle} iconClassName="bg-destructive/10 text-destructive" />
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters((v) => !v)}
            className="shrink-0"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[160px] shrink-0">
              <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently added</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="mr-1 h-3.5 w-3.5" />
                Clear all
              </Button>
            )}
          </div>
          <div className="mt-3 grid gap-5 md:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Location</p>
              <div className="max-h-40 space-y-2 overflow-y-auto scrollbar-thin pr-1">
                {allLocations.map((loc) => (
                  <label key={loc} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={locationFilter.includes(loc)}
                      onCheckedChange={() => toggleArr(locationFilter, loc, setLocationFilter)}
                    />
                    <span className="truncate">{loc}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Skills</p>
              <div className="max-h-40 space-y-2 overflow-y-auto scrollbar-thin pr-1">
                {allSkills.slice(0, 15).map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={skillFilter.includes(s)}
                      onCheckedChange={() => toggleArr(skillFilter, s, setSkillFilter)}
                    />
                    <span className="truncate">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Resume status</p>
              <div className="space-y-2">
                {(['COMPLETED', 'PROCESSING', 'PENDING', 'FAILED'] as ResumeStatus[]).map((st) => (
                  <label key={st} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={statusFilter.includes(st)}
                      onCheckedChange={() => toggleArr(statusFilter, st, setStatusFilter)}
                    />
                    <span>{resumeStatusLabel[st]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description={
            query || activeFilterCount > 0
              ? 'Try adjusting your search or filters.'
              : 'Upload resumes to start building your candidate pool.'
          }
          action={
            query || activeFilterCount > 0 ? (
              <Button variant="outline" onClick={() => { setQuery(''); clearFilters(); }}>
                Clear search
              </Button>
            ) : (
              <ResumeUploadDialog>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resumes
                </Button>
              </ResumeUploadDialog>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Experience</TableHead>
                <TableHead className="hidden xl:table-cell">Skills</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead className="hidden sm:table-cell">Added</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const resume = resumeForCandidate(c.id);
                const yrs = totalExperienceYears(c.experience);
                return (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => window.location.assign(`/candidates/${c.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarName name={c.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{c.location || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{yrs} yrs</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <SkillTagList skills={c.skills} max={3} />
                    </TableCell>
                    <TableCell>
                      {resume ? <ResumeStatusBadge status={resume.status} /> : <span className="text-xs text-muted-foreground">No resume</span>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resume && toast.info(`Mock: download ${resume.fileName}`)}>
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link href={`/candidates/${c.id}`}><Eye className="h-4 w-4 text-muted-foreground" /></Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
