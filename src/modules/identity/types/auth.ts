import type { UserProfile } from "@/modules/identity/types/user";

export interface LoginPayload{
  email: string;
  password: string;
}

export interface RegisterPayload{
  email: string;
  password: string;
  fullName: string;
}

export interface VerifyEmailPayload{
  email: string;
  token: string;
}

export interface AuthResponse{
  accessToken: string;
  userId: string;
  fullName: string;
  role: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
}
