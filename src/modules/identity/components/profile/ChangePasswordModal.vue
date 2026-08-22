<script setup lang="ts">
import {ref, reactive, watch} from 'vue';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/shared/store/toast.store';
import{useAuthStore} from '@/modules/identity/stores/auth.store'
import {userService} from '@/modules/identity/services/user.service'

import AppLoading from '@/shared/components/ui/AppLoading.vue';

import IconSvgCancel from '@/assets/icons/IconSvgCancel.svg';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close']);

const toastStore = useToastStore();
const authStore = useAuthStore();
const router = useRouter();

const isLoading = ref(false);
const errors = ref<Record<string, string>>({});

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Reset form mỗi khi mở lại modal
watch(() => props.isOpen, (open) => {
  if (open) {
    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
    errors.value = {};
  }
});

const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (!form.currentPassword) {
    errors.value.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    isValid = false;
  }

  if (!form.newPassword) {
    errors.value.newPassword = 'Vui lòng nhập mật khẩu mới.';
    isValid = false;
  } else if (form.newPassword.length < 6) {
    errors.value.newPassword = 'Mật khẩu phải dài ít nhất 6 ký tự.';
    isValid = false;
  } else if (!/[A-Z]/.test(form.newPassword)) {
    errors.value.newPassword = 'Mật khẩu phải chứa ít nhất 1 chữ hoa.';
    isValid = false;
  } else if (!/[0-9]/.test(form.newPassword)) {
    errors.value.newPassword = 'Mật khẩu phải chứa ít nhất 1 chữ số.';
    isValid = false;
  } else if (form.newPassword === form.currentPassword) {
    errors.value.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại.';
    isValid = false;
  }

  if (form.newPassword !== form.confirmPassword) {
    errors.value.confirmPassword = 'Xác nhận mật khẩu không khớp.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;

    // Gọi API từ userService
    await userService.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword
    });

    toastStore.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
    emit('close');

    // Đăng xuất và điều hướng về trang chủ
    await authStore.logout();
    router.push('/');
    authStore.openLoginModal();

  } catch (error: any) {
    toastStore.error(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
  } finally {
    isLoading.value = false;
  }
};

</script>
<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Lớp phủ tối -->
    <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

    <!-- Nội dung Modal -->
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 flex flex-col animate-[fadeIn_0.2s_ease-out]">
      <AppLoading :show="isLoading" overlay text="Đang xử lý..." />

      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="text-lg font-bold text-gray-900">Đổi mật khẩu</h3>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">
          <IconSvgCancel class="h-5 w-5" />
        </button>
      </div>

      <div class="p-6 space-y-5">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">Mật khẩu hiện tại <span class="text-red-500">*</span></label>
          <input v-model="form.currentPassword" type="password" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Nhập mật khẩu hiện tại" />
          <span v-if="errors.currentPassword" class="text-xs text-red-500 mt-1 block">{{ errors.currentPassword }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">Mật khẩu mới <span class="text-red-500">*</span></label>
          <input v-model="form.newPassword" type="password" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Tối thiểu 6 ký tự, 1 chữ hoa, 1 chữ số" />
          <span v-if="errors.newPassword" class="text-xs text-red-500 mt-1 block">{{ errors.newPassword }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu mới <span class="text-red-500">*</span></label>
          <input v-model="form.confirmPassword" type="password" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Nhập lại mật khẩu mới" />
          <span v-if="errors.confirmPassword" class="text-xs text-red-500 mt-1 block">{{ errors.confirmPassword }}</span>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button @click="$emit('close')" type="button" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          Hủy bỏ
        </button>
        <button @click="handleSubmit" :disabled="isLoading" class="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-70">
          Cập nhật
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
