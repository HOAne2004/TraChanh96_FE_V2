<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { useToastStore } from '@/shared/store/toast.store';
import { addressService } from '../services/address.service';
import type { AddressFormRequest, AddressDto } from '../types/address';

const props = defineProps<{
  isOpen: boolean;
  isEdit?: boolean;
  initialData?: AddressDto | null;
}>();

const emit = defineEmits(['close', 'saved']);
const toastStore = useToastStore();

// --- STATE ---
const isLoading = ref(false);
const isLocating = ref(false);
const errors = ref<Record<string, string>>({});

const form = ref<AddressFormRequest>({
  recipientName: '', phoneNumber: '', addressDetail: '',
  province: '', district: '', commune: '',
  isDefault: false, latitude: null, longitude: null,
});

// --- API HÀNH CHÍNH VN (ESGOO) ---
interface AdminUnit { id: string; full_name: string; }
const provinces = ref<AdminUnit[]>([]);
const districts = ref<AdminUnit[]>([]);
const communes = ref<AdminUnit[]>([]);

const selectedProvinceId = ref('');
const selectedDistrictId = ref('');
const selectedCommuneId = ref('');

const fetchProvinces = async () => {
  try {
    const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
    if (res.data?.error === 0) provinces.value = res.data.data;
  } catch {
    toastStore.error('Lỗi tải dữ liệu Tỉnh/Thành');
  }
};

const fetchDistricts = async (provinceId: string) => {
  districts.value = []; communes.value = [];
  if (!provinceId) return;
  const res = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
  if (res.data?.error === 0) districts.value = res.data.data;
};

const fetchCommunes = async (districtId: string) => {
  communes.value = [];
  if (!districtId) return;
  const res = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
  if (res.data?.error === 0) communes.value = res.data.data;
};

// --- WATCHERS CHO SELECT ---
watch(selectedProvinceId, async (id) => {
  const p = provinces.value.find((x) => x.id === id);
  form.value.province = p?.full_name || '';
  // Chỉ clear cấp dưới nếu user chủ động click đổi
  if(form.value.district && !districts.value.length) {} else {
    selectedDistrictId.value = ''; selectedCommuneId.value = '';
    form.value.district = ''; form.value.commune = '';
  }
  if (id) await fetchDistricts(id);
});

watch(selectedDistrictId, async (id) => {
  const d = districts.value.find((x) => x.id === id);
  form.value.district = d?.full_name || '';
  if(form.value.commune && !communes.value.length) {} else {
    selectedCommuneId.value = ''; form.value.commune = '';
  }
  if (id) await fetchCommunes(id);
});

watch(selectedCommuneId, async (id) => {
  const c = communes.value.find((x) => x.id === id);
  form.value.commune = c?.full_name || '';
});


// --- TIỆN ÍCH CHUẨN HÓA CHUỖI ---
// Bỏ các từ khóa hành chính để so khớp (VD: "Thành phố Hà Nội" -> "hà nội")
const normalizeText = (text?: string) => {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/^(thành phố|tỉnh|tp\.|quận|huyện|thị xã|phường|xã|thị trấn)\s+/i, '')
    .trim();
};

// --- TÍNH NĂNG 1: REVERSE GEOCODING (AUTO-FILL TỪ GPS) ---
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    toastStore.error('Trình duyệt không hỗ trợ vị trí'); return;
  }

  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      form.value.latitude = pos.coords.latitude;
      form.value.longitude = pos.coords.longitude;

      try {
        // Dịch ngược tọa độ ra địa chỉ
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
          params: { format: 'json', lat: pos.coords.latitude, lon: pos.coords.longitude, addressdetails: 1, 'accept-language': 'vi' }
        });

        const addr = res.data?.address;
        if (addr) {
          const cityName = normalizeText(addr.city || addr.province || addr.state || addr.town);
          const districtName = normalizeText(addr.county || addr.district || addr.suburb || addr.city_district);
          const communeName = normalizeText(addr.village || addr.suburb || addr.quarter || addr.neighbourhood || addr.hamlet || addr.residential);

          const findBestMatch = (list: AdminUnit[], text: string) => {
             if (!text) return undefined;
             const exactMatch = list.find(l => normalizeText(l.full_name) === text);
             if (exactMatch) return exactMatch;
             return list.find(l => normalizeText(l.full_name).includes(text) || text.includes(normalizeText(l.full_name)));
          };

          // 1. So khớp Tỉnh
          const pMatch = findBestMatch(provinces.value, cityName);
          if (pMatch) {
            selectedProvinceId.value = pMatch.id;
            await fetchDistricts(pMatch.id); // Đợi load Huyện

            // 2. So khớp Huyện
            const dMatch = findBestMatch(districts.value, districtName);
            if (dMatch) {
              selectedDistrictId.value = dMatch.id;
              await fetchCommunes(dMatch.id); // Đợi load Xã

              // 3. So khớp Xã
              const cMatch = findBestMatch(communes.value, communeName);
              if (cMatch) selectedCommuneId.value = cMatch.id;
            }
          }
          toastStore.success('Đã định vị và điền tự động khu vực!');
        }
      } catch {
        toastStore.info('Lấy tọa độ thành công, nhưng không thể dịch tự động ra Tỉnh/Phường');
      } finally {
        isLocating.value = false;
      }
    },
    () => {
      toastStore.error('Không thể lấy vị trí (Vui lòng cấp quyền GPS)');
      isLocating.value = false;
    }
  );
};


// --- TÍNH NĂNG 2: AUTO GEOCODING (NGẦM DỊCH TỌA ĐỘ KHI LƯU) ---
const geocodeSilent = async () => {
  if (!form.value.province || !form.value.district) return;
  const queries = [
    `${form.value.commune}, ${form.value.district}, ${form.value.province}`,
    `${form.value.district}, ${form.value.province}`
  ];

  try {
    for (const q of queries) {
      if (!q.trim() || q.startsWith(',')) continue;
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { format: 'json', limit: 1, countrycodes: 'vn', q }
      });
      if (res.data?.length > 0) {
        form.value.latitude = Number(res.data[0].lat);
        form.value.longitude = Number(res.data[0].lon);
        return; // Thành công thì thoát luôn
      }
    }
  } catch (err) {
    console.warn("Auto geocoding failed", err);
  }
};


// --- XỬ LÝ LƯU ---
const validate = () => {
  errors.value = {};
  let ok = true;
  if (!form.value.recipientName.trim()) { errors.value.recipientName = 'Vui lòng nhập tên người nhận'; ok = false; }
  if (!form.value.phoneNumber.trim()) { errors.value.phoneNumber = 'Vui lòng nhập số điện thoại'; ok = false; }
  if (!form.value.addressDetail.trim()) { errors.value.addressDetail = 'Vui lòng nhập số nhà, tên đường'; ok = false; }
  if (!form.value.province || !form.value.district || !form.value.commune) {
    errors.value.region = 'Vui lòng chọn đầy đủ Tỉnh / Huyện / Xã'; ok = false;
  }
  return ok;
};

const handleSubmit = async () => {
  if (!validate()) return;
  isLoading.value = true;

  // Nếu người dùng chưa dùng GPS, hệ thống ngầm dò tọa độ
  if (!form.value.latitude || !form.value.longitude) {
    await geocodeSilent();
  }

  try {
    if (props.isEdit && props.initialData?.id) {
      await addressService.updateAddress(props.initialData.id, form.value);
    } else {
      await addressService.addAddress(form.value);
    }
    toastStore.success(props.isEdit ? 'Cập nhật thành công!' : 'Đã thêm địa chỉ mới!');
    emit('saved');
    closeModal();
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } }, message?: string };
    toastStore.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => { emit('close'); };

// --- LIFECYCLE VÀ KHỞI TẠO ---
onMounted(fetchProvinces);

watch(() => props.isOpen, async (open) => {
  if (!open) return;
  errors.value = {};

  if (props.isEdit && props.initialData) {
    form.value = {
      recipientName: props.initialData.recipientName || '',
      phoneNumber: props.initialData.phone || '',
      addressDetail: props.initialData.addressDetail || '',
      province: props.initialData.province || '',
      district: props.initialData.district || '',
      commune: props.initialData.commune || '',
      isDefault: props.initialData.isDefault || false,
      latitude: props.initialData.latitude || null,
      longitude: props.initialData.longitude || null,
    };

    await nextTick();
    selectedProvinceId.value = provinces.value.find(p => p.full_name === form.value.province)?.id || '';
    if (selectedProvinceId.value) await fetchDistricts(selectedProvinceId.value);
    selectedDistrictId.value = districts.value.find(d => d.full_name === form.value.district)?.id || '';
    if (selectedDistrictId.value) await fetchCommunes(selectedDistrictId.value);
    selectedCommuneId.value = communes.value.find(c => c.full_name === form.value.commune)?.id || '';
  } else {
    form.value = {
      recipientName: '', phoneNumber: '', addressDetail: '',
      province: '', district: '', commune: '',
      isDefault: false, latitude: null, longitude: null,
    };
    selectedProvinceId.value = '';
  }
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
    <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeModal"></div>

    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh] animate-[fadeIn_0.2s_ease-out]">

      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
        <h3 class="text-lg font-bold text-gray-900">
          {{ isEdit ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới' }}
        </h3>
        <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Tên người nhận <span class="text-red-500">*</span></label>
            <input v-model="form.recipientName" type="text" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Họ và tên" />
            <span v-if="errors.recipientName" class="text-xs text-red-500 mt-1 block">{{ errors.recipientName }}</span>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Số điện thoại <span class="text-red-500">*</span></label>
            <input v-model="form.phoneNumber" type="tel" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="09xxxx..." />
            <span v-if="errors.phoneNumber" class="text-xs text-red-500 mt-1 block">{{ errors.phoneNumber }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
             <div>
                <p class="text-sm font-semibold text-gray-800">Sử dụng vị trí hiện tại</p>
                <p class="text-xs text-gray-500">Hệ thống sẽ tự động điền Tỉnh/Huyện/Xã</p>
             </div>
          </div>
          <button @click.prevent="getCurrentLocation" :disabled="isLocating" class="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2">
            <span v-if="isLocating" class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
            Định vị
          </button>
        </div>

        <div class="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Khu vực hành chính <span class="text-red-500">*</span></h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select v-model="selectedProvinceId" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
              <option value="" disabled>-- Tỉnh / Thành phố --</option>
              <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.full_name }}</option>
            </select>

            <select v-model="selectedDistrictId" :disabled="!selectedProvinceId" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400">
              <option value="" disabled>-- Quận / Huyện --</option>
              <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.full_name }}</option>
            </select>

            <select v-model="selectedCommuneId" :disabled="!selectedDistrictId" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400">
              <option value="" disabled>-- Phường / Xã --</option>
              <option v-for="c in communes" :key="c.id" :value="c.id">{{ c.full_name }}</option>
            </select>
          </div>
          <span v-if="errors.region" class="text-xs text-red-500 block">{{ errors.region }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">Số nhà, tên đường <span class="text-red-500">*</span></label>
          <textarea v-model="form.addressDetail" rows="2" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all" placeholder="VD: Số nhà 12, Ngõ 1..."></textarea>
          <span v-if="errors.addressDetail" class="text-xs text-red-500 mt-1 block">{{ errors.addressDetail }}</span>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input id="isDefault" type="checkbox" v-model="form.isDefault" class="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer" />
          <label for="isDefault" class="text-sm text-gray-700 font-medium cursor-pointer select-none">Đặt làm địa chỉ mặc định</label>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-3">
        <button @click="closeModal" type="button" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          Hủy bỏ
        </button>
        <button @click="handleSubmit" :disabled="isLoading" class="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
          <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isEdit ? 'Lưu thay đổi' : 'Hoàn tất thêm mới' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
</style>
