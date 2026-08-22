import apiClient from "@/shared/services/http/axios";
import type { UserProfileResponse, UpdateProfilePayload, ChangePasswordPayload, ChangeEmailPayload, VerifyChangedEmailPayload, ActiveSessionDto } from "../types/user";
import type { ApiResponse } from "@/shared/types/api";

const BASE_URL = '/identity/users/me';

export const userService = {
  getMyProfile(): Promise<UserProfileResponse> {
    return apiClient.get<ApiResponse<UserProfileResponse>>(BASE_URL).then(res => res.data.data);
  },

  updateMyProfile(data: UpdateProfilePayload): Promise<string> {
    return apiClient.put<ApiResponse<null>>(BASE_URL, data).then(res => res.data.message || 'Cập nhật thành công');
  },

  changePassword(data: ChangePasswordPayload): Promise<string> {
    return apiClient.put<ApiResponse<null>>(`${BASE_URL}/password`, data).then(res => res.data.message || 'Đổi mật khẩu thành công');
  },

  changeEmail(data: ChangeEmailPayload): Promise<string> {
    return apiClient.put<ApiResponse<null>>(`${BASE_URL}/email`, data).then(res => res.data.message || 'Đã gửi OTP');
  },

  cancelChangeEmail(): Promise<string> {
    return apiClient.delete<ApiResponse<null>>(`${BASE_URL}/email/pending`).then(res => res.data.message || 'Đã hủy yêu cầu đổi email');
  },

  verifyEmail(data: VerifyChangedEmailPayload): Promise<string> {
    return apiClient.post<ApiResponse<null>>(`${BASE_URL}/verify-email`, data).then(res => res.data.message || 'Đổi email thành công');
  },

  // --- QUẢN LÝ SESSIONS (THIẾT BỊ ĐĂNG NHẬP) ---
  getMySessions(): Promise<ActiveSessionDto[]> {
    return apiClient.get<ApiResponse<ActiveSessionDto[]>>(`${BASE_URL}/sessions`).then(res => res.data.data);
  },

  revokeDeviceSession(sessionId: string): Promise<string> {
    return apiClient.delete<ApiResponse<null>>(`${BASE_URL}/sessions/${sessionId}`).then(res => res.data.message || '');
  },

  revokeAllSessions(): Promise<string> {
    return apiClient.delete<ApiResponse<null>>(`${BASE_URL}/sessions`).then(res => res.data.message || '');
  },
};

