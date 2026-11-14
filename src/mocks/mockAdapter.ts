import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';
import { OnboardingState, AssessmentStatusResponse, RIASECQuestion } from '../types/assessment';
import { Career, CareerDetail } from '../types/career';
import { DashboardSummary } from '../types/dashboard';
import { RoadmapData } from '../types/roadmap';
import { SkillGapAnalysisResponse } from '../types/skills';
import { StudentProfile } from '../types/user';
import {
  INITIAL_PROFILE,
  INITIAL_USER,
  MOCK_CAREERS,
  MOCK_CAREER_DETAILS,
  MOCK_DASHBOARD,
  MOCK_ROADMAP,
  MOCK_SKILL_GAP,
} from './mockData';
import { RIASEC_QUESTIONS } from './riasecQuestions';

const STORAGE_KEYS = {
  USER: 'pathly_user',
  TOKEN: 'pathly_auth_token',
  PROFILE: 'pathly_profile',
  ROADMAP: 'pathly_roadmap',
  DRAFT: 'pathly_onboarding_draft',
  SKILLS: 'pathly_skill_gap',
};

// Simulated network latency
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to write to localStorage', e);
  }
}

export const mockAdapter = {
  // Auth
  async login(payload: LoginPayload): Promise<AuthResponse> {
    await delay(200);
    if (!payload.email || !payload.password) {
      throw new Error('Please provide email and password.');
    }
    const user: User = getStorage(STORAGE_KEYS.USER, INITIAL_USER);
    const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
    setStorage(STORAGE_KEYS.TOKEN, token);
    setStorage(STORAGE_KEYS.USER, user);
    return {
      user,
      token,
      tokenType: 'bearer',
    };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay(250);
    if (!payload.email || !payload.password || !payload.fullName) {
      throw new Error('Please fill in all required registration fields.');
    }
    const newUser: User = {
      id: 'usr_' + Date.now().toString(36),
      fullName: payload.fullName,
      email: payload.email,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };
    const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
    setStorage(STORAGE_KEYS.USER, newUser);
    setStorage(STORAGE_KEYS.TOKEN, token);
    return {
      user: newUser,
      token,
      tokenType: 'bearer',
    };
  },

  async me(): Promise<User> {
    await delay(100);
    const user = getStorage<User | null>(STORAGE_KEYS.USER, null);
    if (!user) {
      // Default to guest or demo student
      return INITIAL_USER;
    }
    return user;
  },

  async logout(): Promise<void> {
    await delay(100);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Assessment
  async getRIASECQuestions(): Promise<RIASECQuestion[]> {
    await delay(100);
    return RIASEC_QUESTIONS;
  },

  async getAssessmentStatus(): Promise<AssessmentStatusResponse> {
    await delay(120);
    const draft = getStorage<Partial<OnboardingState> | null>(STORAGE_KEYS.DRAFT, null);
    const user = getStorage<User>(STORAGE_KEYS.USER, INITIAL_USER);
    return {
      isCompleted: user.onboardingCompleted,
      completedStep: draft?.currentStep || (user.onboardingCompleted ? 7 : 1),
      lastUpdated: new Date().toISOString(),
      savedState: draft || undefined,
    };
  },

  async saveDraft(step: number, draftData: Partial<OnboardingState>): Promise<{ savedAt: string }> {
    await delay(150);
    const updatedDraft: Partial<OnboardingState> = {
      ...draftData,
      currentStep: step,
      isDraftSaved: true,
      lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setStorage(STORAGE_KEYS.DRAFT, updatedDraft);
    return { savedAt: updatedDraft.lastSavedAt! };
  },

  async submitAssessment(state: OnboardingState): Promise<{ success: boolean; message: string }> {
    await delay(350);
    // Mark user onboarding completed
    const currentUser = getStorage<User>(STORAGE_KEYS.USER, INITIAL_USER);
    const updatedUser: User = { ...currentUser, onboardingCompleted: true };
    setStorage(STORAGE_KEYS.USER, updatedUser);

    // Update profile
    const currentProfile = getStorage<StudentProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    const updatedProfile: StudentProfile = {
      ...currentProfile,
      personalInfo: state.personalInfo,
      academicBackground: state.academicBackground,
      technicalSkills: state.technicalSkills,
      softSkills: state.softSkills,
      careerPreferences: state.careerPreferences,
      weeklyAvailability: state.weeklyAvailability,
    };
    setStorage(STORAGE_KEYS.PROFILE, updatedProfile);

    // Clear draft
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
    return { success: true, message: 'Career recommendations computed successfully!' };
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    await delay(150);
    const roadmap = getStorage<RoadmapData>(STORAGE_KEYS.ROADMAP, MOCK_ROADMAP);
    return {
      ...MOCK_DASHBOARD,
      roadmapProgressPct: roadmap.progressPct,
      topCareerRecommendations: MOCK_CAREERS,
    };
  },

  // Careers
  async getCareers(readinessFilter?: string): Promise<Career[]> {
    await delay(160);
    if (!readinessFilter || readinessFilter === 'All') {
      return MOCK_CAREERS;
    }
    return MOCK_CAREERS.filter((c) => c.readinessLabel.toLowerCase() === readinessFilter.toLowerCase());
  },

  async getCareerById(id: string): Promise<CareerDetail> {
    await delay(180);
    const detail = MOCK_CAREER_DETAILS[id];
    if (detail) return detail;
    // Fallback: build detail from mock list
    const basic = MOCK_CAREERS.find((c) => c.id === id) || MOCK_CAREERS[0];
    return {
      ...basic,
      overview: `Detailed professional path for ${basic.title}. This track emphasizes hands-on systems architecture, scalable software practices, and high-impact industry delivery.`,
      industryOutlook: 'Robust hiring projections with high market demand across enterprise technology sectors.',
      scoreBreakdown: {
        overall: basic.compatibilityScore,
        skillCompatibility: basic.compatibilityScore - 2,
        interestCompatibility: Math.min(98, basic.compatibilityScore + 3),
        academicRelevance: basic.compatibilityScore + 1,
        marketDemand: 91,
      },
      strengths: [
        'Solid programming core in primary languages',
        'Demonstrated analytical mindset and problem decomposition',
        'Relevant computer science academic groundwork',
      ],
      skillGaps: [
        'Advanced distributed architecture design',
        'End-to-end continuous integration and deployment pipelines',
      ],
      requiredSkills: [
        { name: 'Core Language', category: 'Languages', requiredLevel: 'Advanced', currentLevel: 'Advanced', status: 'Matched' },
        { name: 'Architecture Design', category: 'Fundamentals', requiredLevel: 'Advanced', currentLevel: 'Intermediate', status: 'Minor Gap' },
        { name: 'Cloud Infrastructure', category: 'Cloud & Infra', requiredLevel: 'Intermediate', currentLevel: 'Beginner', status: 'Moderate Gap' },
      ],
      riasecAlignment: {
        primaryCode: 'IRC',
        description: 'Strong alignment with your Investigative and Conventional assessment scores.',
        alignmentPercentage: basic.compatibilityScore,
      },
      recommendedNextSteps: [
        'Activate this track on your Personalized Learning Roadmap',
        'Review the critical skill gaps and prioritize Stage 1 project deliverables',
      ],
    };
  },

  // Skill Gap Analysis
  async getSkillGapAnalysis(): Promise<SkillGapAnalysisResponse> {
    await delay(170);
    return getStorage<SkillGapAnalysisResponse>(STORAGE_KEYS.SKILLS, MOCK_SKILL_GAP);
  },

  // Roadmap
  async getRoadmap(): Promise<RoadmapData> {
    await delay(180);
    return getStorage<RoadmapData>(STORAGE_KEYS.ROADMAP, MOCK_ROADMAP);
  },

  async toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<{
    task: { id: string; isCompleted: boolean };
    roadmap: RoadmapData;
  }> {
    await delay(150);
    const roadmap = getStorage<RoadmapData>(STORAGE_KEYS.ROADMAP, MOCK_ROADMAP);

    let totalTasks = 0;
    let completedTasks = 0;

    const updatedStages = roadmap.stages.map((stage) => {
      const updatedTasks = stage.tasks.map((task) => {
        if (task.id === taskId) {
          const updated = {
            ...task,
            isCompleted,
            completedAt: isCompleted ? new Date().toISOString().split('T')[0] : undefined,
          };
          if (updated.isCompleted) completedTasks++;
          totalTasks++;
          return updated;
        }
        if (task.isCompleted) completedTasks++;
        totalTasks++;
        return task;
      });

      // Update stage status
      const allStageTasksDone = updatedTasks.every((t) => t.isCompleted);
      const someStageTasksDone = updatedTasks.some((t) => t.isCompleted);
      const status = allStageTasksDone ? 'Completed' : someStageTasksDone ? 'In Progress' : stage.status;

      return {
        ...stage,
        status,
        tasks: updatedTasks,
      };
    });

    const newProgressPct = Math.round((completedTasks / totalTasks) * 100);
    const updatedRoadmap: RoadmapData = {
      ...roadmap,
      completedTasksCount: completedTasks,
      totalTasksCount: totalTasks,
      progressPct: newProgressPct,
      stages: updatedStages,
    };

    setStorage(STORAGE_KEYS.ROADMAP, updatedRoadmap);
    return {
      task: { id: taskId, isCompleted },
      roadmap: updatedRoadmap,
    };
  },

  // Profile & Settings
  async getProfile(): Promise<StudentProfile> {
    await delay(150);
    return getStorage<StudentProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
  },

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    await delay(200);
    const current = getStorage<StudentProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    const updated: StudentProfile = {
      ...current,
      ...updates,
      personalInfo: { ...current.personalInfo, ...(updates.personalInfo || {}) },
      academicBackground: { ...current.academicBackground, ...(updates.academicBackground || {}) },
      careerPreferences: { ...current.careerPreferences, ...(updates.careerPreferences || {}) },
      weeklyAvailability: { ...current.weeklyAvailability, ...(updates.weeklyAvailability || {}) },
      accountSettings: { ...current.accountSettings, ...(updates.accountSettings || {}) },
    };
    setStorage(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },
};
