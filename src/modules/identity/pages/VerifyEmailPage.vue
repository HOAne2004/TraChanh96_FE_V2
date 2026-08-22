<script setup lang="ts">
import IconSvgCancelCircle from '@/assets/icons/IconSvgCancelCircle.svg'
import IconSvgCheckCircle from '@/assets/icons/IconSvgCheckCircle.svg'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/modules/identity/services/auth.service'
import { useToastStore } from '@/shared/store/toast.store'
import { useAuthStore } from '@/modules/identity/stores/auth.store'
import AppLoading from '@/shared/components/ui/AppLoading.vue'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const authStore = useAuthStore()

const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('Đang tiến hành xác thực tài khoản của bạn...')

onMounted(async () => {
  // Lấy email và token từ URL (ví dụ: ?email=abc@gmail.com&token=123...)
  const email = route.query.email as string
  const token = route.query.token as string

  if (!email || !token) {
    status.value = 'error'
    message.value = 'Đường dẫn xác thực không hợp lệ hoặc bị thiếu thông tin.'
    return
  }

  try {
    // Tự động gọi API xác thực
    await authService.verifyEmail({ email, token })
    
    status.value = 'success'
    message.value = 'Xác thực tài khoản thành công!'
    toastStore.success('Tài khoản đã được kích hoạt.')

    // Đợi 3 giây rồi chuyển về trang chủ và bật Modal đăng nhập
    setTimeout(() => {
      router.push('/')
      authStore.openLoginModal()
    }, 3000)

  } catch (error: any) {
    status.value = 'error'
    message.value = error.message || 'Mã xác thực không chính xác hoặc đã hết hạn.'
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
      
      <div v-if="status === 'loading'" class="mb-4 flex justify-center">
        <AppLoading :show="true" text="" />
      </div>

      <div v-else-if="status === 'success'" class="mb-4 flex justify-center text-green-500">
        <IconSvgCheckCircle class="h-16 w-16" />
      </div>

      <div v-else class="mb-4 flex justify-center text-red-500">
        <IconSvgCancelCircle class="h-16 w-16" />
      </div>

      <h2 class="mb-2 text-2xl font-bold text-gray-800">
        {{ status === 'loading' ? 'Đang xác thực...' : (status === 'success' ? 'Hoàn tất' : 'Xác thực thất bại') }}
      </h2>
      
      <p class="text-gray-600">{{ message }}</p>

      <div v-if="status === 'success'" class="mt-6 text-sm text-gray-500">
        Sẽ tự động chuyển hướng sau 3 giây...
      </div>

      <button
        v-if="status === 'error'"
        @click="router.push('/')"
        class="btn-primary mt-6 w-full py-2"
      >
        Về trang chủ
      </button>
    </div>
  </div>
</template>