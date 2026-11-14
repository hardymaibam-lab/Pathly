import { AssessmentStatusResponse, OnboardingState, RIASECQuestion } from '../types/assessment';
import { apiClient, USE_MOCKS } from './api';
import { mockAdapter } from '../mocks/mockAdapter';

export const assessmentService = {
  async getRIASECQuestions(): Promise<RIASECQuestion[]> {
    if (USE_MOCKS) {
      return mockAdapter.getRIASECQuestions();
    }
    const res = await apiClient<{ questions: RIASECQuestion[] }>('/assessment/riasec-questions');
    return res.questions;
  },

  async getStatus(): Promise<AssessmentStatusResponse> {
    if (USE_MOCKS) {
      return mockAdapter.getAssessmentStatus();
    }
    return apiClient<AssessmentStatusResponse>('/assessment/status');
  },

  async saveDraft(step: number, draftData: Partial<OnboardingState>): Promise<{ savedAt: string }> {
    if (USE_MOCKS) {
      return mockAdapter.saveDraft(step, draftData);
    }
    return apiClient<{ savedAt: string }>('/assessment/save-draft', {
      method: 'PUT',
      body: JSON.stringify({ current_step: step, draft_data: draftData }),
    });
  },

  async submitAssessment(state: OnboardingState): Promise<{ success: boolean; message: string }> {
    if (USE_MOCKS) {
      return mockAdapter.submitAssessment(state);
    }
    return apiClient<{ success: boolean; message: string }>('/assessment/submit', {
      method: 'POST',
      body: JSON.stringify(state),
    });
  },
};
