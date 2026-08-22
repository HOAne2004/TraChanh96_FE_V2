import apiClient from "@/shared/services/http/axios";
import type { LoginPayload, AuthResponse, RegisterPayload, VerifyEmailPayload, ForgotPasswordPayload, ResetPasswordPayload } from "@/modules/identity/types/auth";
import type { ApiResponse } from "@/shared/types/api";

const BASE_URL = '/identity/auth';

export const authService = {
  login(data: LoginPayload): Promise<AuthResponse> {
    return apiClient.post<ApiResponse<AuthResponse>>(`${BASE_URL}/login`, data).then(res => res.data.data);
  },

  register(data: RegisterPayload): Promise<string> {
    return apiClient.post<ApiResponse<null>>(`${BASE_URL}/register`, data).then(res => res.data.message || 'Đăng ký thành công');
  },

  verifyEmail(data: VerifyEmailPayload): Promise<string> {
    return apiClient.post<ApiResponse<null>>(`${BASE_URL}/verify-email`, data).then(res => res.data.message || 'Xác thực thành công');
  },

  forgotPassword(data: ForgotPasswordPayload): Promise<string> {
    return apiClient.post<ApiResponse<null>>(`${BASE_URL}/forgot-password`, data).then(res => res.data.message || 'Đã gửi yêu cầu khôi phục');
  },

  resetPassword(data: ResetPasswordPayload): Promise<string> {
    return apiClient.post<ApiResponse<null>>(`${BASE_URL}/reset-password`, data).then(res => res.data.message || 'Khôi phục mật khẩu thành công');
  },

  // Payload gửi lên BE phải map đúng tham số Command
  refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<ApiResponse<AuthResponse>>(`${BASE_URL}/refresh-token`, { refreshToken }).then(res => res.data.data);
  },

  // Logout (BE yêu cầu [Authorize] nhưng thuộc AuthController)
  logout(refreshToken: string): Promise<string> {
    return apiClient.post<ApiResponse<null>>(`${BASE_URL}/logout`, { refreshToken }).then(res => res.data.message || 'Đăng xuất thành công');
  }
};
