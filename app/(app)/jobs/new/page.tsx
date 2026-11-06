'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  X,
  GraduationCap,
  Layers,
  Save,
  Rocket,
  Info,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-elements';
import {
  EDUCATION_LEVELS,
  educationLevelLabel,
  skillGroupTypeLabel,
  skillGroupTypeHint,
} from '@/lib/format';
import type {
  EducationLevel,
  SkillGroup,
  SkillGroupType,
  SkillRequirement,
  AcceptedDegree,
} from '@/lib/types';

type ExtractionState = 'idle' | 'processing' | 'completed';

let idCounter = 100;
const uid = (prefix: string) => `${prefix}_${++idCounter}`;

interface DraftJob {
  title: string;
  description: string;
  location: string;
  minExperience: string;
  maxExperience: string;
  jobResponsibility: string[];
  skillGroups: SkillGroup[];
  educationRequirement: {
    minEducationLevel: EducationLevel;
    relatedDegreesAllowed: boolean;
    isMandatory: boolean;
    relatedDegreeFieldsOfStudy: string[];
    acceptedDegrees: AcceptedDegree[];
  };
}

function emptyDraft(): DraftJob {
  return {
    title: '',
    description: '',
    location: '',
    minExperience: '',
    maxExperience: '',
    jobResponsibility: [''],
    skillGroups: [],
    educationRequirement: {
      minEducationLevel: 'UNDERGRADUATE',
      relatedDegreesAllowed: true,
      isMandatory: false,
      relatedDegreeFieldsOfStudy: [],
      acceptedDegrees: [],
    },
  };
}

function mockExtractedRequirements(title: string, description: string): Partial<DraftJob> {
  const text = `${title} ${description}`.toLowerCase();
  const skills = new Map<string, string>();
  const skillMap: Record<string, string> = {
    react: 'React', typescript: 'TypeScript', javascript: 'JavaScript',
    'node.js': 'Node.js', nodejs: 'Node.js', python: 'Python', go: 'Go',
    'tailwind css': 'Tailwind CSS', tailwindcss: 'Tailwind CSS',
    graphql: 'GraphQL', postgresql: 'PostgreSQL', aws: 'AWS', docker: 'Docker',
    kubernetes: 'Kubernetes', figma: 'Figma', 'next.js': 'Next.js', nextjs: 'Next.js',
    redis: 'Redis', kafka: 'Kafka', grpc: 'gRPC', terraform: 'Terraform',
    storybook: 'Storybook', 'framer motion': 'Framer Motion',
    'css modules': 'CSS Modules', accessibility: 'Accessibility',
    cypress: 'Cypress', playwright: 'Playwright', jest: 'Jest',
  };
  for (const [key, label] of Object.entries(skillMap)) {
    if (text.includes(key) && !skills.has(label.toLowerCase())) {
      skills.set(label.toLowerCase(), label);
    }
  }
  const allSkills = Array.from(skills.values());

  const core = allSkills.slice(0, 2);
  const styling = allSkills.filter((s) => ['Tailwind CSS', 'CSS Modules', 'Figma', 'Framer Motion'].includes(s));
  const bonus = allSkills.filter((s) => ['Storybook', 'Accessibility', 'Cypress', 'Playwright', 'Jest'].includes(s));

  const skillGroups: SkillGroup[] = [];
  if (core.length) {
    skillGroups.push({
      id: uid('sg'),
      category: 'Core',
      requirementType: 'ALL',
      jobId: '',
      skills: core.map((s) => ({ id: uid('sr'), name: s, normalizedName: s.toLowerCase(), groupId: '' })),
    });
  }
  if (styling.length) {
    skillGroups.push({
      id: uid('sg'),
      category: 'Styling & Design',
      requirementType: 'ANY',
      jobId: '',
      skills: styling.map((s) => ({ id: uid('sr'), name: s, normalizedName: s.toLowerCase(), groupId: '' })),
    });
  }
  if (bonus.length) {
    skillGroups.push({
      id: uid('sg'),
      category: 'Bonus',
      requirementType: 'PREFERRED',
      jobId: '',
      skills: bonus.map((s) => ({ id: uid('sr'), name: s, normalizedName: s.toLowerCase(), groupId: '' })),
    });
  }

  const responsibilities: string[] = [];
  if (text.includes('mentor')) responsibilities.push('Mentor junior engineers and drive code quality.');
  if (text.includes('design') || text.includes('component')) responsibilities.push('Own the component library and design-system evolution.');
  if (text.includes('scale') || text.includes('performance')) responsibilities.push('Ensure performance and reliability at scale.');
  if (responsibilities.length === 0) responsibilities.push('Deliver high-quality features in collaboration with the team.');

  const minExp = text.match(/(\d+)\+?\s*years?/) ? parseInt(text.match(/(\d+)\+?\s*years?/)![1]) : 3;

  return {
    title: title || '',
    location: text.includes('remote') ? 'Remote' : text.includes('san francisco') ? 'San Francisco, CA' : '',
    minExperience: String(minExp),
    maxExperience: String(minExp + 5),
    jobResponsibilities: responsibilities.length ? responsibilities : [''],
    skillGroups: skillGroups.length ? skillGroups : [],
    educationRequirement: {
      minEducationLevel: 'UNDERGRADUATE',
      relatedDegreesAllowed: true,
      isMandatory: true,
      relatedDegreeFieldsOfStudy: ['Computer Science', 'Software Engineering'],
      acceptedDegrees: [
        { id: uid('ad'), degreeName: "Bachelor's in Computer Science", normalizedDegreeName: "bachelor's in computer science", acceptedFieldOfStudy: 'Computer Science', normalizedAcceptedFieldOfStudy: 'computer science', isFieldOfStudyMandatory: true, educationRequirementId: '' },
      ],
    },
  };
}

export default function CreateJobPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftJob>(emptyDraft());
  const [extraction, setExtraction] = useState<ExtractionState>('idle');
  const [fieldOfStudyInput, setFieldOfStudyInput] = useState('');

  const canExtract = draft.description.trim().length > 50;

  const runExtraction = () => {
    if (!canExtract) {
      toast.error('Please add a longer job description before extracting.');
      return;
    }
    setExtraction('processing');
    setTimeout(() => {
      const extracted = mockExtractedRequirements(draft.title, draft.description);
      setDraft((prev) => ({ ...prev, ...extracted }));
      setExtraction('completed');
      toast.success('Requirements extracted', {
        description: 'Review and edit the extracted requirements before saving.',
      });
    }, 2200);
  };

  const update = (patch: Partial<DraftJob>) => setDraft((prev) => ({ ...prev, ...patch }));

  // Responsibilities
  const updateResponsibility = (i: number, val: string) => {
    setDraft((prev) => ({
      ...prev,
      jobResponsibility: prev.jobResponsibility.map((r, idx) => (idx === i ? val : r)),
    }));
  };

  // Skill groups
  const addSkillGroup = () => {
    setDraft((prev) => ({
      ...prev,
      skillGroups: [
        ...prev.skillGroups,
        { id: uid('sg'), category: 'New group', requirementType: 'ANY', jobId: '', skills: [] },
      ],
    }));
  };
  const updateSkillGroup = (id: string, patch: Partial<SkillGroup>) => {
    setDraft((prev) => ({
      ...prev,
      skillGroups: prev.skillGroups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  };
  const removeSkillGroup = (id: string) => {
    setDraft((prev) => ({ ...prev, skillGroups: prev.skillGroups.filter((g) => g.id !== id) }));
  };
  const addSkillToGroup = (groupId: string, name: string) => {
    if (!name.trim()) return;
    setDraft((prev) => ({
      ...prev,
      skillGroups: prev.skillGroups.map((g) =>
        g.id === groupId
          ? { ...g, skills: [...g.skills, { id: uid('sr'), name: name.trim(), normalizedName: name.trim().toLowerCase(), groupId }] }
          : g,
      ),
    }));
  };
  const removeSkillFromGroup = (groupId: string, skillId: string) => {
    setDraft((prev) => ({
      ...prev,
      skillGroups: prev.skillGroups.map((g) =>
        g.id === groupId ? { ...g, skills: g.skills.filter((s) => s.id !== skillId) } : g,
      ),
    }));
  };

  // Education
  const updateEdu = (patch: Partial<DraftJob['educationRequirement']>) => {
    setDraft((prev) => ({ ...prev, educationRequirement: { ...prev.educationRequirement, ...patch } }));
  };
  const addAcceptedDegree = () => {
    setDraft((prev) => ({
      ...prev,
      educationRequirement: {
        ...prev.educationRequirement,
        acceptedDegrees: [
          ...prev.educationRequirement.acceptedDegrees,
          { id: uid('ad'), degreeName: '', normalizedDegreeName: '', acceptedFieldOfStudy: '', normalizedAcceptedFieldOfStudy: '', isFieldOfStudyMandatory: false, educationRequirementId: '' },
        ],
      },
    }));
  };
  const updateAcceptedDegree = (id: string, patch: Partial<AcceptedDegree>) => {
    setDraft((prev) => ({
      ...prev,
      educationRequirement: {
        ...prev.educationRequirement,
        acceptedDegrees: prev.educationRequirement.acceptedDegrees.map((d) =>
          d.id === id ? { ...d, ...patch, normalizedDegreeName: (patch.degreeName ?? d.degreeName).toLowerCase(), normalizedAcceptedFieldOfStudy: (patch.acceptedFieldOfStudy ?? d.acceptedFieldOfStudy ?? '').toLowerCase() } : d,
        ),
      },
    }));
  };
  const removeAcceptedDegree = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      educationRequirement: {
        ...prev.educationRequirement,
        acceptedDegrees: prev.educationRequirement.acceptedDegrees.filter((d) => d.id !== id),
      },
    }));
  };
  const addFieldOfStudy = () => {
    if (!fieldOfStudyInput.trim()) return;
    updateEdu({ relatedDegreeFieldsOfStudy: [...draft.educationRequirement.relatedDegreeFieldsOfStudy, fieldOfStudyInput.trim()] });
    setFieldOfStudyInput('');
  };

  // Validation
  const validate = (): string | null => {
    if (!draft.title.trim()) return 'Job title is required.';
    if (!draft.description.trim()) return 'Job description is required.';
    return null;
  };

  const handleSave = (activate: boolean) => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(activate ? 'Job created and activated' : 'Job saved as draft', {
      description: draft.title,
    });
    router.push('/jobs');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/jobs')}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to jobs
        </Button>
      </div>

      <PageHeader
        title="Create Job"
        description="Add a job description and extract structured, editable requirements."
      />

      {/* Step 1: Job information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job title</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Frontend Engineer"
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Job description</Label>
            <Textarea
              id="description"
              placeholder="Paste the full job description here..."
              rows={8}
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {draft.description.trim().length} characters — aim for at least 200 for good extraction.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. San Francisco, CA (Hybrid)"
              value={draft.location}
              onChange={(e) => update({ location: e.target.value })}
            />
          </div>

          {extraction === 'idle' && (
            <Button onClick={runExtraction} disabled={!canExtract} size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Extract Requirements
            </Button>
          )}

          {extraction === 'processing' && (
            <div className="flex items-center gap-3 rounded-lg border bg-primary/5 p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium">Extracting requirements...</p>
                <p className="text-xs text-muted-foreground">Analyzing the job description for skills, experience, and education.</p>
              </div>
            </div>
          )}

          {extraction === 'completed' && (
            <div className="flex items-center gap-2 rounded-lg border bg-success/10 p-3 text-sm text-success">
              <Check className="h-4 w-4" />
              Requirements extracted — review and edit below.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Editable requirements */}
      {extraction === 'completed' && (
        <div className="space-y-6 animate-fade-in">
          {/* Experience & location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Experience & location</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Min experience (years)</Label>
                <Input type="number" min={0} value={draft.minExperience} onChange={(e) => update({ minExperience: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Max experience (years)</Label>
                <Input type="number" min={0} value={draft.maxExperience} onChange={(e) => update({ maxExperience: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={draft.location} onChange={(e) => update({ location: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Responsibilities</CardTitle>
              <Button variant="outline" size="sm" onClick={() => update({ jobResponsibility: [...draft.jobResponsibility, ''] })}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {draft.jobResponsibility.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Describe a responsibility..."
                    value={r}
                    onChange={(e) => updateResponsibility(i, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground"
                    onClick={() => update({ jobResponsibility: draft.jobResponsibility.filter((_, idx) => idx !== i) })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skill groups */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Skill groups
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Group skills by category and set how they're evaluated.</p>
              </div>
              <Button variant="outline" size="sm" onClick={addSkillGroup}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add group
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {draft.skillGroups.length === 0 && (
                <p className="text-sm text-muted-foreground">No skill groups yet. Add one to start defining required skills.</p>
              )}
              {draft.skillGroups.map((group) => (
                <SkillGroupEditor
                  key={group.id}
                  group={group}
                  onUpdate={(patch) => updateSkillGroup(group.id, patch)}
                  onRemove={() => removeSkillGroup(group.id)}
                  onAddSkill={(name) => addSkillToGroup(group.id, name)}
                  onRemoveSkill={(skillId) => removeSkillFromGroup(group.id, skillId)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Education requirement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                Education requirement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Minimum education level</Label>
                  <Select
                    value={draft.educationRequirement.minEducationLevel}
                    onValueChange={(v) => updateEdu({ minEducationLevel: v as EducationLevel })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>{educationLevelLabel[lvl]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Mandatory requirement</p>
                  <p className="text-xs text-muted-foreground">If on, candidates without this education are flagged.</p>
                </div>
                <Switch
                  checked={draft.educationRequirement.isMandatory}
                  onCheckedChange={(v) => updateEdu({ isMandatory: v })}
                />
              </div>

              <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Allow related degrees</p>
                  <p className="text-xs text-muted-foreground">Accept degrees in related fields of study, not just exact matches.</p>
                </div>
                <Switch
                  checked={draft.educationRequirement.relatedDegreesAllowed}
                  onCheckedChange={(v) => updateEdu({ relatedDegreesAllowed: v })}
                />
              </div>

              {/* Related fields of study */}
              <div className="space-y-2">
                <Label>Related degree fields of study</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Computer Science"
                    value={fieldOfStudyInput}
                    onChange={(e) => setFieldOfStudyInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFieldOfStudy(); } }}
                  />
                  <Button variant="outline" onClick={addFieldOfStudy}><Plus className="h-4 w-4" /></Button>
                </div>
                {draft.educationRequirement.relatedDegreeFieldsOfStudy.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {draft.educationRequirement.relatedDegreeFieldsOfStudy.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 text-xs">
                        {f}
                        <button
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => updateEdu({ relatedDegreeFieldsOfStudy: draft.educationRequirement.relatedDegreeFieldsOfStudy.filter((_, idx) => idx !== i) })}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Accepted degrees */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Accepted degrees</p>
                    <p className="text-xs text-muted-foreground">Each degree has its own field of study and mandatory-field setting.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addAcceptedDegree}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add degree
                  </Button>
                </div>
                {draft.educationRequirement.acceptedDegrees.length === 0 && (
                  <p className="text-sm text-muted-foreground">No accepted degrees added yet.</p>
                )}
                {draft.educationRequirement.acceptedDegrees.map((degree) => (
                  <div key={degree.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid flex-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Degree name</Label>
                          <Input
                            placeholder="e.g. B.S. Computer Science"
                            value={degree.degreeName}
                            onChange={(e) => updateAcceptedDegree(degree.id, { degreeName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Accepted field of study</Label>
                          <Input
                            placeholder="e.g. Computer Science"
                            value={degree.acceptedFieldOfStudy ?? ''}
                            onChange={(e) => updateAcceptedDegree(degree.id, { acceptedFieldOfStudy: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" onClick={() => removeAcceptedDegree(degree.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Switch
                          checked={degree.isFieldOfStudyMandatory}
                          onCheckedChange={(v) => updateAcceptedDegree(degree.id, { isFieldOfStudyMandatory: v })}
                        />
                        Field of study is mandatory
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => handleSave(false)}>
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button onClick={() => handleSave(true)}>
              <Rocket className="mr-2 h-4 w-4" />
              Activate Job
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillGroupEditor({
  group,
  onUpdate,
  onRemove,
  onAddSkill,
  onRemoveSkill,
}: {
  group: SkillGroup;
  onUpdate: (patch: Partial<SkillGroup>) => void;
  onRemove: () => void;
  onAddSkill: (name: string) => void;
  onRemoveSkill: (skillId: string) => void;
}) {
  const [skillInput, setSkillInput] = useState('');

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Input
            value={group.category}
            onChange={(e) => onUpdate({ category: e.target.value })}
            placeholder="e.g. Core Frontend"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Requirement type</Label>
          <Select
            value={group.requirementType}
            onValueChange={(v) => onUpdate({ requirementType: v as SkillGroupType })}
          >
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(skillGroupTypeLabel) as SkillGroupType[]).map((t) => (
                <SelectItem key={t} value={t}>{skillGroupTypeLabel[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{skillGroupTypeHint[group.requirementType]}</p>
      </div>

      {/* Skills in this group */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill and press Enter"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddSkill(skillInput);
                setSkillInput('');
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => { onAddSkill(skillInput); setSkillInput(''); }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {group.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {group.skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-0.5 text-xs font-medium"
              >
                {skill.name}
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveSkill(skill.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
