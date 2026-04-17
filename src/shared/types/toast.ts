export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;          // Mã duy nhất để biết đường xóa
  message: string;     // Nội dung thông báo
  type: ToastType;     // Loại thông báo để chọn màu
  duration?: number;   // Thời gian hiển thị (mặc định là 3000ms)
}
