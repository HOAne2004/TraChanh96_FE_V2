import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/modules/identity/stores/auth.store'
import { useToastStore } from '@/shared/store/toast.store'
import type { ApiError } from '@/shared/types/api'
import router from '@/router/customer'
import { getMockData } from '@/modules/catalog/services/catalog.mock'

let lastMockWarningTime = 0


const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Hàng đợi lưu các request đang chờ token mới
let isRefreshing = false
let refreshSubscribers: { resolve: () => void; reject: (err: any) => void }[] = []

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb.resolve())
  refreshSubscribers = []
}

function onRefreshFailed(error: any) {
  refreshSubscribers.forEach((cb) => cb.reject(error))
  refreshSubscribers = []
}

// ==========================================
// 1. REQUEST INTERCEPTOR
// ==========================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    const token = authStore.token

    const isRefreshTokenUrl = config.url?.includes('/identity/auth/refresh-token')

    if (isRefreshTokenUrl) {
      if (config.headers) {
        delete config.headers.Authorization
        delete config.headers.authorization
      }
    } else if (token && config.headers) {
      // Gắn token bình thường cho các API khác
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log(
      `🚀 [Gửi Request] ${config.method?.toUpperCase()} ${config.url}`,
      isRefreshTokenUrl ? '👉 (API REFRESH)' : '',
    )
    return config
  },
  (error) => Promise.reject(error),
)

// ==========================================
// 2. RESPONSE INTERCEPTOR
// ==========================================
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    console.error(
      `❌ [Lỗi Trả Về] ${error.config?.url} | Mã HTTP: ${error.response?.status || 'KHÔNG CÓ'} | Thông báo Axios: ${error.message}`,
    )

    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Tự động sử dụng Mock Data nếu rớt mạng/máy chủ offline khi gửi GET request
    const isNetworkError = error.code === 'ERR_NETWORK' || !error.response
    if (isNetworkError && error.config && error.config.method?.toLowerCase() === 'get') {
      const url = error.config.url || ''
      const cleanUrl = url.split('?')[0] || ''
      const mockData = getMockData(cleanUrl)
      if (mockData !== null) {
        console.warn(`⚠️ [Mock Fallback] API ${url} không kết nối được. Sử dụng dữ liệu mock thay thế.`)
        const now = Date.now()
        if (now - lastMockWarningTime > 15000) {
          lastMockWarningTime = now
          try {
            toastStore.warning('Không thể kết nối đến máy chủ. Đang sử dụng dữ liệu giả lập (mock data).')
          } catch (e) {
            // Safe fallback
          }
        }
        return Promise.resolve({
          data: {
            data: mockData,
            message: 'Dữ liệu mock fallback',
            status: 200,
            success: true
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        } as AxiosResponse)
      }
    }

    // FIX LỖI TOAST RÁC: Đưa skipUrls lên đầu cùng.
    // Nếu API refresh-token hoặc logout bị sập mạng/HTTP2, bỏ qua luôn, không hiển thị Toast rác.
    const skipUrls = ['/identity/auth/refresh-token', '/identity/users/me/logout']
    if (skipUrls.some((url) => originalRequest.url?.includes(url))) {
      return Promise.reject(error)
    }

    // Xử lý 401 khi hết hạn Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push({
            resolve: () => {
              // Xóa header cũ của request bị lỗi để Request Interceptor tự động gắn token mới vào
              if (originalRequest.headers) delete originalRequest.headers.Authorization
              resolve(apiClient(originalRequest))
            },
            reject: (err: any) => reject(err),
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newAccessToken = await authStore.refreshAccessToken()

        if (newAccessToken) {
          onRefreshed() // Kích hoạt chạy lại toàn bộ hàng đợi
          if (originalRequest.headers) delete originalRequest.headers.Authorization
          return apiClient(originalRequest) // Chạy lại request bị kẹt đầu tiên
        } else {
          throw new Error('Refresh token expired or invalid')
        }
      } catch (refreshError) {
        onRefreshFailed(refreshError) // Giải tán hàng đợi

        authStore.logout()
        toastStore.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        authStore.openLoginModal()

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Xử lý các lỗi HTTP khác từ Backend (400, 403, 500...)
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data as ApiError | any
      const actualMessage = errorData?.message || 'Đã có lỗi xảy ra từ máy chủ'

      switch (status) {
        case 403:
          toastStore.error('Bạn không có quyền truy cập vào chức năng này!')
          break
        case 500:
          toastStore.error('Hệ thống đang gặp sự cố, vui lòng thử lại sau.')
          break
        case 400:
          if (errorData?.errors) {
            const validationErrors = Object.values(errorData.errors).flat().join(', ');
            console.error('❌ Lỗi Validation từ BE:', validationErrors);
            toastStore.error(validationErrors);
          } else {
            toastStore.error(actualMessage);
          }
          break;
      }

      console.error('Lỗi từ API:', actualMessage)
      return Promise.reject({ ...errorData, message: actualMessage } as ApiError)
    }

    // Nếu rớt mạng thực sự (mất wifi...) hoặc server sập
    toastStore.error('Lỗi kết nối mạng hoặc server không phản hồi')
    return Promise.reject(error)
  },
)

export default apiClient
