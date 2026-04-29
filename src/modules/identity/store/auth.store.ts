// modules/identity/stores/auth.store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfile } from '@/modules/identity/types/user';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

export const useAuthStore = defineStore('auth', () => {
  // 1. State
  const token = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken')); // THÊM MỚI
  const savedUser = localStorage.getItem('user');
  const user = ref<UserProfile | null>(savedUser ? JSON.parse(savedUser) : null);

  const isLoginModalVisible = ref<boolean>(false);
  const isRegisterModalVisible = ref<boolean>(false);
  const isForgotPasswordModalVisible = ref<boolean>(false);

  // 2. Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'Admin' || user.value?.role === 'Manager');

  // 3. Actions
  function setTokens(accessToken: string, refreshTokenValue: string) {
    token.value = accessToken;
    refreshToken.value = refreshTokenValue;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshTokenValue);
  }

  function setUser(newUser: UserProfile) {
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
  }

  function clearAuthData() {
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async function logout() {
    try {
      if (user.value?.publicId) {
        await userService.logout(user.value.publicId);
      }
    } catch (error) {
      console.warn('Logout API failed, but clearing local state anyway:', error);
    } finally {
      clearAuthData();
    }
  }

  async function refreshAccessToken(): Promise<string | null> {
    const currentRefreshToken = refreshToken.value;

    if (!currentRefreshToken) {
        clearAuthData();
        return null;
    }

    try {
      // Gọi API refresh token (nhớ đảm bảo authService có hàm này)
      const response = await authService.refreshToken(currentRefreshToken);

      // Update tokens mới vào Store & LocalStorage
      setTokens(response.accessToken, response.refreshToken);

      // Optional: Cập nhật lại user nếu Backend trả về thông tin user mới
      if (response.userId) {
          setUser({
              publicId: response.userId,
              email: response.email,
              fullName: response.fullName,
              role: response.role,
              // phone, thumbnailUrl... (tùy backend trả về)
          } as UserProfile);
      }

      return response.accessToken;
    } catch (error) {
      // NẾU LỖI: Trả thẳng lỗi ra ngoài để file axios.ts bắt và xử lý redirect/toast
      // (Không gọi toast hay openLoginModal ở đây để tách bạch logic UI khỏi Store)
      clearAuthData();
      throw error;
    }
  }

  // --- Quản lý Modal ---
  function openLoginModal() {
    isLoginModalVisible.value = true;
  }

  function closeLoginModal() {
    isLoginModalVisible.value = false;
  }

  function openRegisterModal() {
    isLoginModalVisible.value = false;
    isRegisterModalVisible.value = true;
  }

  function closeRegisterModal() {
    isRegisterModalVisible.value = false;
  }

  function openForgotPasswordModal() {
    isLoginModalVisible.value = false;
    isForgotPasswordModalVisible.value = true;
  }

  function closeForgotPasswordModal() {
    isForgotPasswordModalVisible.value = false;
  }

  return {
    token,
    refreshToken,
    user,
    isAuthenticated,
    isAdmin,
    isLoginModalVisible,
    isRegisterModalVisible,
    isForgotPasswordModalVisible,
    setTokens,
    setUser,
    clearAuthData,
    logout,
    refreshAccessToken,
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
    openForgotPasswordModal,
    closeForgotPasswordModal,
  };
});
