import { Career } from './career';

export interface RecentActivity {
  id: string;
  type: 'assessment' | 'roadmap_task' | 'milestone' | 'profile_update' | 'career_view';
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardSummary {
  careerReadinessScore: number;
  profileCompletionPct: number;
  topCareerRecommendations: Career[];
  skillStrengthsCount: number;
  skillGapsCount: number;
  roadmapProgressPct: number;
  activeMilestoneTitle: string;
  recentActivities: RecentActivity[];
  riasecBreakdown: Record<string, number>;
  skillDistribution: {
    category: string;
    proficientCount: number;
    gapCount: number;
  }[];
}
