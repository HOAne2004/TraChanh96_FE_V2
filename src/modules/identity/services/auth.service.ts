import apiClient from "@/shared/services/http/axios";
import type { LoginPayload, AuthResponse, RegisterPayload, VerifyEmailPayload, ForgotPasswordPayload, ResetPasswordPayload } from "@/modules/identity/types/auth";

export const authService = {
  async login(data: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/identity/auth/login', data);
    return response.data;
  },

  async register(data: RegisterPayload): Promise<string> {
    const response = await apiClient.post<string>('/identity/auth/register', data);
    return response.data;
  },

  async verifyEmail(data: VerifyEmailPayload): Promise<string> {
    const response = await apiClient.post<string>('/identity/auth/verify-email', data);
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordPayload): Promise<string> {
    const response = await apiClient.post<string>('/identity/auth/forgot-password', data);
    return response.data;
  },

  async resetPassword(data: ResetPasswordPayload): Promise<string> {
    const response = await apiClient.post<string>('/identity/auth/reset-password', data);
    return response.data;
  }
}
