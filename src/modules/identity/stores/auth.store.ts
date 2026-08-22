// modules/identity/stores/auth.store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfileResponse } from '@/modules/identity/types/user';
import { authService } from '../services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  // 1. State
  const token = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken')); // THÊM MỚI
  const savedUser = localStorage.getItem('user');
  const user = ref<UserProfileResponse | null>(savedUser ? JSON.parse(savedUser) : null);

  const isLoginModalVisible = ref<boolean>(false);
  const isRegisterModalVisible = ref<boolean>(false);
  const isForgotPasswordModalVisible = ref<boolean>(false);

  // 2. Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.roles?.includes('Admin') || user.value?.roles?.includes('Manager'));

  // 3. Actions
  function setTokens(accessToken: string, refreshTokenValue: string) {
    token.value = accessToken;
    refreshToken.value = refreshTokenValue;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshTokenValue);
  }

  function setUser(newUser: UserProfileResponse) {
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
      if (refreshToken.value) {
        await authService.logout(refreshToken.value);
      }
    } catch (error) {
      console.warn('Logout API failed (maybe already expired), clearing local state anyway:', error);
    } finally {
      // Dù API thành công hay rớt mạng, vẫn phải dọn dẹp LocalStorage để user thoát ra
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
              id: response.userId,
              email: response.email,
              fullName: response.fullName,
              roles: response.roles || [],
              thumbnailUrl: response.thumbnailUrl || '',
              emailVerified: user.value?.emailVerified || false,
          });
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
