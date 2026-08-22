<script setup lang="ts">
import IconSvgLcationDark from '@/assets/icons/IconSvgLcationDark.svg'
import IconSvgAdd from '@/assets/icons/IconSvgAdd.svg'

import { ref, onMounted } from 'vue'
import SectionWrapper from '@/shared/components/ui/SectionWrapper.vue'
import { addressService } from '@/modules/identity/services/address.service'
import type { AddressDto } from '@/modules/identity/types/address'
import { useToastStore } from '@/shared/store/toast.store'
import { useConfirmStore } from '@/shared/store/confirm.store'
import AddressModal from './AddressModal.vue'
import AppLoading from '@/shared/components/ui/AppLoading.vue'

const toastStore = useToastStore()
const confirmStore = useConfirmStore()

const addresses = ref<AddressDto[]>([])
const isLoading = ref(true)

// --- QUẢN LÝ TRẠNG THÁI MODAL ---
const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentEditData = ref<AddressDto | null>(null)

const fetchAddresses = async () => {
  try {
    isLoading.value = true
    addresses.value = (await addressService.getMyAddresses()) || []
  } catch {
    toastStore.error('Không thể tải danh sách địa chỉ')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAddresses()
})

// --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
const openAddModal = () => {
  if (addresses.value && addresses.value.length >= 5) {
    toastStore.warning('Bạn đã đạt giới hạn tối đa 5 địa chỉ.')
    return
  }
  isEditMode.value = false
  currentEditData.value = null
  isModalOpen.value = true
}

const openEditModal = (address: AddressDto) => {
  isEditMode.value = true
  currentEditData.value = address
  isModalOpen.value = true
}

const formatLocalPhone = (phone?: string) => {
  if (!phone) return ''
  // Nếu bắt đầu bằng +84, cắt bỏ 3 ký tự đầu và thay bằng 0
  if (phone.startsWith('+84')) return '0' + phone.slice(3)
  // Đề phòng trường hợp lưu thiếu dấu +
  if (phone.startsWith('84')) return '0' + phone.slice(2)
  return phone
}
// Hàm xóa địa chỉ
const handleDelete = async (id: string) => {
  const confirm = await confirmStore.ask({
    title: 'Xóa địa chỉ',
    message: 'Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ không?',
    confirmText: 'Xóa',
    type: 'danger',
  })

  if (confirm) {
    try {
      await addressService.deleteAddress(id)
      toastStore.success('Đã xóa địa chỉ thành công')
      await fetchAddresses() // Cập nhật lại list sau khi xóa
    } catch (error) {
      const err = error as { message?: string }
      toastStore.error(err?.message || 'Xóa thất bại')
    }
  }
}
</script>

<template>
  <SectionWrapper title="Sổ địa chỉ nhận hàng">
    <main class="p-5 lg:p-8 relative">
      <div class="flex items-end flex-col sm:flex-row justify-end sm:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span class="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            {{ addresses?.length || 0 }}/5
          </span>
          <button
            @click="openAddModal"
            class="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg transition shadow-sm whitespace-nowrap"
            :class="addresses?.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700 active:scale-95'"
          >
            <IconSvgAdd class="w-4 h-4" />
            <span>Thêm địa chỉ</span>
          </button>
        </div>
      </div>

    <AppLoading v-if="isLoading" :show="true" text="Đang tải danh sách địa chỉ..." />

    <div v-else-if="addresses?.length > 0" class="space-y-4">
      <div
        v-for="address in addresses"
        :key="address.id"
        class="bg-white p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row justify-between gap-4 transition-all hover:border-primary-300"
        :class="
          address.isDefault ? 'border-primary-500 shadow-sm bg-primary-50/10' : 'border-gray-200'
        "
      >
        <div class="space-y-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-bold text-gray-900 text-base sm:text-lg">
              {{ address.recipientName }}
            </h3>
            <span class="text-gray-400">|</span>
            <span class="text-gray-600 text-sm font-medium">{{
              formatLocalPhone(address.phone)
            }}</span>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed max-w-2xl">{{ address.fullAddress }}</p>
          <div
            v-if="address.isDefault"
            class="mt-2 inline-block px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-md"
          >
            Mặc định
          </div>
        </div>

        <div
          class="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0"
        >
          <button
            @click="openEditModal(address)"
            class="text-sm font-medium text-blue-600 hover:text-blue-800 transition px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Sửa
          </button>
          <button
            @click="handleDelete(address.id)"
            :disabled="address.isDefault && addresses.length > 1"
            class="text-sm font-medium text-red-600 hover:text-red-800 transition px-2 py-1 bg-red-50 hover:bg-red-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            :title="
              address.isDefault
                ? 'Không thể xóa địa chỉ mặc định, hãy chọn địa chỉ khác làm mặc định trước'
                : ''
            "
          >
            Xóa
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
      <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
        <IconSvgLcationDark class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-base font-semibold text-gray-900 mb-1">Chưa có địa chỉ nào</h3>
      <p class="text-sm text-gray-500 max-w-[250px] mx-auto">Bạn chưa thiết lập địa chỉ giao hàng nào.</p>
    </div>

    <AddressModal
      :isOpen="isModalOpen"
      :isEdit="isEditMode"
      :initialData="currentEditData"
      @close="isModalOpen = false"
      @saved="fetchAddresses"
    />
    </main>
  </SectionWrapper>
</template>
