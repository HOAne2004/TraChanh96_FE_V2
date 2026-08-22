<script setup lang="ts">
import IconSvgUser from '@/assets/icons/IconSvgUser.svg'
import { reactive, ref } from 'vue'
import { authService } from '@/modules/identity/services/auth.service'
import { useAuthStore } from '@/modules/identity/stores/auth.store'
import { useToastStore } from '@/shared/store/toast.store'
import type { ApiError } from '@/shared/types/api'
import AppLoading from '@/shared/components/ui/AppLoading.vue'

const authStore = useAuthStore()
const toastStore = useToastStore()

const isLoading = ref(false)
const errorMessage = ref('')
const currentStep = ref(1)

const form = reactive({
  email: '',
  password: '',
  fullName: '',
})

const otpCode = ref('')

const handleRegister = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await authService.register(form)
    currentStep.value = 2
  } catch (error) {
    const apiError = error as ApiError
    errorMessage.value = apiError.message || 'Có lỗi xảy ra khi đăng ký'
    toastStore.error(apiError.message || 'Có lỗi xảy ra khi đăng ký')
  } finally {
    isLoading.value = false
  }
}

const handleVerifyOtp = async () => {
  // Thay đổi logic kiểm tra: Token dạng Guid N có đúng 32 ký tự
  if (!otpCode.value || otpCode.value.length < 32) {
    errorMessage.value = 'Vui lòng nhập mã xác thực hợp lệ (32 ký tự).'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authService.verifyEmail({ email: form.email, token: otpCode.value })

    toastStore.success('Xác thực thành công! Vui lòng đăng nhập.')
    authStore.closeRegisterModal()
    authStore.openLoginModal()

    currentStep.value = 1
    form.email = ''
    form.password = ''
    form.fullName = ''
    otpCode.value = ''
  } catch (error) {
    const apiError = error as ApiError
    errorMessage.value = apiError.message || 'Mã xác thực không chính xác hoặc đã hết hạn.'
    toastStore.error(apiError.message || 'Mã xác thực không chính xác hoặc đã hết hạn.')
  } finally {
    isLoading.value = false
  }
}

const backToLogin = () => {
  authStore.closeRegisterModal()
  authStore.openLoginModal()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="authStore.isRegisterModalVisible"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="authStore.closeRegisterModal"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl relative overflow-hidden">
        <AppLoading :show="isLoading" overlay text="Đang xử lý..." />
        <button
          @click="authStore.closeRegisterModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <IconSvgUser class="h-6 w-6" />
        </button>

        <h2 class="mb-6 text-center text-3xl font-bold text-gray-800">
          {{ currentStep === 1 ? 'Tạo Tài Khoản' : 'Xác Thực Email' }}
        </h2>

        <div
          v-if="errorMessage"
          class="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100"
        >
          {{ errorMessage }}
        </div>

        <form v-if="currentStep === 1" @submit.prevent="handleRegister">
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-gray-700">Họ và Tên</label>
            <input
              v-model="form.fullName"
              type="text"
              required
              class="input-field"
              placeholder="Ví dụ: Lê Huy"
            />
          </div>

          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="Ví dụ: lehuy@gmail.com"
            />
          </div>

          <div class="mb-6">
            <label class="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="6"
              class="input-field"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full py-3 text-lg font-semibold"
          >
            Đăng Ký
          </button>

          <p class="mt-6 text-center text-sm text-gray-600">
            Đã có tài khoản?
            <button
              type="button"
              @click="backToLogin"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Đăng nhập ngay
            </button>
          </p>
        </form>

        <form v-if="currentStep === 2" @submit.prevent="handleVerifyOtp">
          <p class="mb-6 text-center text-gray-600">
            Chúng tôi đã gửi một liên kết và mã xác thực đến email
            <strong class="text-primary-600">{{ form.email }}</strong>.
            <br /> Vui lòng click vào link trong email hoặc dán mã vào đây.
          </p>

          <div class="mb-8">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 text-center">Mã Xác Thực</label>
            <input
              v-model="otpCode"
              type="text"
              required
              class="input-field text-center text-base tracking-wide font-medium"
              placeholder="Dán mã gồm 32 ký tự vào đây..."
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full py-3 text-lg font-semibold"
          >
            Xác Nhận
          </button>

          <div class="mt-6 text-center">
            <button
              type="button"
              @click="currentStep = 1"
              class="text-sm text-gray-500 hover:text-primary-600"
            >
              &larr; Quay lại sửa email
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
