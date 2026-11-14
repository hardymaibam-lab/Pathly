export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  tokenType: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}
