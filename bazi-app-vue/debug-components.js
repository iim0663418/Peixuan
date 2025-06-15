// 調試腳本：檢查特質解構和命理依據組件的資料更新問題

console.log('=== 開始調試特質解構和命理依據組件 ===');

// 1. 檢查 purpleStarChart 的實際內容
setTimeout(() => {
  const purpleStarView = document.querySelector('.purple-star-container');
  if (purpleStarView) {
    console.log('找到 PurpleStarView 容器');
    
    // 檢查是否有命盤資料
    const chartDisplay = document.querySelector('[class*="purple-star-chart"]');
    console.log('命盤顯示組件存在:', !!chartDisplay);
    
    // 檢查側邊欄是否打開
    const drawer = document.querySelector('.el-drawer');
    console.log('側邊欄是否打開:', !!drawer && !drawer.classList.contains('el-drawer__closed'));
    
    // 檢查特質解構組件
    const traitComponent = document.querySelector('.trait-deconstruction');
    console.log('特質解構組件存在:', !!traitComponent);
    
    // 檢查命理依據組件
    const basisComponent = document.querySelector('.astrological-basis');
    console.log('命理依據組件存在:', !!basisComponent);
    
  } else {
    console.log('未找到 PurpleStarView 容器');
  }
}, 2000);

// 2. 監聽全域事件
window.addEventListener('purpleStarChartUpdated', (event) => {
  console.log('🔄 收到 purpleStarChartUpdated 事件:', event.detail);
});

window.addEventListener('purple-star-chart-updated', (event) => {
  console.log('🔄 收到 purple-star-chart-updated 事件:', event.detail);
});

// 3. 檢查 Vue 應用實例
setTimeout(() => {
  // 檢查是否可以訪問 Vue 開發者工具
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('Vue 開發者工具可用');
  }
  
  // 嘗試訪問調試函數
  if (window.debugTraitDeconstruction) {
    console.log('特質解構調試函數可用');
    window.debugTraitDeconstruction();
  }
  
  if (window.debugAstrologicalBasis) {
    console.log('命理依據調試函數可用');
    window.debugAstrologicalBasis();
  }
}, 3000);

// 4. 檢查 sessionStorage 中的資料
console.log('=== SessionStorage 資料檢查 ===');
const keys = Object.keys(sessionStorage).filter(key => key.startsWith('peixuan_'));
keys.forEach(key => {
  try {
    const data = JSON.parse(sessionStorage.getItem(key));
    console.log(`${key}:`, data ? '有資料' : '無資料');
    if (key.includes('purple_star_chart') && data) {
      console.log('命盤宮位數量:', data.palaces?.length || 0);
      console.log('命宮資料:', data.palaces?.find(p => p.name === '命宮'));
    }
  } catch (e) {
    console.log(`${key}: 解析錯誤`);
  }
});

console.log('=== 調試腳本載入完成 ===');