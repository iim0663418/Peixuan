import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// 立即載入的首頁 (因為是首次訪問)
import HomeView from '../views/HomeView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },

  {
    path: '/purple-star',
    name: 'purple-star',
    component: () => import('../views/PurpleStarView.vue'),
    meta: { title: 'astrology.purple_star' },
  },
  {
    path: '/bazi',
    name: 'bazi',
    component: () => import('../views/BaziView.vue'),
    meta: { title: 'astrology.bazi' },
  },
  {
    path: '/integrated-analysis',
    name: 'integrated-analysis',
    component: () => import('../views/IntegratedAnalysisView.vue'),
    meta: {
      title: 'astrology.integrated_analysis',
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
