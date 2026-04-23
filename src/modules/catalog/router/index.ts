import type { RouteRecordRaw } from 'vue-router';

export const catalogRoutes: RouteRecordRaw[] = [
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('@/shared/pages/customer/MenuPage.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/products/:slug',
    name: 'ProductDetail',
    component: () => import('@/shared/pages/customer/ProductDetail.vue'),
    meta: {
      requiresAuth: false
    }
  }
];
