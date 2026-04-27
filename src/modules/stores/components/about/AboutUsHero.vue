<script setup lang="ts">
import { computed, ref, onUnmounted, watch } from 'vue';
import type { StoreCustomerList } from '@/modules/stores/types/store';
import defaultStore from '@/assets/images/default-store.png';
const props = defineProps<{
  stores: StoreCustomerList[];
}>();

const featuredStores = computed(() => props.stores.slice(0, 5));
const currentSlide = ref(0);
let slideInterval: ReturnType<typeof setInterval> | null = null;

const startSlideShow = () => {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    if (featuredStores.value.length > 0) {
      currentSlide.value = (currentSlide.value + 1) % featuredStores.value.length;
    }
  }, 4000);
};

const stopSlideShow = () => {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
};

watch(featuredStores, (newVal) => {
  if (newVal.length > 0) {
    startSlideShow();
  }
}, { immediate: true });

onUnmounted(() => {
  stopSlideShow();
});
</script>

<template>
  <section class="max-w-4xl mx-auto mb-12 px-4">
    <h1 class="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
      Câu chuyện thương hiệu
    </h1>

    <div
      class="h-64 md:h-[400px] bg-gray-200 rounded-3xl overflow-hidden mb-6 shadow-lg relative group"
      @mouseenter="stopSlideShow"
      @mouseleave="startSlideShow"
    >
      <div v-if="featuredStores.length === 0" class="w-full h-full flex items-center justify-center text-gray-400">
        Đang tải hình ảnh...
      </div>

      <template v-else>
        <transition-group name="fade" tag="div" class="w-full h-full relative">
          <div
            v-for="(store, index) in featuredStores"
            :key="store.publicId"
            v-show="currentSlide === index"
            class="absolute inset-0 w-full h-full"
          >
            <img
              :src="store.imageUrl"
              :alt="store.name"
              class="w-full h-full object-cover transition-transform duration-\[10000ms] ease-linear scale-100 hover:scale-110"
              v-fallback-img="defaultStore"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

            <div class="absolute bottom-0 left-0 p-6 md:p-8 w-full text-left">
              <h2 class="text-2xl md:text-3xl font-extrabold text-white mb-2 drop-shadow-md">
                {{ store.name }}
              </h2>
              <p class="text-sm md:text-base text-gray-200 flex items-center gap-2 drop-shadow-sm">
                📍 {{ store.fullAddress }}
              </p>
            </div>
          </div>
        </transition-group>

        <div class="absolute bottom-4 right-6 flex gap-2 z-20">
          <button
            v-for="(_, index) in featuredStores"
            :key="index"
            @click="currentSlide = index"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300"
            :class="currentSlide === index ? 'bg-primary-500 w-8' : 'bg-white/50 hover:bg-white'"
          ></button>
        </div>
      </template>
    </div>

    <div class="text-center max-w-2xl mx-auto">
      <p class="text-gray-700 leading-relaxed text-lg">
        "Hành trình mang hương vị trà chanh phố cổ nguyên bản từ năm 1996 đến với mọi miền tổ quốc. Giữ trọn vị truyền thống, hòa nhịp cùng phong cách trẻ trung."
      </p>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
