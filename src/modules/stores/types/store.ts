// 1. Param tìm kiếm
export interface GetCustomerStoresParams {
  pageIndex?: number;
  pageSize?: number;
  searchTerm?: string;
  userLat?: number;
  userLng?: number;
}

// 2. DTO Danh sách quán (Đã thêm openDate)
export interface StoreCustomerList {
  publicId: string;
  slug: string;
  name: string;
  fullAddress: string;
  imageUrl?: string;
  distanceKm: number | null;
  isOpenNow: boolean;
  closingTimeToday: string | null;
  openDate: string | null; 
}

// 3. Các Type phụ trợ cho trang Chi tiết
export interface OperatingHour {
  dayOfWeek: number; // 0: Chủ nhật, 1: Thứ 2...
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Table {
  tableId: number;
  name: string;
  seatCapacity: number;
  isActive: boolean;
}

export interface Area {
  areaId: number;
  name: string;
  tables: Table[];
}

// 4. DTO Chi tiết 1 quán (Kèm Lịch & Bàn)
export interface StoreCustomerDetail {
  publicId: string;
  name: string;
  slug: string;
  fullAddress: string;
  phoneNumber: string | null;
  wifiPassword: string | null;
  description: string | null;
  imageUrl: string | null;
  isOpenNow: boolean;
  openTimeToday: string | null;
  closingTimeToday: string | null;
  openDate: string | null;
  weeklySchedule: OperatingHour[];
  areas: Area[];
}

// 5. DTO Quét mã QR
export interface TableQrInfo {
  storePublicId: string;
  storeName: string;
  areaId: number;
  areaName: string;
  tableId: number;
  tableName: string;
  seatCapacity: number;
}