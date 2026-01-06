<template>
  <div class="narrative-summary">
    <!-- Peixuan's Voice Section -->
    <div class="peixuan-voice">
      <div class="voice-header">
        <span class="voice-icon">✨</span>
        <h2 class="voice-title">{{ t('narrative.peixuanSays') }}</h2>
      </div>

      <div v-if="narrativeText" class="narrative-content">
        <!-- AI Analysis displayed with serif font for warmth -->
        <div
          class="narrative-text markdown-content"
          v-html="renderedNarrative"
        />
      </div>

      <!-- Loading state -->
      <div v-else-if="isLoading" class="narrative-loading">
        <el-skeleton :rows="6" animated />
        <p class="loading-hint">{{ t('narrative.loading') }}</p>
      </div>

      <!-- Empty state -->
      <div v-else class="narrative-empty">
        <p class="empty-message">{{ t('narrative.noAnalysis') }}</p>
        <el-button type="primary" @click="requestAnalysis">
          {{ t('narrative.requestAnalysis') }}
        </el-button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div v-if="narrativeText && !isLoading" class="quick-actions">
      <el-button :icon="CopyDocument" size="small" @click="copyToClipboard">
        {{ t('narrative.copy') }}
      </el-button>
      <el-button :icon="RefreshRight" size="small" @click="regenerateAnalysis">
        {{ t('narrative.regenerate') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { parseReportMarkdown } from '@/utils/markdown';
import { CopyDocument, RefreshRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

interface Props {
  narrativeText?: string;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  narrativeText: '',
  isLoading: false,
});

const emit = defineEmits<{
  requestAnalysis: [];
  regenerate: [];
}>();

const { t } = useI18n();

// Render markdown with keyword highlighting
const renderedNarrative = computed(() => {
  if (!props.narrativeText) {
    return '';
  }
  return parseReportMarkdown(props.narrativeText);
});

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.narrativeText);
    ElMessage.success(t('narrative.copySuccess'));
  } catch (error) {
    ElMessage.error(t('narrative.copyFailed'));
  }
};

const requestAnalysis = () => {
  emit('requestAnalysis');
};

const regenerateAnalysis = () => {
  emit('regenerate');
};
</script>

<style scoped>
/* Phase 2: Narrative Transformation - Typography-first design */

.narrative-summary {
  width: 100%;
  margin-bottom: var(--space-2xl);
}

/* Peixuan's Voice Container */
.peixuan-voice {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(250, 247, 242, 0.98) 100%
  );
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.peixuan-voice:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 16px 48px rgba(0, 0, 0, 0.16);
}

/* Voice Header */
.voice-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-md);
  border-bottom: 2px solid var(--border-light);
}

.voice-icon {
  font-size: var(--font-size-2xl);
  line-height: 1;
}

.voice-title {
  /* Serif font for Peixuan's voice - warm and personal */
  font-family: 'Noto Serif TC', 'Georgia', 'Times New Roman', serif;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 0.5px;
}

/* Narrative Content */
.narrative-content {
  margin-top: var(--space-lg);
}

.narrative-text {
  /* CRITICAL: Serif font for AI-generated content to distinguish from UI */
  font-family: 'Noto Serif TC', 'Georgia', 'Times New Roman', serif;
  font-size: var(--font-size-base);
  line-height: 1.8;
  color: var(--text-primary);
  letter-spacing: 0.3px;
}

/* Markdown rendering enhancements */
.narrative-text :deep(h1),
.narrative-text :deep(h2),
.narrative-text :deep(h3) {
  font-family: 'Noto Serif TC', 'Georgia', 'Times New Roman', serif;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-top: var(--space-xl);
  margin-bottom: var(--space-md);
  line-height: 1.4;
}

.narrative-text :deep(h1) {
  font-size: var(--font-size-2xl);
}

.narrative-text :deep(h2) {
  font-size: var(--font-size-xl);
}

.narrative-text :deep(h3) {
  font-size: var(--font-size-lg);
}

.narrative-text :deep(p) {
  margin-bottom: var(--space-lg);
  line-height: 1.8;
}

.narrative-text :deep(ul),
.narrative-text :deep(ol) {
  margin-left: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.narrative-text :deep(li) {
  margin-bottom: var(--space-sm);
  line-height: 1.8;
}

.narrative-text :deep(strong) {
  font-weight: var(--font-weight-bold);
  color: var(--info);
}

.narrative-text :deep(em) {
  font-style: italic;
  color: var(--text-secondary);
}

/* Loading State */
.narrative-loading {
  padding: var(--space-xl) 0;
}

.loading-hint {
  font-family: 'Noto Serif TC', 'Georgia', 'Times New Roman', serif;
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  margin-top: var(--space-md);
  font-style: italic;
}

/* Empty State */
.narrative-empty {
  text-align: center;
  padding: var(--space-3xl) var(--space-xl);
}

.empty-message {
  font-family: 'Noto Serif TC', 'Georgia', 'Times New Roman', serif;
  font-size: var(--font-size-base);
  color: var(--text-tertiary);
  margin-bottom: var(--space-xl);
  font-style: italic;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-light);
  justify-content: flex-end;
}

/* Mobile Responsive */
@media (max-width: 767px) {
  .peixuan-voice {
    padding: var(--space-lg);
  }

  .voice-title {
    font-size: var(--font-size-lg);
  }

  .narrative-text {
    font-size: var(--font-size-sm);
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-actions .el-button {
    width: 100%;
  }
}

/* Tablet Responsive */
@media (min-width: 768px) and (max-width: 1023px) {
  .narrative-text {
    font-size: var(--font-size-base);
  }
}

/* Desktop Optimization */
@media (min-width: 1024px) {
  .peixuan-voice {
    padding: var(--space-3xl);
  }

  .narrative-text {
    font-size: var(--font-size-lg);
    line-height: 2;
  }
}

/* Accessibility - Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .peixuan-voice {
    transition: none;
  }

  .peixuan-voice:hover {
    transform: none;
  }
}

/* 深色模式優化 */
@media (prefers-color-scheme: dark) {
  .narrative-summary {
    background: var(--bg-secondary);
    border-color: var(--border-light);
  }

  .peixuan-voice {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-light) !important;
  }

  .narrative-text {
    color: var(--text-primary) !important;
  }

  /* Element Plus 卡片深色模式 */
  :deep(.el-card) {
    background: var(--bg-secondary) !important;
    border-color: var(--border-light) !important;
  }

  :deep(.el-card.is-always-shadow) {
    background: var(--bg-secondary) !important;
    border-color: var(--border-light) !important;
    box-shadow: var(--shadow-md) !important;
  }

  :deep(.result-card) {
    background: var(--bg-secondary) !important;
    border-color: var(--border-light) !important;
  }
}
</style>
