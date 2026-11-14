import { ProficiencyLevel, SkillCategory } from './skills';

export type ReadinessLabel = 'Ready Now' | 'Minor Upskilling' | 'Moderate Upskilling' | 'Long-term Path';

export interface ScoreBreakdown {
  overall: number;
  skillCompatibility: number;
  interestCompatibility: number;
  academicRelevance: number;
  marketDemand: number;
}

export interface CareerSkillRequirement {
  name: string;
  category: SkillCategory;
  requiredLevel: ProficiencyLevel;
  currentLevel: ProficiencyLevel | 'Missing';
  status: 'Matched' | 'Minor Gap' | 'Moderate Gap' | 'Missing';
}

export interface Career {
  id: string;
  title: string;
  category: string;
  compatibilityScore: number;
  readinessLabel: ReadinessLabel;
  shortExplanation: string;
  medianSalary: string;
  growthRate: string;
  topSkills: string[];
  workStyle: string;
}

export interface CareerDetail extends Career {
  overview: string;
  industryOutlook: string;
  scoreBreakdown: ScoreBreakdown;
  strengths: string[];
  skillGaps: string[];
  requiredSkills: CareerSkillRequirement[];
  riasecAlignment: {
    primaryCode: string;
    description: string;
    alignmentPercentage: number;
  };
  recommendedNextSteps: string[];
}
