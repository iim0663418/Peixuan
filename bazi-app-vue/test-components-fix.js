// 測試組件修復 - 在瀏覽器控制台執行此腳本

console.log('=== 測試特質解構和命理依據組件修復 ===');

// 1. 檢查組件是否存在
function checkComponents() {
  const traitComponent = document.querySelector('.trait-deconstruction');
  const basisComponent = document.querySelector('.astrological-basis');
  
  console.log('特質解構組件:', traitComponent ? '存在' : '不存在');
  console.log('命理依據組件:', basisComponent ? '存在' : '不存在');
  
  if (traitComponent) {
    console.log('特質解構內容:', traitComponent.innerHTML.length > 100 ? '有內容' : '內容較少');
  }
  
  if (basisComponent) {
    console.log('命理依據內容:', basisComponent.innerHTML.length > 100 ? '有內容' : '內容較少');
  }
}

// 2. 檢查是否顯示"載入中"狀態
function checkLoadingStates() {
  const noChartData = document.querySelectorAll('.no-chart-data');
  console.log('載入中狀態組件數量:', noChartData.length);
  
  noChartData.forEach((element, index) => {
    console.log(`載入狀態 ${index + 1}:`, element.textContent.trim());
  });
}

// 3. 檢查側邊欄狀態和當前模式
function checkSidebarState() {
  const drawer = document.querySelector('.el-drawer');
  const isOpen = drawer && drawer.style.transform !== 'translateX(100%)';
  console.log('側邊欄是否打開:', isOpen);
  
  // 檢查當前活動的 tab
  const activeTab = document.querySelector('.dashboard-tab-button.active');
  if (activeTab) {
    console.log('當前活動 tab:', activeTab.textContent.trim());
  }
}

// 4. 測試更新按鈕功能
function testRefreshButton() {
  const refreshBtn = document.querySelector('.refresh-dashboard-btn');
  if (refreshBtn) {
    console.log('找到更新按鈕，點擊測試...');
    refreshBtn.click();
    
    // 等待一下再檢查結果
    setTimeout(() => {
      checkComponents();
    }, 1000);
  } else {
    console.log('未找到更新按鈕');
  }
}

// 5. 檢查調試函數是否可用
function checkDebugFunctions() {
  console.log('debugTraitDeconstruction 可用:', typeof window.debugTraitDeconstruction === 'function');
  console.log('debugAstrologicalBasis 可用:', typeof window.debugAstrologicalBasis === 'function');
  console.log('refreshTraitDeconstruction 可用:', typeof window.refreshTraitDeconstruction === 'function');
  console.log('refreshAstrologicalBasis 可用:', typeof window.refreshAstrologicalBasis === 'function');
}

// 執行檢查
setTimeout(() => {
  console.log('\n--- 組件狀態檢查 ---');
  checkComponents();
  
  console.log('\n--- 載入狀態檢查 ---');
  checkLoadingStates();
  
  console.log('\n--- 側邊欄狀態檢查 ---');
  checkSidebarState();
  
  console.log('\n--- 調試函數檢查 ---');
  checkDebugFunctions();
  
  console.log('\n--- 測試更新功能 ---');
  testRefreshButton();
}, 1000);

// 導出檢查函數供手動調用
window.testComponentsFix = {
  checkComponents,
  checkLoadingStates,
  checkSidebarState,
  testRefreshButton,
  checkDebugFunctions
};