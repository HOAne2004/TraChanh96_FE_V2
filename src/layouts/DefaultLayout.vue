<script setup lang="ts">
import HeaderCustomer from '@/shared/components/customer/HeaderCustomer.vue';
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <HeaderCustomer></HeaderCustomer>
    <main class="flex-1">
      <!-- Nơi để hiển thị nội dung của từng trang -->
      <router-view />
    </main>

    <footer class="bg-gray-800 text-white py-6 text-center">
      <p class="text-sm text-gray-400">© 2026 Trà Chanh 1996. All rights reserved.</p>
    </footer>
  </div>
</template>
