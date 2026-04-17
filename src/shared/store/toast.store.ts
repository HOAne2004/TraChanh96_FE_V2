import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ToastMessage, ToastType } from '@/shared/types/toast';

export const useToastStore = defineStore('toast', () => {
  // 1. State: Mảng chứa các thông báo đang hiển thị
  const toasts = ref<ToastMessage[]>([]);

  // 2. Actions: Hàm xóa thông báo
  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  // 3. Actions: Hàm thêm thông báo mới
  function addToast(message: string, type: ToastType = 'info', duration: number = 3000) {
    // Tạo ID ngẫu nhiên không đụng hàng
    const id = Math.random().toString(36).substring(2, 9);

    // Đẩy vào mảng
    toasts.value.push({ id, message, type, duration });

    // Hẹn giờ tự động xóa sau `duration` mili-giây
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  // Tiện ích: Các hàm gọi nhanh
  const success = (msg: string) => addToast(msg, 'success');
  const error = (msg: string) => addToast(msg, 'error');
  const warning = (msg: string) => addToast(msg, 'warning');
  const info = (msg: string) => addToast(msg, 'info');

  return {
    toasts,
    removeToast,
    addToast,
    success,
    error,
    warning,
    info
  };
});
