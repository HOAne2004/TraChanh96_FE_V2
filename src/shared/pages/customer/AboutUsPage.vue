<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreStore } from '@/modules/stores/stores/store.store'

// Components
import StoreCard from '@/modules/stores/components/StoreCard.vue'

const router = useRouter()
const customerStore = useStoreStore()

const pageLoading = ref(true)

onMounted(async () => {
  try {
    // Gọi API lấy danh sách chi nhánh (có thể truyền pageSize lớn để lấy hết)
    await customerStore.fetchStores({ pageIndex: 1, pageSize: 50 })
  } catch (error) {
    console.error('Lỗi tải danh sách cửa hàng:', error)
  } finally {
    pageLoading.value = false
  }
})

// --- 1. DỮ LIỆU TĨNH: LỊCH SỬ THƯƠNG HIỆU (Marketing Content) ---
const yearlyHistory = [
  { year: 2026, count: 5, stores: 'Cầu Giấy, Đống Đa, Thanh Xuân, Hà Đông...' },
  { year: 2020, count: 2, stores: 'Hai Bà Trưng, Hoàn Kiếm' },
  { year: 1996, count: 1, stores: 'Cơ sở đầu tiên tại Phố Cổ Hà Nội' }
]

const milestones = [
  {
    date: '15/03/2026',
    title: 'Khai trương chi nhánh Cầu Giấy',
    imageUrl: 'https://picsum.photos/400/300?random=11'
  },
  {
    date: '02/09/2020',
    title: 'Mở rộng khu vực trung tâm',
    imageUrl: 'https://picsum.photos/400/300?random=12'
  },
  {
    date: '10/10/1996',
    title: 'Viên gạch đầu tiên',
    imageUrl: 'https://picsum.photos/400/300?random=13'
  }
]

// --- 2. XỬ LÝ DANH SÁCH CỬA HÀNG (Dynamic Content) ---
const INITIAL_COUNT = 3
const itemsToShow = ref(INITIAL_COUNT)

// Lấy danh sách từ Pinia store
const totalAvailable = computed(() => customerStore.stores.length)
const visibleStores = computed(() => customerStore.stores.slice(0, itemsToShow.value))
const hasMore = computed(() => visibleStores.value.length < totalAvailable.value)

const loadMore = () => {
  itemsToShow.value += 3
}

const showLess = () => {
  itemsToShow.value = INITIAL_COUNT
  const el = document.getElementById('system-title')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// Khi người dùng bấm "Chọn quán" từ thẻ StoreCard
const handleSelectStore = (storeId: string) => {
  customerStore.selectedStore(storeId)
  // Chuyển hướng sang trang Menu sau khi chọn quán thành công
  router.push('/menu')
}
</script>

<template>
  <main class="py-8 bg-gray-50 min-h-screen">
    <section class="max-w-4xl mx-auto mb-12 px-4">
      <h1 class="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
        Câu chuyện thương hiệu
      </h1>

      <div class="h-64 md:h-80 bg-gray-200 rounded-2xl overflow-hidden mb-6 shadow-lg relative">
        <img
          src="https://picsum.photos/1200/500?random=1"
          alt="Trà Chanh 1996"
          class="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
        />
        <div class="absolute inset-0 bg-black/20"></div>
      </div>

      <div class="text-center max-w-2xl mx-auto">
        <p class="text-gray-700 leading-relaxed text-lg">
          "Hành trình mang hương vị trà chanh phố cổ nguyên bản từ năm 1996 đến với mọi miền tổ quốc. Giữ trọn vị truyền thống, hòa nhịp cùng phong cách trẻ trung."
        </p>
      </div>
    </section>

    <section class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8 bg-white rounded-3xl shadow-md mb-12 border border-gray-100">
      
      <div class="md:col-span-1">
        <h2 class="text-xl font-bold mb-6 border-b pb-3 text-primary-600">
          Lịch sử hình thành
        </h2>
        <div class="space-y-8 relative pl-0">
          <div class="absolute left-[15px] top-2 bottom-2 w-0.5 bg-primary-100"></div>

          <div v-for="item in yearlyHistory" :key="item.year" class="relative pl-10 group">
            <div class="absolute left-0 top-1.5 w-8 h-8 flex items-center justify-center bg-white border-4 border-primary-500 rounded-full z-10 group-hover:scale-125 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-primary-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <p class="text-xl font-bold text-gray-800">{{ item.year }}</p>
            <p class="text-sm text-gray-600 mt-1">
              Mở rộng thêm <span class="font-bold text-primary-600">{{ item.count }}</span> chi nhánh.
            </p>
            <p class="text-xs text-gray-500 italic mt-1">{{ item.stores }}</p>
          </div>
        </div>
      </div>

      <div class="md:col-span-2">
        <h2 class="text-xl font-bold mb-6 border-b pb-3 text-primary-600">
          Cột mốc đáng nhớ
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="(item, index) in milestones"
            :key="index"
            class="p-4 rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-primary-50 min-h-[120px] flex flex-col justify-end"
            :style="{
              backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }"
          >
            <div v-if="item.imageUrl" class="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent rounded-xl"></div>

            <div class="relative z-10">
              <span class="inline-block px-2 py-1 rounded bg-primary-500 text-white text-xs font-bold mb-2">
                {{ item.date }}
              </span>
              <p class="font-bold text-white text-lg leading-tight shadow-sm">
                {{ item.title }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto text-center my-16 px-4">
      <div class="inline-block p-8 bg-linear-to-br from-primary-500 to-primary-700 rounded-3xl shadow-xl text-white transform hover:-translate-y-1 transition-transform duration-300 min-w-[300px]">
        <h2 class="text-6xl font-extrabold mb-2 drop-shadow-md">{{ totalAvailable || '...' }}</h2>
        <p class="text-xl font-medium opacity-90">Chi nhánh trên toàn quốc</p>
        <p class="text-sm mt-2 opacity-75">Sẵn sàng phục vụ bạn mỗi ngày</p>
      </div>
    </section>

    <section id="system-title" class="max-w-6xl mx-auto px-4 pb-12">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold border-l-4 border-primary-500 pl-4 text-gray-800">
          Hệ thống cửa hàng
        </h2>
      </div>

      <div v-if="pageLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>

      <div v-else-if="visibleStores.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center md:place-items-stretch">
          <StoreCard 
            v-for="store in visibleStores" 
            :key="store.publicId" 
            :store="store" 
            @select="handleSelectStore"
          />
        </div>

        <div v-if="totalAvailable > INITIAL_COUNT" class="mt-10 flex justify-center space-x-4">
          <button
            v-if="itemsToShow > INITIAL_COUNT"
            @click="showLess"
            class="btn-outline"
          >
            Thu gọn
          </button>
          <button
            v-if="hasMore"
            @click="loadMore"
            class="btn-primary px-6"
          >
            Xem thêm chi nhánh
          </button>
        </div>
      </div>

      <div v-else class="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto text-gray-300 mb-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
        </svg>
        <h3 class="text-lg font-bold text-gray-800">Đang cập nhật hệ thống</h3>
        <p class="text-gray-500 mt-1 max-w-md mx-auto">Danh sách cửa hàng Trà Chanh 1996 đang được cập nhật. Vui lòng quay lại sau.</p>
      </div>
    </section>
  </main>
</template>