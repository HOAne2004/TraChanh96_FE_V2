export interface UserAdminDto {
 id: string;
 email: string;
 fullName: string;
 phone?: string | null;
 roles: string[];
 status: string;
 createdAt: string;
}

export interface UserDetailAdminDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  thumbnailUrl?: string | null;
  roles: string[];
  status: string;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockoutEnd: string | null;
  createdAt: string;
  pendingEmail: string | null;
  passwordResetAttempts: number | null;
  emailVerificationAttempts: number | null;
}

export interface CreateUserByAdminPayload {
  email: string;
  fullName: string;
  phoneNumber: string | null;
  rolesIds: string[];
}

export interface AssignRolePayload {
  roleIds: string[];
}

export interface UpdateUserByAdminPayload {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
}
