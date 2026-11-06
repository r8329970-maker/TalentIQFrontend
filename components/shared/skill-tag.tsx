import { cn } from '@/lib/utils';

interface SkillTagProps {
  name: string;
  variant?: 'default' | 'matched' | 'missing' | 'preferred';
  className?: string;
}

const variantClass = {
  default: 'bg-muted text-muted-foreground border-transparent',
  matched: 'bg-success/10 text-success border-success/20',
  missing: 'bg-destructive/10 text-destructive border-destructive/20',
  preferred: 'bg-primary/10 text-primary border-primary/20',
};

export function SkillTag({ name, variant = 'default', className }: SkillTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        variantClass[variant],
        className,
      )}
    >
      {name}
    </span>
  );
}

export function SkillTagList({
  skills,
  variant = 'default',
  max = 8,
  className,
}: {
  skills: string[];
  variant?: SkillTagProps['variant'];
  max?: number;
  className?: string;
}) {
  const visible = skills.slice(0, max);
  const remaining = skills.length - visible.length;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visible.map((s, i) => (
        <SkillTag key={`${s}-${i}`} name={s} variant={variant} />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-md border border-transparent bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
