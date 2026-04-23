import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/shared/App.vue'
import router from '@/router'
import '@/assets/main.css'
import { vFallbackImage } from '@/shared/directives/fallbackImage'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('fallback-img', vFallbackImage)

app.mount('#app')
