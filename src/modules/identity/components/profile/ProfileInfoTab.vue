<script setup lang="ts">
import IconSvgCamera from '@/assets/icons/IconSvgCamera.svg'
import IconSvgEdit from '@/assets/icons/IconSvgEdit.svg'

import { ref, onMounted, reactive, nextTick } from 'vue'
import { useAuthStore } from '@/modules/identity/stores/auth.store'
import { useToastStore } from '@/shared/store/toast.store'
import { userService } from '@/modules/identity/services/user.service'
import { uploadService } from '@/shared/services/upload.service'

import type { UserProfileResponse } from '@/modules/identity/types/user'

import SectionWrapper from '@/shared/components/ui/SectionWrapper.vue'
import AppLoading from '@/shared/components/ui/AppLoading.vue'

const authStore = useAuthStore()
const toastStore = useToastStore()

const activeTab = ref('profile')
const isLoading = ref(true)
const userDetail = ref<UserProfileResponse | null>(null)

// ==========================================
// THÔNG TIN CHUNG
// ==========================================
const editingField = ref<'fullName' | 'phone' | null>(null)
const editForm = reactive({ fullName: '', phone: '' })
const inputRef = ref<HTMLInputElement | null>(null)

const startEdit = async (field: 'fullName' | 'phone') => {
  editingField.value = field
  editForm.fullName = userDetail.value?.fullName || authStore.user?.fullName || ''
  editForm.phone = userDetail.value?.phone || ''

  await nextTick()
  if (inputRef.value) inputRef.value.focus()
}

const cancelEdit = () => {
  editingField.value = null
}

const saveEdit = async () => {
  if (!editForm.fullName.trim()) {
    toastStore.warning('Họ tên không được để trống!')
    return
  }

  try {
    isLoading.value = true
    await userService.updateMyProfile({
      fullName: editForm.fullName,
      phoneNumber: editForm.phone,
      thumbnailUrl: userDetail.value?.thumbnailUrl,
    })

    toastStore.success('Cập nhật thành công!')

    if (userDetail.value) {
      userDetail.value.fullName = editForm.fullName
      userDetail.value.phone = editForm.phone
    }
    if (authStore.user) {
      authStore.setUser({
        ...authStore.user,
        fullName: editForm.fullName,
      })
    }

    editingField.value = null
  } catch (error) {
    const err = error as { message?: string }
    toastStore.error(err?.message || 'Có lỗi xảy ra khi lưu')
  } finally {
    isLoading.value = false
  }
}

// ==========================================
// UPLOAD AVATAR
// ==========================================
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerAvatarUpload = () => {
  if (fileInputRef.value) fileInputRef.value.click()
}

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    isLoading.value = true
    toastStore.info('Đang tải ảnh lên, vui lòng đợi...')

    const imageUrl = await uploadService.uploadFile(file)

    await userService.updateMyProfile({
      fullName: userDetail.value?.fullName || authStore.user?.fullName || '',
      phoneNumber: userDetail.value?.phone || '',
      thumbnailUrl: imageUrl,
    })

    if (userDetail.value) userDetail.value.thumbnailUrl = imageUrl
    if (authStore.user) {
      authStore.setUser({
        ...authStore.user,
        thumbnailUrl: imageUrl,
      })
    }

    toastStore.success('Cập nhật ảnh đại diện thành công!')
  } catch (error) {
    const err = error as { message?: string }
    toastStore.error(err?.message || 'Có lỗi xảy ra khi tải ảnh lên')
  } finally {
    isLoading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

// ==========================================
// INIT DATA
// ==========================================
const fetchProfile = async () => {
  if (!authStore.isAuthenticated) return
  try {
    isLoading.value = true
    const data = await userService.getMyProfile()
    const rawData = data as unknown as Record<string, string>
    const fullName = data.fullName || rawData.FullName || ''
    const phone = data.phone || rawData.Phone || ''
    const thumbnailUrl = data.thumbnailUrl || rawData.ThumbnailUrl || ''

    userDetail.value = {
      ...data,
      fullName,
      phone,
      thumbnailUrl,
    }

    if (authStore.user) {
      authStore.setUser({
        ...authStore.user,
        fullName,
        thumbnailUrl,
      })
    }
  } catch {
    toastStore.error('Không thể tải thông tin hồ sơ')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchProfile())
</script>

<template>
  <SectionWrapper title="Thông tin cá nhân">
    <!-- MAIN CONTENT -->
    <main class="p-5 lg:p-8 relative">
      <!-- Lớp chặn mờ khi Loading -->
      <AppLoading :show="isLoading" overlay text="Đang tải..." />

      <!-- Avatar & Name Section -->
      <div
        class="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-8 mb-8 border-b border-gray-100"
      >
        <div class="relative shrink-0 group hover:scale-105 transition-transform">
          <div
            class="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-400"
          >
            <img
              :src="userDetail?.thumbnailUrl || undefined"
              class="w-full h-full object-cover"
              v-fallback-img
            />
          </div>

          <input
            type="file"
            ref="fileInputRef"
            class="hidden"
            accept="image/*"
            @change="handleFileSelected"
          />
          <button
            @click="triggerAvatarUpload"
            class="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 p-1.5"
            title="Tải ảnh lên"
          >
            <IconSvgCamera class="w-full h-full" />
          </button>
        </div>

        <div class="flex-1 w-full text-center sm:text-left min-w-0 pt-1">
          <!-- Chế độ CHỈNH SỬA TÊN -->
          <div
            v-if="editingField === 'fullName'"
            class="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 w-full"
          >
            <input
              ref="inputRef"
              v-model="editForm.fullName"
              @keyup.enter="saveEdit"
              @keyup.esc="cancelEdit"
              type="text"
              class="w-full sm:w-auto flex-1 text-base font-medium text-gray-900 border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white px-3 py-2 rounded-lg transition-colors outline-none shadow-sm"
              placeholder="Nhập họ và tên đầy đủ..."
            />
            <div class="flex items-center gap-2 shrink-0">
              <button
                @click="saveEdit"
                class="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors focus:ring-2 focus:-ring-offset-1 focus:ring-primary-500 shadow-sm"
              >
                Lưu
              </button>
              <button
                @click="cancelEdit"
                class="flex-1 sm:flex-none text-xs font-medium px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200 shadow-sm"
              >
                Hủy
              </button>
            </div>
          </div>

          <!-- Chế độ HIỂN THỊ TÊN -->
          <div
            v-else
            class="flex flex-col sm:flex-row items-center sm:items-center gap-3 min-w-0 group relative"
          >
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 truncate max-w-full">
              {{ userDetail?.fullName || authStore.user?.fullName || 'Chưa cập nhật' }}
            </h2>
            <div class="flex items-center gap-2">
              <span
                class="text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full font-medium whitespace-nowrap"
              >
                {{ userDetail?.roles?.[0] || 'Khách' }}
              </span>
              <button
                @click="startEdit('fullName')"
                class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md sm:opacity-0 sm:group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] sm:shadow-none bg-white sm:bg-transparent"
                title="Sửa tên"
              >
                <IconSvgEdit class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p class="text-gray-500 text-sm mt-1.5 hidden sm:block">
            Thành viên tham gia hệ thống từ 2026
          </p>
        </div>
      </div>

      <!-- Contacts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-4">
        <!-- CỘT TRÁI: ĐIỆN THOẠI & BẢO MẬT -->
        <div class="space-y-8 lg:pr-6 lg:border-r border-gray-100">
          <!-- Số điện thoại -->
          <section>
            <label class="block text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase"
              >Số điện thoại</label
            >

            <div
              v-if="editingField === 'phone'"
              class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <input
                ref="inputRef"
                v-model="editForm.phone"
                @keyup.enter="saveEdit"
                @keyup.esc="cancelEdit"
                type="tel"
                class="w-full flex-1 text-sm text-gray-900 border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white px-3 py-2 rounded-lg transition-colors outline-none shadow-sm"
                placeholder="09..."
              />
              <div class="flex items-center gap-2 shrink-0">
                <button
                  @click="saveEdit"
                  class="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm"
                >
                  Lưu
                </button>
                <button
                  @click="cancelEdit"
                  class="flex-1 sm:flex-none text-xs font-medium px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
                >
                  Hủy
                </button>
              </div>
            </div>

            <div
              v-else
              class="flex flex-row items-center justify-between gap-3 group p-3 -ml-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors"
            >
              <p
                class="text-sm font-medium"
                :class="userDetail?.phone ? 'text-gray-900' : 'text-gray-400 italic font-normal'"
              >
                {{ userDetail?.phone || 'Chưa thiết lập' }}
              </p>
              <button
                @click="startEdit('phone')"
                class="text-xs flex items-center gap-1.5 font-medium text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-md hover:bg-primary-100 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none"
              >
                <IconSvgEdit class="w-3.5 h-3.5" />
                Cập nhật
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  </SectionWrapper>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
