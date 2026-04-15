import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type { UserProfile } from '@/modules/identity/types/auth';

//Khởi tạo kho tên là 'auth'
export const useAuthStore = defineStore('auth', () =>{
  //1. State (biến lưu dữ liệu)
  // ref<T> là cách nói với TS: "Biến này là kiểu T"
  const token = ref<string| null>(localStorage.getItem('accessToken'));
  const user = ref<UserProfile | null>(null);

  //2. Getters (dữ liệu tính toán tự động)
  // Hàm này trả về true nếu token có giá trị, false nếu token là null
  const isAuthenticated = computed(() => !!token.value);

  //Hàm này kiểm tra xem user có phải là Admin/Manager không
  const isAdmin = computed(() => user.value?.role === 'Admin'|| user.value?.role == 'Manager');

  const isLoginModalVisible = ref<boolean>(false);

  //3. Actions (Hàm thay đổi State)
  function setToken(newToken: string){
    token.value = newToken;
    localStorage.setItem('accessToken', newToken); //Lưu vào ổ cứng trình duyệt
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
  //Trả ra ngoài để các file khác dùng được
  return{
    token,
    user,
    isAuthenticated,
    isAdmin,
    isLoginModalVisible,
    setToken,
    logout,
    openLoginModal,
    closeLoginModal,
  };
});
