<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/modules/identity/services/auth.service'
import { useToastStore } from '@/shared/store/toast.store'
import { useAuthStore } from '@/modules/identity/stores/auth.store'
import AppLoading from '@/shared/components/ui/AppLoading.vue'
import IconSvgCheckCircle from '@/assets/icons/IconSvgCheckCircle.svg'
import IconSvgCancelCircle from '@/assets/icons/IconSvgCancelCircle.svg'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const authStore = useAuthStore()

const email = ref('')
const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const isLoading = ref(false)
const errorMessage = ref('')
const isSuccess = ref(false)

onMounted(() => {
  email.value = (route.query.email as string) || ''
  token.value = (route.query.token as string) || ''

  if (!email.value || !token.value) {
    errorMessage.value = 'Đường dẫn thiết lập mật khẩu không hợp lệ hoặc bị thiếu thông tin.'
  }
})

const handleSetupPassword = async () => {
  errorMessage.value = ''

  if (newPassword.value.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Xác nhận mật khẩu không khớp.'
    return
  }

  try {
    isLoading.value = true
    await authService.resetPassword({
      email: email.value,
      token: token.value,
      newPassword: newPassword.value
    })
    
    isSuccess.value = true
    toastStore.success('Thiết lập mật khẩu thành công!')
    
    setTimeout(() => {
      router.push('/')
      authStore.openLoginModal()
    }, 3000)
    
  } catch (error: any) {
    errorMessage.value = error.message || 'Mã xác thực không đúng hoặc đã hết hạn.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl relative overflow-hidden">
      <AppLoading :show="isLoading" overlay text="Đang xử lý..." />

      <div v-if="isSuccess" class="text-center">
        <div class="mb-4 flex justify-center text-green-500">
          <IconSvgCheckCircle class="h-16 w-16" />
        </div>
        <h2 class="mb-2 text-2xl font-bold text-gray-800">Hoàn tất</h2>
        <p class="text-gray-600 mb-6">Mật khẩu của bạn đã được thiết lập thành công.</p>
        <div class="text-sm text-gray-500">Sẽ tự động chuyển hướng sau 3 giây...</div>
      </div>

      <div v-else-if="!email || !token" class="text-center">
         <div class="mb-4 flex justify-center text-red-500">
          <IconSvgCancelCircle class="h-16 w-16" />
        </div>
        <h2 class="mb-2 text-2xl font-bold text-gray-800">Lỗi liên kết</h2>
        <p class="text-gray-600 mb-6">{{ errorMessage }}</p>
        <button @click="router.push('/')" class="btn-primary w-full py-2">
          Về trang chủ
        </button>
      </div>

      <form v-else @submit.prevent="handleSetupPassword">
        <h2 class="mb-2 text-center text-2xl font-bold text-gray-800">Thiết Lập Mật Khẩu</h2>
        <p class="mb-6 text-center text-sm text-gray-500">Tạo mật khẩu cho tài khoản <strong class="text-gray-700">{{ email }}</strong></p>

        <div v-if="errorMessage" class="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          {{ errorMessage }}
        </div>

        <div class="mb-4">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
          <input
            v-model="newPassword"
            type="password"
            required
            minlength="6"
            placeholder="Tối thiểu 6 ký tự"
            class="input-field"
          />
        </div>

        <div class="mb-6">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="6"
            placeholder="Nhập lại mật khẩu mới"
            class="input-field"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-primary w-full py-3 text-lg font-semibold"
        >
          Xác Nhận
        </button>
      </form>
    </div>
  </div>
</template>
