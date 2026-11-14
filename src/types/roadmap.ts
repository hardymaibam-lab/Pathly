export type StageStatus = 'Completed' | 'In Progress' | 'Upcoming' | 'Locked';

export type TaskCategory = 'Project' | 'Theory' | 'Coding' | 'System Design' | 'Assessment' | 'Databases';

export type ResourceType = 'Course' | 'Documentation' | 'Book' | 'GitHub' | 'Interactive';

export interface RoadmapTask {
  id: string;
  stageId: string;
  title: string;
  description: string;
  category: TaskCategory;
  estimatedHours: number;
  isCompleted: boolean;
  completedAt?: string;
  deliverable?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetWeek: number;
  isCompleted: boolean;
  badgeIcon?: string;
}

export interface RoadmapStage {
  id: string;
  stageNumber: number;
  title: string;
  description: string;
  duration: string;
  status: StageStatus;
  milestones: Milestone[];
  tasks: RoadmapTask[];
}

export interface WeeklyScheduleSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  focus: string;
  hours: number;
  completedThisWeek: boolean;
}

export interface WeeklySchedule {
  totalWeeklyHours: number;
  scheduleSlots: WeeklyScheduleSlot[];
  tipsForSuccess: string[];
}

export interface RecommendedResource {
  id: string;
  title: string;
  type: ResourceType;
  provider: string;
  url: string;
  isFree: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
}

export interface RoadmapData {
  careerId: string;
  careerTitle: string;
  totalWeeks: number;
  currentWeek: number;
  completedTasksCount: number;
  totalTasksCount: number;
  progressPct: number;
  stages: RoadmapStage[];
  weeklySchedule: WeeklySchedule;
  resources: RecommendedResource[];
}
