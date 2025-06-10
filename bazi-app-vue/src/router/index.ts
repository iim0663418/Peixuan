import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // RouteRecordRaw 改為 type import
import HomeView from '../views/HomeView.vue' // 我們稍後會創建這個組件

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  }
  // 之後可以在這裡添加更多路由
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
