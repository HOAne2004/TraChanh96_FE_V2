import type { DirectiveBinding } from 'vue';
import defaultDrinkImg from '@/assets/images/default-drink.png'; // Ảnh mặc định toàn hệ thống

export const vFallbackImage = {
  // Hàm này chạy ngay khi thẻ <img> được gắn vào DOM
  mounted(el: HTMLImageElement, binding: DirectiveBinding) {
    // Cho phép truyền ảnh mặc định khác từ ngoài vào, nếu không có thì dùng defaultDrinkImg
    const fallbackUrl = binding.value || defaultDrinkImg;

    // Trường hợp 1: API trả về null hoặc chuỗi rỗng
    if (!el.src || el.src === window.location.href || el.getAttribute('src') === 'null') {
      el.src = fallbackUrl;
    }

    // Trường hợp 2: Có URL nhưng link ảnh bị chết (lỗi 404)
    el.onerror = () => {
      // Đảm bảo không bị lặp vô hạn nếu chính cái ảnh fallback cũng bị lỗi
      if (el.src !== fallbackUrl) {
        el.src = fallbackUrl;
      }
      el.onerror = null; // Hủy event lắng nghe để tối ưu hiệu năng
    };
  },

  // Xử lý thêm trường hợp dữ liệu bên trong thẻ <img> bị thay đổi linh hoạt (Vue Reactivity)
  updated(el: HTMLImageElement, binding: DirectiveBinding) {
    const fallbackUrl = binding.value || defaultDrinkImg;
    if (!el.src || el.getAttribute('src') === 'null') {
      el.src = fallbackUrl;
    }
  }
};
