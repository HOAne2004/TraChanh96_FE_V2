export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface VerifyEmailPayload {
  email: string;
  token: string;
}

// Map chính xác với LoginResponseDto ở BE
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  thumbnailUrl?: string | null;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
}

