<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import IconSvgUser from '@/assets/icons/IconSvgUser.svg'
import IconSvgTrash from '@/assets/icons/IconSvgTrash.svg'
import IconSvgLockDark from '@/assets/icons/IconSvgLockDark.svg'
import { useAuthStore } from '@/modules/identity/stores/auth.store'
import { useToastStore } from '@/shared/store/toast.store'
import { userService } from '@/modules/identity/services/user.service'

import ChangePasswordModal from './ChangePasswordModal.vue'
import DeviceSessionsModal from './DeviceSessionsModal.vue'
import SectionWrapper from '@/shared/components/ui/SectionWrapper.vue'
import AppLoading from '@/shared/components/ui/AppLoading.vue'

const authStore = useAuthStore()
const toastStore = useToastStore()

const isLoading = ref(false)
const userEmail = ref(authStore.user?.email || 'Chưa thiết lập')

// LOGIC ĐỔI EMAIL
const editingEmail = ref(false)
const emailStep = ref<1 | 2>(1)
const isSendingOTP = ref(false)
const editForm = reactive({ email: '', emailToken: '' })
const emailInputRef = ref<HTMLInputElement | null>(null)

const isOpenChangePasswordModal = ref(false)
const isOpenDeviceSessionsModal = ref(false)

const startEditEmail = async () => {
  editingEmail.value = true
  editForm.email = userEmail.value
  editForm.emailToken = ''
  emailStep.value = 1
  await nextTick()
  if (emailInputRef.value) emailInputRef.value.focus()
}

const cancelEditEmail = () => {
  editingEmail.value = false
}

const requestEmailToken = async () => {
  if (!editForm.email.trim() || !editForm.email.includes('@')) {
    toastStore.warning('Email không hợp lệ!')
    return
  }
  try {
    isSendingOTP.value = true
    await userService.changeEmail({ newEmail: editForm.email })
    toastStore.success('Mã xác thực đã được gửi đến email mới của bạn!')
    emailStep.value = 2
  } catch (error: any) {
    toastStore.error(error?.message || 'Không thể gửi mã xác thực.')
  } finally {
    isSendingOTP.value = false
  }
}

const changeEmailConfirm = async () => {
  if (!editForm.emailToken.trim()) {
    toastStore.warning('Vui lòng nhập mã OTP!')
    return
  }
  try {
    isLoading.value = true
    await userService.verifyEmail({ otpToken: editForm.emailToken })
    toastStore.success('Đổi email thành công!')
    userEmail.value = editForm.email
    if (authStore.user) {
      authStore.setUser({ ...authStore.user, email: editForm.email })
    }
    editingEmail.value = false
  } catch (error: any) {
    toastStore.error(error?.message || 'Mã xác thực không đúng.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <SectionWrapper title="Bảo mật tài khoản">
    <main class="p-5 lg:p-8 relative">
      <AppLoading :show="isLoading" overlay text="Đang xử lý..." />

      <!-- BỐ CỤC LƯỚI 2 CỘT CHO DESKTOP, 1 CỘT CHO MOBILE -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- CỘT TRÁI: EMAIL & MẬT KHẨU -->
        <div class="space-y-8 lg:pr-6 lg:border-r border-gray-100">
          <!-- KHỐI: EMAIL -->
          <section>
            <label class="block text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase"
              >Hộp thư điện tử liên kết</label
            >

            <div
              v-if="editingEmail"
              class="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-200"
            >
              <!-- Đổi email: B1 -->
              <div v-if="emailStep === 1" class="space-y-4">
                <div>
                  <label class="text-xs text-gray-600 mb-1.5 block font-medium"
                    >Nhập địa chỉ Email mới</label
                  >
                  <input
                    ref="emailInputRef"
                    v-model="editForm.email"
                    type="email"
                    class="w-full text-sm text-gray-900 border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white px-3 py-2.5 rounded-lg transition-colors outline-none shadow-sm"
                    placeholder="Ví dụ: hotro@gmail.com"
                  />
                </div>
                <div class="flex flex-col sm:flex-row items-stretch gap-2.5">
                  <button
                    @click="requestEmailToken"
                    :disabled="isSendingOTP"
                    class="flex-1 text-sm font-semibold px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex items-center justify-center h-[42px]"
                  >
                    <span v-if="!isSendingOTP">Gửi mã xác minh</span>
                    <span v-else class="animate-pulse">Đang gửi OTP...</span>
                  </button>
                  <button
                    @click="cancelEditEmail"
                    class="flex-1 text-sm font-medium px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition h-[42px]"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>

              <!-- Đổi email: B2 -->
              <div v-else-if="emailStep === 2" class="space-y-4 animate-fadeIn">
                <div
                  class="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg border border-emerald-100/60 leading-relaxed shadow-sm"
                >
                  <span class="block">Mã 6 số đã được gửi tới:</span>
                  <strong class="text-sm my-0.5 block">{{ editForm.email }}</strong>
                  <span class="opacity-80"> Vui lòng kiểm tra Hộp thư đến hoặc thư mục Spam.</span>
                </div>
                <div>
                  <label class="text-xs text-gray-600 mb-1.5 block font-medium"
                    >Nhập mã định danh (OTP)</label
                  >
                  <input
                    v-model="editForm.emailToken"
                    type="text"
                    class="w-full text-center tracking-[0.5em] font-bold text-xl text-gray-900 border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 bg-white px-4 py-3 rounded-lg shadow-inner outline-none transition-all placeholder-gray-300"
                    placeholder="••••••"
                    maxlength="6"
                  />
                </div>
                <div class="flex flex-col gap-2 pt-1">
                  <button
                    @click="changeEmailConfirm"
                    class="w-full text-sm font-semibold px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition shadow-sm"
                  >
                    Xác nhận thay đổi
                  </button>
                  <button
                    @click="emailStep = 1"
                    class="w-full text-sm font-medium px-4 py-2.5 bg-transparent text-gray-600 hover:text-gray-900 transition underline underline-offset-2"
                  >
                    Sử dụng Email khác
                  </button>
                </div>
              </div>
            </div>

            <div
              v-else
              class="flex flex-row items-center justify-between gap-3 group p-3 -ml-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors"
            >
              <p class="text-sm font-medium text-gray-900">{{ userEmail }}</p>
              <button
                @click="startEditEmail"
                class="text-xs flex shrink-0 items-center gap-1.5 font-medium text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-md hover:bg-primary-100 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
              >
                <IconSvgUser class="w-3.5 h-3.5" /> Đổi Email
              </button>
            </div>
          </section>

          <!-- KHỐI: ĐỔI MẬT KHẨU -->
          <section class="pt-6 border-t border-gray-100">
            <label class="block text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase"
              >Mật khẩu</label
            >
            <div
              class="flex flex-row items-center justify-between gap-3 p-3 -ml-3 rounded-xl hover:bg-gray-50 border border-transparent transition-colors"
            >
              <p class="text-sm font-medium text-gray-900 tracking-[0.2em]">••••••••</p>
              <button
                @click="isOpenChangePasswordModal = true"
                class="text-xs flex items-center gap-1.5 font-medium text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-md hover:bg-primary-100"
              >
                Cập nhật
              </button>
            </div>
          </section>
        </div>

        <!-- CỘT PHẢI: QUẢN LÝ THIẾT BỊ & KHÓA TÀI KHOẢN -->
        <div class="space-y-8 pt-2 lg:pt-0 border-t border-gray-100 lg:border-none">
          <!-- KHỐI: THIẾT BỊ ĐĂNG NHẬP -->
          <section>
            <label class="block text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase"
              >Thiết bị đang đăng nhập</label
            >
            <p class="text-sm text-gray-500 mb-4">
              Quản lý các thiết bị và trình duyệt đã truy cập vào tài khoản của bạn.
            </p>

            <!-- DANH SÁCH SESSIONS SẼ ĐƯỢC RENDER Ở ĐÂY -->
            <button
              @click="isOpenDeviceSessionsModal = true"
              class="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 shadow-sm"
            >
              Quản lý thiết bị
            </button>
          </section>
        </div>
      </div>
    </main>

    <ChangePasswordModal
      :is-open="isOpenChangePasswordModal"
      @close="isOpenChangePasswordModal = false"
    />
    <DeviceSessionsModal
      :is-open="isOpenDeviceSessionsModal"
      @close="isOpenDeviceSessionsModal = false"
    />
  </SectionWrapper>
</template>
