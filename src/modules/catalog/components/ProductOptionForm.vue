<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ModalProductOption, ProductSize, SelectedTopping, OptionChangePayload, ProductTopping } from '@/modules/catalog/types/product';

const props = defineProps<{
  product: ModalProductOption;
}>();

const emit = defineEmits<{
  (e: 'update:price', totalPrice: number): void; // Phát giá tiền để Modal bên ngoài hiển thị
  (e: 'change', payload: OptionChangePayload): void; // Phát toàn bộ cấu hình mỗi khi có thay đổi
}>();

// --- STATE MANAGEMENT ---
const selectedSize = ref<ProductSize | null>(null);
const selectedSugar = ref<string | null>(null);
const selectedIce = ref<string | null>(null);
const selectedToppings = ref<SelectedTopping[]>([]); // Lưu mảng các Topping đã chọn kèm số lượng

// --- MAPPING ENUMS (Tự động tạo danh sách hiển thị) ---
const sugarMap: Record<string, string> = {
  'S0': 'Không đường', 'S30': '30% Đường', 'S50': '50% Đường', 'S70': '70% Đường', 'S100': '100% Đường'
};
const iceMap: Record<string, string> = {
  'None': 'Không đá', 'Warm': 'Ấm', 'Hot': 'Nóng', 'I30': '30% Đá', 'I50': '50% Đá', 'I70': '70% Đá', 'I100': '100% Đá'
};

const sugarOptions = computed(() => {
  return props.product.allowedSugarLevels?.map(val => ({ value: val, label: sugarMap[val] || val })) || [];
});

const iceOptions = computed(() => {
  return props.product.allowedIceLevels?.map(val => ({ value: val, label: iceMap[val] || val })) || [];
});


// --- METHODS ---
const selectSize = (size: ProductSize) => {
  selectedSize.value = size;
  emitChanges();
};

const selectSugar = (val: string) => {
  selectedSugar.value = val;
  emitChanges();
};

const selectIce = (val: string) => {
  selectedIce.value = val;
  emitChanges();
};

const isToppingSelected = (id: number) => selectedToppings.value.some(t => t.toppingId === id);

const getToppingQty = (id: number) => {
  const t = selectedToppings.value.find(x => x.toppingId === id);
  return t ? t.quantity : 0;
};

const toggleTopping = (topping: ProductTopping) => {
  const index = selectedToppings.value.findIndex(t => t.toppingId === topping.toppingId);
  if (index > -1) {
    // Nếu có rồi thì xóa đi (Bỏ tick)
    selectedToppings.value.splice(index, 1);
  } else {
    // Nếu chưa có thì thêm vào với số lượng = 1
    selectedToppings.value.push({
      toppingId: topping.toppingId,
      name: topping.name,
      quantity: 1,
      priceAmount: topping.priceAmount
    });
  }
  emitChanges();
};

const updateToppingQty = (toppingId: number, delta: number) => {
  const item = selectedToppings.value.find(t => t.toppingId === toppingId);
  if (item) {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      // Nếu giảm xuống 0 thì xóa luôn khỏi mảng
      selectedToppings.value = selectedToppings.value.filter(t => t.toppingId !== toppingId);
    } else {
      // Logic chặn Max Quantity được xử lý ở nút HTML disabled, nhưng cứ an toàn
      const baseTopping = props.product.toppings.find(t => t.toppingId === toppingId);
      if (baseTopping && newQty <= baseTopping.maxQuantity) {
        item.quantity = newQty;
      }
    }
    emitChanges();
  }
};

// --- LOGIC TÍNH TỔNG TIỀN & PHÁT SỰ KIỆN ---
const calculatePrice = () => {
  // Giả sử giá Base đang được truyền ở Product cha, Form chỉ tính tiền Option cộng thêm
  let extraPrice = 0;
  if (selectedSize.value) {
    extraPrice += selectedSize.value.priceAmount;
  }
  selectedToppings.value.forEach(t => {
    extraPrice += (t.priceAmount * t.quantity);
  });
  return extraPrice;
};

const emitChanges = () => {
  const extraPrice = calculatePrice();
  emit('update:price', extraPrice);

  emit('change', {
    size: selectedSize.value?.size,
    sugar: selectedSugar.value,
    ice: selectedIce.value,
    toppings: selectedToppings.value
  });
};

// Format tiền tệ
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const hasOptions = computed(() => {
  return (props.product.sizes && props.product.sizes.length > 0) ||
         (sugarOptions.value.length > 0) ||
         (iceOptions.value.length > 0) ||
         (props.product.toppings && props.product.toppings.length > 0);
});

// Tự động chọn Size đầu tiên, Đường Mặc định, Đá Mặc định khi Component Load hoặc khi Data thay đổi
watch(() => props.product, (newVal) => {
  if (!newVal) return;
  
  if (newVal.sizes && newVal.sizes.length > 0) {
    selectedSize.value = newVal.sizes[0] || null;
  } else {
    selectedSize.value = null;
  }

  if (sugarOptions.value && sugarOptions.value.length > 0) {
    selectedSugar.value = sugarOptions.value[0]?.value || null;
  } else {
    selectedSugar.value = null;
  }

  if (iceOptions.value && iceOptions.value.length > 0) {
    selectedIce.value = iceOptions.value[0]?.value || null;
  } else {
    selectedIce.value = null;
  }

  selectedToppings.value = [];
  emitChanges();
}, { immediate: true, deep: true });
</script>

<template>
  <div v-if="product.productType === 'Drink'" class="space-y-6">
    <div v-if="!hasOptions" class="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl border border-gray-100">
      Sản phẩm này không có tùy chọn nào.
    </div>

    <div v-if="product.sizes && product.sizes.length > 0">
      <div class="flex items-center justify-between mb-3">
        <span class="block text-base font-bold text-gray-800">Chọn Kích Cỡ</span>
        <span class="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded">Bắt buộc</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          v-for="size in product.sizes"
          :key="size.size"
          @click="selectSize(size)"
          class="relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200"
          :class="[
            selectedSize?.size === size.size
              ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
              : 'border-gray-100 bg-white text-gray-600 hover:border-primary-200 hover:bg-gray-50'
          ]"
        >
          <span class="text-lg font-extrabold mb-1">{{ size.size }}</span>

          <span class="text-xs font-medium" :class="selectedSize?.size === size.size ? 'text-primary-600' : 'text-gray-400'">
            {{ size.priceAmount > 0 ? `+ ${formatPrice(size.priceAmount)}` : 'Miễn phí' }}
          </span>

          <div v-if="selectedSize?.size === size.size" class="absolute -top-2 -right-2 bg-primary-500 text-white rounded-full p-0.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <hr v-if="product.sizes?.length > 0" class="border-gray-100" />

    <div v-if="sugarOptions.length > 0">
      <span class="block text-base font-bold text-gray-800 mb-3">Độ Ngọt</span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="sugar in sugarOptions"
          :key="sugar.value"
          @click="selectSugar(sugar.value)"
          class="px-4 py-2 rounded-full border text-sm font-medium transition-colors"
          :class="[
            selectedSugar === sugar.value
              ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
          ]"
        >
          {{ sugar.label }}
        </button>
      </div>
    </div>

    <div v-if="iceOptions.length > 0">
      <span class="block text-base font-bold text-gray-800 mb-3">Lượng Đá</span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="ice in iceOptions"
          :key="ice.value"
          @click="selectIce(ice.value)"
          class="px-4 py-2 rounded-full border text-sm font-medium transition-colors"
          :class="[
            selectedIce === ice.value
              ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
          ]"
        >
          {{ ice.label }}
        </button>
      </div>
    </div>

    <hr v-if="sugarOptions.length > 0 || iceOptions.length > 0" class="border-gray-100" />

    <div v-if="product.toppings && product.toppings.length > 0">
      <div class="flex items-center justify-between mb-3">
        <span class="block text-base font-bold text-gray-800">Thêm Topping</span>
        <span class="text-xs text-gray-400 font-medium">Chọn tối đa theo quy định</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="topping in product.toppings"
          :key="topping.toppingId"
          class="flex flex-col rounded-xl border-2 transition-all p-3"
          :class="isToppingSelected(topping.toppingId) ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 bg-white'"
        >
          <div class="flex items-center justify-between cursor-pointer" @click="toggleTopping(topping)">
            <div class="flex items-center gap-3">
              <div
                class="w-5 h-5 rounded border flex shrink-0 items-center justify-center transition-colors"
                :class="isToppingSelected(topping.toppingId) ? 'bg-primary-500 border-primary-500' : 'border-gray-300'"
              >
                <svg v-if="isToppingSelected(topping.toppingId)" class="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-800 text-sm">Topping #{{ topping.toppingId }}</p>
                <p class="text-xs text-primary-600 font-bold">+ {{ formatPrice(topping.priceAmount) }}</p>
              </div>
            </div>
          </div>

          <div v-if="isToppingSelected(topping.toppingId)" class="mt-3 flex items-center justify-end gap-3 pt-3 border-t border-primary-100">
            <span class="text-xs text-gray-500">Số lượng (Max: {{ topping.maxQuantity }}):</span>
            <div class="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden h-8">
              <button
                @click.stop="updateToppingQty(topping.toppingId, -1)"
                class="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
              >
                -
              </button>
              <span class="w-8 text-center text-sm font-semibold text-gray-800">
                {{ getToppingQty(topping.toppingId) }}
              </span>
              <button
                @click.stop="updateToppingQty(topping.toppingId, 1)"
                :disabled="getToppingQty(topping.toppingId) >= topping.maxQuantity"
                class="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors disabled:opacity-30 disabled:hover:bg-white"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
