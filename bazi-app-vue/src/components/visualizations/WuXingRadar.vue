<template>
  <div class="wuxing-radar">
    <svg
      :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
      class="radar-svg"
      role="img"
      :aria-label="`五行雷達圖: ${ariaLabel}`"
    >
      <!-- Background grid circles -->
      <g class="grid-circles">
        <circle
          v-for="i in 5"
          :key="`grid-${i}`"
          :cx="centerX"
          :cy="centerY"
          :r="(maxRadius * i) / 5"
          :class="i === 5 ? 'grid-outer' : 'grid-inner'"
        />
      </g>

      <!-- Grid lines from center to vertices -->
      <g class="grid-lines">
        <line
          v-for="(point, index) in vertexPoints"
          :key="`line-${index}`"
          :x1="centerX"
          :y1="centerY"
          :x2="point.x"
          :y2="point.y"
          class="grid-line"
        />
      </g>

      <!-- Raw score polygon (semi-transparent) -->
      <polygon
        v-if="showRaw"
        :points="rawPolygonPoints"
        class="polygon-raw"
        :style="{ fill: polygonFillRaw, stroke: polygonStroke }"
      />

      <!-- Adjusted score polygon (full opacity) -->
      <polygon
        :points="adjustedPolygonPoints"
        class="polygon-adjusted"
        :style="{ fill: polygonFillAdjusted, stroke: polygonStroke }"
      />

      <!-- Vertex points for adjusted scores -->
      <g class="vertex-points">
        <circle
          v-for="(point, index) in adjustedDataPoints"
          :key="`point-${index}`"
          :cx="point.x"
          :cy="point.y"
          :r="pointRadius"
          class="data-point"
          :style="{ fill: ELEMENT_COLORS[ELEMENT_NAMES[index]] }"
        />
      </g>

      <!-- Element labels -->
      <g class="element-labels">
        <text
          v-for="(label, index) in elementLabels"
          :key="`label-${index}`"
          :x="label.x"
          :y="label.y"
          :class="['element-label', `label-${index}`]"
          :style="{ fill: ELEMENT_COLORS[ELEMENT_NAMES[index]] }"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ ELEMENT_NAMES[index] }}
        </text>
      </g>

      <!-- Score labels (optional, for adjusted values) -->
      <g v-if="showScoreLabels" class="score-labels">
        <text
          v-for="(point, index) in adjustedDataPoints"
          :key="`score-${index}`"
          :x="point.x"
          :y="point.y - scoreLabelOffset"
          class="score-label"
          text-anchor="middle"
        >
          {{ elements[index].adjusted }}
        </text>
      </g>
    </svg>

    <!-- Legend -->
    <div v-if="showRaw" class="legend">
      <span class="legend-item">
        <span class="legend-dot raw" />
        原始得分
      </span>
      <span class="legend-item">
        <span class="legend-dot adjusted" />
        月令調整後
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  ELEMENT_COLORS,
  ELEMENT_NAMES,
  type WuXingDistribution,
} from './constants';

interface Props {
  distribution: WuXingDistribution;
  showRaw?: boolean;
  showScoreLabels?: boolean;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showRaw: true,
  showScoreLabels: false,
  size: 300,
});

// SVG viewport configuration
const viewBoxSize = 300;
const centerX = viewBoxSize / 2;
const centerY = viewBoxSize / 2;
const maxRadius = 120; // Maximum radius for the pentagon
const labelOffset = 25; // Distance of labels from vertices
const pointRadius = 5; // Radius of vertex points
const scoreLabelOffset = 15; // Offset for score labels

// Compute elements data
const elements = computed(() => {
  return ELEMENT_NAMES.map((name) => ({
    name,
    raw: props.distribution.raw[name],
    adjusted: props.distribution.adjusted[name],
    color: ELEMENT_COLORS[name],
  }));
});

// Calculate max score for normalization
const maxScore = computed(() => {
  const allScores = [
    ...Object.values(props.distribution.raw),
    ...Object.values(props.distribution.adjusted),
  ];
  return Math.max(...allScores, 10);
});

// Calculate vertex positions for a pentagon (5 elements)
// Starting from top (Wood) and going clockwise: 木 -> 火 -> 土 -> 金 -> 水
const vertexPoints = computed(() => {
  return ELEMENT_NAMES.map((_, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2; // Start from top
    return {
      x: centerX + maxRadius * Math.cos(angle),
      y: centerY + maxRadius * Math.sin(angle),
    };
  });
});

// Calculate data points for raw scores
const rawDataPoints = computed(() => {
  return elements.value.map((element, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const radius = (element.raw / maxScore.value) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
});

// Calculate data points for adjusted scores
const adjustedDataPoints = computed(() => {
  return elements.value.map((element, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const radius = (element.adjusted / maxScore.value) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
});

// Calculate element label positions (outside the pentagon)
const elementLabels = computed(() => {
  return ELEMENT_NAMES.map((_, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const radius = maxRadius + labelOffset;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
});

// Convert data points to SVG polygon points string
const rawPolygonPoints = computed(() => {
  return rawDataPoints.value.map((p) => `${p.x},${p.y}`).join(' ');
});

const adjustedPolygonPoints = computed(() => {
  return adjustedDataPoints.value.map((p) => `${p.x},${p.y}`).join(' ');
});

// Polygon fill colors (using average of element colors)
const polygonFillRaw = 'rgba(156, 163, 175, 0.2)'; // Gray with opacity
const polygonFillAdjusted = 'rgba(156, 163, 175, 0.4)'; // Gray with more opacity
const polygonStroke = 'rgba(107, 114, 128, 0.8)'; // Gray border

// Accessibility label
const ariaLabel = computed(() => {
  const elementScores = elements.value
    .map((e) => `${e.name} ${e.adjusted}`)
    .join(', ');
  return `${elementScores}`;
});
</script>

<style scoped>
/* Design tokens applied - Radar chart visualization */
/* RWD optimization for SVG scaling */

.wuxing-radar {
  padding: clamp(12px, 3vw, 16px);
  background: var(--bg-primary);
  border-radius: 8px;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.radar-svg {
  width: 100%;
  max-width: 400px;
  height: auto;
  display: block;
  margin: 0 auto;
}

/* Grid styling */
.grid-circles circle {
  fill: none;
  stroke-width: 1;
}

.grid-inner {
  stroke: var(--border-light);
  stroke-opacity: 0.3;
}

.grid-outer {
  stroke: var(--border-dark);
  stroke-opacity: 0.5;
}

.grid-line {
  stroke: var(--border-light);
  stroke-width: 1;
  stroke-opacity: 0.3;
}

/* Polygon styling */
.polygon-raw,
.polygon-adjusted {
  stroke-width: 2;
  stroke-linejoin: round;
  transition: all 0.3s ease;
}

.polygon-raw:hover,
.polygon-adjusted:hover {
  stroke-width: 3;
}

/* Reduce animations on mobile if user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .polygon-raw,
  .polygon-adjusted {
    transition: none;
  }
}

/* Vertex points */
.data-point {
  stroke: white;
  stroke-width: 2;
  transition: r 0.2s ease;
}

.data-point:hover {
  r: 7;
}

/* Element labels */
.element-label {
  font-size: 16px;
  font-weight: 600;
  user-select: none;
}

/* Score labels */
.score-label {
  font-size: 12px;
  fill: var(--text-secondary);
  user-select: none;
}

/* Legend */
.legend {
  display: flex;
  justify-content: center;
  gap: clamp(12px, 3vw, 16px);
  font-size: clamp(11px, 2.8vw, 12px);
  color: var(--text-tertiary);
  margin-top: clamp(12px, 3vw, 16px);
  box-sizing: border-box;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: clamp(5px, 1.2vw, 6px);
}

.legend-dot {
  width: clamp(10px, 2.5vw, 12px);
  height: clamp(10px, 2.5vw, 12px);
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-dot.raw {
  background: rgba(156, 163, 175, 0.5);
}

.legend-dot.adjusted {
  background: rgba(107, 114, 128, 0.8);
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .element-label {
    font-size: 14px;
  }

  .score-label {
    font-size: 11px;
  }

  /* Hide legend on mobile */
  .legend {
    display: none;
  }
}

/* Tablet and above */
@media (min-width: 768px) {
  .radar-svg {
    max-width: 450px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .radar-svg {
    max-width: 500px;
  }

  .element-label {
    font-size: 18px;
  }

  .score-label {
    font-size: 13px;
  }
}
</style>
