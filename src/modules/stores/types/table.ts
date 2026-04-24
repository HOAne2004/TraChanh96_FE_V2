// Dành cho hiển thị danh sách bàn trong một khu vực (Admin)
export interface Table {
  tableId: number;
  name: string;
  seatCapacity: number;
  isActive: boolean;
}

// Dành cho luồng Khách hàng quét mã QR (Customer)
// Ánh xạ từ TableQrResponseDto
export interface TableQrInfo {
  storePublicId: string;
  storeName: string;
  areaId: number;
  areaName: string;
  tableId: number;
  tableName: string;
  seatCapacity: number;
}