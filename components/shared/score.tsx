import { cn } from '@/lib/utils';
import { scoreBand } from '@/lib/format';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

export function ScoreRing({
  score,
  size = 56,
  strokeWidth = 5,
  className,
  showLabel = true,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const band = scoreBand(score);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-700', {
            'stroke-success': score >= 80,
            'stroke-primary': score >= 60 && score < 80,
            'stroke-warning': score >= 40 && score < 60,
            'stroke-muted-foreground': score < 40,
          })}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold tabular-nums">
          {score}
        </span>
      )}
      <span className="sr-only">{band.label} match</span>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
  className?: string;
}

export function ScoreBar({ label, score, className }: ScoreBarProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-700', {
            'bg-success': score >= 80,
            'bg-primary': score >= 60 && score < 80,
            'bg-warning': score >= 40 && score < 60,
            'bg-muted-foreground': score < 40,
          })}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
