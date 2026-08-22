import type { RouteRecordRaw } from 'vue-router';

export const storeRoutes: RouteRecordRaw[] = [
    {
        path: '/about-us',
        name: 'aboutus',
        component: () => import('@/modules/stores/pages/AboutUsPage.vue'),
        meta: {
            requiresAuth: false,
        }
    },
    {
        path: '/stores/:slug',
        name: 'store-detail',
        component: () => import('@/modules/stores/pages/StoreDetailPage.vue'),
        meta: {
            requiresAuth: false,
        }
    }
];