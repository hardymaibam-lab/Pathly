import { Career, CareerDetail } from '../types/career';
import { apiClient, USE_MOCKS } from './api';
import { mockAdapter } from '../mocks/mockAdapter';

export const careerService = {
  async getCareers(readinessFilter?: string): Promise<Career[]> {
    if (USE_MOCKS) {
      return mockAdapter.getCareers(readinessFilter);
    }
    return apiClient<Career[]>('/careers', {
      params: readinessFilter && readinessFilter !== 'All' ? { readiness: readinessFilter } : undefined,
    });
  },

  async getCareerById(id: string): Promise<CareerDetail> {
    if (USE_MOCKS) {
      return mockAdapter.getCareerById(id);
    }
    return apiClient<CareerDetail>(`/careers/${id}`);
  },
};
