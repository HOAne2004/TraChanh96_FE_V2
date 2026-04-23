//npm install axios
import axios, {type AxiosInstance, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig} from "axios";
//axios: default export => không cần {}
//AxiosInstance: Named export => cần {}
// bổ sung type vào trước những type ảo
import { useAuthStore } from "@/modules/identity/store/auth.store";
import { useToastStore } from "@/shared/store/toast.store";
import type { ApiError } from "@/shared/types/api";

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
    // 1. KHI THÀNH CÔNG (HTTP Status 200 - 299)
    // Lột bỏ lớp vỏ Axios, chỉ trả về đúng cái 'data' bên trong
    // (chính là object { data, message, status, success } từ .NET)
        return response;
    },
    (error: AxiosError) => {
    // 2. KHI THẤT BẠI (HTTP Status 4xx, 5xx)
    const authStore = useAuthStore();
    const toastStore = useToastStore();

    // Lấy thông tin lỗi từ .NET
      if(error.response)
      {
        const status = error.response.status;
        const errorData = error.response.data as ApiError;

        // Xử lý tự động theo mã trạng thái (HTTP Status)
        switch (status) {
            case 401: // Chưa đăng nhập hoặc Token hết hạn
                toastStore.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                authStore.logout();
                authStore.openLoginModal(); // Bật popup bắt đăng nhập lại
                break;

            case 403: // Không có quyền truy cập
                toastStore.error('Bạn không có quyền truy cập vào chức năng này!');
                break;

            case 500: // Server Backend bị sập/lỗi code
                toastStore.error('Hệ thống đang gặp sự cố, vui lòng thử lại sau.');
                break;

            // Các lỗi 400 (Bad Request), 404... ta không gọi Toast ở đây,
            // mà trả về để các trang tự hiển thị thông báo riêng cho phù hợp.
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
