# 四化飛星與流年太歲實施計畫

**基於**: `doc/四化飛星頂層彙總&流年太歲計算.md`  
**預估時間**: 10-14 小時  
**優先級**: 高（核心功能缺口）

---

## 📊 現狀分析

### ✅ 已完成功能

**流年計算基礎** (Sprint 4):
- `getAnnualPillar()` - 年柱計算（立春為界）
- `hasPassedLiChun()` - 立春判定
- `locateAnnualLifePalace()` - 流年命宮定位
- `rotateAnnualPalaces()` - 流年宮位旋轉

**干支交互分析** (Sprint 4):
- `detectStemCombinations()` - 天干五合
- `detectBranchClashes()` - 地支六沖（含嚴重度）
- `detectHarmoniousCombinations()` - 三合/三會

### ❌ 缺失功能

**模組一：四化飛星** (完全未實現):
- 四化規則引擎
- 飛星圖論模型
- 循環檢測算法
- 壓力匯聚點分析

**模組二：流年太歲** (部分實現):
- ✅ 沖太歲（六沖已實現）
- ❌ 值太歲（本命年）
- ❌ 刑太歲（三刑）
- ❌ 破太歲（六破）
- ❌ 害太歲（六害）

---

## 🎯 實施策略

### Phase 1: 流年太歲完成 (4-6h) - 優先

**原因**: 
- 基礎已完成 70%
- 只需補充 4 種犯太歲檢測
- 可快速交付價值

**任務分解**:

#### Task 1.1: 值太歲檢測 (30 min)
```typescript
// peixuan-worker/src/services/annual/taiSuiDetection.ts
export function detectZhiTaiSui(
  annualBranch: EarthlyBranch,
  natalBranch: EarthlyBranch
): boolean {
  return annualBranch === natalBranch;
}
```

#### Task 1.2: 刑太歲檢測 (1h)
```typescript
const XING_RELATIONS = {
  // 三刑
  '寅巳申': ['寅', '巳', '申'],
  '丑戌未': ['丑', '戌', '未'],
  // 自刑
  '辰辰': ['辰'],
  '午午': ['午'],
  '酉酉': ['酉'],
  '亥亥': ['亥'],
  // 無恩之刑
  '子卯': ['子', '卯'],
};

export function detectXingTaiSui(
  annualBranch: EarthlyBranch,
  natalBranches: EarthlyBranch[]
): XingTaiSuiResult {
  // 檢測三刑、自刑、無恩之刑
}
```

#### Task 1.3: 破太歲檢測 (45 min)
```typescript
const PO_RELATIONS: Record<EarthlyBranch, EarthlyBranch> = {
  '子': '酉', '酉': '子',
  '丑': '辰', '辰': '丑',
  '寅': '亥', '亥': '寅',
  '卯': '午', '午': '卯',
  '巳': '申', '申': '巳',
  '未': '戌', '戌': '未',
};

export function detectPoTaiSui(
  annualBranch: EarthlyBranch,
  natalBranch: EarthlyBranch
): boolean {
  return PO_RELATIONS[annualBranch] === natalBranch;
}
```

#### Task 1.4: 害太歲檢測 (45 min)
```typescript
const HAI_RELATIONS: Record<EarthlyBranch, EarthlyBranch> = {
  '子': '未', '未': '子',
  '丑': '午', '午': '丑',
  '寅': '巳', '巳': '寅',
  '卯': '辰', '辰': '卯',
  '申': '亥', '亥': '申',
  '酉': '戌', '戌': '酉',
};

export function detectHaiTaiSui(
  annualBranch: EarthlyBranch,
  natalBranch: EarthlyBranch
): boolean {
  return HAI_RELATIONS[annualBranch] === natalBranch;
}
```

#### Task 1.5: 整合與測試 (1-2h)
```typescript
// peixuan-worker/src/services/annual/taiSuiAnalysis.ts
export interface TaiSuiAnalysisResult {
  zhi: boolean;      // 值太歲
  chong: boolean;    // 沖太歲
  xing: XingType[];  // 刑太歲（三刑/自刑/無恩）
  po: boolean;       // 破太歲
  hai: boolean;      // 害太歲
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export function analyzeTaiSui(
  annualPillar: Pillar,
  natalChart: FourPillars
): TaiSuiAnalysisResult {
  // 整合所有檢測
  // 計算綜合嚴重度
}
```

**測試覆蓋**:
- 值太歲：本命年案例（12 個地支）
- 刑太歲：三刑組合（寅巳申、丑戌未）、自刑（辰午酉亥）、無恩（子卯）
- 破太歲：六破組合（6 對）
- 害太歲：六害組合（6 對）
- 綜合案例：多重犯太歲

**驗收標準**:
- [ ] 所有 5 種犯太歲檢測函數實現
- [ ] 單元測試覆蓋率 > 90%
- [ ] 整合到 AnnualFortune 模組
- [ ] API 返回 taiSuiAnalysis 欄位

---

### Phase 2: 四化飛星基礎 (6-8h) - 次要

**原因**:
- 全新功能，需完整設計
- 涉及圖論算法
- 需要大量測試

**任務分解**:

#### Task 2.1: 資料結構設計 (1h)
```typescript
// peixuan-worker/src/types/sihua.ts

export type SiHuaType = 'Lu' | 'Quan' | 'Ke' | 'Ji'; // 祿權科忌

export interface SiHuaRule {
  stem: HeavenlyStem;           // 觸發天干
  star: string;                 // 星曜名稱
  sihuaType: SiHuaType;         // 四化類型
}

export interface FlyingStarEdge {
  source: PalaceId;             // 源宮位
  target: PalaceId;             // 目標宮位
  star: string;                 // 飛化星曜
  sihuaType: SiHuaType;         // 四化類型
  stemSource: HeavenlyStem;     // 觸發天干
}

export interface SiHuaGraph {
  nodes: PalaceId[];            // 12 宮位
  edges: FlyingStarEdge[];      // 飛星邊
}

export interface SiHuaCycle {
  palaces: PalaceId[];          // 構成循環的宮位
  sihuaType: SiHuaType;         // 循環類型
  severity: 'low' | 'medium' | 'high';
}

export interface StressNexus {
  palace: PalaceId;             // 壓力宮位
  inDegree: number;             // 入度（接收化忌數量）
  sources: PalaceId[];          // 壓力來源宮位
}
```

#### Task 2.2: 四化規則引擎 (2h)
```typescript
// peixuan-worker/src/services/sihua/sihuaRules.ts

// 四化規則表（基於研究文件）
const SIHUA_RULES: Record<HeavenlyStem, Record<SiHuaType, string>> = {
  '甲': { Lu: '廉貞', Quan: '破軍', Ke: '武曲', Ji: '太陽' },
  '乙': { Lu: '天機', Quan: '天梁', Ke: '紫微', Ji: '太陰' },
  '丙': { Lu: '天同', Quan: '天機', Ke: '文昌', Ji: '廉貞' },
  '丁': { Lu: '太陰', Quan: '天同', Ke: '天機', Ji: '巨門' },
  '戊': { Lu: '貪狼', Quan: '太陰', Ke: '右弼', Ji: '天機' },
  '己': { Lu: '武曲', Quan: '貪狼', Ke: '天梁', Ji: '文曲' },
  '庚': { Lu: '太陽', Quan: '武曲', Ke: '太陰', Ji: '天同' },
  '辛': { Lu: '巨門', Quan: '太陽', Ke: '文曲', Ji: '文昌' },
  '壬': { Lu: '天梁', Quan: '紫微', Ke: '左輔', Ji: '武曲' },
  '癸': { Lu: '破軍', Quan: '巨門', Ke: '太陰', Ji: '貪狼' },
};

export function getSiHuaForStem(stem: HeavenlyStem): Record<SiHuaType, string> {
  return SIHUA_RULES[stem];
}

export function buildSiHuaRules(
  lifePalaceStem: HeavenlyStem,
  yearStem: HeavenlyStem,
  monthStem: HeavenlyStem,
  dayStem: HeavenlyStem,
  hourStem: HeavenlyStem
): SiHuaRule[] {
  // 為每個天干生成四化規則
}
```

#### Task 2.3: 飛星圖構建 (2h)
```typescript
// peixuan-worker/src/services/sihua/flyingStarGraph.ts

export function buildFlyingStarGraph(
  palaces: Palace[],
  sihuaRules: SiHuaRule[]
): SiHuaGraph {
  const edges: FlyingStarEdge[] = [];
  
  // 對每個宮位
  for (const palace of palaces) {
    // 找出該宮位的主星
    const mainStars = palace.stars.filter(s => isMainStar(s));
    
    // 對每個主星，檢查是否有四化
    for (const star of mainStars) {
      const sihua = sihuaRules.find(r => r.star === star.name);
      if (sihua) {
        // 飛化到對宮、三方等
        const targets = calculateFlyingTargets(palace.id);
        for (const target of targets) {
          edges.push({
            source: palace.id,
            target,
            star: star.name,
            sihuaType: sihua.sihuaType,
            stemSource: sihua.stem,
          });
        }
      }
    }
  }
  
  return {
    nodes: palaces.map(p => p.id),
    edges,
  };
}
```

#### Task 2.4: 循環檢測算法 (2h)
```typescript
// peixuan-worker/src/services/sihua/cycleDetection.ts

export function detectJiCycles(graph: SiHuaGraph): SiHuaCycle[] {
  // 僅考慮化忌的邊
  const jiEdges = graph.edges.filter(e => e.sihuaType === 'Ji');
  
  // DFS 檢測循環
  const cycles: SiHuaCycle[] = [];
  const visited = new Set<PalaceId>();
  const recStack = new Set<PalaceId>();
  
  function dfs(node: PalaceId, path: PalaceId[]): void {
    visited.add(node);
    recStack.add(node);
    path.push(node);
    
    // 找出所有從 node 出發的化忌邊
    const outEdges = jiEdges.filter(e => e.source === node);
    
    for (const edge of outEdges) {
      if (!visited.has(edge.target)) {
        dfs(edge.target, [...path]);
      } else if (recStack.has(edge.target)) {
        // 找到循環
        const cycleStart = path.indexOf(edge.target);
        cycles.push({
          palaces: path.slice(cycleStart),
          sihuaType: 'Ji',
          severity: calculateCycleSeverity(path.slice(cycleStart)),
        });
      }
    }
    
    recStack.delete(node);
  }
  
  for (const node of graph.nodes) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }
  
  return cycles;
}

export function detectLuCycles(graph: SiHuaGraph): SiHuaCycle[] {
  // 類似邏輯，檢測化祿循環
}
```

#### Task 2.5: 壓力匯聚點分析 (1h)
```typescript
// peixuan-worker/src/services/sihua/stressAnalysis.ts

export function analyzeStressNexus(graph: SiHuaGraph): StressNexus[] {
  const jiEdges = graph.edges.filter(e => e.sihuaType === 'Ji');
  const nexusMap = new Map<PalaceId, StressNexus>();
  
  // 計算每個宮位的化忌入度
  for (const edge of jiEdges) {
    if (!nexusMap.has(edge.target)) {
      nexusMap.set(edge.target, {
        palace: edge.target,
        inDegree: 0,
        sources: [],
      });
    }
    const nexus = nexusMap.get(edge.target)!;
    nexus.inDegree++;
    nexus.sources.push(edge.source);
  }
  
  // 返回入度 > 1 的宮位（壓力匯聚點）
  return Array.from(nexusMap.values())
    .filter(n => n.inDegree > 1)
    .sort((a, b) => b.inDegree - a.inDegree);
}
```

#### Task 2.6: 整合與測試 (1-2h)
```typescript
// peixuan-worker/src/services/sihua/sihuaAnalysis.ts

export interface SiHuaAnalysisResult {
  graph: SiHuaGraph;
  jiCycles: SiHuaCycle[];       // 化忌循環（業力迴圈）
  luCycles: SiHuaCycle[];       // 化祿循環（資源閉環）
  stressNexus: StressNexus[];   // 壓力匯聚點
  summary: {
    hasKarmicCycles: boolean;
    criticalPalaces: PalaceId[];
    recommendations: string[];
  };
}

export function analyzeSiHua(
  palaces: Palace[],
  fourPillars: FourPillars
): SiHuaAnalysisResult {
  // 1. 建立四化規則
  const sihuaRules = buildSiHuaRules(
    fourPillars.year.stem,
    fourPillars.month.stem,
    fourPillars.day.stem,
    fourPillars.hour.stem
  );
  
  // 2. 構建飛星圖
  const graph = buildFlyingStarGraph(palaces, sihuaRules);
  
  // 3. 檢測循環
  const jiCycles = detectJiCycles(graph);
  const luCycles = detectLuCycles(graph);
  
  // 4. 分析壓力點
  const stressNexus = analyzeStressNexus(graph);
  
  // 5. 生成摘要
  const summary = generateSummary(jiCycles, luCycles, stressNexus);
  
  return {
    graph,
    jiCycles,
    luCycles,
    stressNexus,
    summary,
  };
}
```

**測試覆蓋**:
- 四化規則：10 天干 × 4 化 = 40 組合
- 飛星圖構建：不同命盤配置
- 循環檢測：有循環/無循環案例
- 壓力點分析：多重化忌案例

**驗收標準**:
- [ ] 四化規則引擎完整
- [ ] 飛星圖構建正確
- [ ] DFS 循環檢測實現
- [ ] 壓力點分析實現
- [ ] 單元測試覆蓋率 > 85%
- [ ] 整合到 UnifiedCalculator

---

## 📅 實施時程

### 建議排程

**Week 2 (當前週)**:
- Phase 1: 流年太歲完成 (4-6h)
- 目標：補齊 4 種犯太歲檢測

**Week 3**:
- Phase 2: 四化飛星基礎 (6-8h)
- 目標：完成圖論模型與循環檢測

**總計**: 10-14 小時

---

## 🎯 優先級建議

### 立即執行 (本週)
✅ **Phase 1: 流年太歲** - 快速補齊缺口

### 下週執行
⏳ **Phase 2: 四化飛星** - 複雜功能，需完整時間

---

## 📊 風險評估

| 風險 | 影響 | 緩解措施 |
|------|------|----------|
| 四化規則派別差異 | 中 | 採用主流派別（飛星派），模組化設計便於擴展 |
| 圖論算法複雜度 | 高 | 使用成熟算法（DFS），充分測試 |
| 測試案例不足 | 中 | 參考命理書籍，建立標準測試集 |
| 前端顯示複雜 | 低 | 先實現後端，前端可視化後續迭代 |

---

## 📝 依賴項

**Phase 1 依賴**:
- ✅ Annual pillar calculation (已完成)
- ✅ Branch interaction detection (已完成)

**Phase 2 依賴**:
- ✅ Palace structure (已完成)
- ✅ Star positioning (已完成)
- ❌ 四化規則表（需補充）
- ❌ 飛星邏輯（需實現）

---

## 🔗 相關文件

- 研究文件：`doc/四化飛星頂層彙總&流年太歲計算.md`
- 現有實現：`peixuan-worker/src/services/annual/`
- 測試檔案：`peixuan-worker/src/services/annual/__tests__/`
