<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/identity/stores/auth.store'
import HerroBanner from '@/modules/marketing/components/banner/HerroBanner.vue'

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = () => {
  authStore.openLoginModal()
}

const handleGoToMenu = () => {
  router.push('/menu')
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <HerroBanner 
      title="Hương vị thanh mát"
      description="Thưởng thức hương vị trà chanh truyền thống sảng khoái tức thì. Đăng nhập ngay để nhận ngập tràn ưu đãi đặc biệt!"
      primaryBtnText="Đăng nhập ngay"
      secondaryBtnText="Khám phá Menu"
      @primary-click="handleLogin"
      @secondary-click="handleGoToMenu"
    />
  </div>
</template>
