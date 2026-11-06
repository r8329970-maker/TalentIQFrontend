import { cn } from '@/lib/utils';
import {
  jobStatusLabel,
  matchStatusLabel,
  resumeStatusLabel,
} from '@/lib/format';
import type {
  JobStatus,
  MatchEvaluationStatus,
  ResumeStatus,
} from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const resumeVariant: Record<ResumeStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground border-border',
  PROCESSING: 'bg-primary/10 text-primary border-primary/20',
  COMPLETED: 'bg-success/10 text-success border-success/20',
  FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
};

const jobVariant: Record<JobStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground border-border',
  ACTIVE: 'bg-success/10 text-success border-success/20',
  CLOSED: 'bg-muted text-muted-foreground border-border',
};

const matchVariant: Record<MatchEvaluationStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground border-border',
  EVALUATED: 'bg-primary/10 text-primary border-primary/20',
  SHORTLISTED: 'bg-success/10 text-success border-success/20',
  REJECTED: 'bg-destructive/10 text-destructive border-destructive/20',
  NEEDS_REVIEW: 'bg-warning/10 text-warning border-warning/20',
};

export function ResumeStatusBadge({ status }: { status: ResumeStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', resumeVariant[status])}>
      <span
        className={cn(
          'mr-1.5 h-1.5 w-1.5 rounded-full',
          status === 'COMPLETED' && 'bg-success',
          status === 'PROCESSING' && 'bg-primary',
          status === 'FAILED' && 'bg-destructive',
          status === 'PENDING' && 'bg-muted-foreground',
        )}
      />
      {resumeStatusLabel[status]}
    </Badge>
  );
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', jobVariant[status])}>
      <span
        className={cn(
          'mr-1.5 h-1.5 w-1.5 rounded-full',
          status === 'ACTIVE' && 'bg-success',
          status === 'CLOSED' && 'bg-muted-foreground',
          status === 'DRAFT' && 'bg-muted-foreground',
        )}
      />
      {jobStatusLabel[status]}
    </Badge>
  );
}

export function MatchStatusBadge({ status }: { status: MatchEvaluationStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', matchVariant[status])}>
      {matchStatusLabel[status]}
    </Badge>
  );
}
