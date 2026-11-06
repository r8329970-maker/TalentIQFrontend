import type {
  EducationLevel,
  GradeType,
  JobExtractionStatus,
  JobStatus,
  MatchEvaluationStatus,
  ResumeStatus,
  SkillGroupType,
} from './types';

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.round((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(iso);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(start: string, end?: string | null): string {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (remMonths > 0) parts.push(`${remMonths} mo${remMonths > 1 ? 's' : ''}`);
  return parts.join(' ') || '< 1 mo';
}

export function totalExperienceYears(experience: { startDate: string; endDate?: string | null }[]): number {
  if (experience.length === 0) return 0;
  let totalMonths = 0;
  for (const exp of experience) {
    const s = new Date(exp.startDate);
    const e = exp.endDate ? new Date(exp.endDate) : new Date();
    const months =
      (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (months > 0) totalMonths += months;
  }
  return Math.round((totalMonths / 12) * 10) / 10;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const EDUCATION_LEVELS: EducationLevel[] = [
  'SECONDARY',
  'HIGHER_SECONDARY',
  'DIPLOMA',
  'ASSOCIATE',
  'UNDERGRADUATE',
  'POSTGRADUATE',
  'DOCTORATE',
  'OTHER',
];

export const educationLevelLabel: Record<EducationLevel, string> = {
  SECONDARY: 'Secondary',
  HIGHER_SECONDARY: 'Higher Secondary',
  DIPLOMA: 'Diploma',
  ASSOCIATE: 'Associate',
  UNDERGRADUATE: "Bachelor's",
  POSTGRADUATE: "Master's",
  DOCTORATE: 'Doctorate',
  OTHER: 'Other',
};

export const educationLevelOrder: Record<EducationLevel, number> = {
  SECONDARY: 1,
  HIGHER_SECONDARY: 2,
  DIPLOMA: 3,
  ASSOCIATE: 4,
  UNDERGRADUATE: 5,
  POSTGRADUATE: 6,
  DOCTORATE: 7,
  OTHER: 0,
};

export const resumeStatusLabel: Record<ResumeStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export const jobStatusLabel: Record<JobStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
};

export const extractionStatusLabel: Record<JobExtractionStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export const skillGroupTypeLabel: Record<SkillGroupType, string> = {
  ANY: 'At least one',
  ALL: 'All required',
  PREFERRED: 'Preferred',
};

export const skillGroupTypeHint: Record<SkillGroupType, string> = {
  ANY: 'Candidate must have at least one skill in this group.',
  ALL: 'Candidate must have every skill in this group.',
  PREFERRED: 'These skills add to the score but are not mandatory.',
};

export const gradeTypeLabel: Record<GradeType, string> = {
  PERCENTAGE: 'Percentage',
  CGPA: 'CGPA',
};

export const matchStatusLabel: Record<MatchEvaluationStatus, string> = {
  PENDING: 'Pending',
  EVALUATED: 'Evaluated',
  SHORTLISTED: 'Shortlisted',
  REJECTED: 'Rejected',
  NEEDS_REVIEW: 'Needs Review',
};

export function scoreBand(score: number): {
  label: string;
  className: string;
  barClass: string;
} {
  if (score >= 80)
    return {
      label: 'Strong',
      className: 'bg-success/10 text-success border-success/20',
      barClass: 'bg-success',
    };
  if (score >= 60)
    return {
      label: 'Potential',
      className: 'bg-primary/10 text-primary border-primary/20',
      barClass: 'bg-primary',
    };
  if (score >= 40)
    return {
      label: 'Fair',
      className: 'bg-warning/10 text-warning border-warning/20',
      barClass: 'bg-warning',
    };
  return {
    label: 'Needs Review',
    className: 'bg-muted text-muted-foreground border-border',
    barClass: 'bg-muted-foreground',
  };
}
