import type { Area } from './area';

// Đồng bộ với Enum StoreStatusEnum trên Backend
export enum StoreStatus {
  Draft = 'Draft',
  ComingSoon = 'ComingSoon',
  Active = 'Active',
  TemporarilyClosed = 'TemporarilyClosed',
  ClosedDown = 'ClosedDown'
}

// Ánh xạ từ OperatingHourResponseDto / OperatingHourRequestDto
export interface OperatingHour {
  dayOfWeek: number; // 0 (Sunday) đến 6 (Saturday) - Chuẩn JS và C#
  openTime: string | null; // Format "HH:mm" (vd: "08:00")
  closeTime: string | null; 
  isClosed: boolean;
}

// Ánh xạ từ StoreCustomerListDto (Dành cho UI App Khách hàng)
export interface StoreCustomerList {
  publicId: string;  
  name: string;
  fullAddress: string;
  imageUrl?: string;
  distanceKm: number | null;
  isOpenNow: boolean;
  closingTimeToday: string | null; // Dạng "22:30"
}

// Ánh xạ từ StoreAdminListDto (Dành cho Dashboard Admin)
export interface StoreAdminList {
  publicId: string;
  storeCode: string;
  name: string;
  status: StoreStatus | string; 
  fullAddress: string;
}

// Ánh xạ từ StoreDetailDto (Dành cho màn hình Chi tiết / Chỉnh sửa của Admin)
export interface StoreDetail {
  publicId: string;
  storeCode: string;
  name: string;
  fullAddress: string;
  status: StoreStatus | string;
  operatingHours: OperatingHour[];
  areas: Area[];
}

// (Tùy chọn) Param cho API tìm kiếm quán của Khách hàng
export interface GetCustomerStoresParams {
  userLatitude?: number;
  userLongitude?: number;
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
}