import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import WebGPU from './pages/WebGPU.vue'
import PiniaDemo from './pages/PiniaDemo.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/webgpu', name: 'webgpu', component: WebGPU },
    { path: '/pinia-demo', name: 'pinia-demo', component: PiniaDemo },
  ],
})
