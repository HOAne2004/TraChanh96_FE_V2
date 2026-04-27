<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '@/modules/identity/store/auth.store';
import { authService } from '@/modules/identity/services/auth.service';
import { useToastStore } from '@/shared/store/toast.store';
import type { ApiError } from '@/shared/types/api';

const authStore = useAuthStore();
const toastStore = useToastStore();

const form = reactive({
  email: '',
  password: '',
});

const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await authService.login(form);

    // Dùng setTokens thay vì setToken
    authStore.setTokens(response.accessToken, response.refreshToken);

    // Lưu User
    authStore.setUser({
      publicId: response.userId,
      email: form.email,
      fullName: response.fullName,
      role: response.role,
      thumbnailUrl: response.thumbnailUrl || ''
    });

    authStore.closeLoginModal();
    toastStore.success('Đăng nhập thành công!');
  } catch (error) {
    const apiError = error as ApiError;
    errorMessage.value = apiError.message || 'Tài khoản hoặc mật khẩu không chính xác';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    v-if="authStore.isLoginModalVisible"
    class="fixed inset-0 z-\[9999\] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="authStore.closeLoginModal"
  >

    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">

      <h2 class="mb-6 text-center text-3xl font-bold text-gray-800">
        Đăng Nhập
      </h2>

      <div v-if="errorMessage" class="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="Ví dụ: admin@trachanh1996.com"
            class="input-field"
          />
        </div>

        <div class="mb-8">
          <div class="mb-1.5 flex justify-between items-center">
            <label class="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <button type="button" @click="authStore.openForgotPasswordModal" class="text-sm font-medium text-primary-600 hover:text-primary-500">Quên mật khẩu?</button>
          </div>
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="Nhập mật khẩu của bạn"
            class="input-field"
          />
        </div>

        <button type="submit" :disabled="isLoading" class="btn-primary w-full py-3 text-lg font-semibold">
          {{ isLoading ? 'Đang xử lý...' : 'Đăng Nhập Ngay' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        Chưa có tài khoản?
        <button type="button" @click="authStore.openRegisterModal" class="font-medium text-primary-600 hover:text-primary-500">Đăng ký ngay</button>
      </p>

    </div>
  </div>
</template>
