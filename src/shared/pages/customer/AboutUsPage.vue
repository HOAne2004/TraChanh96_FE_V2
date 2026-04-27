<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreStore } from '@/modules/stores/stores/store.store'

// Components
import StoreCard from '@/modules/stores/components/StoreCard.vue'
import AboutUsHero from '@/modules/stores/components/about/AboutUsHero.vue'
import AboutUsTimeline from '@/modules/stores/components/about/AboutUsTimeline.vue'

const router = useRouter()
const customerStore = useStoreStore()

const pageLoading = ref(true)

onMounted(async () => {
  try {
    // Tải toàn bộ danh sách chi nhánh (hoặc số lượng lớn) để làm data
    if (customerStore.stores.length === 0) {
      await customerStore.fetchActiveStores({ pageIndex: 1, pageSize: 100 })
    }
  } catch (error) {
    console.error('Lỗi tải danh sách cửa hàng:', error)
  } finally {
    pageLoading.value = false
  }
})

// --- XỬ LÝ DANH SÁCH CỬA HÀNG (Phân trang Local) ---
const INITIAL_COUNT = 3
const itemsToShow = ref(INITIAL_COUNT)

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

const handleSelectStore = (slug: string) => {
  customerStore.setSelectedStore(slug)
  router.push(`/stores/${slug}`)
}
</script>

<template>
  <main class="py-8 bg-gray-50 min-h-screen">
    <AboutUsHero :stores="customerStore.stores" />

    <AboutUsTimeline :stores="customerStore.stores" />

    <section class="max-w-6xl mx-auto text-center my-16 px-4">
      <div class="inline-block p-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-xl text-white transform hover:-translate-y-1 transition-transform duration-300 min-w-[300px]">
        <h2 class="text-6xl font-extrabold mb-2 drop-shadow-md">{{ totalAvailable || '...' }}</h2>
        <p class="text-xl font-medium opacity-90">Chi nhánh trên toàn quốc</p>
        <p class="text-sm mt-2 opacity-75">Sẵn sàng phục vụ bạn mỗi ngày</p>
      </div>
    </section>

    <section id="system-title" class="max-w-6xl mx-auto px-4 pb-12">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold border-l-4 border-primary-600 pl-4 text-primary-600">
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
          <button v-if="itemsToShow > INITIAL_COUNT" @click="showLess" class="btn-outline">Thu gọn</button>
          <button v-if="hasMore" @click="loadMore" class="btn-primary px-6">Xem thêm chi nhánh</button>
        </div>
      </div>

      <div v-else class="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-gray-500 mt-1 max-w-md mx-auto">Danh sách cửa hàng đang được cập nhật. Vui lòng quay lại sau.</p>
      </div>
    </section>
  </main>
</template>
