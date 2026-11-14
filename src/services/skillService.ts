import { SkillGapAnalysisResponse } from '../types/skills';
import { apiClient, USE_MOCKS } from './api';
import { mockAdapter } from '../mocks/mockAdapter';

export const skillService = {
  async getGapAnalysis(): Promise<SkillGapAnalysisResponse> {
    if (USE_MOCKS) {
      return mockAdapter.getSkillGapAnalysis();
    }
    return apiClient<SkillGapAnalysisResponse>('/skills/gap-analysis');
  },
};
