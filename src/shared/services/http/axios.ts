//npm install axios
import axios, {type AxiosInstance, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig} from "axios";
//axios: default export => không cần {}
//AxiosInstance: Named export => cần {}
// bổ sung type vào trước những type ảo
import { useAuthStore } from "@/modules/identity/store/auth.store";
import { useToastStore } from "@/shared/store/toast.store";
import type { ApiError } from "@/shared/types/api";
import router from "@/router";

//import {getMockData} from "@/modules/catalog/services/catalog.mock";

const apiClient: AxiosInstance = axios.create({
  /* bổ sung vào tsconfig.app.json nếu báo đỏ
  "compilerOptions": {
    "target": "ESNext",         // Cho phép dùng tính năng JS mới nhất
    "module": "ESNext",         // Cho phép dùng import/export đời mới (có import.meta)
    "moduleResolution": "bundler", // Cách TS tìm file thư viện (dành cho Vite)
  */
  //url gốc của API
    baseURL: import.meta.env.VITE_API_BASE_URL,
    //thời gian chờ tối đa cho 1 request(10s)
    timeout: 10000,
    //mặc định mọi request gửi đi đều là định dạng JSON
    headers: {
        "Content-Type": "application/json",
    }
});

// Flag để tránh gọi refresh nhiều lần
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

//Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) =>{
    //Gọi Store lấy dữ liệu
    // LƯU Ý: Phải gọi bên trong interceptor, không gọi ở ngoài cùng file để tránh lỗi Pinia chưa khởi tạo.
    const authStore = useAuthStore();
    const token = authStore.token;

    //Nếu có token và config có headers thì nhét token vào Authorization
    if(token && config.headers){
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error)=>{
    return Promise.reject(error);
  }
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const authStore = useAuthStore();
    const toastStore = useToastStore();
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // // 1.Kiểm tra nếu: Không có response (mất mạng) HOẶC lỗi server (5xx) HOẶC timeout
    // const isNetworkError = !error.response;
    // const isServerError = error.response && error.response.status >= 500;
    // const isTimeout = error.code === 'ECONNABORTED';
    // const is401 = error.response?.status === 401;

    // if (isNetworkError || isServerError || isTimeout || is401) {
    //     // Lấy dữ liệu mock dựa trên URL request
    //     const mockData = getMockData(originalRequest.url || "");

    //     if (mockData) {
    //         console.warn(`[Mock Mode] Sử dụng dữ liệu thay thế cho: ${originalRequest.url}`);

    //         // Trả về RESOLVE để Frontend tiếp tục chạy
    //         return Promise.resolve({
    //             data: mockData,
    //             status: 200,
    //             statusText: 'OK (Mocked)',
    //             headers: {},
    //             config: originalRequest,
    //         });
    //     }
    // }
    // 2. Nếu lỗi 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const skipUrls = ['/identity/auth/refresh-token', '/identity/users/me/logout'];
      if (skipUrls.some(url => originalRequest.url?.includes(url))) {
          return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers!.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await authStore.refreshAccessToken();

        if (newAccessToken) {
          // Thành công: Thông báo cho các request đang đợi và chạy lại request hiện tại
          onRefreshed(newAccessToken);
          originalRequest.headers!.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          // Thất bại: Ném lỗi xuống catch
          throw new Error("Refresh token expired or invalid");
        }
      } catch (refreshError) {
        // Gọi hàm logout ở Store để dọn dẹp sạch sẽ (Hàm này bạn đã viết trong auth.store.ts)
        authStore.logout();

        // Thông báo 1 lần duy nhất
        toastStore.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

        // Bật Modal Đăng nhập thay vì dùng Router chuyển trang
        authStore.openLoginModal();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý các lỗi khác (403, 500...)
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data as ApiError;

      switch (status) {
        case 403:
          toastStore.error('Bạn không có quyền truy cập vào chức năng này!');
          break;
        case 400:
        case 500:
          toastStore.error('Hệ thống đang gặp sự cố, vui lòng thử lại sau.');
          break;
      }

      console.error("Lỗi từ API:", errorData?.message || "Lỗi không xác định");
      return Promise.reject(error);
    }

    toastStore.error("Lỗi kết nối mạng hoặc server không phản hồi");
    return Promise.reject(error);
  }
);

//xuất nó ra để các file khác có thể import và sử dụng
export default apiClient;
