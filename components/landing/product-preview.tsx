import { Check, AlertCircle, FileText } from 'lucide-react';
import { ScoreRing } from '@/components/shared/score';
import { SkillTag } from '@/components/shared/skill-tag';
import { AvatarName } from '@/components/shared/avatar-name';
import { Card } from '@/components/ui/card';

export function ProductPreview() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-3xl" />

      <Card className="overflow-hidden shadow-xl shadow-primary/5">
        <div className="border-b bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/40" />
            <span className="ml-3 text-xs text-muted-foreground">talentiq.io / jobs / senior-frontend / matches</span>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-5 sm:p-6">
          {/* Candidate card */}
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <AvatarName name="Alex Chen" size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Alex Chen</p>
                <p className="truncate text-xs text-muted-foreground">Senior Frontend Engineer</p>
              </div>
              <ScoreRing score={92} size={48} className="ml-auto" />
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Matching skills</p>
              <div className="flex flex-wrap gap-1.5">
                <SkillTag name="React" variant="matched" />
                <SkillTag name="TypeScript" variant="matched" />
                <SkillTag name="Tailwind CSS" variant="matched" />
                <SkillTag name="Storybook" variant="matched" />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Experience</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  <div className="text-xs">
                    <p className="font-medium">Linear — Senior Frontend Engineer</p>
                    <p className="text-muted-foreground">Design-system rewrite</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  <div className="text-xs">
                    <p className="font-medium">Stripe — Frontend Engineer</p>
                    <p className="text-muted-foreground">Merchant dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="sm:col-span-3 space-y-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Evaluation breakdown</p>
                <span className="text-xs text-muted-foreground">Illustrative</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                <ScoreMini label="Skills" value={95} />
                <ScoreMini label="Experience" value={90} />
                <ScoreMini label="Role alignment" value={94} />
                <ScoreMini label="Education" value={88} />
                <ScoreMini label="Location" value={100} />
                <ScoreMini label="Overall" value={92} highlight />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Job requirements</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">Core Frontend</span>
                  <span className="text-muted-foreground">· All required</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <SkillTag name="React" variant="matched" />
                  <SkillTag name="TypeScript" variant="matched" />
                  <SkillTag name="Tailwind CSS" variant="matched" />
                </div>
                <div className="mt-2 flex items-start gap-2 text-xs">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                  <span className="text-muted-foreground">
                    No missing required skills detected from resume.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ScoreMini({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className={highlight ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
        <span className={`font-semibold tabular-nums ${highlight ? 'text-primary' : ''}`}>{value}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${highlight ? 'bg-primary' : value >= 80 ? 'bg-success' : value >= 60 ? 'bg-primary' : 'bg-warning'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
