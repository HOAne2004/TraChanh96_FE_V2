import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import HomePage from '@/shared/pages/customer/HomePage.vue'
import { identityRoutes } from '@/modules/identity/router';

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
      ]
    }
  ],
})

export default router
