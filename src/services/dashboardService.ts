import { DashboardSummary } from '../types/dashboard';
import { apiClient, USE_MOCKS } from './api';
import { mockAdapter } from '../mocks/mockAdapter';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    if (USE_MOCKS) {
      return mockAdapter.getDashboardSummary();
    }
    return apiClient<DashboardSummary>('/dashboard/summary');
  },
};
