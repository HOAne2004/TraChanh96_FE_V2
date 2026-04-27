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

  // SỬA LẠI: Gọi API logout ở BE
  async function logout() {
    try {
      // Gọi API logout để xóa refresh token ở BE
      await userService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Xóa toàn bộ dữ liệu ở FE
      token.value = null;
      refreshToken.value = null;
      user.value = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // THÊM MỚI: Refresh token tự động
  async function refreshAccessToken(): Promise<string | null> {
    const currentRefreshToken = refreshToken.value;
    if (!currentRefreshToken) return null;

    try {
      const response = await authService.refreshToken(currentRefreshToken);
      // Cập nhật tokens mới
      setTokens(response.accessToken, response.refreshToken);
      // Cập nhật user nếu cần (giữ nguyên thông tin cũ, không cần thay đổi)
      return response.accessToken;
    } catch (error) {
      // Refresh token hết hạn hoặc không hợp lệ
      await logout();
      return null;
    }
  }

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
