import { AcademicBackground, CareerPreferences, PersonalInfo, WeeklyAvailability } from './assessment';
import { TechnicalSkillItem } from './skills';

export interface StudentProfile {
  id: string;
  personalInfo: PersonalInfo;
  academicBackground: AcademicBackground;
  technicalSkills: TechnicalSkillItem[];
  softSkills: string[];
  interests: string[];
  careerPreferences: CareerPreferences;
  weeklyAvailability: WeeklyAvailability;
  accountSettings: {
    emailNotifications: boolean;
    weeklyDigest: boolean;
    roadmapReminders: boolean;
    privacyMode: boolean;
  };
}
