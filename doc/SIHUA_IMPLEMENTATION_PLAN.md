# 四化飛星頂層彙總實作計劃

## 專案資訊
- **模組**: 四化飛星圖論分析 (SiHua Flying Stars Graph Analysis)
- **預估時間**: 6-8 小時
- **優先級**: MEDIUM
- **狀態**: 規劃中

---

## 一、飛化規則確認（已明確）

### 核心邏輯
**飛化目標確定規則**：
```
發射宮位天干 → 查四化表 → 被四化的星曜 → 星曜所在宮位 = 目標宮位
```

**有向邊定義**：
```typescript
Edge = (N_source, N_target, Type: 祿|權|科|忌)
```

### 飛化層次
1. **生年四化** (Fixed Layer) - 權重最高
2. **大限四化** (Decade Layer) - 權重次之
3. **流年四化** (Annual Layer) - 權重最低

### 四化類型處理
- ✅ **祿 (Lu)**: 資源源頭分析
- ✅ **權 (Quan)**: 權力流動分析
- ✅ **科 (Ke)**: 名聲流動分析
- ✅ **忌 (Ji)**: 壓力匯聚點分析（重點）

---

## 二、數據結構設計

### 2.1 飛星邊 (Flying Star Edge)
```typescript
interface FlyingStarEdge {
  source: number;              // 源宮位索引 (0-11)
  target: number;              // 目標宮位索引 (0-11)
  sihuaType: '祿' | '權' | '科' | '忌';
  starName: string;            // 觸發的星曜名稱
  layer: 'natal' | 'decade' | 'annual';  // 飛化層次
  weight: number;              // 權重 (natal:1.0, decade:0.7, annual:0.5)
  sourceStem: string;          // 觸發天干
}
```

### 2.2 宮位圖 (Palace Graph)
```typescript
interface PalaceGraph {
  nodes: number[];             // [0,1,2,...,11] 十二宮位
  edges: FlyingStarEdge[];     // 所有飛星邊
  adjacencyList: Map<number, FlyingStarEdge[]>;  // 鄰接表
}
```

### 2.3 循環結構 (Cycle)
```typescript
interface SiHuaCycle {
  palaces: number[];           // 構成循環的宮位索引
  type: '祿' | '權' | '科' | '忌';
  severity: 'low' | 'medium' | 'high';  // 嚴重度
  description: string;         // 循環描述
}
```

### 2.4 中心性分析 (Centrality)
```typescript
interface CentralityNode {
  palace: number;              // 宮位索引
  palaceName: string;          // 宮位名稱
  inDegree: number;            // 入度（接收數量）
  outDegree: number;           // 出度（發射數量）
  sihuaType: '祿' | '權' | '科' | '忌';
  severity: 'low' | 'medium' | 'high';
}
```

### 2.5 頂層彙總輸出
```typescript
interface SiHuaAggregation {
  // 循環檢測
  jiCycles: SiHuaCycle[];      // 化忌循環（業力迴圈）
  luCycles: SiHuaCycle[];      // 化祿循環（資源閉環）
  quanCycles: SiHuaCycle[];    // 化權循環
  keCycles: SiHuaCycle[];      // 化科循環
  
  // 中心性分析
  stressNodes: CentralityNode[];   // 壓力匯聚點（高入度化忌）
  resourceNodes: CentralityNode[]; // 資源源頭（高出度化祿）
  powerNodes: CentralityNode[];    // 權力中心（高出度化權）
  fameNodes: CentralityNode[];     // 名聲中心（高出度化科）
  
  // 圖論統計
  totalEdges: number;          // 總邊數
  edgesByType: Record<string, number>;  // 各類型邊數
  edgesByLayer: Record<string, number>; // 各層次邊數
  
  // 結構特徵
  hasJiCycle: boolean;         // 是否存在化忌循環
  hasLuCycle: boolean;         // 是否存在化祿循環
  maxStressPalace: number;     // 最大壓力宮位
  maxResourcePalace: number;   // 最大資源宮位
}
```

---

## 三、實作任務拆解

### Task 1: 數據結構與類型定義 (1h)
**檔案**: `peixuan-worker/src/calculation/ziwei/sihua/types.ts`

- [ ] 定義 FlyingStarEdge 介面
- [ ] 定義 PalaceGraph 介面
- [ ] 定義 SiHuaCycle 介面
- [ ] 定義 CentralityNode 介面
- [ ] 定義 SiHuaAggregation 介面
- [ ] 匯出所有類型

### Task 2: 飛化邊生成器 (2-3h)
**檔案**: `peixuan-worker/src/calculation/ziwei/sihua/edgeGenerator.ts`

- [ ] 實作 `generateNatalEdges(palaces, natalStem)` - 生年四化邊
- [ ] 實作 `generateDecadeEdges(palaces, decadeStem)` - 大限四化邊
- [ ] 實作 `generateAnnualEdges(palaces, annualStem)` - 流年四化邊
- [ ] 實作 `buildPalaceGraph(edges)` - 建立圖結構
- [ ] 輔助函數：`findStarPalace(palaces, starName)` - 查找星曜所在宮位
- [ ] 輔助函數：`getPalaceStem(palace)` - 獲取宮位天干

**核心邏輯**：
```typescript
function generateNatalEdges(palaces: Palace[], natalStem: string): FlyingStarEdge[] {
  const edges: FlyingStarEdge[] = [];
  const transformations = FOUR_TRANSFORMATIONS_MAP[natalStem];
  
  // 遍歷12宮位
  for (let sourceIdx = 0; sourceIdx < 12; sourceIdx++) {
    const sourceStem = getPalaceStem(palaces[sourceIdx]);
    const sourceTransforms = FOUR_TRANSFORMATIONS_MAP[sourceStem];
    
    // 生成四化邊
    ['lu', 'quan', 'ke', 'ji'].forEach(type => {
      const starName = sourceTransforms[type];
      const targetIdx = findStarPalace(palaces, starName);
      
      if (targetIdx !== -1) {
        edges.push({
          source: sourceIdx,
          target: targetIdx,
          sihuaType: typeMap[type],
          starName,
          layer: 'natal',
          weight: 1.0,
          sourceStem
        });
      }
    });
  }
  
  return edges;
}
```

### Task 3: 圖論分析算法 (2-3h)
**檔案**: `peixuan-worker/src/calculation/ziwei/sihua/graphAnalysis.ts`

- [ ] 實作 `detectCycles(graph, sihuaType)` - DFS 循環檢測
- [ ] 實作 `calculateInDegree(graph, sihuaType)` - 入度計算
- [ ] 實作 `calculateOutDegree(graph, sihuaType)` - 出度計算
- [ ] 實作 `identifyStressNodes(graph)` - 壓力匯聚點識別
- [ ] 實作 `identifyResourceNodes(graph)` - 資源源頭識別
- [ ] 輔助函數：`dfs(node, visited, stack, graph)` - 深度優先搜尋

**DFS 循環檢測邏輯**：
```typescript
function detectCycles(graph: PalaceGraph, sihuaType: string): SiHuaCycle[] {
  const cycles: SiHuaCycle[] = [];
  const visited = new Set<number>();
  const recStack = new Set<number>();
  const path: number[] = [];
  
  function dfs(node: number): void {
    visited.add(node);
    recStack.add(node);
    path.push(node);
    
    const edges = graph.adjacencyList.get(node) || [];
    const filteredEdges = edges.filter(e => e.sihuaType === sihuaType);
    
    for (const edge of filteredEdges) {
      if (!visited.has(edge.target)) {
        dfs(edge.target);
      } else if (recStack.has(edge.target)) {
        // 找到循環
        const cycleStart = path.indexOf(edge.target);
        const cyclePalaces = path.slice(cycleStart);
        cycles.push({
          palaces: cyclePalaces,
          type: sihuaType,
          severity: calculateCycleSeverity(cyclePalaces, sihuaType),
          description: generateCycleDescription(cyclePalaces, sihuaType)
        });
      }
    }
    
    path.pop();
    recStack.delete(node);
  }
  
  for (let i = 0; i < 12; i++) {
    if (!visited.has(i)) {
      dfs(i);
    }
  }
  
  return cycles;
}
```

### Task 4: 頂層彙總器 (1-2h)
**檔案**: `peixuan-worker/src/calculation/ziwei/sihua/aggregator.ts`

- [ ] 實作 `aggregateSiHua(palaces, natalStem, decadeStem?, annualStem?)` - 主函數
- [ ] 整合邊生成、圖構建、循環檢測、中心性分析
- [ ] 生成 SiHuaAggregation 結構化輸出
- [ ] 計算統計數據
- [ ] 識別結構特徵

**主函數邏輯**：
```typescript
export function aggregateSiHua(
  palaces: Palace[],
  natalStem: string,
  decadeStem?: string,
  annualStem?: string
): SiHuaAggregation {
  // 1. 生成飛化邊
  const natalEdges = generateNatalEdges(palaces, natalStem);
  const decadeEdges = decadeStem ? generateDecadeEdges(palaces, decadeStem) : [];
  const annualEdges = annualStem ? generateAnnualEdges(palaces, annualStem) : [];
  const allEdges = [...natalEdges, ...decadeEdges, ...annualEdges];
  
  // 2. 建立圖結構
  const graph = buildPalaceGraph(allEdges);
  
  // 3. 循環檢測
  const jiCycles = detectCycles(graph, '忌');
  const luCycles = detectCycles(graph, '祿');
  const quanCycles = detectCycles(graph, '權');
  const keCycles = detectCycles(graph, '科');
  
  // 4. 中心性分析
  const stressNodes = identifyStressNodes(graph);
  const resourceNodes = identifyResourceNodes(graph);
  const powerNodes = identifyPowerNodes(graph);
  const fameNodes = identifyFameNodes(graph);
  
  // 5. 統計與特徵
  const totalEdges = allEdges.length;
  const edgesByType = countEdgesByType(allEdges);
  const edgesByLayer = countEdgesByLayer(allEdges);
  
  return {
    jiCycles,
    luCycles,
    quanCycles,
    keCycles,
    stressNodes,
    resourceNodes,
    powerNodes,
    fameNodes,
    totalEdges,
    edgesByType,
    edgesByLayer,
    hasJiCycle: jiCycles.length > 0,
    hasLuCycle: luCycles.length > 0,
    maxStressPalace: stressNodes[0]?.palace ?? -1,
    maxResourcePalace: resourceNodes[0]?.palace ?? -1
  };
}
```

### Task 5: 整合到 ZiWeiResult (0.5h)
**檔案**: `peixuan-worker/src/calculation/types/index.ts`

- [ ] 在 ZiWeiResult 介面添加 `sihuaAggregation?: SiHuaAggregation`
- [ ] 更新 calculator.ts 調用 aggregateSiHua
- [ ] 添加計算步驟記錄

### Task 6: 單元測試 (1-2h)
**檔案**: `peixuan-worker/src/calculation/ziwei/sihua/__tests__/`

- [ ] 測試邊生成邏輯
- [ ] 測試循環檢測算法
- [ ] 測試中心性計算
- [ ] 測試完整彙總流程
- [ ] 邊界情況測試

---

## 四、實作順序

1. **Task 1** (1h) - 數據結構定義
2. **Task 2** (2-3h) - 飛化邊生成器
3. **Task 3** (2-3h) - 圖論分析算法
4. **Task 4** (1-2h) - 頂層彙總器
5. **Task 5** (0.5h) - 整合到 ZiWeiResult
6. **Task 6** (1-2h) - 單元測試

**總計**: 7.5-11.5h（取中位數 ~8h）

---

## 五、技術考量

### 5.1 性能優化
- 使用鄰接表而非鄰接矩陣（稀疏圖）
- DFS 使用迭代而非遞迴（避免堆疊溢出）
- 緩存宮位天干查詢結果

### 5.2 可擴展性
- 支援動態添加飛化層次
- 支援自定義權重配置
- 支援不同派別的四化表

### 5.3 錯誤處理
- 星曜未找到時的處理
- 無效天干的處理
- 空宮位的處理

---

## 六、驗收標準

- [ ] 所有類型定義完整且符合規範
- [ ] 飛化邊生成正確（生年/大限/流年）
- [ ] DFS 循環檢測準確（無漏檢/誤檢）
- [ ] 中心性計算正確
- [ ] 頂層彙總輸出結構完整
- [ ] 單元測試覆蓋率 > 80%
- [ ] 整合到 API 回應正常
- [ ] 性能測試通過（< 100ms）

---

## 七、後續優化

- 視覺化圖論結構（前端）
- 飛化路徑追蹤
- 多層次飛化疊加分析
- 時間序列運勢波動圖
- 不同派別規則切換
