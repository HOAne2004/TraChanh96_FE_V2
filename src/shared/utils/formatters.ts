// src/shared/utils/formatters.ts

/**
 * Format số tiền thành định dạng Tiền tệ Việt Nam (VND)
 * Ví dụ: 15000 -> "15.000 ₫"
 * * @param value Số tiền cần format
 * @param fallback Chuỗi trả về nếu value không hợp lệ (mặc định '0 ₫')
 * @returns Chuỗi đã được format
 */
export const formatCurrency = (value: number | string | null | undefined, fallback: string = '0 ₫'): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return fallback;
  }

  const numValue = Number(value);

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    currencyDisplay: 'symbol', // Hiển thị chữ '₫'
    maximumFractionDigits: 0,  // Không hiển thị số thập phân (VND không dùng)
  }).format(numValue);
};

/**
 * Format số lượng hiển thị (có dấu chấm phân cách hàng nghìn)
 * Ví dụ: 1500000 -> "1.500.000"
 */
export const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }

  return new Intl.NumberFormat('vi-VN').format(Number(value));
};

/**
 * Format chuỗi ISO Date từ Backend C# thành ngày giờ Việt Nam
 * Ví dụ: "2026-04-27T16:00:00Z" -> "27/04/2026 23:00"
 * * @param dateString Chuỗi ngày giờ (ISO 8601)
 * @param includeTime Có bao gồm giờ phút không (mặc định: true)
 */
export const formatDate = (dateString: string | null | undefined, includeTime: boolean = true): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Kiểm tra Invalid Date
  if (isNaN(date.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = false; // Dùng định dạng 24h
  }

  return new Intl.DateTimeFormat('vi-VN', options).format(date);
};

/**
 * Format tên trạng thái đơn hàng từ tiếng Anh sang tiếng Việt
 * @param status Trạng thái đơn hàng (string/enum)
 */
export const translateOrderStatus = (status: string | number): string => {
  const statusMap: Record<string, string> = {
    '1': 'Bản nháp',
    'Draft': 'Bản nháp',
    '2': 'Chờ thanh toán',
    'AwaitingPayment': 'Chờ thanh toán',
    '3': 'Thanh toán lỗi',
    'PaymentFailed': 'Thanh toán lỗi',
    '4': 'Chờ quán nhận',
    'Pending': 'Chờ quán nhận',
    '5': 'Đã nhận đơn',
    'Confirmed': 'Đã nhận đơn',
    '6': 'Đang pha chế',
    'Preparing': 'Đang pha chế',
    '7': 'Đã xong',
    'Ready': 'Đã xong',
    '8': 'Đang giao',
    'Shipping': 'Đang giao',
    '9': 'Hoàn thành',
    'Completed': 'Hoàn thành',
    '10': 'Đã hủy',
    'Cancelled': 'Đã hủy',
  };

  return statusMap[String(status)] || 'Không xác định';
};
