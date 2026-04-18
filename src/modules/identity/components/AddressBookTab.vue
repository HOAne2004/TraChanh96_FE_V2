<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SectionWrapper from '@/shared/components/ui/SectionWrapper.vue';
import { addressService } from '../services/address.service';
import type { AddressDto } from '../types/address';
import { useToastStore } from '@/shared/store/toast.store';
import { useConfirmStore } from '@/shared/store/confirm.store';
import AddressModal from './AddressModal.vue';

const toastStore = useToastStore();
const confirmStore = useConfirmStore();

const addresses = ref<AddressDto[]>([]);
const isLoading = ref(true);

// --- QUẢN LÝ TRẠNG THÁI MODAL ---
const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentEditData = ref<AddressDto | null>(null);

const fetchAddresses = async () => {
  try {
    isLoading.value = true;
    addresses.value = await addressService.getMyAddresses() || [];
  } catch {
    toastStore.error('Không thể tải danh sách địa chỉ');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAddresses();
});

// --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
const openAddModal = () => {
  isEditMode.value = false;
  currentEditData.value = null;
  isModalOpen.value = true;
};

const openEditModal = (address: AddressDto) => {
  isEditMode.value = true;
  currentEditData.value = address;
  isModalOpen.value = true;
};

// Hàm xóa địa chỉ
const handleDelete = async (id: number) => {
  const confirm = await confirmStore.ask({
    title: 'Xóa địa chỉ',
    message: 'Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ không?',
    confirmText: 'Xóa',
    type: 'danger'
  });

  if (confirm) {
    try {
      await addressService.deleteAddress(id);
      toastStore.success('Đã xóa địa chỉ thành công');
      await fetchAddresses(); // Cập nhật lại list sau khi xóa
    } catch (error) {
      const err = error as { message?: string };
      toastStore.error(err?.message || 'Xóa thất bại');
    }
  }
};
</script>

<template>
  <SectionWrapper title="Sổ địa chỉ nhận hàng">
    <div class="flex justify-between items-center mb-6">
      <p class="text-sm text-gray-500">Quản lý địa chỉ giao hàng của bạn (Tối đa 5 địa chỉ).</p>
      <button
        @click="openAddModal"
        :disabled="addresses?.length >= 5"
        class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        <span class="hidden sm:inline">Thêm địa chỉ mới</span>
        <span class="sm:hidden">Thêm</span>
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-10">
      <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="addresses?.length > 0" class="space-y-4">
      <div
        v-for="address in addresses"
        :key="address.id"
        class="bg-white p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row justify-between gap-4 transition-all hover:border-primary-300"
        :class="address.isDefault ? 'border-primary-500 shadow-sm bg-primary-50/10' : 'border-gray-200'"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-bold text-gray-900 text-base sm:text-lg">{{ address.recipientName }}</h3>
            <span class="text-gray-400">|</span>
            <span class="text-gray-600 text-sm font-medium">{{ address.phone }}</span>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed max-w-2xl">{{ address.fullAddress }}</p>
          <div v-if="address.isDefault" class="mt-2 inline-block px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-md">
            Mặc định
          </div>
        </div>

        <div class="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
          <button @click="openEditModal(address)" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded">Sửa</button>
          <button
            @click="handleDelete(address.id)"
            :disabled="address.isDefault && addresses.length > 1"
            class="text-sm font-medium text-red-600 hover:text-red-800 transition px-2 py-1 bg-red-50 hover:bg-red-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            :title="address.isDefault ? 'Không thể xóa địa chỉ mặc định, hãy chọn địa chỉ khác làm mặc định trước' : ''"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
      </div>
      <p class="text-gray-500 mb-4 font-medium">Bạn chưa thiết lập địa chỉ nào.</p>
    </div>

    <AddressModal
      :isOpen="isModalOpen"
      :isEdit="isEditMode"
      :initialData="currentEditData"
      @close="isModalOpen = false"
      @saved="fetchAddresses"
    />
  </SectionWrapper>
</template>
