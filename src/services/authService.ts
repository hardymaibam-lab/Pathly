import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';
import { apiClient, USE_MOCKS } from './api';
import { mockAdapter } from '../mocks/mockAdapter';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (USE_MOCKS) {
      return mockAdapter.login(payload);
    }
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (USE_MOCKS) {
      return mockAdapter.register(payload);
    }
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async me(): Promise<User> {
    if (USE_MOCKS) {
      return mockAdapter.me();
    }
    return apiClient<User>('/auth/me');
  },

  async logout(): Promise<void> {
    if (USE_MOCKS) {
      return mockAdapter.logout();
    }
    await apiClient('/auth/logout', { method: 'POST' });
  },
};
