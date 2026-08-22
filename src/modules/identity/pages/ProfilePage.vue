<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/modules/identity/stores/auth.store'

// Import các Component con đã được tách ra
import ProfileInfoTab from '../components/ProfileInfoTab.vue'
import AddressBookTab from '../components/AddressBookTab.vue'
// import OrderHistoryTab from '../components/OrderHistoryTab.vue'; // Sẽ tạo sau

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const activeTab = ref((route.query.tab as string) || 'profile') // 'profile' | 'addresses' | 'orders'

watch(activeTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } })
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-6 lg:py-10">
    <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-6">
      <aside class="w-full md:w-64 lg:w-72 shrink-0">
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-row md:flex-col gap-1 md:gap-0 p-1.5 md:p-0 overflow-x-auto md:overflow-visible sticky top-6"
        >
          <button
            @click="activeTab = 'profile'"
            :class="[
              activeTab === 'profile'
                ? 'bg-primary-50 text-primary-700 md:bg-white md:border-l-4 md:border-l-primary-500'
                : 'text-gray-600 hover:bg-gray-50',
              'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal shrink-0 border-b border-transparent md:border-gray-100 last:border-0 rounded-md md:rounded-none',
            ]"
          >
            Hồ sơ cá nhân
          </button>

          <button
            @click="activeTab = 'addresses'"
            :class="[
              activeTab === 'addresses'
                ? 'bg-primary-50 text-primary-700 md:bg-white md:border-l-4 md:border-l-primary-500'
                : 'text-gray-600 hover:bg-gray-50',
              'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal shrink-0 border-b border-transparent md:border-gray-100 last:border-0 rounded-md md:rounded-none',
            ]"
          >
            Sổ địa chỉ
          </button>

          <button
            @click="activeTab = 'orders'"
            :class="[
              activeTab === 'orders'
                ? 'bg-primary-50 text-primary-700 md:bg-white md:border-l-4 md:border-l-primary-500'
                : 'text-gray-600 hover:bg-gray-50',
              'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal shrink-0 border-b border-transparent md:border-gray-100 last:border-0 rounded-md md:rounded-none',
            ]"
          >
            Lịch sử đơn hàng
          </button>

          <button
            @click="handleLogout"
            class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap md:whitespace-normal shrink-0 border-none rounded-md md:rounded-none"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main class="flex-1 w-full min-w-0">
        <ProfileInfoTab v-if="activeTab === 'profile'" />
        <AddressBookTab v-if="activeTab === 'addresses'" />
      </main>
    </div>
  </div>
</template>
