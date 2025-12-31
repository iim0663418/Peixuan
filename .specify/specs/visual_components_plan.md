# Phase 2 Priority 2: Visual Component Library - Implementation Plan

## 1. Executive Strategy
To adhere to the strict performance constraints (keep under 100KB) and ensure perfect visual integration with the existing Element Plus dark theme, we will utilize **Native SVG + Vue Reactivity** instead of importing heavy charting libraries like Chart.js or D3. This approach ensures:
- **Zero additional bundle size impact**.
- **Full styling control** via CSS variables (matching `element-plus-dark.css`).
- **High performance** rendering with Vue 3's efficient DOM patching.

## 2. Component Architecture

### Directory Structure
```text
src/
├── components/
│   ├── visualizations/
│   │   ├── WuXingChart.vue       # Priority 1: 5-Element Radar Chart
│   │   ├── VisualWrapper.vue     # Wrapper for progressive disclosure (Title, Toggle, Tooltip)
│   │   └── common/
│   │       └── LegendItem.vue    # Reusable legend component
├── composables/
│   └── useChartCalculations.ts   # Shared geometry logic (polar to cartesian)
└── types/
    └── visualization.ts          # Shared types for charts
```

## 3. Component Specifications

### 3.1. Shared Types (`src/types/visualization.ts`)
```typescript
export interface ChartDimensions {
  width: number;
  height: number;
  padding: number;
}

export interface WuXingDataPoint {
  element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
  label: string;
  value: number; // Normalized 0-100 or 0-1
  color: string;
}
```

### 3.2. WuXing Chart (`src/components/visualizations/WuXingChart.vue`)

**Concept:** A pentagonal radar chart (Spider Web) representing the 5 elements.
- **Background:** 3 concentric pentagons representing Weak, Balanced, and Strong thresholds.
- **Data Layer:** A semi-transparent filled polygon connecting the calculated values for each element.
- **Interactivity:** Hovering over a vertex highlights the element and shows a tooltip.

**Props Interface:**
```typescript
interface Props {
  data: WuXingDistribution; // From get_life_forces
  size?: number;            // Default 300
  animated?: boolean;       // Default true
}
```

**Implementation Details:**
- **Geometry:** 5 axes at 72-degree intervals (0° starts at top for Wood/Fire convention or adjust to traditional placement).
    - Traditional Order Clockwise: Wood (East/Right), Fire (South/Bottom), Earth (Center/Intermediate), Metal (West/Left), Water (North/Top).
    - *Plan:* Use standard pentagon rotation. Wood (Top), Fire (Top-Right), Earth (Bottom-Right), Metal (Bottom-Left), Water (Top-Left) creates a "Generating Cycle" visual flow.
- **Theme Colors (CSS Variables):**
    - `--color-wood`: `#67C23A` (Element Plus Success)
    - `--color-fire`: `#F56C6C` (Element Plus Danger)
    - `--color-earth`: `#E6A23C` (Element Plus Warning)
    - `--color-metal`: `#909399` (Element Plus Info)
    - `--color-water`: `#409EFF` (Element Plus Primary)

### 3.3. Visual Wrapper (`src/components/visualizations/VisualWrapper.vue`)

**Purpose:** Provides the "Progressive Disclosure" wrapper.
- **Header:** Icon + Title (e.g., "五行能量分布").
- **Content:** The chart (always visible or minimized).
- **Footer/Expand:** "View Details" button to show text analysis/raw numbers.

**Props:**
```typescript
interface WrapperProps {
  title: string;
  icon?: string;
  description?: string;
}
```

## 4. Implementation Steps

### Step 1: Geometry Composable (`useChartCalculations.ts`)
Create a utility to map values to SVG coordinates.
```typescript
export function valueToPoint(
  value: number, 
  index: number, 
  totalPoints: number, 
  radius: number, 
  center: { x: number, y: number }
) {
  const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
  const x = center.x + radius * value * Math.cos(angle);
  const y = center.y + radius * value * Math.sin(angle);
  return { x, y };
}
```

### Step 2: Implement WuXingChart.vue
1.  **Template:** SVG element with `viewBox="0 0 100 100"`.
2.  **Script:** 
    - Compute `points` string for the `<polygon>` based on `props.data.adjusted`.
    - Compute `axisLines` for the background grid.
3.  **Styles:** Scoped CSS using `v-bind` for colors.

### Step 3: Integration
Modify `src/views/UnifiedResultView.vue` (or the relevant component displaying results):
```vue
<template>
  <div class="analysis-section">
    <!-- Existing Text Content -->
    
    <!-- New Visual Component -->
    <VisualWrapper 
      title="五行平衡分析" 
      description="Visual representation of your Five Elements balance"
    >
      <WuXingChart :data="analysisResult.wuxing" />
      
      <template #details>
        <!-- The detailed text table goes here for progressive disclosure -->
        <WuXingDetailsTable :data="analysisResult.wuxing" />
      </template>
    </VisualWrapper>
  </div>
</template>
```

## 5. Mobile Responsiveness Strategy
- **SVG ViewBox:** The chart will scale naturally to the container width.
- **Legend:** Place legend *below* the chart on mobile (< 768px) and *beside* the chart on desktop using CSS Flexbox `flex-direction: column-reverse` (mobile) vs `row` (desktop).
- **Touch Targets:** Ensure interactive elements (vertices) have a transparent circle overlay with `r="10"` to increase touch area.
