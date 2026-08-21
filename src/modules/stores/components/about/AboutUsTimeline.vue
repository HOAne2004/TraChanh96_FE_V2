<script setup lang="ts">
import IconSvgStore from '@/assets/icons/IconSvgStore.svg'
import { computed } from 'vue';
import type { StoreCustomerList } from '@/modules/stores/types/store';
import defaultStore from '@/assets/images/default-store.png';

const props = defineProps<{
  stores: StoreCustomerList[];
}>();

// --- 2. LOGIC LỊCH SỬ HÌNH THÀNH (Gom theo năm) ---
const yearlyHistory = computed(() => {
  const historyMap = new Map<number, { count: number, storeNames: string[] }>();

  props.stores.forEach(store => {
    if (store.openDate) {
      const year = new Date(store.openDate).getFullYear();
      if (!historyMap.has(year)) {
        historyMap.set(year, { count: 0, storeNames: [] });
      }
      const yearData = historyMap.get(year)!;
      yearData.count++;
      yearData.storeNames.push(store.name);
    }
  });

  return Array.from(historyMap.entries())
    .map(([year, data]) => ({
      year,
      count: data.count,
      stores: data.storeNames.join(', ')
    }))
    .sort((a, b) => Number(b.year) - Number(a.year)); // Sắp xếp năm mới nhất lên trên
});

interface Milestone {
  title: string;
  date: string;
  imageUrl?: string;
  rawDate: string;
}

// --- 3. LOGIC CỘT MỐC ĐÁNG NHỚ (Theo thành phố) ---
const milestones = computed<Milestone[]>(() => {
  const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng'];
  const results: Milestone[] = [];

  cities.forEach(city => {
    const storesInCity = props.stores.filter(s =>
      s.fullAddress.toLowerCase().includes(city.toLowerCase()) && s.openDate
    );

    if (storesInCity.length > 0) {
      const oldestStore = storesInCity.sort((a, b) =>
        new Date(a.openDate!).getTime() - new Date(b.openDate!).getTime()
      )[0];

      if (oldestStore) {
        const dateObj = new Date(oldestStore.openDate!);
        results.push({
          title: `Có mặt tại ${city}`,
          date: `Tháng ${dateObj.getMonth() + 1}, ${dateObj.getFullYear()}`,
          imageUrl: oldestStore.imageUrl,
          rawDate: oldestStore.openDate!
        });
      }
    }
  });

  return results.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
});
</script>

<template>
  <section class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8 bg-white rounded-3xl shadow-md mb-12 border border-gray-100">

    <div class="md:col-span-1">
      <h2 class="text-xl font-bold mb-6 border-b border-primary-600 pb-3 text-primary-600"><span class="pl-2 border-l-4 border-primary-500">Lịch sử hình thành</span></h2>
      <div v-if="yearlyHistory.length === 0" class="text-gray-500 italic text-sm">Đang cập nhật dữ liệu...</div>

      <div v-else class="space-y-8 relative pl-0">
        <div class="absolute left-[15px] top-2 bottom-2 w-0.5 bg-primary-100"></div>

        <div v-for="item in yearlyHistory" :key="item.year" class="relative pl-10 group">
          <div class="absolute left-0 top-1.5 w-8 h-8 flex items-center justify-center bg-white border-4 border-primary-500 rounded-full z-10 group-hover:scale-125 transition-transform">
            <IconSvgStore class="size-4 text-primary-600" />
          </div>
          <p class="text-xl font-bold text-gray-800">{{ item.year }}</p>
          <p class="text-sm text-gray-600 mt-1">Mở rộng thêm <span class="font-bold text-primary-600">{{ item.count }}</span> chi nhánh.</p>
          <p class="text-xs text-gray-500 italic mt-1 line-clamp-2" :title="item.stores">{{ item.stores }}</p>
        </div>
      </div>
    </div>

    <div class="md:col-span-2">
      <h2 class="text-xl font-bold mb-6 border-b pb-3 text-primary-600"><span class="pl-2 border-l-4 border-primary-500">Cột mốc đáng nhớ</span></h2>
      <div v-if="milestones.length === 0" class="text-gray-500 italic text-sm">Đang cập nhật cột mốc...</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="(item, index) in milestones"
          :key="index"
          class="p-4 rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-primary-50 min-h-[140px] flex flex-col justify-end group"
          :style="{
            backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : `url(${defaultStore})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
        >
          <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent rounded-xl transition-opacity group-hover:opacity-90"></div>

          <div class="relative z-10 transform transition-transform group-hover:-translate-y-1">
            <span class="inline-block px-2 py-1 rounded bg-primary-500 text-white text-xs font-bold mb-2">{{ item.date }}</span>
            <p class="font-bold text-white text-lg leading-tight shadow-sm">{{ item.title }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
