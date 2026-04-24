import type { RouteRecordRaw } from 'vue-router';

export const storeRoutes: RouteRecordRaw[] = [
    {
        path: '/about-us',
        name: 'aboutus',
        component: () => import('@/shared/pages/customer/AboutUsPage.vue'),
        meta: {
            requiresAuth: false,
        }
    },
    {
        path: '/stores/:slug',
        name: 'store-detail',
        component: () => import('@/shared/pages/customer/StoreDetailPage.vue'),
        meta: {
            requiresAuth: false,
        }
    }
];