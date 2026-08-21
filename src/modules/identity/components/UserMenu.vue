<script setup lang="ts">
import IconSvgUser from '@/assets/icons/IconSvgUser.svg'
import IconSvgDocument from '@/assets/icons/IconSvgDocument.svg'
import IconSvgChevronRight from '@/assets/icons/IconSvgChevronRight.svg'
import IconSvgLogout from '@/assets/icons/IconSvgLogout.svg'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/identity/stores/auth.store'
import { useConfirmStore } from '@/shared/store/confirm.store'

const authStore = useAuthStore()
const confirmStore = useConfirmStore()
const router = useRouter()

// Quản lý trạng thái mở/đóng dropdown
const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Đóng menu khi click ra ngoài
const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    closeMenu()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// Điều hướng
const navigateTo = (path: string) => {
  closeMenu()
  router.push(path)
}

// Xử lý đăng xuất có xác nhận
const handleLogout = async () => {
  closeMenu()
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
  <div ref="menuRef" class="relative">
    <button
      v-if="!authStore.isAuthenticated"
      @click="authStore.openLoginModal"
      class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
    >
      <IconSvgLogout class="w-4 h-4" />
      <span>Đăng nhập</span>
    </button>

    <div v-else>
      <button
        @click="toggleMenu"
        class="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        :class="{ 'bg-gray-100': isMenuOpen }"
        aria-expanded="false"
      >
        <div
          class="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center shrink-0"
        >
          <img
            :src="authStore.user?.thumbnailUrl || undefined"
            class="w-full h-full object-cover"
            alt="Avatar"
            v-fallback-img
          />
        </div>
        <div class="hidden lg:flex flex-col items-start justify-center max-w-[120px]">
          <span class="text-sm font-medium text-gray-900 leading-none truncate w-full">
            {{ authStore.user?.fullName || 'Khách' }}
          </span>
        </div>
        <IconSvgChevronRight
          class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ml-1"
          :class="{ 'rotate-90': isMenuOpen }"
        />
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
          <button
            @click="navigateTo('/profile')"
            class="w-full text-left px-3 py-2.5 mb-1 bg-gray-50/50 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:bg-gray-100"
          >
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ authStore.user?.fullName || 'Thành viên' }}
            </p>
            <p class="text-xs text-gray-500 font-medium truncate mt-0.5">
              {{ authStore.user?.email || authStore.user?.roles?.[0] || 'User' }}
            </p>
          </button>

          <div class="hidden md:flex flex-col gap-0.5">
            <button
              @click="navigateTo('/profile')"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:bg-gray-100"
            >
              <IconSvgUser class="w-4 h-4 text-gray-400 shrink-0" />
              Hồ sơ cá nhân
            </button>

            <button
              @click="navigateTo('/profile?tab=orders')"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:bg-gray-100"
            >
              <IconSvgDocument class="w-4 h-4 text-gray-400 shrink-0" />
              Lịch sử đơn hàng
            </button>
          </div>

          <div class="h-px bg-gray-100 my-1 mx-1"></div>

          <button
            @click="handleLogout"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50"
          >
            <IconSvgLogout class="w-4 h-4 shrink-0" />
            Đăng xuất
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>
