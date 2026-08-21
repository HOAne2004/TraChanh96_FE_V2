<script setup lang="ts">
import IconSvgLeaf from '@/assets/icons/IconSvgLeaf.svg'
import { computed } from 'vue'
import defaultDrink from '@/assets/images/default-drink.png'

interface Props {
  badgeText?: string
  title?: string
  description?: string
  primaryBtnText?: string
  secondaryBtnText?: string
  image?: string
}

const props = withDefaults(defineProps<Props>(), {
  badgeText: 'Tươi mới mỗi ngày - Giao hàng tận nơi',
  title: 'Hương vị trà chanh truyền thống',
  description:
    'Thưởng thức hương vị thanh mát, sảng khoái tức thì từ những nguyên liệu tự nhiên chọn lọc kỹ càng.',
  primaryBtnText: 'Đặt hàng ngay',
  secondaryBtnText: 'Xem menu',
  image: '',
})

const emit = defineEmits<{
  (e: 'primary-click'): void
  (e: 'secondary-click'): void
}>()

const bannerImage = computed(() => props.image || defaultDrink)
</script>

<template>
  <div
    class="relative overflow-hidden rounded-3xl m-4 bg-cover bg-center bg-no-repeat shadow-2xl transition-all duration-500 hover:shadow-primary-500/10 group/banner"
    :style="{
      backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 100%), url(${bannerImage})`,
    }"
  >
    <!-- Ambient light glow effects -->
    <div
      class="absolute -right-24 -top-24 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover/banner:bg-primary-500/25"
    ></div>
    <div
      class="absolute -left-24 -bottom-24 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover/banner:bg-secondary-500/15"
    ></div>

    <!-- Responsive grid layout (1 column on mobile, 2 columns on lg) -->
    <div
      class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-8 sm:p-12 lg:p-16"
    >
      <!-- Text content: Left column (7 cols on lg) -->
      <div class="order-2 lg:col-span-7 flex flex-col justify-center space-y-6 text-left">
        <!-- Premium glassmorphic badge -->
        <div
          class="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 w-fit rounded-full text-xs sm:text-sm font-medium backdrop-blur-md text-white shadow-inner select-none transition-transform duration-300 hover:scale-105"
        >
          <IconSvgLeaf class="w-4 h-4 text-secondary-400 fill-current animate-pulse" />
          <span class="text-white/95">{{ badgeText }}</span>
        </div>

        <!-- Headline -->
        <h1
          class="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-sm"
        >
          {{ title }}
        </h1>

        <!-- Description -->
        <p class="text-base sm:text-lg text-gray-200 font-light leading-relaxed max-w-xl">
          {{ description }}
        </p>

        <!-- Dynamic Action Buttons -->
        <div class="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
          <button
            v-if="primaryBtnText"
            @click="emit('primary-click')"
            class="px-8 py-3.5 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-300 cursor-pointer flex items-center justify-center"
          >
            {{ primaryBtnText }}
          </button>

          <button
            v-if="secondaryBtnText"
            @click="emit('secondary-click')"
            class="px-8 py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-md transition-all duration-300 cursor-pointer flex items-center justify-center"
          >
            {{ secondaryBtnText }}
          </button>
        </div>
      </div>

      <!-- Featured Image: Right column (5 cols on lg) -->
      <div class="order-1 lg:col-span-5 flex justify-center items-center lg:justify-end">
        <div class="relative group max-w-[280px] sm:max-w-[340px] lg:max-w-full">
          <!-- Glow indicator -->
          <div
            class="absolute -inset-1.5 bg-linear-to-r from-secondary-400 to-primary-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-35 transition duration-1000 group-hover:duration-300"
          ></div>

          <!-- Glass card container for main image -->
          <div
            class="relative bg-neutral-900/40 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-2xl transition-all duration-300 group-hover:bg-neutral-900/50 group-hover:border-white/20"
          >
            <img
              :src="bannerImage"
              :alt="title"
              class="w-full h-auto object-contain rounded-xl max-h-[260px] sm:max-h-[320px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.02]"
              v-fallback-img
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
