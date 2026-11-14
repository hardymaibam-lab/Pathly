import { StudentProfile } from '../types/user';
import { apiClient, USE_MOCKS } from './api';
import { mockAdapter } from '../mocks/mockAdapter';

export const profileService = {
  async getProfile(): Promise<StudentProfile> {
    if (USE_MOCKS) {
      return mockAdapter.getProfile();
    }
    return apiClient<StudentProfile>('/profile');
  },

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    if (USE_MOCKS) {
      return mockAdapter.updateProfile(updates);
    }
    return apiClient<StudentProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};
