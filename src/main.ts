import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,    // 2 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  },
})

app.use(router)
app.mount('#app')
