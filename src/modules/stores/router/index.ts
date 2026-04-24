import type { RouteRecordRaw } from 'vue-router';

export const storeRoutes: RouteRecordRaw[] = [
  {
    path: '/aboutus',
    name: 'aboutus',
    component: () => import('@/shared/pages/customer/AboutUsView.vue'),
    meta: {
      requiresAuth: false,
    }
  }
];