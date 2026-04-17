<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '@/modules/identity/store/auth.store';
import { authService } from '@/modules/identity/services/auth.service';
import type { ApiError } from '@/shared/types/api';

const authStore = useAuthStore();

// Quản lý luồng 2 bước
const step = ref<1 | 2>(1);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = reactive({
  email: '',
  token: '',
  newPassword: ''
});

const handleRequestReset = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authService.forgotPassword({ email: form.email });
    successMessage.value = 'Mã xác thực đã được gửi đến email của bạn.';
    step.value = 2; // Chuyển sang bước nhập mã
  } catch (error) {
    const apiError = error as ApiError;
    errorMessage.value = apiError.message || 'Có lỗi xảy ra, vui lòng thử lại.';
  } finally {
    isLoading.value = false;
  }
};

const handleResetPassword = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authService.resetPassword({
      email: form.email,
      token: form.token,
      newPassword: form.newPassword
    });

    alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');

    // Đóng modal này và mở lại modal Đăng nhập
    authStore.closeForgotPasswordModal();
    authStore.openLoginModal();

    // Reset lại state của form
    step.value = 1;
    form.email = '';
    form.token = '';
    form.newPassword = '';
  } catch (error) {
    const apiError = error as ApiError;
    errorMessage.value = apiError.message || 'Mã xác thực không đúng hoặc đã hết hạn.';
  } finally {
    isLoading.value = false;
  }
};

const backToLogin = () => {
  authStore.closeForgotPasswordModal();
  authStore.openLoginModal();
};
</script>

<template>
  <div
    v-if="authStore.isForgotPasswordModalVisible"
    class="fixed inset-0 z-\[9999\] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="authStore.closeForgotPasswordModal"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
      <h2 class="mb-6 text-center text-3xl font-bold text-gray-800">
        Khôi Phục Mật Khẩu
      </h2>

      <div v-if="errorMessage" class="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage && step === 2" class="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-600 border border-green-100">
        {{ successMessage }}
      </div>

      <form v-if="step === 1" @submit.prevent="handleRequestReset">
        <div class="mb-6">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Email đã đăng ký</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="Ví dụ: admin@trachanh1996.com"
            class="input-field"
          />
        </div>
        <button type="submit" :disabled="isLoading" class="btn-primary w-full py-3 text-lg font-semibold">
          {{ isLoading ? 'Đang gửi...' : 'Gửi mã xác thực' }}
        </button>
      </form>

      <form v-else @submit.prevent="handleResetPassword">
        <div class="mb-4">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Mã xác thực (OTP)</label>
          <input
            v-model="form.token"
            type="text"
            required
            placeholder="Nhập mã 6 số từ email"
            class="input-field text-center tracking-widest text-lg font-bold"
          />
        </div>
        <div class="mb-6">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
          <input
            v-model="form.newPassword"
            type="password"
            required
            minlength="6"
            placeholder="Nhập mật khẩu mới (từ 6 ký tự)"
            class="input-field"
          />
        </div>
        <button type="submit" :disabled="isLoading" class="btn-primary w-full py-3 text-lg font-semibold">
          {{ isLoading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        Nhớ mật khẩu rồi?
        <button @click="backToLogin" class="font-medium text-primary-600 hover:text-primary-500">Quay lại đăng nhập</button>
      </p>
    </div>
  </div>
</template>
