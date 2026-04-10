//npm install axios
import axios, {AxiosInstance} from "axios";

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

//xuất nó ra để các file khác có thể import và sử dụng
export default apiClient;
