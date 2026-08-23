<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/shared/store/toast.store';
import { useConfirmStore } from '@/shared/store/confirm.store';
import { useAuthStore } from '@/modules/identity/stores/auth.store';
import { userService } from '@/modules/identity/services/user.service';
import type { ActiveSessionDto } from '@/modules/identity/types/user';
import IconSvgCancel from '@/assets/icons/IconSvgCancel.svg'; // Close Icon
import AppLoading from '@/shared/components/ui/AppLoading.vue';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close']);

const toastStore = useToastStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const router = useRouter();

const isLoading = ref(false);
const sessions = ref<ActiveSessionDto[]>([]);

// Tải danh sách thiết bị mỗi khi Modal mở
watch(() => props.isOpen, (open) => {
  if (open) fetchSessions();
});

const fetchSessions = async () => {
  try {
    isLoading.value = true;
    // Dữ liệu trả về sẽ map chính xác với ActiveSessionDto
    sessions.value = await userService.getMySessions();
  } catch (error: any) {
    toastStore.error(error?.message || 'Không thể tải danh sách thiết bị.');
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (isoString: string) => {
  const d = new Date(isoString);
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d);
};

// Đăng xuất 1 thiết bị cụ thể
const handleRevokeSession = async (session: ActiveSessionDto) => {
  const isConfirmed = await confirmStore.ask({
    title: 'Đăng xuất thiết bị',
    message: session.isCurrentSession
      ? 'Đây là thiết bị bạn đang sử dụng. Đăng xuất sẽ đẩy bạn ra khỏi hệ thống ngay lập tức. Bạn chắc chắn chứ?'
      : `Bạn có chắc muốn đăng xuất tài khoản khỏi thiết bị "${session.deviceName}"?`,
    confirmText: 'Đăng xuất',
    type: session.isCurrentSession ? 'danger' : 'warning'
  });

  if (!isConfirmed) return;

  try {
    isLoading.value = true;
    await userService.revokeDeviceSession(session.sessionId);
    toastStore.success('Đã đăng xuất thiết bị thành công.');

    if (session.isCurrentSession) {
      // Nếu tự kick chính mình -> Về trang chủ
      emit('close');
      authStore.clearAuthData();
      router.push('/');
    } else {
      // Nếu kick thiết bị khác -> Load lại danh sách
      await fetchSessions();
    }
  } catch (error: any) {
    toastStore.error(error?.message || 'Có lỗi xảy ra khi đăng xuất thiết bị.');
  } finally {
    isLoading.value = false;
  }
};

// Đăng xuất toàn bộ
const handleRevokeAll = async () => {
  const isConfirmed = await confirmStore.ask({
    title: 'Đăng xuất tất cả',
    message: 'Hành động này sẽ đăng xuất tài khoản khỏi TẤT CẢ thiết bị, bao gồm cả thiết bị hiện tại. Đảm bảo bạn nhớ mật khẩu để đăng nhập lại.',
    confirmText: 'Đăng xuất tất cả',
    type: 'danger'
  });

  if (!isConfirmed) return;

  try {
    isLoading.value = true;
    await userService.revokeAllSessions();
    toastStore.success('Đã đăng xuất khỏi tất cả các thiết bị.');

    emit('close');
    authStore.clearAuthData();
    router.push('/');
  } catch (error: any) {
    toastStore.error(error?.message || 'Có lỗi xảy ra.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh] animate-[fadeIn_0.2s_ease-out]">
      <AppLoading :show="isLoading" overlay text="Đang xử lý..." />

      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
        <div>
          <h3 class="text-lg font-bold text-gray-900">Thiết bị đăng nhập</h3>
          <p class="text-xs text-gray-500 mt-0.5">Quản lý những nơi tài khoản của bạn đang hoạt động.</p>
        </div>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">
          <IconSvgCancel class="h-5 w-5" />
        </button>
      </div>

      <!-- Danh sách thiết bị -->
      <div class="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">

        <div v-if="sessions.length === 0 && !isLoading" class="text-center py-10 text-gray-500">
          Không tìm thấy thiết bị nào.
        </div>

        <div
          v-for="session in sessions"
          :key="session.sessionId"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all"
          :class="session.isCurrentSession ? 'bg-primary-50/30 border-primary-200' : 'bg-white border-gray-200 hover:border-gray-300'"
        >
          <!-- Cột thông tin -->
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="session.isCurrentSession ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'"
            >
              <!-- Icon máy tính / điện thoại cơ bản bằng SVG (có thể thay bằng icon của bạn) -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div>
              <div class="flex items-center gap-2 mb-1">
                <h4 class="text-sm font-bold text-gray-900">{{ session.deviceName || 'Thiết bị không xác định' }}</h4>
                <span
                  v-if="session.isCurrentSession"
                  class="px-2 py-0.5 text-[10px] font-bold text-primary-700 bg-primary-100 rounded uppercase tracking-wider"
                >
                  Đang dùng
                </span>
              </div>
              <p class="text-xs text-gray-500">IP: {{ session.ipAddress }}</p>
              <p class="text-xs text-gray-500 mt-0.5">Đăng nhập lúc: {{ formatDate(session.createdAt) }}</p>
            </div>
          </div>

          <!-- Nút Đăng xuất -->
          <button
            v-if="!session.isCurrentSession"
            @click="handleRevokeSession(session)"
            class="sm:w-auto w-full px-4 py-2 text-xs font-semibold rounded-lg transition-colors border text-gray-700 border-gray-200 bg-white hover:bg-gray-50"
          >
            Đăng xuất
          </button>
        </div>

      </div>

      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-xs text-gray-500 w-full sm:w-auto text-center sm:text-left">
          Nghi ngờ tài khoản bị lộ? Đăng xuất toàn bộ ngay.
        </p>
        <button
          @click="handleRevokeAll"
          :disabled="isLoading || sessions.length <= 1"
          class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
        >
          Đăng xuất tất cả
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
</style>
