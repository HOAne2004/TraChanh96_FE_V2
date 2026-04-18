<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/identity/store/auth.store';
import { useToastStore } from '@/shared/store/toast.store';
import { useConfirmStore } from '@/shared/store/confirm.store';
import { userService } from '@/modules/identity/services/user.service';
import { uploadService } from '@/shared/services/upload.service';
import type { UserProfile } from '@/modules/identity/types/user';
import SectionWrapper from '@/shared/components/ui/SectionWrapper.vue';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();
const confirmStore = useConfirmStore();

const activeTab = ref('profile');
const isLoading = ref(true);
const userDetail = ref<UserProfile | null>(null);

// ==========================================
// THÔNG TIN CHUNG
// ==========================================
const editingField = ref<'fullName' | 'phone' | 'email' | null>(null);
const editForm = reactive({ fullName: '', phone: '', email: '', emailToken: '' });
const inputRef = ref<HTMLInputElement | null>(null);
const emailStep = ref<1 | 2>(1);
const isSendingOTP = ref(false);

const startEdit = async (field: 'fullName' | 'phone' | 'email') => {
  editingField.value = field;

  editForm.fullName = userDetail.value?.fullName || authStore.user?.fullName || '';
  editForm.phone = userDetail.value?.phone || '';
  editForm.email = userDetail.value?.email || authStore.user?.email || '';
  editForm.emailToken = '';
  emailStep.value = 1;

  await nextTick();
  if (inputRef.value) inputRef.value.focus();
};

const cancelEdit = () => {
  editingField.value = null;
};

const saveEdit = async () => {
  if (!editForm.fullName.trim()) {
    toastStore.warning('Họ tên không được để trống!');
    return;
  }

  try {
    isLoading.value = true;
    await userService.updateProfile({
      fullName: editForm.fullName,
      phoneNumber: editForm.phone,
      thumbnailUrl: userDetail.value?.thumbnailUrl
    });

    toastStore.success('Cập nhật thành công!');

    if (userDetail.value) {
      userDetail.value.fullName = editForm.fullName;
      userDetail.value.phone = editForm.phone;
    }
    if (authStore.user) {
       authStore.setUser({
          ...authStore.user,
          fullName: editForm.fullName
       });
    }

    editingField.value = null;
  } catch (error) {
    const err = error as { message?: string };
    toastStore.error(err?.message || 'Có lỗi xảy ra khi lưu');
  } finally {
    isLoading.value = false;
  }
};

// ==========================================
// ĐỔI EMAIL (2 BƯỚC)
// ==========================================
const requestEmailToken = async () => {
  if (!editForm.email.trim() || !editForm.email.includes('@')) {
    toastStore.warning('Email không hợp lệ!');
    return;
  }
  try {
    isSendingOTP.value = true;
    // B1: Gọi API đổi email (Sẽ nhận được email chứa Token)
    await userService.changeEmail({ newEmail: editForm.email });

    toastStore.success('Mã xác thực đã được gửi đến email mới của bạn!');
    emailStep.value = 2;
  } catch (error) {
    const err = error as { message?: string };
    toastStore.error(err?.message || 'Không thể gửi mã xác thực. Thử lại sau!');
  } finally {
    isSendingOTP.value = false;
  }
};

const changeEmailConfirm = async () => {
  if (!editForm.emailToken.trim()) {
    toastStore.warning('Vui lòng nhập mã OTP!');
    return;
  }
  try {
    isLoading.value = true;
    // B2: Xác thực email với mã OTP
    await userService.verifyEmail({ otpToken: editForm.emailToken });

    toastStore.success('Đổi email thành công!');
    if (userDetail.value) userDetail.value.email = editForm.email;
    if (authStore.user) {
        authStore.setUser({
          ...authStore.user,
          email: editForm.email
        });
    }

    editingField.value = null;
  } catch (error) {
    const err = error as { message?: string };
    toastStore.error(err?.message || 'Mã xác thực không đúng hợp lệ');
  } finally {
    isLoading.value = false;
  }
};

// ==========================================
// KHÓA TÀI KHOẢN
// ==========================================
const handleLockAccount = async () => {
  const isConfirmed = await confirmStore.ask({
    title: 'Khóa tài khoản?',
    message: 'Bạn có chắc chắn muốn vô hiệu hóa tài khoản? Chỉ Admin web mới có thể mở lại dữ liệu.',
    confirmText: 'Xác nhận khóa',
    type: 'danger' // Modal sẽ hiện nút đỏ (Nếu Store hỗ trợ)
  });

  if (isConfirmed) {
    try {
      isLoading.value = true;
      await userService.lockAccount(); // API vừa được add trong service
      toastStore.success('Tài khoản đã khóa thành công.');
      authStore.logout();
      router.push('/');
    } catch (error) {
      const err = error as { message?: string };
      toastStore.error(err?.message || 'Lỗi khi xử lý khóa tài khoản!');
    } finally {
      isLoading.value = false;
    }
  }
};

// ==========================================
// UPLOAD AVATAR
// ==========================================
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerAvatarUpload = () => {
  if (fileInputRef.value) fileInputRef.value.click();
};

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  try {
    isLoading.value = true;
    toastStore.info('Đang tải ảnh lên, vui lòng đợi...');

    const imageUrl = await uploadService.uploadFile(file);

    await userService.updateProfile({
      fullName: userDetail.value?.fullName || authStore.user?.fullName || '',
      phoneNumber: userDetail.value?.phone || '',
      thumbnailUrl: imageUrl
    });

    if (userDetail.value) userDetail.value.thumbnailUrl = imageUrl;
    if (authStore.user) {
      authStore.setUser({
        ...authStore.user,
        thumbnailUrl: imageUrl
      });
    }

    toastStore.success('Cập nhật ảnh đại diện thành công!');

  } catch (error) {
    const err = error as { message?: string };
    toastStore.error(err?.message || 'Có lỗi xảy ra khi tải ảnh lên');
  } finally {
    isLoading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
};

// ==========================================
// INIT DATA
// ==========================================
const fetchProfile = async () => {
  if(!authStore.isAuthenticated) return;
  try {
    isLoading.value = true;
    const data = await userService.getProfile();
    const rawData = data as unknown as Record<string, string>;
    const fullName = data.fullName || rawData.FullName || '';
    const phone = data.phone || rawData.Phone || '';
    const thumbnailUrl = data.thumbnailUrl || rawData.ThumbnailUrl || '';

    userDetail.value = {
        ...data,
        fullName,
        phone,
        thumbnailUrl
    };

    if (authStore.user) {
         authStore.setUser({
            ...authStore.user,
            fullName,
            thumbnailUrl
         });
    }
  } catch {
    toastStore.error('Không thể tải thông tin hồ sơ');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => fetchProfile());
</script>

<template>
  <SectionWrapper title="Thông tin cá nhân">
      <!-- MAIN CONTENT -->
      <main class="flex justify-end items-center mb-6">
          <!-- Lớp chặn mờ khi Loading -->
          <div v-if="isLoading" class="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
             <div class="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin"></div>
             <span class="mt-3 text-sm text-gray-600 font-medium tracking-wide">Đang tải...</span>
          </div>

          <!-- TAB: HỒ SƠ -->
          <div v-if="activeTab === 'profile'" class="p-5 lg:p-8">
            <div class="mb-8">
              <h1 class="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">Hồ sơ cá nhân</h1>
              <p class="text-sm text-gray-500 mt-1">Quản lý thông tin bảo mật và định danh của bạn.</p>
            </div>

            <!-- Avatar & Name Section -->
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-8 mb-8 border-b border-gray-100">
              <div class="relative shrink-0 group hover:scale-105 transition-transform">
                <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-400">
                  <img v-if="userDetail?.thumbnailUrl" :src="userDetail.thumbnailUrl" class="w-full h-full object-cover" />
                  <span v-else>{{ (userDetail?.fullName || authStore.user?.fullName || 'U').charAt(0).toUpperCase() }}</span>
                </div>

                <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handleFileSelected" />
                <button
                  @click="triggerAvatarUpload"
                  class="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 p-1.5"
                  title="Tải ảnh lên"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-full h-full">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </button>
              </div>

              <div class="flex-1 w-full text-center sm:text-left min-w-0 pt-1">
                <!-- Chế độ CHỈNH SỬA TÊN -->
                <div v-if="editingField === 'fullName'" class="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 w-full">
                  <input
                    ref="inputRef"
                    v-model="editForm.fullName"
                    @keyup.enter="saveEdit"
                    @keyup.esc="cancelEdit"
                    type="text"
                    class="w-full sm:w-auto flex-1 text-base font-medium text-gray-900 border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white px-3 py-2 rounded-lg transition-colors outline-none shadow-sm"
                    placeholder="Nhập họ và tên đầy đủ..."
                  />
                  <div class="flex items-center gap-2 shrink-0">
                    <button @click="saveEdit" class="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors focus:ring-2 focus:-ring-offset-1 focus:ring-primary-500 shadow-sm">Lưu</button>
                    <button @click="cancelEdit" class="flex-1 sm:flex-none text-xs font-medium px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200 shadow-sm">Hủy</button>
                  </div>
                </div>

                <!-- Chế độ HIỂN THỊ TÊN -->
                <div v-else class="flex flex-col sm:flex-row items-center sm:items-center gap-3 min-w-0 group relative">
                  <h2 class="text-xl sm:text-2xl font-bold text-gray-900 truncate max-w-full">
                    {{ userDetail?.fullName || authStore.user?.fullName || 'Chưa cập nhật' }}
                  </h2>
                  <div class="flex items-center gap-2">
                    <span class="text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full font-medium whitespace-nowrap">
                      {{ userDetail?.role || 'Khách' }}
                    </span>
                    <button @click="startEdit('fullName')" class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md sm:opacity-0 sm:group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] sm:shadow-none bg-white sm:bg-transparent" title="Sửa tên">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                    </button>
                  </div>
                </div>
                <p class="text-gray-500 text-sm mt-1.5 hidden sm:block">Thành viên tham gia hệ thống từ 2026</p>
              </div>
            </div>

            <!-- Contacts Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-4">

              <!-- CỘT TRÁI: ĐIỆN THOẠI & BẢO MẬT -->
              <div class="space-y-8 lg:pr-6 lg:border-r border-gray-100">

                <!-- Số điện thoại -->
                <section>
                  <label class="block text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">Số điện thoại</label>

                  <div v-if="editingField === 'phone'" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      ref="inputRef"
                      v-model="editForm.phone"
                      @keyup.enter="saveEdit"
                      @keyup.esc="cancelEdit"
                      type="tel"
                      class="w-full flex-1 text-sm text-gray-900 border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white px-3 py-2 rounded-lg transition-colors outline-none shadow-sm"
                      placeholder="09..."
                    />
                    <div class="flex items-center gap-2 shrink-0">
                      <button @click="saveEdit" class="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm">Lưu</button>
                      <button @click="cancelEdit" class="flex-1 sm:flex-none text-xs font-medium px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm">Hủy</button>
                    </div>
                  </div>

                  <div v-else class="flex flex-row items-center justify-between gap-3 group p-3 -ml-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                    <p class="text-sm font-medium" :class="userDetail?.phone ? 'text-gray-900' : 'text-gray-400 italic font-normal'">
                      {{ userDetail?.phone || 'Chưa thiết lập' }}
                    </p>
                    <button @click="startEdit('phone')" class="text-xs flex items-center gap-1.5 font-medium text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-md hover:bg-primary-100 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                      Cập nhật
                    </button>
                  </div>
                </section>

                <!-- Tính năng: Khóa tài khoản -->
                <section class="pt-6 border-t border-gray-100">
                  <header class="flex items-center gap-2 mb-2">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-red-500"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" /></svg>
                     <label class="block text-xs font-bold text-red-500 tracking-wider uppercase">Bảo mật nâng cao</label>
                  </header>
                  <p class="text-xs text-gray-500 mb-4 leading-relaxed focus:mb-2">Vô hiệu hóa quyền truy cập hệ thống ngay lập tức nếu nghi ngờ tài khoản bị xâm nhập trái phép.</p>
                  <button @click="handleLockAccount" class="text-sm font-semibold flex items-center justify-center gap-2 text-red-700 bg-white border border-red-200 shadow-sm hover:bg-red-50 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto outline-none focus:ring-2 focus:ring-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                    Tạm khóa tải khoản
                  </button>
                </section>
              </div>

              <!-- CỘT PHẢI: EMAIL -->
              <div class="space-y-6 pt-2 lg:pt-0 border-t border-gray-100 lg:border-none">
                <section>
                  <label class="block text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">Hộp thư điện tử liên kết</label>

                  <div v-if="editingField === 'email'" class="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-200">
                     <!-- Đổi email: B1 -->
                     <div v-if="emailStep === 1" class="space-y-4">
                       <div>
                         <label class="text-xs text-gray-600 mb-1.5 block font-medium">Nhập địa chỉ Email mới</label>
                         <input
                          ref="inputRef"
                          v-model="editForm.email"
                          type="email"
                          class="w-full text-sm text-gray-900 border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white px-3 py-2.5 rounded-lg transition-colors outline-none shadow-sm"
                          placeholder="Ví dụ: hotro@gmail.com"
                         />
                       </div>
                       <div class="flex flex-col sm:flex-row items-stretch gap-2.5">
                         <button @click="requestEmailToken" :disabled="isSendingOTP" class="flex-1 text-sm font-semibold px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex items-center justify-center h-[42px]">
                           <span v-if="!isSendingOTP">Gửi mã xác minh</span>
                           <span v-else class="animate-pulse">Đang gửi OTP...</span>
                         </button>
                         <button @click="cancelEdit" class="flex-1 text-sm font-medium px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition h-[42px]">Hủy bỏ</button>
                       </div>
                     </div>

                     <!-- Đổi email: B2 -->
                     <div v-else-if="emailStep === 2" class="space-y-4 animate-fadeIn">
                       <div class="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg border border-emerald-100/60 leading-relaxed shadow-sm">
                          <span class="block">Mã 6 số đã được gửi tới:</span>
                          <strong class="text-sm my-0.5 block">{{editForm.email}}</strong>
                          <span class="opacity-80"> Vui lòng kiểm tra Hộp thư đến hoặc thư mục Spam.</span>
                       </div>
                       <div>
                         <label class="text-xs text-gray-600 mb-1.5 block font-medium">Nhập mã định danh (OTP)</label>
                         <input
                          v-model="editForm.emailToken"
                          type="text"
                          class="w-full text-center tracking-[0.5em] font-bold text-xl text-gray-900 border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 bg-white px-4 py-3 rounded-lg shadow-inner outline-none transition-all placeholder-gray-300"
                          placeholder="••••••"
                          maxlength="6"
                         />
                       </div>
                       <div class="flex flex-col gap-2 pt-1">
                         <button @click="changeEmailConfirm" class="w-full text-sm font-semibold px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition shadow-sm">Xác nhận thay đổi</button>
                         <button @click="emailStep = 1" class="w-full text-sm font-medium px-4 py-2.5 bg-transparent text-gray-600 hover:text-gray-900 transition underline underline-offset-2">Sử dụng Email khác</button>
                       </div>
                     </div>
                  </div>

                  <div v-else class="flex flex-row items-center justify-between gap-3 group p-3 -ml-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors overflow-hidden">
                    <p class="text-sm font-medium text-gray-900 truncate flex-1 min-w-0" :title="userDetail?.email || authStore.user?.email || 'Chưa thiết lập'">
                      {{ userDetail?.email || authStore.user?.email || 'Chưa thiết lập' }}
                    </p>
                    <button @click="startEdit('email')" class="text-xs flex shrink-0 items-center gap-1.5 font-medium text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-md hover:bg-primary-100 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                      Đổi Email
                    </button>
                  </div>
                </section>
              </div>

            </div>
          </div>

          <!-- TAB: LỊCH SỬ ĐƠN HÀNG -->
          <div v-if="activeTab === 'orders'" class="p-5 lg:p-8">
            <h1 class="text-xl lg:text-2xl font-bold text-gray-900 mb-8 leading-tight">Lịch sử đơn hàng</h1>
            <div class="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
               <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-400">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                 </svg>
               </div>
               <h3 class="text-base font-semibold text-gray-900 mb-1">Chưa có đơn hàng nào</h3>
               <p class="text-sm text-gray-500 max-w-[250px] mx-auto">Bạn chưa thực hiện bất kỳ giao dịch mua hàng nào trên hệ thống.</p>
            </div>
          </div>

      </main>
  </SectionWrapper>

</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
