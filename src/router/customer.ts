import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import HomePage from '@/shared/pages/customer/HomePage.vue'
import { identityRoutes } from '@/modules/identity/router';
import { catalogRoutes } from '@/modules/catalog/router';
import { storeRoutes } from '@/modules/stores/router';
import { orderRoutes } from '@/modules/orders/router';

import { useAuthStore } from '@/modules/identity/stores/auth.store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children:[
        {
          path: '',
          name:'Home',
          component: HomePage
        },
        ...identityRoutes,
        ...catalogRoutes,
        ...storeRoutes,
        ...orderRoutes,
        {
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/shared/pages/NotFoundPage.vue')
        }
      ]
    }
  ],
})

// === THÊM BƯỚC BẢO VỆ ĐIỀU HƯỚNG TẠI ĐÂY ===
router.beforeEach((to, from, next) => {
  // BẮT BUỘC PHẢI KHỞI TẠO STORE Ở BÊN TRONG HÀM NÀY
  const authStore = useAuthStore();

  // Kiểm tra xem route hiện tại có gắn biển "requiresAuth" không?
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Nếu có gắn biển mà chưa đăng nhập -> Đẩy về trang chủ
    next('/');

    // Tự động bật Modal bắt đăng nhập luôn cho tiện
    authStore.openLoginModal();
  } else {
    // Nếu đã đăng nhập, hoặc trang không yêu cầu đăng nhập -> Cho phép đi tiếp
    next();
  }
});

export default router
