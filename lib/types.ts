// TalentIQ — domain types following the provided database schema.
// These are frontend-only types used to shape mock data; no backend is assumed.

export type ResumeStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type EducationLevel =
  | 'SECONDARY'
  | 'HIGHER_SECONDARY'
  | 'DIPLOMA'
  | 'ASSOCIATE'
  | 'UNDERGRADUATE'
  | 'POSTGRADUATE'
  | 'DOCTORATE'
  | 'OTHER';

export type GradeType = 'PERCENTAGE' | 'CGPA';

export type JobStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export type JobExtractionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type SkillGroupType = 'ANY' | 'ALL' | 'PREFERRED';

export type MatchEvaluationStatus =
  | 'PENDING'
  | 'EVALUATED'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'NEEDS_REVIEW';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  status: ResumeStatus;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedById: string;
  candidateId?: string | null;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  candidateId: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  technologies: string[];
  projectUrl?: string | null;
  candidateId: string;
}

export interface Education {
  id: string;
  educationLevel: EducationLevel;
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startYear: number;
  endYear?: number | null;
  gradeType?: GradeType | null;
  grade?: string | null;
  candidateId: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  linkedIn?: string | null;
  summary?: string | null;
  skills: string[];
  normalizedSkills: string[];
  createdAt: string;
  updatedAt: string;
  resumeId?: string | null;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  uploadedById: string;
}

export interface SkillRequirement {
  id: string;
  name: string;
  normalizedName: string;
  groupId: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  requirementType: SkillGroupType;
  jobId: string;
  skills: SkillRequirement[];
}

export interface AcceptedDegree {
  id: string;
  degreeName: string;
  normalizedDegreeName: string;
  acceptedFieldOfStudy?: string | null;
  normalizedAcceptedFieldOfStudy?: string | null;
  isFieldOfStudyMandatory: boolean;
  educationRequirementId: string;
}

export interface EducationRequirement {
  id: string;
  minEducationLevel: EducationLevel;
  relatedDegreesAllowed: boolean;
  isMandatory: boolean;
  relatedDegreeFieldsOfStudy: string[];
  normalizedRelatedDegreeFieldsOfStudy: string[];
  jobId: string;
  acceptedDegrees: AcceptedDegree[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  minExperience?: number | null;
  maxExperience?: number | null;
  location?: string | null;
  jobResponsibility: string[];
  status: JobStatus;
  extractionStatus: JobExtractionStatus;
  extractionError?: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  skillGroups: SkillGroup[];
  educationRequirement?: EducationRequirement | null;
}

// ---- Matching / evaluation UI types (not DB fields on Candidate or Job) ----

export interface ResumeEvidence {
  snippet: string;
  source: string;
  relevance: 'high' | 'medium' | 'low';
}

export interface EducationAssessment {
  meetsMinimum: boolean;
  matchedDegrees: string[];
  missingDegrees: string[];
  note?: string;
}

export interface RelevantExperienceItem {
  company: string;
  position: string;
  duration: string;
  relevance: 'high' | 'medium' | 'low';
  note?: string;
}

export interface CandidateEvaluation {
  id: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  roleAlignmentScore: number;
  educationScore: number;
  locationScore: number;
  status: MatchEvaluationStatus;
  evaluatedAt: string;
  matchingSkills: string[];
  missingRequiredSkills: string[];
  preferredSkills: string[];
  relevantExperience: RelevantExperienceItem[];
  educationAssessment: EducationAssessment;
  resumeEvidence: ResumeEvidence[];
  reviewNotes: string[];
}

export interface ActivityItem {
  id: string;
  type: 'resume_uploaded' | 'candidate_created' | 'job_created' | 'evaluation_completed' | 'job_status_changed';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}
