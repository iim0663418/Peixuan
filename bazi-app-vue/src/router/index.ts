import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';

// Removed legacy routes (2025-11-30):
// - /home (HomeView)
// - /purple-star (PurpleStarView)
// - /bazi (BaziView)
// - /integrated-analysis (IntegratedAnalysisView)

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/unified',
  },
  {
    path: '/unified',
    name: 'unified',
    component: () => import('../views/UnifiedView.vue'),
    meta: { title: 'astrology.unified' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
