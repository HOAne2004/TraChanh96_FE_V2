import type { RouteRecordRaw } from 'vue-router';

export const orderRoutes: RouteRecordRaw[] = [
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/modules/orders/pages/CartPage.vue'),
    meta: {
      requiresAuth: false
    }
  }
];
