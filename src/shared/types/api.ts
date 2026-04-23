export interface ApiResponse<T = unknown> {
  data: T,
  message: string,
  status: number,
  success: boolean,
}

export interface ApiError {
  errorCode: string,
  message: string,
  details?: string
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
