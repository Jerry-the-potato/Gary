import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './styles/theme.css'
import App from './App.vue'
import { router } from './router'

// 創建 Pinia 實例
const pinia = createPinia()

// 創建並配置 Vue 應用程式
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
