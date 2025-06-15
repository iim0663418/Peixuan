// 調試組件更新問題的腳本
// 在瀏覽器控制台中運行此腳本來調試

console.log('=== 開始調試特質解構和命理依據組件更新問題 ===');

// 1. 檢查 sessionStorage 中的資料
function checkSessionStorageData() {
  console.log('1. 檢查 sessionStorage 資料:');
  
  const keys = [
    'peixuan_purple_star_chart',
    'peixuan_birth_info',
    'peixuan_transformation_flows',
    'peixuan_transformation_combinations',
    'peixuan_transformation_multi_layer_energies'
  ];
  
  keys.forEach(key => {
    const data = sessionStorage.getItem(key);
    console.log(`  ${key}:`, data ? '存在' : '不存在', data ? `(${Math.round(data.length / 1024)}KB)` : '');
    if (data && key === 'peixuan_purple_star_chart') {
      try {
        const parsed = JSON.parse(data);
        console.log(`    命盤宮位數量: ${parsed.palaces?.length || 0}`);
        console.log(`    命宮天干: ${parsed.mingGan || '未知'}`);
      } catch (e) {
        console.log(`    解析失敗: ${e.message}`);
      }
    }
  });
}

// 2. 檢查 Vue 組件實例
function checkVueComponents() {
  console.log('2. 檢查 Vue 組件實例:');
  
  // 查找特質解構組件
  const traitElements = document.querySelectorAll('[class*="trait-deconstruction"]');
  console.log(`  找到特質解構元素: ${traitElements.length} 個`);
  
  // 查找命理依據組件
  const basisElements = document.querySelectorAll('[class*="astrological-basis"]');
  console.log(`  找到命理依據元素: ${basisElements.length} 個`);
  
  // 檢查是否在智慧解讀模式
  const drawer = document.querySelector('.el-drawer');
  console.log(`  智慧解讀側邊欄: ${drawer ? '顯示' : '隱藏'}`);
  
  // 檢查當前選中的標籤
  const activeTabs = document.querySelectorAll('.dashboard-tab-button.active');
  activeTabs.forEach((tab, index) => {
    console.log(`  活躍標籤 ${index + 1}: ${tab.textContent?.trim()}`);
  });
}

// 3. 檢查 props 傳遞
function checkPropsFlow() {
  console.log('3. 檢查 props 傳遞:');
  
  // 使用 Vue devtools API (如果可用)
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('  Vue DevTools 已安裝，建議使用 DevTools 檢查 props');
  } else {
    console.log('  Vue DevTools 未安裝，無法詳細檢查 props');
  }
  
  // 檢查是否有全域的調試函數
  if (window.debugTraitDeconstruction) {
    console.log('  發現特質解構調試函數，執行中...');
    window.debugTraitDeconstruction();
  } else {
    console.log('  特質解構調試函數不可用');
  }
  
  if (window.debugAstrologicalBasis) {
    console.log('  發現命理依據調試函數，執行中...');
    window.debugAstrologicalBasis();
  } else {
    console.log('  命理依據調試函數不可用');
  }
}

// 4. 檢查監聽器狀態
function checkWatchers() {
  console.log('4. 檢查監聽器狀態:');
  
  // 模擬資料變化來測試響應性
  console.log('  嘗試觸發強制更新...');
  
  // 發送自定義事件來測試組件響應
  const event = new CustomEvent('debug-force-update', {
    detail: { timestamp: Date.now() }
  });
  window.dispatchEvent(event);
  
  console.log('  已發送強制更新事件');
  
  // 測試命盤更新事件
  const chartData = sessionStorage.getItem('peixuan_purple_star_chart');
  if (chartData) {
    try {
      const chart = JSON.parse(chartData);
      const chartUpdateEvent = new CustomEvent('purple-star-chart-updated', {
        detail: { 
          chartData: chart,
          timestamp: Date.now(),
          source: 'debug-test'
        }
      });
      window.dispatchEvent(chartUpdateEvent);
      console.log('  已發送命盤更新測試事件');
    } catch (e) {
      console.log('  無法發送命盤更新事件，資料解析失敗');
    }
  } else {
    console.log('  無法發送命盤更新事件，無命盤資料');
  }
}

// 5. 檢查條件渲染
function checkConditionalRendering() {
  console.log('5. 檢查條件渲染:');
  
  // 檢查 v-if 條件
  const hiddenElements = document.querySelectorAll('[style*="display: none"]');
  console.log(`  隱藏元素數量: ${hiddenElements.length}`);
  
  // 檢查智慧解讀的顯示狀態
  const interpretationModes = ['fortune', 'traits', 'basis'];
  interpretationModes.forEach(mode => {
    const panel = document.querySelector(`[class*="dashboard-panel"]`);
    if (panel) {
      const isVisible = !panel.hasAttribute('style') || !panel.style.display.includes('none');
      console.log(`  ${mode} 面板可見性: ${isVisible ? '可見' : '隱藏'}`);
    }
  });
}

// 6. 測試手動強制更新
function testManualUpdate() {
  console.log('6. 測試手動強制更新:');
  
  // 嘗試調用刷新函數
  if (window.refreshTraitDeconstruction) {
    console.log('  執行特質解構刷新...');
    window.refreshTraitDeconstruction();
  }
  
  if (window.refreshAstrologicalBasis) {
    console.log('  執行命理依據刷新...');
    window.refreshAstrologicalBasis();
  }
  
  // 檢查是否有開發模式的刷新按鈕
  const refreshButtons = document.querySelectorAll('.refresh-btn');
  console.log(`  找到刷新按鈕: ${refreshButtons.length} 個`);
  
  if (refreshButtons.length > 0) {
    console.log('  點擊第一個刷新按鈕...');
    refreshButtons[0].click();
  }
}

// 7. 檢查命盤資料結構
function checkChartDataStructure() {
  console.log('7. 檢查命盤資料結構:');
  
  const chartData = sessionStorage.getItem('peixuan_purple_star_chart');
  if (chartData) {
    try {
      const chart = JSON.parse(chartData);
      console.log('  命盤基本結構:');
      console.log(`    宮位數量: ${chart.palaces?.length || 0}`);
      console.log(`    命宮天干: ${chart.mingGan || '未知'}`);
      console.log(`    五行局: ${chart.fiveElementsBureau || '未知'}`);
      
      // 檢查宮位星曜資料
      if (chart.palaces) {
        chart.palaces.forEach((palace, index) => {
          const starCount = palace.stars?.length || 0;
          console.log(`    ${palace.name}: ${starCount} 顆星曜`);
        });
      }
      
      // 檢查星曜五行屬性
      let elementCount = 0;
      if (chart.palaces) {
        chart.palaces.forEach(palace => {
          palace.stars?.forEach(star => {
            if (star.element) elementCount++;
          });
        });
      }
      console.log(`  有五行屬性的星曜: ${elementCount} 顆`);
      
    } catch (e) {
      console.log(`  命盤資料解析失敗: ${e.message}`);
    }
  } else {
    console.log('  無命盤資料');
  }
}

// 執行所有檢查
function runAllChecks() {
  checkSessionStorageData();
  console.log('');
  checkVueComponents();
  console.log('');
  checkPropsFlow();
  console.log('');
  checkWatchers();
  console.log('');
  checkConditionalRendering();
  console.log('');
  testManualUpdate();
  console.log('');
  checkChartDataStructure();
  
  console.log('=== 調試檢查完成 ===');
  console.log('建議操作:');
  console.log('1. 如果命盤資料存在但組件未更新，檢查 props 傳遞');
  console.log('2. 如果在開發模式，嘗試點擊刷新按鈕');
  console.log('3. 檢查瀏覽器控制台是否有 Vue 警告或錯誤');
  console.log('4. 使用 Vue DevTools 檢查組件狀態');
}

// 導出到全域以便在控制台調用
window.debugComponentUpdate = runAllChecks;
window.checkSessionStorageData = checkSessionStorageData;
window.checkChartDataStructure = checkChartDataStructure;

// 立即執行檢查
runAllChecks();