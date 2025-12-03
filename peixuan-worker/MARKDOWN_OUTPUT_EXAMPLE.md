# 命理分析結果

---

## 📋 基本資訊

- **出生日期**：2000-01-01 04:00:00
- **性別**：男
- **經度**：121.5°E
- **真太陽時**：2000-01-01 04:04:37
- **儒略日**：2451544
---

## 🎋 八字四柱

### 四柱
| 柱位 | 天干 | 地支 |
|------|------|------|
| 年柱 | 己 | 卯 |
| 月柱 | 丁 | 卯 |
| 日柱 | 癸 | 丑 |
| 時柱 | 甲 | 子 |

### 藏干

**年柱藏干**
- 主氣：乙

**月柱藏干**
- 主氣：乙

**日柱藏干**
- 主氣：己
- 中氣：癸
- 餘氣：辛

**時柱藏干**
- 主氣：癸

### 十神關係
- 年干（己）→ 日主（癸）：**七殺**
- 月干（丁）→ 日主（癸）：**偏財**
- 時干（甲）→ 日主（癸）：**傷官**

### 五行分布
**原始分布**
- 木：0
- 火：0
- 土：0
- 金：0
- 水：0

**調整後分布**
- 木：4.5
- 火：1.3
- 土：1.1199999999999999
- 金：0.05
- 水：2.3
**平衡度**：18.9%
---

## 🔄 大運流年

### 起運資訊
- **起運日期**：2008-01-30 04:00:00
- **運行方向**：逆行

### 大運列表

| 大運 | 干支 | 年齡範圍 | 時間範圍 |
|------|------|----------|----------|
| 第1運 | 丙寅 | 8-18歲 | 2008-2018 |
| 第2運 | 乙丑 | 18-28歲 | 2018-2028 |
| 第3運 | 甲子 | 28-38歲 | 2028-2038 |
| 第4運 | 癸亥 | 38-48歲 | 2038-2048 |
| 第5運 | 壬戌 | 48-58歲 | 2048-2058 |
| 第6運 | 辛酉 | 58-68歲 | 2058-2068 |
| 第7運 | 庚申 | 68-78歲 | 2068-2078 |
| 第8運 | 己未 | 78-88歲 | 2078-2088 |
| 第9運 | 戊午 | 88-98歲 | 2088-2098 |
| 第10運 | 丁巳 | 98-108歲 | 2098-2108 |

**當前大運**：乙丑（18-28歲）
---

## 🌟 紫微斗數

### 命盤基本資訊
- **命宮**：子宮（第0宮）
- **身宮**：戌宮（第10宮）
- **五行局**：水二局

### 主星分布
- **紫微星**：第1宮
- **天府星**：第3宮

### 輔星分布
- **文昌**：第10宮
- **文曲**：第4宮
- **左輔**：第2宮
- **右弼**：第0宮

### 星曜對稱性
- 紫微（第1宮）↔ 天府（第3宮）：opposite
- 天府（第3宮）↔ 紫微（第1宮）：opposite
- 文昌（第10宮）↔ 文曲（第4宮）：pair
- 文曲（第4宮）↔ 文昌（第10宮）：pair
- 左辅（第2宮）↔ 右弼（第0宮）：pair
- 右弼（第0宮）↔ 左辅（第2宮）：pair

### 十二宮位

| 宮位 | 地支 | 主星 |
|------|------|------|
| undefined | 子 | 天機、右弼 |
| undefined | 丑 | 紫微、破軍 |
| undefined | 寅 | 左輔 |
| undefined | 卯 | 天府 |
| undefined | 辰 | 太陰、文曲 |
| undefined | 巳 | 廉貞、貪狼 |
| undefined | 午 | 巨門 |
| undefined | 未 | 天相 |
| undefined | 申 | 天同、天梁 |
| undefined | 酉 | 武曲、七殺 |
| undefined | 戌 | 太陽、文昌 |
| undefined | 亥 | 無 |
---

## 📅 流年分析

### 流年年柱
- **干支**：乙巳

### 太歲分析
- **犯太歲類型**：刑太歲
- **嚴重程度**：none
- **總分**：undefined
---

## 🔧 計算步驟

### 八字計算步驟

**步驟 1：Calculate true solar time based on longitude**
- 輸入：`{"solarDate":"2000-01-01T04:00:00.000Z","longitude":121.5}`
- 輸出：`"2000-01-01T04:04:37.390Z"`

**步驟 2：Convert solar date to Julian day number**
- 輸入：`{"solarDate":"2000-01-01T04:00:00.000Z"}`
- 輸出：`2451544`

**步驟 3：Calculate year pillar using Lichun boundary**
- 輸入：`{"solarDate":"2000-01-01T04:00:00.000Z","lichunTime":"2000-02-04T12:40:24.000Z"}`
- 輸出：`{"stem":"己","branch":"卯"}`

**步驟 4：Calculate month pillar using solar longitude**
- 輸入：`{"monthBranchIndex":1,"yearStemIndex":5}`
- 輸出：`{"stem":"丁","branch":"卯"}`

**步驟 5：Calculate day pillar using Julian day method**
- 輸入：`{"solarDate":"2000-01-01T04:00:00.000Z"}`
- 輸出：`{"stem":"癸","branch":"丑"}`

**步驟 6：Calculate hour pillar using true solar time**
- 輸入：`{"trueSolarTime":"2000-01-01T04:04:37.390Z","dayStemIndex":9}`
- 輸出：`{"stem":"甲","branch":"子"}`

**步驟 7：Calculate WuXing distribution with seasonality adjustment**
- 輸入：`{"fourPillars":{"year":{"stem":"己","branch":"卯"},"month":{"stem":"丁","branch":"卯"},"day":{"stem":"癸","branch":"丑"},"hour":{"stem":"甲","branch":"子"}}}`
- 輸出：`{"raw":{"tiangan":{"Wood":1,"Fire":1,"Earth":1,"Metal":0,"Water":1},"hiddenStems":{"Wood":2,"Fire":0,"Earth":0.6,"Metal":0.1,"Water":1.3}},"adjusted":{"Wood":4.5,"Fire":1.3,"Earth":1.1199999999999999,"Metal":0.05,"Water":2.3},"dominant":"Wood","deficient":"Metal","balance":0.18913110907769004}`

**步驟 8：Calculate QiYun date and fortune direction**
- 輸入：`{"birthDate":"2000-01-01T04:00:00.000Z","yearStem":"己","gender":"male","trueSolarTime":"2000-01-01T04:04:37.390Z"}`
- 輸出：`{"qiyunDate":"2008-01-30T04:00:00.000Z","direction":"backward"}`

**步驟 9：Generate 10-year fortune cycles and identify current cycle**
- 輸入：`{"monthPillar":{"stem":"丁","branch":"卯"},"birthDate":"2000-01-01T04:00:00.000Z","qiyunDate":"2008-01-30T04:00:00.000Z","direction":"backward","count":10}`
- 輸出：`{"dayunList":[{"stem":"丙","branch":"寅","startAge":8,"endAge":18},{"stem":"乙","branch":"丑","startAge":18,"endAge":28},{"stem":"甲","branch":"子","startAge":28,"endAge":38},{"stem":"癸","branch":"亥","startAge":38,"endAge":48},{"stem":"壬","branch":"戌","startAge":48,"endAge":58},{"stem":"辛","branch":"酉","startAge":58,"endAge":68},{"stem":"庚","branch":"申","startAge":68,"endAge":78},{"stem":"己","branch":"未","startAge":78,"endAge":88},{"stem":"戊","branch":"午","startAge":88,"endAge":98},{"stem":"丁","branch":"巳","startAge":98,"endAge":108}],"currentDayun":{"stem":"乙","branch":"丑","startDate":"2018-01-30T04:00:00.000Z","endDate":"2028-01-30T04:00:00.000Z","startAge":18,"endAge":28}}`

### 紫微斗數計算步驟

**步驟 1：Convert solar date to lunar calendar**
- 輸入：`{"solarDate":"2000-01-01T04:00:00.000Z"}`
- 輸出：`{"lunarMonth":11,"lunarDay":25}`

**步驟 2：Calculate life palace (命宫) position**
- 輸入：`{"lunarMonth":11,"hourBranch":0,"isLeapMonth":false}`
- 輸出：`{"position":0,"branch":"子"}`

**步驟 3：Calculate body palace (身宫) position**
- 輸入：`{"lunarMonth":11,"hourBranch":0}`
- 輸出：`{"position":10,"branch":"戌"}`

**步驟 4：Calculate five elements bureau (五行局)**
- 輸入：`{"lifePalaceStem":"丙","lifePalaceBranch":"子"}`
- 輸出：`2`

**步驟 5：Calculate ZiWei star (紫微星) position**
- 輸入：`{"lunarDay":25,"bureau":2}`
- 輸出：`1`

**步驟 6：Calculate TianFu star (天府星) position based on ZiWei**
- 輸入：`{"ziWeiPosition":1}`
- 輸出：`3`

**步驟 7：Calculate time-based auxiliary stars (文昌/文曲)**
- 輸入：`{"hourBranch":0}`
- 輸出：`{"wenChang":10,"wenQu":4}`

**步驟 8：Calculate month-based auxiliary stars (左辅/右弼)**
- 輸入：`{"lunarMonth":11}`
- 輸出：`{"zuoFu":2,"youBi":0}`

**步驟 9：Generate 12 palaces array with earthly branches**
- 輸入：`{"lifePalacePosition":0,"lifePalaceBranch":"子"}`
- 輸出：`[{"position":0,"branch":"子","stars":[{"name":"天機","brightness":"neutral"},{"name":"右弼","brightness":"neutral"}]},{"position":1,"branch":"丑","stars":[{"name":"紫微","brightness":"neutral"},{"name":"破軍","brightness":"neutral"}]},{"position":2,"branch":"寅","stars":[{"name":"左輔","brightness":"neutral"}]},{"position":3,"branch":"卯","stars":[{"name":"天府","brightness":"neutral"}]},{"position":4,"branch":"辰","stars":[{"name":"太陰","brightness":"neutral"},{"name":"文曲","brightness":"neutral"}]},{"position":5,"branch":"巳","stars":[{"name":"廉貞","brightness":"neutral"},{"name":"貪狼","brightness":"neutral"}]},{"position":6,"branch":"午","stars":[{"name":"巨門","brightness":"neutral"}]},{"position":7,"branch":"未","stars":[{"name":"天相","brightness":"neutral"}]},{"position":8,"branch":"申","stars":[{"name":"天同","brightness":"neutral"},{"name":"天梁","brightness":"neutral"}]},{"position":9,"branch":"酉","stars":[{"name":"武曲","brightness":"neutral"},{"name":"七殺","brightness":"neutral"}]},{"position":10,"branch":"戌","stars":[{"name":"太陽","brightness":"neutral"},{"name":"文昌","brightness":"neutral"}]},{"position":11,"branch":"亥","stars":[]}]`

**步驟 10：Populate palaces with main stars (ZiWei + TianFu systems) and auxiliary stars**
- 輸入：`{"ziWeiPosition":1,"tianFuPosition":3,"hourBranch":0,"lunarMonth":11}`
- 輸出：`{"totalStars":18}`

**步驟 11：Calculate current decade (大限) palace stem**
- 輸入：`{"birthDate":"2000-01-01T04:00:00.000Z","bureau":2,"yearStem":"己","gender":"male"}`
- 輸出：`"丙"`

**步驟 12：Aggregate SiHua flying stars analysis (cycles, centrality, graph statistics)**
- 輸入：`{"palaces":[{"position":0,"branch":"子","stars":[{"name":"天機","brightness":"neutral"},{"name":"右弼","brightness":"neutral"}]},{"position":1,"branch":"丑","stars":[{"name":"紫微","brightness":"neutral"},{"name":"破軍","brightness":"neutral"}]},{"position":2,"branch":"寅","stars":[{"name":"左輔","brightness":"neutral"}]},{"position":3,"branch":"卯","stars":[{"name":"天府","brightness":"neutral"}]},{"position":4,"branch":"辰","stars":[{"name":"太陰","brightness":"neutral"},{"name":"文曲","brightness":"neutral"}]},{"position":5,"branch":"巳","stars":[{"name":"廉貞","brightness":"neutral"},{"name":"貪狼","brightness":"neutral"}]},{"position":6,"branch":"午","stars":[{"name":"巨門","brightness":"neutral"}]},{"position":7,"branch":"未","stars":[{"name":"天相","brightness":"neutral"}]},{"position":8,"branch":"申","stars":[{"name":"天同","brightness":"neutral"},{"name":"天梁","brightness":"neutral"}]},{"position":9,"branch":"酉","stars":[{"name":"武曲","brightness":"neutral"},{"name":"七殺","brightness":"neutral"}]},{"position":10,"branch":"戌","stars":[{"name":"太陽","brightness":"neutral"},{"name":"文昌","brightness":"neutral"}]},{"position":11,"branch":"亥","stars":[]}],"lifePalaceStem":"丙","decadeStem":"丙","annualStem":"乙"}`
- 輸出：`{"jiCycles":[{"palaces":[10,5],"type":"忌","severity":"low","description":"業力循環: 福德宮 → 疾厄宮 → 福德宮"}],"luCycles":[{"palaces":[5,6,8],"type":"祿","severity":"medium","description":"資源循環: 疾厄宮 → 遷移宮 → 官祿宮 → 疾厄宮"}],"quanCycles":[{"palaces":[0],"type":"權","severity":"low","description":"權力循環: 命宮 → 命宮"},{"palaces":[1,8],"type":"權","severity":"low","description":"權力循環: 兄弟宮 → 官祿宮 → 兄弟宮"}],"keCycles":[{"palaces":[10],"type":"科","severity":"low","description":"名聲循環: 福德宮 → 福德宮"},{"palaces":[4],"type":"科","severity":"low","description":"名聲循環: 財帛宮 → 財帛宮"}],"stressNodes":[{"palace":5,"palaceName":"疾厄宮","inDegree":4,"outDegree":0,"sihuaType":"忌","severity":"high"},{"palace":4,"palaceName":"財帛宮","inDegree":3,"outDegree":0,"sihuaType":"忌","severity":"high"},{"palace":6,"palaceName":"遷移宮","inDegree":2,"outDegree":0,"sihuaType":"忌","severity":"medium"},{"palace":10,"palaceName":"福德宮","inDegree":2,"outDegree":0,"sihuaType":"忌","severity":"medium"},{"palace":0,"palaceName":"命宮","inDegree":1,"outDegree":0,"sihuaType":"忌","severity":"low"},{"palace":8,"palaceName":"官祿宮","inDegree":1,"outDegree":0,"sihuaType":"忌","severity":"low"},{"palace":9,"palaceName":"田宅宮","inDegree":1,"outDegree":0,"sihuaType":"忌","severity":"low"}],"resourceNodes":[{"palace":0,"palaceName":"命宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":1,"palaceName":"兄弟宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":2,"palaceName":"夫妻宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":3,"palaceName":"子女宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":4,"palaceName":"財帛宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":5,"palaceName":"疾厄宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":6,"palaceName":"遷移宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":7,"palaceName":"奴僕宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":8,"palaceName":"官祿宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":9,"palaceName":"田宅宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":10,"palaceName":"福德宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"},{"palace":11,"palaceName":"父母宮","inDegree":0,"outDegree":1,"sihuaType":"祿","severity":"low"}],"powerNodes":[{"palace":0,"palaceName":"命宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":1,"palaceName":"兄弟宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":2,"palaceName":"夫妻宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":3,"palaceName":"子女宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":4,"palaceName":"財帛宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":5,"palaceName":"疾厄宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":6,"palaceName":"遷移宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":7,"palaceName":"奴僕宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":8,"palaceName":"官祿宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":9,"palaceName":"田宅宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":10,"palaceName":"福德宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"},{"palace":11,"palaceName":"父母宮","inDegree":0,"outDegree":1,"sihuaType":"權","severity":"low"}],"fameNodes":[{"palace":0,"palaceName":"命宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":1,"palaceName":"兄弟宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":2,"palaceName":"夫妻宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":3,"palaceName":"子女宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":4,"palaceName":"財帛宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":5,"palaceName":"疾厄宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":6,"palaceName":"遷移宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":7,"palaceName":"奴僕宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":8,"palaceName":"官祿宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":9,"palaceName":"田宅宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":10,"palaceName":"福德宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"},{"palace":11,"palaceName":"父母宮","inDegree":0,"outDegree":1,"sihuaType":"科","severity":"low"}],"totalEdges":56,"edgesByType":{"祿":14,"權":14,"科":14,"忌":14},"edgesByLayer":{"natal":48,"decade":4,"annual":4},"hasJiCycle":true,"hasLuCycle":true,"maxStressPalace":5,"maxResourcePalace":0}`
---

## 📚 元數據

### 八字算法
- **算法**：JulianDayMethod、TrueSolarTimeCorrection、LichunBoundary
- **方法**：FourPillarsCalculation、HiddenStemsExtraction、TenGodsMatrix、SeasonalityAdjustment、MetabolicConversion、FortuneDirection
- **參考文獻**：渊海子平、三命通会、滴天髓

### 紫微斗數算法
- **算法**：ZiWeiPositioning、BureauCalculation、PalacePositioning、SiHuaGraphAnalysis
- **方法**：LunarCalendar、StarSymmetry、AuxiliaryStarPlacement、FlyingStarCycleDetection、CentralityAnalysis
- **參考文獻**：紫微斗数全书、紫微斗数讲义、骨髓赋

**計算時間**：2025-12-03 05:33:36