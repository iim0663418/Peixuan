# P0 擴展實施規格：三層四化飛星修正
## 問題嚴重性升級：大限/流年邏輯同樣錯誤

### 🚨 Critical 問題範圍擴大

用戶正確指出，不僅 `generateNatalEdges` 有宮位天干計算錯誤，`generateDecadeEdges` 和 `generateAnnualEdges` 也使用了相同的錯誤邏輯。這意味著：

1. **本命四化**: 使用錯誤的 `getPalaceStem(lifePalaceStem, palaceIndex)`
2. **大限四化**: 使用錯誤的 `getPalaceStem(decadeStem, palaceIndex)`  
3. **流年四化**: 使用錯誤的 `getPalaceStem(annualStem, palaceIndex)`

### 🎯 統一修正方案

#### 1. 修正後的 getPalaceStem 函數
```typescript
/**
 * 計算宮位天干 - 使用五虎遁法則
 * 
 * 五虎遁口訣：
 * 甲己之年丙作首 (甲/己年 -> 寅宮起丙)
 * 乙庚之歲戊為頭 (乙/庚年 -> 寅宮起戊)  
 * 丙辛之歲庚寅上 (丙/辛年 -> 寅宮起庚)
 * 丁壬壬寅順行流 (丁/壬年 -> 寅宮起壬)
 * 戊癸之年甲寅起 (戊/癸年 -> 寅宮起甲)
 * 
 * @param baseStem - 基準天干 (本命用生年天干，大限用大限天干，流年用流年天干)
 * @param palaceIndex - 宮位索引 (0=子, 1=丑, 2=寅, ..., 11=亥)
 * @returns 該宮位的天干
 */
export function getPalaceStem(baseStem: string, palaceIndex: number): HeavenlyStem | '' {
  if (!isHeavenlyStem(baseStem)) return '';
  
  const baseStemIdx = HEAVENLY_STEMS.indexOf(baseStem);
  
  // 五虎遁公式：寅宮天干索引 = ((基準天干索引 % 5) * 2 + 2) % 10
  const yinPalaceStemIdx = ((baseStemIdx % 5) * 2 + 2) % 10;
  
  // 計算目標宮位相對於寅宮(索引2)的偏移
  const offsetFromYin = palaceIndex - 2;
  
  // 計算最終天干索引 (加20確保正數)
  const finalStemIdx = (yinPalaceStemIdx + offsetFromYin + 20) % 10;
  
  return HEAVENLY_STEMS[finalStemIdx];
}
```

#### 2. 修正後的三個邊生成函數

```typescript
/**
 * 生成本命四化邊 (使用生年天干)
 */
export function generateNatalEdges(
  palaces: Palace[],
  lifePalaceStem: string  // 這裡應該是生年天干，不是命宮天干
): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];
  
  if (!palaces || palaces.length !== 12) return edges;
  
  // 遍歷12宮，每宮用生年天干計算該宮天干
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    const sourceStem = getPalaceStem(lifePalaceStem, sourceIdx);
    
    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) continue;
    
    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];
    
    // 生成四化邊
    ['lu', 'quan', 'ke', 'ji'].forEach((type) => {
      const starName = sourceTransforms[type as keyof typeof sourceTransforms];
      const targetIdx = findStarPalace(palaces, starName);
      
      if (targetIdx !== -1) {
        edges.push({
          source: sourceIdx,
          target: targetIdx,
          sihuaType: TYPE_MAP[type],
          starName,
          layer: 'natal',
          weight: 1.0,
          sourceStem,
        });
      }
    });
  }
  
  return edges;
}

/**
 * 生成大限四化邊 (使用大限天干)
 */
export function generateDecadeEdges(
  palaces: Palace[],
  decadeStem: string  // 大限天干
): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];
  
  if (!palaces || palaces.length !== 12 || !decadeStem) return edges;
  
  // 遍歷12宮，每宮用大限天干計算該宮天干
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    const sourceStem = getPalaceStem(decadeStem, sourceIdx);
    
    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) continue;
    
    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];
    
    // 生成四化邊 (權重0.7)
    ['lu', 'quan', 'ke', 'ji'].forEach((type) => {
      const starName = sourceTransforms[type as keyof typeof sourceTransforms];
      const targetIdx = findStarPalace(palaces, starName);
      
      if (targetIdx !== -1) {
        edges.push({
          source: sourceIdx,
          target: targetIdx,
          sihuaType: TYPE_MAP[type],
          starName,
          layer: 'decade',
          weight: 0.7,
          sourceStem,
        });
      }
    });
  }
  
  return edges;
}

/**
 * 生成流年四化邊 (使用流年天干)
 */
export function generateAnnualEdges(
  palaces: Palace[],
  annualStem: string  // 流年天干
): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];
  
  if (!palaces || palaces.length !== 12 || !annualStem) return edges;
  
  // 遍歷12宮，每宮用流年天干計算該宮天干
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    const sourceStem = getPalaceStem(annualStem, sourceIdx);
    
    if (!sourceStem || !FOUR_TRANSFORMATIONS_MAP[sourceStem]) continue;
    
    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];
    
    // 生成四化邊 (權重0.5)
    ['lu', 'quan', 'ke', 'ji'].forEach((type) => {
      const starName = sourceTransforms[type as keyof typeof sourceTransforms];
      const targetIdx = findStarPalace(palaces, starName);
      
      if (targetIdx !== -1) {
        edges.push({
          source: sourceIdx,
          target: targetIdx,
          sihuaType: TYPE_MAP[type],
          starName,
          layer: 'annual',
          weight: 0.5,
          sourceStem,
        });
      }
    });
  }
  
  return edges;
}
```

### 🧪 測試影響評估

#### 破壞性變更
1. **所有四化相關測試**: 本命/大限/流年的四化邊都會改變
2. **圖論分析結果**: 循環檢測、中心性分析結果完全不同
3. **AI 分析內容**: 基於四化的運勢分析將產生不同結果

#### 驗證需求
1. **手工驗證**: 至少3個真實命盤的四化飛星計算
2. **回歸測試**: 更新所有相關測試快照
3. **端到端測試**: 確保 AI 分析仍能正常運作

### 🚀 實施優先級

**P0 Critical**: 三層四化邊生成函數同步修正
- 影響範圍：整個四化飛星系統
- 修正複雜度：中等 (統一邏輯)
- 測試工作量：高 (大量快照更新)

### 📋 實施檢查清單

- [ ] 修正 `getPalaceStem` 函數
- [ ] 更新 `generateNatalEdges` 
- [ ] 更新 `generateDecadeEdges`
- [ ] 更新 `generateAnnualEdges`
- [ ] 更新相關類型定義
- [ ] 修正所有單元測試
- [ ] 手工驗證真實命盤
- [ ] 端到端測試驗證
