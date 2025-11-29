<template>
  <div class="empty-palace-indicator">
    <div class="empty-badge">
      <span class="empty-icon">○</span>
      <span class="empty-text">空宮</span>
    </div>

    <div v-if="borrowedPalace" class="borrowed-info">
      <div class="borrowed-label">借星</div>
      <div class="borrowed-palace">
        <span class="palace-name">{{ borrowedPalace.name }}</span>
        <div class="borrowed-stars">
          <div
            v-for="star in borrowedPalace.mainStars"
            :key="star.name"
            class="borrowed-star"
          >
            <span class="star-name">{{ star.name }}</span>
            <StarBrightnessIndicator
              v-if="star.brightness"
              :brightness="star.brightness"
            />
            <span class="power-reduction">7成</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showTooltip" class="tooltip">
      <div class="tooltip-content">
        <h4>空宮說明</h4>
        <p>此宮位無主星，需借用對宮星曜進行分析。</p>
        <p v-if="borrowedPalace">
          借用【{{ borrowedPalace.name }}】的星曜，影響力約為七成。
        </p>
        <div class="interpretation-note">
          空宮並非不好，而是代表此領域需要更多主動創造與學習。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StarBrightnessIndicator from './StarBrightnessIndicator.vue';

interface Star {
  name: string;
  brightness?: string;
  type?: string;
}

interface BorrowedPalace {
  name: string;
  mainStars: Star[];
}

interface Props {
  borrowedPalace?: BorrowedPalace;
  showTooltip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showTooltip: false,
});
</script>

<style scoped>
.empty-palace-indicator {
  position: relative;
  display: inline-block;
}

.empty-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
  border: 1px dashed #bbb;
  border-radius: 12px;
  color: #666;
  font-size: 11px;
}

.empty-icon {
  font-size: 12px;
  opacity: 0.7;
}

.empty-text {
  font-weight: 500;
}

.borrowed-info {
  margin-top: 8px;
  padding: 8px;
  background: #fff8e1;
  border: 1px solid #ffcc02;
  border-radius: 6px;
  font-size: 10px;
}

.borrowed-label {
  font-weight: 600;
  color: #f57c00;
  margin-bottom: 4px;
  text-align: center;
}

.borrowed-palace {
  text-align: center;
}

.palace-name {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  font-size: 11px;
}

.borrowed-stars {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.borrowed-star {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.star-name {
  font-size: 9px;
  color: #e65100;
  font-weight: 500;
}

.power-reduction {
  font-size: 8px;
  color: #ff5722;
  font-weight: bold;
  background: rgba(255, 87, 34, 0.1);
  padding: 1px 3px;
  border-radius: 2px;
}

.tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  margin-top: 8px;
  width: 240px;
}

.tooltip-content {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 12px;
}

.tooltip-content h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 13px;
}

.tooltip-content p {
  margin: 0 0 6px 0;
  line-height: 1.4;
  color: #666;
}

.interpretation-note {
  margin-top: 8px;
  padding: 6px 8px;
  background: #e8f5e8;
  border-left: 3px solid #4caf50;
  border-radius: 4px;
  font-size: 11px;
  color: #2e7d32;
  font-style: italic;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .tooltip {
    width: 200px;
  }

  .tooltip-content {
    font-size: 11px;
    padding: 10px;
  }

  .borrowed-info {
    font-size: 9px;
  }

  .star-name {
    font-size: 8px;
  }
}
</style>
