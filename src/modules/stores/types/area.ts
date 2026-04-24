import type { Table } from './table';

// Ánh xạ từ AreaDto (Dùng lồng bên trong StoreDetail cho Admin)
export interface Area {
  areaId: number;
  name: string;
  tables: Table[];
}

// Ánh xạ từ AreaResponseDto (Dùng khi gọi API GetStoreAreasQuery)
export interface AreaSummary {
  areaId: number;
  name: string;
  isActive: boolean;
  tableCount: number;
}