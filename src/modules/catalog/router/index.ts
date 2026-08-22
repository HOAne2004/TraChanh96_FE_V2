import type { RouteRecordRaw } from 'vue-router';

export const catalogRoutes: RouteRecordRaw[] = [
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('@/modules/catalog/pages/MenuPage.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/products/:slug',
    name: 'ProductDetail',
    component: () => import('@/modules/catalog/pages/ProductDetailPage.vue'),
    meta: {
      requiresAuth: false
    }
  }
];
