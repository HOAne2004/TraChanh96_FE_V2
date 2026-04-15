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

export interface AuthResponse{
  accessToken: string;
  user: UserProfile;
}
