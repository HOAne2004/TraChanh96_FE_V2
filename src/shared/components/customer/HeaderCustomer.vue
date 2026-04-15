<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/shared/stores/auth.store';

const authStore = useAuthStore();

// Biến để quản lý trạng thái mở/đóng menu trên điện thoại
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-40">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

      <div class="flex items-center gap-2">
        <span class="text-2xl font-bold text-primary-600">🍋 Trà Chanh 1996</span>
      </div>

      <nav class="hidden md:flex gap-8 font-medium text-gray-600">
        <a href="#" class="hover:text-primary-500 transition-colors">Trang chủ</a>
        <a href="#" class="hover:text-primary-500 transition-colors">Thực đơn</a>
        <a href="#" class="hover:text-primary-500 transition-colors">Khuyến mãi</a>
      </nav>

      <div class="flex items-center gap-4">

        <div class="hidden md:block">
          <button v-if="!authStore.isAuthenticated" @click="authStore.openLoginModal" class="btn-primary">
            Đăng nhập
          </button>
          <div v-else class="flex items-center gap-4">
            <span class="text-sm font-medium text-gray-700">Chào, {{ authStore.user?.fullName || 'Bạn' }}</span>
            <button @click="authStore.logout" class="btn-outline text-sm py-1.5">Đăng xuất</button>
          </div>
        </div>

        <button @click="toggleMobileMenu" class="md:hidden p-2 text-gray-600 hover:text-primary-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

      </div>
    </div>

    <div v-show="isMobileMenuOpen" class="md:hidden border-t border-gray-100 bg-white px-4 py-4 shadow-lg">
      <nav class="flex flex-col gap-4 font-medium text-gray-600">
        <a href="#" class="hover:text-primary-500">Trang chủ</a>
        <a href="#" class="hover:text-primary-500">Thực đơn</a>
        <a href="#" class="hover:text-primary-500">Khuyến mãi</a>

        <hr class="border-gray-200" />

        <button v-if="!authStore.isAuthenticated" @click="authStore.openLoginModal" class="btn-primary w-full text-center">
          Đăng nhập
        </button>
        <div v-else class="flex flex-col gap-3">
          <span class="text-sm font-medium text-gray-700">Chào, {{ authStore.user?.fullName || 'Bạn' }}</span>
          <button @click="authStore.logout" class="btn-outline w-full text-center">Đăng xuất</button>
        </div>
      </nav>
    </div>
  </header>
</template>
