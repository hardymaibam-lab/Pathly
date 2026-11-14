import { RoadmapData } from '../types/roadmap';
import { apiClient, USE_MOCKS } from './api';
import { mockAdapter } from '../mocks/mockAdapter';

export const roadmapService = {
  async getRoadmap(): Promise<RoadmapData> {
    if (USE_MOCKS) {
      return mockAdapter.getRoadmap();
    }
    return apiClient<RoadmapData>('/roadmap');
  },

  async toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<{
    task: { id: string; isCompleted: boolean };
    roadmap: RoadmapData;
  }> {
    if (USE_MOCKS) {
      return mockAdapter.toggleTaskCompletion(taskId, isCompleted);
    }
    return apiClient<{ task: { id: string; isCompleted: boolean }; roadmap: RoadmapData }>(
      `/roadmap/tasks/${taskId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: isCompleted }),
      }
    );
  },
};
