import type { RouteRecordRaw } from 'vue-router';

export const orderRoutes: RouteRecordRaw[] = [
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/shared/pages/customer/CartPage.vue'),
    meta: {
      requiresAuth: false
    }
  }
];
