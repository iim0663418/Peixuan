// 調試資料流向腳本
// 在瀏覽器控制台中執行此腳本來檢查資料傳遞問題

console.log('=== 開始調試綜合人生解讀儀表板資料流向 ===');

// 檢查 PurpleStarView 的資料狀態
function checkPurpleStarViewData() {
  console.log('🔍 檢查 PurpleStarView 資料狀態:');
  
  // 查找 Vue 應用實例
  const app = document.querySelector('#app').__vueParentComponent;
  if (!app) {
    console.error('❌ 無法找到 Vue 應用實例');
    return;
  }
  
  // 檢查 purpleStarChart 資料
  const purpleStarChart = app.ctx.purpleStarChart;
  console.log('📊 purpleStarChart 存在:', !!purpleStarChart);
  
  if (purpleStarChart) {
    console.log('📊 purpleStarChart 內容:', purpleStarChart);
    console.log('📊 宮位數量:', purpleStarChart.palaces?.length || 0);
    console.log('📊 命宮資料:', purpleStarChart.palaces?.find(p => p.name === '命宮'));
  }
  
  // 檢查儀表板更新鍵
  const dashboardUpdateKey = app.ctx.dashboardUpdateKey;
  console.log('🔑 dashboardUpdateKey:', dashboardUpdateKey);
  
  // 檢查最後更新時間
  const lastDashboardUpdate = app.ctx.lastDashboardUpdate;
  console.log('⏰ lastDashboardUpdate:', lastDashboardUpdate);
}

// 檢查組件渲染狀態
function checkComponentRenderState() {
  console.log('🔍 檢查組件渲染狀態:');
  
  // 檢查特質解構組件
  const traitsPanel = document.querySelector('[v-if="interpretationMode === \'traits\'"]');
  console.log('🎭 特質解構面板存在:', !!traitsPanel);
  
  if (traitsPanel) {
    const traitComponent = traitsPanel.__vueParentComponent;
    if (traitComponent) {
      console.log('🎭 特質解構組件 props:', traitComponent.props);
      console.log('🎭 特質解構組件 chartData:', traitComponent.props?.chartData);
    }
  }
  
  // 檢查命理依據組件
  const basisPanel = document.querySelector('[v-if="interpretationMode === \'basis\'"]');
  console.log('📚 命理依據面板存在:', !!basisPanel);
  
  if (basisPanel) {
    const basisComponent = basisPanel.__vueParentComponent;
    if (basisComponent) {
      console.log('📚 命理依據組件 props:', basisComponent.props);
      console.log('📚 命理依據組件 chartData:', basisComponent.props?.chartData);
    }
  }
}

// 觸發手動更新
function triggerManualUpdate() {
  console.log('🔄 觸發手動更新...');
  
  // 發送全域事件
  window.dispatchEvent(new CustomEvent('purpleStarChartUpdated', {
    detail: {
      chart: null, // 將由組件自行獲取
      updateKey: Date.now(),
      timestamp: new Date().toISOString(),
      source: 'debugScript'
    }
  }));
  
  console.log('✅ 手動更新事件已發送');
}

// 檢查事件監聽器
function checkEventListeners() {
  console.log('🔍 檢查事件監聽器:');
  
  // 檢查全域調試函數
  if (typeof window.debugTraitDeconstruction === 'function') {
    console.log('✅ TraitDeconstruction 調試函數可用');
  } else {
    console.log('❌ TraitDeconstruction 調試函數不可用');
  }
  
  if (typeof window.debugAstrologicalBasis === 'function') {
    console.log('✅ AstrologicalBasis 調試函數可用');
  } else {
    console.log('❌ AstrologicalBasis 調試函數不可用');
  }
}

// 執行完整診斷
function runFullDiagnostic() {
  console.log('🚀 執行完整資料流向診斷:');
  console.log('');
  
  checkPurpleStarViewData();
  console.log('');
  
  checkComponentRenderState();
  console.log('');
  
  checkEventListeners();
  console.log('');
  
  console.log('💡 如果發現問題，可以執行以下命令:');
  console.log('- triggerManualUpdate() // 觸發手動更新');
  console.log('- window.debugTraitDeconstruction() // 調試特質解構');
  console.log('- window.debugAstrologicalBasis() // 調試命理依據');
}

// 暴露函數到全域
window.debugDataFlow = {
  checkPurpleStarViewData,
  checkComponentRenderState,
  triggerManualUpdate,
  checkEventListeners,
  runFullDiagnostic
};

// 自動執行診斷
runFullDiagnostic();

console.log('=== 資料流向調試完成 ===');
console.log('💡 使用 window.debugDataFlow.runFullDiagnostic() 重新執行診斷');