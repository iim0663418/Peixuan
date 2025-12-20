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
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: '首頁 - 佩璇' },
  },
  {
    path: '/unified',
    name: 'unified',
    component: () => import('../views/UnifiedView.vue'),
    meta: { title: '整合命盤計算 - 佩璇' },
  },
  {
    path: '/personality',
    name: 'personality',
    component: () => import('../views/UnifiedAIAnalysisView.vue'),
    meta: { title: '佩璇性格分析 - 佩璇' },
  },
  {
    path: '/fortune',
    name: 'fortune',
    component: () => import('../views/UnifiedAIAnalysisView.vue'),
    meta: { title: '佩璇運勢分析 - 佩璇' },
  },
  {
    path: '/daily-question',
    name: 'daily-question',
    component: () => import('../views/DailyQuestionView.vue'),
    meta: { title: '每日問答 - 佩璇' },
  },
  // 向後兼容 (Backward compatibility redirects)
  {
    path: '/calculate',
    redirect: '/unified',
  },
  {
    path: '/ai-analysis',
    redirect: '/personality',
  },
  {
    path: '/advanced-analysis',
    redirect: '/fortune',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

// 動態更新頁面標題
router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || '佩璇';
  next();
});

export default router;
