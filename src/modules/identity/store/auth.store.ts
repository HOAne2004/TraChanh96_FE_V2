import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type { UserProfile } from '@/modules/identity/types/user';

//Khởi tạo kho tên là 'auth'
export const useAuthStore = defineStore('auth', () =>{
  //1. State (biến lưu dữ liệu)
  // ref<T> là cách nói với TS: "Biến này là kiểu T"
  const token = ref<string| null>(localStorage.getItem('accessToken'));
  // Khôi phục user từ localStorage nếu có (để F5 không bị mất tên)
  const savedUser = localStorage.getItem('user');
  const user = ref<UserProfile | null>(savedUser ? JSON.parse(savedUser) : null);

  const isLoginModalVisible = ref<boolean>(false);
  const isRegisterModalVisible = ref<boolean>(false);
  const isForgotPasswordModalVisible = ref<boolean>(false);

  //2. Getters (dữ liệu tính toán tự động)
  // Hàm này trả về true nếu token có giá trị, false nếu token là null
  const isAuthenticated = computed(() => !!token.value);

  //Hàm này kiểm tra xem user có phải là Admin/Manager không
  const isAdmin = computed(() => user.value?.role === 'Admin'|| user.value?.role == 'Manager');


  //3. Actions (Hàm thay đổi State)
  function setToken(newToken: string){
    token.value = newToken;
    localStorage.setItem('accessToken', newToken); //Lưu vào ổ cứng trình duyệt
  }

  //lưu thông tin user
  function setUser(newUser: UserProfile){
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
  }

  function logout(){
    token.value = null;
    user.value = null;
    localStorage.removeItem('accessToken');
  }

  function openLoginModal(){
    isLoginModalVisible.value = true;
  }

  function closeLoginModal(){
    isLoginModalVisible.value = false;
  }

  function openRegisterModal() {
    isLoginModalVisible.value = false; // Tự động đóng modal đăng nhập nếu đang mở
    isRegisterModalVisible.value = true;
  }

  function closeRegisterModal() {
    isRegisterModalVisible.value = false;
  }

  function openForgotPasswordModal() {
    isLoginModalVisible.value = false; // Đóng modal login nếu đang mở
    isForgotPasswordModalVisible.value = true;
  }

  function closeForgotPasswordModal() {
    isForgotPasswordModalVisible.value = false;
  }

  //Trả ra ngoài để các file khác dùng được
  return{
    token,
    user,
    isAuthenticated,
    isAdmin,
    isLoginModalVisible,
    isRegisterModalVisible,
    isForgotPasswordModalVisible,
    setToken,
    setUser,
    logout,
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
    openForgotPasswordModal,
    closeForgotPasswordModal,
  };
});
