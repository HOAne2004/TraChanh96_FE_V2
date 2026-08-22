export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  phone?: string | null;
  thumbnailUrl?: string | null;
  emailVerified: boolean;
}

export interface UpdateProfilePayload {
  fullName: string;
  phoneNumber?: string | null;
  thumbnailUrl?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailPayload {
  newEmail: string;
}

export interface VerifyChangedEmailPayload {
  otpToken: string;
}

export interface ActiveSessionDto {
  sessionId: string;
  deviceName: string;
  ipAddress: string;
  expiryDate: string;
  createdAt: string;
  isCurrentSession: boolean;
}
