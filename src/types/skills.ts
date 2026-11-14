export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type GapPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type SkillCategory = 'Languages' | 'Frameworks' | 'Cloud & Infra' | 'Databases' | 'AI & ML' | 'Fundamentals';

export interface TechnicalSkillItem {
  id?: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
}

export interface SkillGapItem {
  id: string;
  name: string;
  category: SkillCategory;
  currentLevel: ProficiencyLevel;
  requiredLevel: ProficiencyLevel;
  currentNumeric: number; // 1 to 4
  requiredNumeric: number; // 1 to 4
  priority: GapPriority;
  potentialScoreImprovement: number; // percentage points, e.g. +6%
  estimatedWeeksToBridge: number;
  description: string;
}

export interface SkillGapAnalysisResponse {
  overallReadinessScore: number;
  potentialMaxScore: number;
  skills: SkillGapItem[];
  missingSkillsCount: number;
  criticalGapsCount: number;
}
