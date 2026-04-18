export interface UserProfile{
  publicId: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  thumbnailUrl?: string;
}

// Payload cho API Cập nhật thông tin
export interface UpdateProfilePayload {
  fullName: string;
  phoneNumber?: string;
  thumbnailUrl?: string;
}

// Payload cho API Đổi mật khẩu
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// Payload cho API Đổi Email
export interface ChangeEmailPayload {
  newEmail: string;
}

// Payload cho API Xác thực đổi Email (bước 2)
export interface VerifyChangedEmailPayload {
  otpToken: string;
}
