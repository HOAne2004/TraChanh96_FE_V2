<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import UserMenu from '@/modules/identity/components/UserMenu.vue';

// Tạm thời mock data giỏ hàng (Sau này thay bằng store giỏ hàng)
//const totalItems = ref(0);

// Quản lý trạng thái mở/đóng menu trên điện thoại
const isMobileMenuOpen = ref(false);
const toggleMobileMenu = () => isMobileMenuOpen.value = !isMobileMenuOpen.value;
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-40">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

      <RouterLink to="/" class="flex items-center gap-2">
        <span class="text-2xl font-bold text-primary-600 font-[cursive]">🍋 Trà Chanh 1996</span>
      </RouterLink>

      <nav class="hidden md:flex gap-8 font-medium text-gray-600">
        <RouterLink to="/" class="hover:text-primary-500 transition-colors">Trang chủ</RouterLink>
        <RouterLink to="#" class="hover:text-primary-500 transition-colors">Thực đơn</RouterLink>
        <RouterLink to="#" class="hover:text-primary-500 transition-colors">Về chúng tôi</RouterLink>
        <RouterLink to="#" class="hover:text-primary-500 transition-colors">Tin tức</RouterLink>
      </nav>

      <div class="flex items-center gap-4">

        <!-- <RouterLink to="/cart" class="relative p-2 text-gray-600 hover:text-primary-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <span v-if="totalItems > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
            {{ totalItems }}
          </span>
        </RouterLink> -->

        <div class="hidden md:block">
          <UserMenu />
        </div>

        <button @click="toggleMobileMenu" class="md:hidden p-2 text-gray-600 hover:text-primary-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

      </div>
    </div>

    <div v-show="isMobileMenuOpen" class="md:hidden border-t border-gray-100 bg-white shadow-lg">
      <nav class="flex flex-col font-medium text-gray-600">
        <RouterLink to="/" class="px-4 py-3 hover:bg-gray-50 hover:text-primary-500 border-b border-gray-50">Trang chủ</RouterLink>
        <RouterLink to="#" class="px-4 py-3 hover:bg-gray-50 hover:text-primary-500 border-b border-gray-50">Thực đơn</RouterLink>
        <RouterLink to="#" class="px-4 py-3 hover:bg-gray-50 hover:text-primary-500 border-b border-gray-50">Về chúng tôi</RouterLink>

        <div class="p-4 bg-gray-50">
          <UserMenu />
        </div>
      </nav>
    </div>
  </header>
</template>
