export interface ApiResponse<T = any> {
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
