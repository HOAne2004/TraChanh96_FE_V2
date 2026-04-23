import axios from "axios";
/**
 * Hàm tiện ích để trích xuất thông báo lỗi từ các exception khác nhau
 * Đặc biệt tối ưu cho Axios và cấu trúc ApiResponse của Backend
 * @param error - Lỗi bắt được từ khối catch (kiểu unknown)
 * @param defaultMessage - Tin nhắn mặc định nếu không thể trích xuất lỗi
 * @returns Chuỗi thông báo lỗi đã được làm sạch
 */

export const extractErrorMessage = (error: unknown, defaultMessage = 'Đã xảy ra lỗi không xác định'): string => {
  // 1. Nếu lỗi đến từ API (Axios Error)
  if (axios.isAxiosError(error)) {
    // Kiểm tra xem server có trả về data không (thường là HTTP 400, 404, 500)
    if (error.response && error.response.data) {
      const data = error.response.data as any; // Ép kiểu nội bộ để đọc dữ liệu

      // Ưu tiên đọc từ cấu trúc ErrorResponse của BE, sau đó đến message thường
      return data.errorMessage || data.message || data.title || defaultMessage;
    }

    // Nếu lỗi do mất mạng, timeout, hoặc server sập không trả về response
    if (error.request) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
    }
  }

  // 2. Nếu lỗi là do code Javascript Frontend (VD: TypeError, ReferenceError)
  if (error instanceof Error) {
    return error.message;
  }

  // 3. Nếu là một kiểu lỗi quái đản nào đó (VD: throw "Lỗi rồi")
  if (typeof error === 'string') {
    return error;
  }

  // 4. Fallback cuối cùng
  return defaultMessage;
};
