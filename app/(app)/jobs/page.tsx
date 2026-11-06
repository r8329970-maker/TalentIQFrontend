'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Briefcase,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Play,
  Ban,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { StatCard } from '@/components/shared/stat-card';
import { JobStatusBadge } from '@/components/shared/status-badges';
import { SkillTagList } from '@/components/shared/skill-tag';
import { EmptyState, PageHeader } from '@/components/shared/page-elements';
import { mockJobs } from '@/lib/mock-data';
import { formatDate, skillGroupTypeLabel } from '@/lib/format';
import type { Job, JobStatus } from '@/lib/types';

type SortKey = 'recent' | 'title' | 'experience';

const allLocations = Array.from(
  new Set(mockJobs.map((j) => j.location).filter(Boolean) as string[]),
).sort();

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);

  const filtered = useMemo(() => {
    let list = jobs.filter((j) => {
      if (query && !j.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(j.status)) return false;
      if (locationFilter.length > 0 && !locationFilter.includes(j.location ?? '')) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'experience') return (a.minExperience ?? 0) - (b.minExperience ?? 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [jobs, query, statusFilter, locationFilter, sort]);

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === 'ACTIVE').length,
    draft: jobs.filter((j) => j.status === 'DRAFT').length,
    closed: jobs.filter((j) => j.status === 'CLOSED').length,
  };

  const toggleArr = <T,>(arr: T[], val: T, setter: (v: T[]) => void) =>
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const activeFilterCount = statusFilter.length + locationFilter.length;
  const clearFilters = () => { setStatusFilter([]); setLocationFilter([]); };

  const handleStatusChange = (job: Job, newStatus: JobStatus) => {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j)));
    toast.success(`Job ${newStatus.toLowerCase()}`, { description: job.title });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
    toast.success('Job deleted', { description: deleteTarget.title });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Create jobs with structured requirements and evaluate candidates against them."
        actions={
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Jobs" value={stats.total} icon={Briefcase} />
        <StatCard label="Active" value={stats.active} icon={Play} iconClassName="bg-success/10 text-success" />
        <StatCard label="Draft" value={stats.draft} icon={Pencil} iconClassName="bg-muted text-muted-foreground" />
        <StatCard label="Closed" value={stats.closed} icon={Ban} iconClassName="bg-muted text-muted-foreground" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by job title..."
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
              <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs">{activeFilterCount}</span>
            )}
          </Button>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[160px] shrink-0">
              <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently created</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="experience">Min experience</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="mr-1 h-3.5 w-3.5" /> Clear all
              </Button>
            )}
          </div>
          <div className="mt-3 grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Status</p>
              <div className="space-y-2">
                {(['ACTIVE', 'DRAFT', 'CLOSED'] as JobStatus[]).map((st) => (
                  <label key={st} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={statusFilter.includes(st)}
                      onCheckedChange={() => toggleArr(statusFilter, st, setStatusFilter)}
                    />
                    <span className="capitalize">{st.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>
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
          </div>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={
            query || activeFilterCount > 0
              ? 'Try adjusting your search or filters.'
              : 'Create your first job to start evaluating candidates.'
          }
          action={
            query || activeFilterCount > 0 ? (
              <Button variant="outline" onClick={() => { setQuery(''); clearFilters(); }}>Clear search</Button>
            ) : (
              <Button asChild><Link href="/jobs/new"><Plus className="mr-2 h-4 w-4" />Create Job</Link></Button>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job title</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Experience</TableHead>
                <TableHead className="hidden xl:table-cell">Skills</TableHead>
                <TableHead className="hidden lg:table-cell">Education</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="w-[60px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((j) => {
                const skillCount = j.skillGroups.reduce((acc, g) => acc + g.skills.length, 0);
                const hasEduReq = !!j.educationRequirement;
                return (
                  <TableRow
                    key={j.id}
                    className="cursor-pointer"
                    onClick={() => window.location.assign(`/jobs/${j.id}`)}
                  >
                    <TableCell>
                      <p className="font-medium">{j.title}</p>
                      <p className="text-xs text-muted-foreground">{skillCount} skills · {j.skillGroups.length} groups</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{j.location || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {j.minExperience != null || j.maxExperience != null
                        ? `${j.minExperience ?? 0}–${j.maxExperience ?? '?'} yrs`
                        : '—'}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <SkillTagList
                        skills={j.skillGroups.flatMap((g) => g.skills.map((s) => s.name))}
                        max={3}
                      />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {hasEduReq ? 'Required' : '—'}
                    </TableCell>
                    <TableCell><JobStatusBadge status={j.status} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(j.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => window.location.assign(`/jobs/${j.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.assign(`/jobs/${j.id}/matches`)}>
                              <Briefcase className="mr-2 h-4 w-4" /> View matches
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.assign(`/jobs/${j.id}`)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {j.status !== 'ACTIVE' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(j, 'ACTIVE')}>
                                <Play className="mr-2 h-4 w-4" /> Activate
                              </DropdownMenuItem>
                            )}
                            {j.status !== 'CLOSED' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(j, 'CLOSED')}>
                                <Ban className="mr-2 h-4 w-4" /> Close
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(j)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{deleteTarget?.title}" and its associated evaluations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
