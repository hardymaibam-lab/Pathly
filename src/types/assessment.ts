import { TechnicalSkillItem } from './skills';

export type RIASECCategory = 
  | 'Realistic' 
  | 'Investigative' 
  | 'Artistic' 
  | 'Social' 
  | 'Enterprising' 
  | 'Conventional';

export interface RIASECQuestion {
  id: string;
  category: RIASECCategory;
  code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  text: string;
  contextHint?: string;
}

export type RIASECResponseValue = 1 | 2 | 3 | 4 | 5;

export type RIASECResponses = Record<string, RIASECResponseValue>;

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export interface AcademicBackground {
  degree: string;
  major: string;
  institution: string;
  graduationYear: number;
  gpa?: string;
  coursework: string[];
}

export interface CareerPreferences {
  targetRoles: string[];
  targetIndustries: string[];
  workPreference: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  expectedSalaryMin: number;
  preferredCompanySizes: string[];
}

export interface WeeklyAvailability {
  weeklyStudyHours: number;
  preferredDays: string[];
  targetTimelineMonths: number;
}

export interface OnboardingState {
  currentStep: number;
  personalInfo: PersonalInfo;
  academicBackground: AcademicBackground;
  technicalSkills: TechnicalSkillItem[];
  softSkills: string[];
  riasecResponses: RIASECResponses;
  careerPreferences: CareerPreferences;
  weeklyAvailability: WeeklyAvailability;
  isDraftSaved?: boolean;
  lastSavedAt?: string;
}

export interface AssessmentStatusResponse {
  isCompleted: boolean;
  completedStep: number;
  lastUpdated: string;
  savedState?: Partial<OnboardingState>;
}
