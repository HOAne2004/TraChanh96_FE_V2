import apiClient from "@/shared/services/http/axios";
import type { LoginPayload, AuthResponse, RegisterPayload, VerifyEmailPayload, ForgotPasswordPayload, ResetPasswordPayload } from "@/modules/identity/types/auth";
import type { ApiResponse } from "@/shared/types/api";

export const authService = {
  login(data: LoginPayload): Promise<AuthResponse> {
    return apiClient
      .post<ApiResponse<AuthResponse>>('/identity/auth/login', data)
      .then((res) => res.data.data);
  },

  register(data: RegisterPayload): Promise<string> {
    return apiClient
      .post<ApiResponse<null>>('/identity/auth/register', data)
      .then((res) => res.data.message || 'Đăng ký thành công');
  },

  verifyEmail(data: VerifyEmailPayload): Promise<string> {
    return apiClient
      .post<ApiResponse<null>>('/identity/auth/verify-email', data)
      .then((res) => res.data.message || 'Xác thực thành công');
  },

  forgotPassword(data: ForgotPasswordPayload): Promise<string> {
    return apiClient
      .post<ApiResponse<null>>('/identity/auth/forgot-password', data)
      .then((res) => res.data.message || 'Đã gửi yêu cầu khôi phục');
  },

  resetPassword(data: ResetPasswordPayload): Promise<string> {
    return apiClient
      .post<ApiResponse<null>>('/identity/auth/reset-password', data)
      .then((res) => res.data.message || 'Khôi phục mật khẩu thành công');
  }
}
