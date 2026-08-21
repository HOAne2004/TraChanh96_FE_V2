<script setup lang="ts">
import IconSvgLogout from '@/assets/icons/IconSvgLogout.svg'
import IconSvgChevronRight from '@/assets/icons/IconSvgChevronRight.svg'
import IconSvgBars from '@/assets/icons/IconSvgBars.svg'
import IconSvgDocumentPro from '@/assets/icons/IconSvgDocumentPro.svg'
import IconSvgCart from '@/assets/icons/IconSvgCart.svg'
import IconSvgHome from '@/assets/icons/IconSvgHome.svg'
import IconSvgCup from '@/assets/icons/IconSvgCup.svg'
import IconSvgUsers from '@/assets/icons/IconSvgUsers.svg'
import IconSvgCancel from '@/assets/icons/IconSvgCancel.svg'

import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import UserMenu from '@/modules/identity/components/UserMenu.vue'
import { useAuthStore } from '@/modules/identity/stores/auth.store'
import { useConfirmStore } from '@/shared/store/confirm.store'

// Tạm thời mock data giỏ hàng (Sau này thay bằng store giỏ hàng)
const totalItems = ref(0)

// Quản lý trạng thái mở/đóng menu trên điện thoại
const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => (isMobileMenuOpen.value = !isMobileMenuOpen.value)
const closeMobileMenu = () => (isMobileMenuOpen.value = false)

const authStore = useAuthStore()
const confirmStore = useConfirmStore()
const router = useRouter()

const handleMobileLogin = () => {
  closeMobileMenu()
  authStore.openLoginModal()
}

const navigateMobileTo = (path: string) => {
  closeMobileMenu()
  router.push(path)
}

const handleMobileLogout = async () => {
  closeMobileMenu()
  const isConfirmed = await confirmStore.ask({
    title: 'Đăng xuất?',
    message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
    confirmText: 'Đăng xuất',
    type: 'warning',
  })

  if (isConfirmed) {
    authStore.logout()
    router.push('/')
  }
}
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-40">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <!-- 1. Tên thương hiệu -->
      <RouterLink to="/" class="flex items-center gap-2">
        <span class="text-2xl font-bold text-primary-600 font-[cursive]">🍋 Trà Chanh 1996</span>
      </RouterLink>

      <!-- 2. Menu chính (Chỉ hiển thị ở màn hình laptop/desktop trở lên) -->
      <nav class="hidden md:flex gap-8 font-medium text-gray-600">
        <RouterLink
          to="/"
          exact-active-class="text-primary-600 !border-primary-500 font-semibold"
          class="hover:text-primary-500 transition-colors border-b-2 border-transparent py-1"
          >Trang chủ</RouterLink
        >
        <RouterLink
          to="/menu"
          exact-active-class="text-primary-600 !border-primary-500 font-semibold"
          class="hover:text-primary-500 transition-colors border-b-2 border-transparent py-1"
          >Thực đơn</RouterLink
        >
        <RouterLink
          to="/about-us"
          exact-active-class="text-primary-600 !border-primary-500 font-semibold"
          class="hover:text-primary-500 transition-colors border-b-2 border-transparent py-1"
          >Về chúng tôi</RouterLink
        >
        <RouterLink
          to="#"
          exact-active-class="text-primary-600 !border-primary-500 font-semibold"
          class="hover:text-primary-500 transition-colors border-b-2 border-transparent py-1"
          >Tin tức</RouterLink
        >
      </nav>

      <!-- Cụm hành động bên phải: Giỏ hàng + Đăng nhập / Menu Mobile -->
      <div class="flex items-center gap-4">
        <!-- 3. Giỏ hàng (Luôn hiển thị ở cả desktop và mobile) -->
        <RouterLink
          to="/cart"
          class="relative p-2 text-gray-600 hover:text-primary-500 transition-colors"
        >
          <IconSvgCart class="w-6 h-6" />
          <span
            v-if="totalItems > 0"
            class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full"
          >
            {{ totalItems }}
          </span>
        </RouterLink>

        <!-- 4. Đăng nhập / User Profile (Ẩn ở mobile, hiện ở desktop) -->
        <div class="hidden md:block">
          <UserMenu />
        </div>

        <!-- Nút Menu Toggle (Chỉ hiện ở mobile thay thế cho phần Menu chính & Nút Đăng nhập) -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2 border-2 border-primary-500 rounded-lg text-gray-600 hover:text-primary-500 transition-colors focus:outline-none"
        >
          <IconSvgBars class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Drawer Overlay (Sử dụng Teleport để tránh lỗi z-index từ cha) -->
    <Teleport to="body">
      <!-- Backdrop mờ tối màn hình -->
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 md:hidden"
          @click="closeMobileMenu"
        ></div>
      </Transition>

      <!-- Thanh menu trượt mượt mà (75% chiều rộng màn hình, trượt từ bên phải) -->
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-y-0 right-0 w-[75%] sm:w-[60%] max-w-[320px] bg-white z-50 shadow-2xl flex flex-col p-6 md:hidden border-l border-gray-100"
        >
          <!-- Drawer Header -->
          <div class="flex items-center justify-between pb-6 border-b border-gray-100">
            <span class="text-xl font-bold text-primary-600 font-[cursive]">🍋 Trà Chanh 1996</span>
            <button
              @click="closeMobileMenu"
              class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <IconSvgCancel class="w-6 h-6" />
            </button>
          </div>

          <!-- Drawer Navigation links -->
          <nav class="flex flex-col space-y-2 py-6 font-medium text-gray-700">
            <span
              class="px-2 py-2 mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100"
              >Menu</span
            >

            <RouterLink
              to="/"
              @click="closeMobileMenu"
              exact-active-class="bg-primary-50 text-primary-600 font-bold border-l-4 border-l-primary-500"
              class="px-4 py-3 rounded-xl hover:bg-gray-50 hover:text-primary-500 transition-colors border-l-4 border-l-transparent flex items-center gap-3"
            >
              <IconSvgHome class="w-5 h-5" />
              <span>Trang chủ</span>
            </RouterLink>
            <RouterLink
              to="/menu"
              @click="closeMobileMenu"
              exact-active-class="bg-primary-50 text-primary-600 font-bold border-l-4 border-l-primary-500"
              class="px-4 py-3 rounded-xl hover:bg-gray-50 hover:text-primary-500 transition-colors border-l-4 border-l-transparent flex items-center gap-3"
            >
              <IconSvgCup class="size-6" />
              <span>Thực đơn</span>
            </RouterLink>
            <RouterLink
              to="/about-us"
              @click="closeMobileMenu"
              exact-active-class="bg-primary-50 text-primary-600 font-bold border-l-4 border-l-primary-500"
              class="px-4 py-3 rounded-xl hover:bg-gray-50 hover:text-primary-500 transition-colors border-l-4 border-l-transparent flex items-center gap-3"
            >
              <IconSvgUsers class="w-5 h-5" />
              <span>Về chúng tôi</span>
            </RouterLink>
            <RouterLink
              to="#"
              @click="closeMobileMenu"
              exact-active-class="bg-primary-50 text-primary-600 font-bold border-l-4 border-l-primary-500"
              class="px-4 py-3 rounded-xl hover:bg-gray-50 hover:text-primary-500 transition-colors border-l-4 border-l-transparent flex items-center gap-3"
            >
              <IconSvgDocumentPro class="w-5 h-5" />
              <span>Tin tức</span>
            </RouterLink>
          </nav>

          <!-- Drawer Footer: Tích hợp trực tiếp UserMenu cho Mobile -->
          <div class="mt-auto pt-6 flex flex-col">
            <span
              class="px-2 py-2 mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100"
              >Tài khoản</span
            >
            <!-- 1. Trạng thái CHƯA ĐĂNG NHẬP -->
            <button
              v-if="!authStore.isAuthenticated"
              @click="handleMobileLogin"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold transition-all hover:bg-gray-800 focus:outline-none cursor-pointer"
            >
              <IconSvgLogout class="w-5 h-5 text-gray-300" />
              <span>Đăng nhập</span>
            </button>

            <!-- 2. Trạng thái ĐÃ ĐĂNG NHẬP -->
            <div v-else class="flex flex-col">
              <!-- Phần A: Tên người dùng + Avatar -->
              <button
                @click="navigateMobileTo('/profile')"
                class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 text-left group"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center shrink-0"
                  >
                    <img
                      :src="authStore.user?.thumbnailUrl || undefined"
                      class="w-full h-full object-cover"
                      alt="Avatar"
                      v-fallback-img
                    />
                  </div>
                  <div class="flex flex-col items-start min-w-0 flex-1">
                    <span class="text-base font-bold text-gray-900 truncate w-full">
                      {{ authStore.user?.fullName || 'Thành viên' }}
                    </span>
                    <span class="text-xs text-gray-500 truncate w-full">
                      {{ authStore.user?.email || authStore.user?.roles?.[0] || 'User' }}
                    </span>
                  </div>
                </div>
                <!-- Icon chevron để báo hiệu có thể click -->
                <IconSvgChevronRight class="w-5 h-5 text-gray-400 shrink-0 ml-2 group-hover:text-gray-600 transition-colors" />
              </button>

              <div class="h-px bg-gray-100 my-3"></div>

              <!-- Phần C: Chức năng đăng xuất -->
              <button
                @click="handleMobileLogout"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer text-left"
              >
                <IconSvgLogout class="w-5 h-5 shrink-0" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>
