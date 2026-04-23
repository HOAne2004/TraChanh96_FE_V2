import apiClient from "@/shared/services/http/axios";
import type {
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ChangeEmailPayload,
  VerifyChangedEmailPayload
} from "../types/user";
import type { ApiResponse } from "@/shared/types/api";

export const userService = {
  // Lấy thông tin chi tiết của người dùng đang đăng nhập
  getProfile(): Promise<UserProfile> {
    return apiClient
      .get<ApiResponse<UserProfile>>('/identity/users/me')
      .then((res) => res.data.data);
  },

  // Cập nhật thông tin (Tên, SDT, Avatar)
  updateProfile(data: UpdateProfilePayload): Promise<string> {
   return apiClient
    .put<ApiResponse<null>>('/identity/users/me', data)
    .then((res) => res.data.message || '');
  },

  // Đổi mật khẩu
  changePassword(data: ChangePasswordPayload): Promise<string> {
    return apiClient
    .put<ApiResponse<null>>('/identity/users/me/password', data)
    .then((res) => res.data.message || '');
  },

  // Đổi Email (Yêu cầu đổi email -> Gửi OTP)
  changeEmail(data: ChangeEmailPayload): Promise<string> {
    return apiClient
    .put<ApiResponse<null>>('/identity/users/me/email', data)
    .then((res) => res.data.message || '');
  },

  // Xác nhận đổi Email bằng OTP
  verifyEmail(data: VerifyChangedEmailPayload): Promise<string> {
    return apiClient
    .post<ApiResponse<null>>('/identity/users/me/verify-email', data)
    .then((res) => res.data.message || '');
  },

  // Khóa tài khoản
  lockAccount(): Promise<string> {
    return apiClient
    .put<ApiResponse<null>>('/identity/users/me/lock')
    .then((res) => res.data.message || '');
  }
};

/* Cấu tạo cho 1 hàm service
 * 1. Tên hàm: Đặt là VERB + Action theo sau
 *    Vi dụ: getUserById, getProfile, updateProfile
 * 2. Tham số: Nhận vào là dữ liệu cần gửi lên API
 * Kiểu dữ liệu được định nghĩa bằng TypeScript interface (UpdateProfilePayload)
 * để đảm bảo an toàn kiểu.
 * 3. Trả về:
 *    - Promise<T> à kiểu trả về của hàm bất đồng bộ, trong đó T là kiểu dữ liệu trả về của API (res.data.data hoặc res.data.message)
 *    - Kết quả trả về của API là một Object có cấu trúc ApiResponse<T> phụ thuộc vào command phía BE trả về
 * 4. Cách sử dụng:
 *    - Gọi hàm và await kết quả
 *    - Sử dụng try-catch để xử lý lỗi
 */
