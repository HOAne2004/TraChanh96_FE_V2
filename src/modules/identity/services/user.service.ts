import apiClient from "@/shared/services/http/axios";
import type {
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ChangeEmailPayload,
  VerifyChangedEmailPayload
} from "../types/user";

export const userService = {
  // Lấy thông tin chi tiết của người dùng đang đăng nhập
  getProfile(): Promise<UserProfile> {
    return apiClient.get('/identity/users/me').then((res: any) => res.data || res.Data || res);
  },

  // Cập nhật thông tin (Tên, SDT, Avatar)
  updateProfile(data: UpdateProfilePayload): Promise<string> {
    return apiClient.put('/identity/users/me', data).then((res: any) => res.message || res.Message);
  },

  // Đổi mật khẩu
  changePassword(data: ChangePasswordPayload): Promise<string> {
    return apiClient.put('/identity/users/me/password', data).then((res: any) => res.message || res.Message);
  },

  // Đổi Email (Yêu cầu đổi email -> Gửi OTP)
  changeEmail(data: ChangeEmailPayload): Promise<string> {
    return apiClient.put('/identity/users/me/email', data).then((res: any) => res.message || res.Message);
  },

  // Xác nhận đổi Email bằng OTP
  verifyEmail(data: VerifyChangedEmailPayload): Promise<string> {
    return apiClient.post('/identity/users/me/verify-email', data).then((res: any) => res.message || res.Message);
  },

  // Khóa tài khoản
  lockAccount(): Promise<string> {
    return apiClient.put('/identity/users/me/lock').then((res: any) => res.message || res.Message);
  }
};
