import type { RouteRecordRaw } from 'vue-router';

export const identityRoutes: RouteRecordRaw[] = [
  {
    path: 'profile',
    name: 'Profile',
    component: () => import('../pages/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },

  {
  path: '/verify-email',
  name: 'VerifyEmail',
  component: () => import('@/modules/identity/pages/VerifyEmailPage.vue'),
  meta: { requiresAuth: false }
}
];
