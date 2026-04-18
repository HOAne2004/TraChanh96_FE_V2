<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/identity/store/auth.store';
import { useConfirmStore } from '@/shared/store/confirm.store';

const authStore = useAuthStore();
const confirmStore = useConfirmStore();
const router = useRouter();

// Quản lý trạng thái mở/đóng dropdown
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

// Đóng menu khi click ra ngoài
const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    closeMenu();
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

// Điều hướng
const navigateTo = (path: string) => {
  closeMenu();
  router.push(path);
};

// Xử lý đăng xuất có xác nhận
const handleLogout = async () => {
  closeMenu();
  const isConfirmed = await confirmStore.ask({
    title: 'Đăng xuất?',
    message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
    confirmText: 'Đăng xuất',
    type: 'warning'
  });

  if (isConfirmed) {
    authStore.logout();
    router.push('/');
  }
};
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      v-if="!authStore.isAuthenticated"
      @click="authStore.openLoginModal"
      class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
      <span>Đăng nhập</span>
    </button>

    <div v-else>
      <button
        @click="toggleMenu"
        class="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        :class="{ 'bg-gray-100': isMenuOpen }"
        aria-expanded="false"
      >
        <div class="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center shrink-0">
          <img v-if="authStore.user?.thumbnailUrl" :src="authStore.user.thumbnailUrl" class="w-full h-full object-cover" alt="Avatar" />
          <span v-else class="text-sm font-semibold text-gray-600 uppercase">
            {{ authStore.user?.fullName ? authStore.user.fullName.charAt(0) : 'U' }}
          </span>
        </div>
        <div class="hidden lg:flex flex-col items-start justify-center max-w-[120px]">
          <span class="text-sm font-medium text-gray-900 leading-none truncate w-full">
            {{ authStore.user?.fullName || 'Khách' }}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ml-1"
          :class="{ 'rotate-180': isMenuOpen }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isMenuOpen"
          class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl shadow-gray-200/50 border border-gray-100 p-1.5 z-50 origin-top-right flex flex-col"
        >
          <div class="px-3 py-2.5 mb-1 bg-gray-50/50 rounded-md">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ authStore.user?.fullName || 'Thành viên' }}
            </p>
            <p class="text-xs text-gray-500 font-medium truncate mt-0.5">
              {{ authStore.user?.email || authStore.user?.role || 'User' }}
            </p>
          </div>

          <div class="flex flex-col gap-0.5">
            <button
              @click="navigateTo('/profile')"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-400 shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Hồ sơ cá nhân
            </button>

            <button
              @click="navigateTo('/profile?tab=orders')"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-400 shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Lịch sử đơn hàng
            </button>
          </div>

          <div class="h-px bg-gray-100 my-1 mx-1"></div>

          <button
            @click="handleLogout"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>
