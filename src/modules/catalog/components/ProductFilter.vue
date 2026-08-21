<script setup lang="ts">
import IconSvgSearch from '@/assets/icons/IconSvgSearch.svg'
import IconSvgFilter from '@/assets/icons/IconSvgFilter.svg'
import IconSvgCancel from '@/assets/icons/IconSvgCancel.svg'
import IconSvgLocation from '@/assets/icons/IconSvgLocation.svg'
import { ref, watch, computed } from 'vue'

interface FilterCategory {
  id: number
  name: string
}

const props = withDefaults(
  defineProps<{
    categories: FilterCategory[]
    title?: string
    modelValue: number[] // ID của category
    searchTerm?: string // BỔ SUNG: Từ khóa tìm kiếm
  }>(),
  {
    title: 'Bộ lọc & Tìm kiếm',
    categories: () => [],
    modelValue: () => [],
    searchTerm: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
  (e: 'update:searchTerm', value: string): void // BỔ SUNG: Emit khi gõ phím
}>()

const selectedCategories = ref<number[]>([...props.modelValue])
const localSearchTerm = ref(props.searchTerm) // Lưu giá trị ô input
const isExpanded = ref(false)

// --- DRAGGING STATE & LOGIC ---
const x = ref<number | null>(null)
const y = ref<number | null>(null)
const isDragging = ref(false)
let startX = 0
let startY = 0
let touchStartX = 0
let touchStartY = 0
let hasDragged = false
const dragThreshold = 5

const handleTouchStart = (e: TouchEvent) => {
  if (typeof window !== 'undefined' && window.innerWidth >= 768) return
  const touch = e.touches[0]
  if (!touch) return

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  startX = touch.clientX - rect.left
  startY = touch.clientY - rect.top

  touchStartX = touch.clientX
  touchStartY = touch.clientY
  hasDragged = false
  isDragging.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  const touch = e.touches[0]
  if (!touch) return

  // Prevent default scroll behavior
  e.preventDefault()

  const clientX = touch.clientX
  const clientY = touch.clientY

  if (Math.abs(clientX - touchStartX) > dragThreshold || Math.abs(clientY - touchStartY) > dragThreshold) {
    hasDragged = true
  }

  let newX = clientX - startX
  let newY = clientY - startY

  const buttonSize = 56 // w-14/h-14 = 56px
  const maxX = window.innerWidth - buttonSize - 10
  const maxY = window.innerHeight - buttonSize - 10

  newX = Math.max(10, Math.min(newX, maxX))
  newY = Math.max(10, Math.min(newY, maxY))

  x.value = newX
  y.value = newY
}

const handleTouchEnd = () => {
  isDragging.value = false
}

const handleButtonClick = () => {
  if (hasDragged) return
  isExpanded.value = !isExpanded.value
}

const mobileStyle = computed(() => {
  if (typeof window === 'undefined') return {}
  if (window.innerWidth >= 768) return {}

  const style: any = {
    position: 'fixed',
    zIndex: 90,
  }

  if (x.value !== null && y.value !== null) {
    style.left = `${x.value}px`
    style.top = `${y.value}px`
    style.bottom = 'auto'
    style.right = 'auto'
  }
  return style
})

// --- WATCHERS ---
watch(
  () => props.modelValue,
  (newVal) => {
    selectedCategories.value = [...newVal]
  },
  { deep: true },
)

watch(
  () => props.searchTerm,
  (newVal) => {
    localSearchTerm.value = newVal
  },
)

// --- METHODS ---
const toggleCategory = (id: number) => {
  if (selectedCategories.value.includes(id)) {
    selectedCategories.value = selectedCategories.value.filter((cId) => cId !== id)
  } else {
    selectedCategories.value.push(id)
  }
  emit('update:modelValue', selectedCategories.value)
}

const handleSearchInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  localSearchTerm.value = value
  emit('update:searchTerm', value) // Bắn sự kiện ra mỗi khi gõ
}

const clearAll = () => {
  selectedCategories.value = []
  localSearchTerm.value = ''
  emit('update:modelValue', [])
  emit('update:searchTerm', '')
}

</script>

<template>
  <div class="md:space-y-3">
    <!-- Mobile Toggle Button (Floating FAB) -->
    <button
      v-if="!isExpanded"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @click="handleButtonClick"
      class="md:hidden fixed bottom-[100px] right-6 z-[99] w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 touch-none"
      :style="mobileStyle"
    >
      <span class="flex items-center justify-center">
        <IconSvgLocation class="w-6 h-6" />
      </span>
    </button>

    <!-- Mobile Backdrop -->
    <div
      v-if="isExpanded"
      @click="isExpanded = false"
      class="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] transition-opacity duration-300"
    ></div>

    <!-- Filter content container (Modal on mobile, Sidebar on desktop) -->
    <div
      :class="[
        isExpanded
          ? 'fixed inset-x-4 top-1/2 -translate-y-1/2 z-[1000] block max-h-[85vh] overflow-y-auto'
          : 'hidden md:block',
      ]"
      class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl"
    >
      <div
        class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 cursor-pointer"
        @click="isExpanded = false"
      >
        <h3 class="font-bold text-gray-800 flex items-center gap-2">
          <IconSvgFilter class="size-5 text-primary-500" />
          {{ title }}
        </h3>

        <div class="flex items-center gap-2" @click.stop>
          <button
            v-if="selectedCategories.length > 0 || localSearchTerm"
            @click="clearAll"
            class="text-xs font-medium text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50"
          >
            Xóa lọc
          </button>

          <!-- Close button (Visible on mobile) -->
          <button
            @click="isExpanded = false"
            class="md:hidden p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IconSvgCancel class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="p-5">
        <div class="mb-5 relative">
          <input
            type="text"
            :value="localSearchTerm"
            @input="handleSearchInput"
            placeholder="Tìm món ngon..."
            class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
          />
          <IconSvgFilter class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div v-if="categories.length === 0" class="text-center text-gray-400 text-sm py-4">
          Đang tải danh mục...
        </div>

        <div v-else class="flex flex-col gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="toggleCategory(cat.id)"
            class="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border text-left flex items-center justify-between"
            :class="[
              selectedCategories.includes(cat.id)
                ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-100 transform scale-[1.02]'
                : 'bg-white border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600',
            ]"
          >
            <span class="relative z-10 flex items-center gap-1.5">{{ cat.name }}</span>
            <span v-if="selectedCategories.includes(cat.id)" class="bg-white/20 rounded-full p-0.5">
              <IconSvgSearch class="h-3 w-3" />
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
