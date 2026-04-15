import apiClient from "@/shared/services/http/axios";
import type { LoginPayload, AuthResponse, RegisterPayload } from "@/modules/identity/types/auth";

export const authService = {
  login(data: LoginPayload): Promise<AuthResponse> {
    return apiClient.post('/identity/auth/login', data);
  },

  register(data: RegisterPayload): Promise<string>{
    return apiClient.post('/identity/auth/register', data);
  },
}


