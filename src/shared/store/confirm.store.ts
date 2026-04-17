import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const useConfirmStore = defineStore('confirm', () => {
  const isOpen = ref(false);
  const options = ref<ConfirmOptions>({
    title: 'Xác nhận',
    message: 'Bạn có chắc chắn muốn thực hiện thao tác này?',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'danger'
  });

  // Lưu trữ hàm resolve của Promise
  let resolvePromise: ((value: boolean) => void) | null = null;

  // Gọi hàm này để mở Modal và chờ kết quả (Trả về Promise)
  function ask(opts: ConfirmOptions): Promise<boolean> {
    options.value = { ...options.value, ...opts }; // Ghi đè options mặc định
    isOpen.value = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }

  // Khi bấm Đồng ý
  function confirm() {
    isOpen.value = false;
    if (resolvePromise) resolvePromise(true);
  }

  // Khi bấm Hủy hoặc Đóng
  function cancel() {
    isOpen.value = false;
    if (resolvePromise) resolvePromise(false);
  }

  return { isOpen, options, ask, confirm, cancel };
});
