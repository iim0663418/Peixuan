<template>
  <div class="daily-question-panel">
    <!-- Header with Avatar and Status -->
    <div class="panel-header">
      <div class="avatar-section">
        <div class="peixuan-avatar">
          <span class="avatar-emoji">🔮</span>
          <div v-if="isAsking" class="status-indicator"></div>
        </div>
        <div class="header-text">
          <h3>{{ $t('dailyQuestion.askPeixuan') }}</h3>
          <p class="subtitle">{{ $t('dailyQuestion.oncePerDay') }}</p>
        </div>
      </div>
      
      <!-- Dynamic Status Indicator -->
      <transition name="fade">
        <div v-if="isAsking && currentStatus" class="status-display">
          <el-icon class="status-icon">
            <component :is="getStatusIcon(currentStatus)" />
          </el-icon>
          <span class="status-text">{{ getStatusText(currentStatus) }}</span>
        </div>
      </transition>
    </div>

    <!-- Chat Messages Area -->
    <div class="messages-container" ref="messagesContainer">
      <!-- Welcome Message -->
      <div v-if="!hasAskedToday && !response" class="message ai-message welcome-message">
        <div class="message-content">
          {{ $t('dailyQuestion.welcomeMessage') }}
        </div>
      </div>

      <!-- User Question -->
      <div v-if="userQuestion" class="message user-message">
        <div class="message-content">{{ userQuestion }}</div>
      </div>

      <!-- AI Thinking Animation -->
      <div v-if="isAsking && !response" class="message ai-message thinking-message">
        <div class="thinking-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- AI Response -->
      <div v-if="response" class="message ai-message">
        <div class="message-content streaming-response" :class="{ 'is-streaming': isAsking }" v-html="formattedResponse"></div>
      </div>

      <!-- Daily Limit Notice - Immersive Style -->
      <div v-if="hasAskedToday && !isAsking && !response" class="message ai-message">
        <div class="message-content limit-message">
          {{ $t('dailyQuestion.dailyLimit.immersiveMessage') }}
        </div>
      </div>

      <!-- Validation Error - Immersive Style -->
      <div v-if="validationError" class="message ai-message">
        <div class="message-content validation-error">
          {{ validationError }}
        </div>
      </div>
    </div>

    <!-- Input Section -->
    <div v-if="!hasAskedToday" class="input-section">
      <!-- Daily Limit Display -->
      <div class="daily-limit-display">
        <el-icon class="limit-icon"><ChatDotRound /></el-icon>
        <span class="limit-text">{{ $t('dailyQuestion.questionsRemaining', { current: hasAskedToday ? 0 : 1, total: 1 }) }}</span>
      </div>

      <!-- Quick Prompts -->
      <div v-if="!userQuestion && !isAsking" class="quick-prompts">
        <button
          v-for="prompt in quickPrompts"
          :key="prompt"
          class="quick-prompt-btn"
          @click="useQuickPrompt(prompt)"
        >
          {{ prompt }}
        </button>
      </div>

      <!-- Text Input -->
      <div class="input-area">
        <el-input
          v-model="question"
          type="textarea"
          :placeholder="$t('dailyQuestion.placeholder')"
          :rows="3"
          maxlength="200"
          show-word-limit
          :disabled="isAsking"
          class="question-input"
          @keydown.enter.prevent="askQuestion"
        />
        
        <el-button
          type="primary"
          size="large"
          :disabled="!question.trim() || question.length < 3 || isAsking"
          :loading="isAsking"
          @click="askQuestion"
          class="ask-button"
        >
          <el-icon><ChatDotRound /></el-icon>
          {{ $t('dailyQuestion.askButton') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { useDailyQuestion } from '@/composables/useDailyQuestion'
import { marked } from 'marked'
import {
  ChatDotRound,
  MagicStick,
  Compass,
  Cpu,
  Loading
} from '@element-plus/icons-vue'

interface Props {
  chartId: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const messagesContainer = ref<HTMLElement>()
const userQuestion = ref('')
const validationError = ref('')

const {
  question,
  response,
  isAsking,
  currentStatus,
  hasAskedToday,
  dailyLimitMessage,
  askQuestion: performAsk,
  checkDailyLimit
} = useDailyQuestion(props.chartId)

// Status mapping based on doc specification
const statusMap: Record<string, { text: string; icon: any }> = {
  'REASONING': { text: '佩璇正在解讀問題意圖...', icon: MagicStick },
  'FETCHING_DATA': { text: '正在調閱您的命盤卷宗...', icon: Compass },
  'ANALYZING': { text: '結合時空能量編寫啟示中...', icon: Cpu },
  'COMPLETED': { text: '分析完成', icon: ChatDotRound }
}

const getStatusIcon = (status: string) => {
  // Parse backend status format like "[思考中] 第 1 輪推理..."
  if (status.includes('思考中') || status.includes('Thinking')) {
    return statusMap['REASONING'].icon
  }
  if (status.includes('執行中') || status.includes('Executing')) {
    return statusMap['FETCHING_DATA'].icon
  }
  if (status.includes('切換中') || status.includes('Switching')) {
    return statusMap['ANALYZING'].icon
  }
  return Loading
}

const getStatusText = (status: string) => {
  // Convert technical status to warm Peixuan messages
  if (status.includes('思考中')) {
    return '佩璇正在仔細思考您的問題...'
  }
  if (status.includes('Thinking')) {
    return 'Peixuan is carefully considering your question...'
  }
  if (status.includes('執行中')) {
    return '正在為您調閱命盤資料...'
  }
  if (status.includes('Executing')) {
    return 'Retrieving your chart data...'
  }
  if (status.includes('切換中')) {
    return '佩璇換個角度來分析...'
  }
  if (status.includes('Switching')) {
    return 'Peixuan is trying a different approach...'
  }
  return status
}

const quickPrompts = [
  '我今天的運勢如何？',
  '適合在今天做重大決定嗎？',
  '最近工作壓力大，有什麼建議？'
]

const useQuickPrompt = (prompt: string) => {
  question.value = prompt
  askQuestion()
}

const askQuestion = async () => {
  if (!question.value.trim() || isAsking.value) return

  // Clear previous validation errors
  validationError.value = ''

  // Validate question length
  if (question.value.trim().length < 3) {
    validationError.value = t('dailyQuestion.validation.tooShort')
    await nextTick()
    scrollToBottom()
    return
  }

  try {
    // Show confirmation dialog
    await ElMessageBox.confirm(
      t('dailyQuestion.confirmation.message'),
      t('dailyQuestion.confirmation.title'),
      {
        confirmButtonText: t('dailyQuestion.confirmation.confirm'),
        cancelButtonText: t('dailyQuestion.confirmation.cancel'),
        type: 'warning',
        center: true
      }
    )

    // User confirmed, proceed with question
    userQuestion.value = question.value
    await performAsk(question.value, locale.value)
    question.value = ''

    // Scroll to bottom after response
    await nextTick()
    scrollToBottom()
  } catch (error) {
    // User canceled, do nothing
    console.log('User canceled question')
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formattedResponse = computed(() => {
  if (!response.value) return ''
  return marked(response.value)
})

onMounted(() => {
  checkDailyLimit()
})
</script>

<style scoped>
.daily-question-panel {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

/* Header Section - Cosmic Color Scheme */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xl);
  background: linear-gradient(135deg, var(--purple-star) 0%, #4a148c 100%);
  color: var(--text-inverse);
  position: relative;
  overflow: hidden;
}

/* Cosmic Starfield Effect */
.panel-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 50% 50%, white, transparent),
    radial-gradient(1px 1px at 80% 10%, white, transparent),
    radial-gradient(2px 2px at 90% 60%, white, transparent),
    radial-gradient(1px 1px at 33% 80%, white, transparent),
    radial-gradient(1px 1px at 15% 15%, white, transparent);
  background-size: 200% 200%;
  background-position: 0% 0%;
  opacity: 0.5;
  pointer-events: none;
  animation: starfield 60s linear infinite;
}

@keyframes starfield {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  position: relative;
  z-index: 1;
}

.peixuan-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.avatar-emoji {
  font-size: 24px;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: var(--success);
  border: 2px solid var(--text-inverse);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.header-text h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-xs) 0;
}

.subtitle {
  font-size: var(--font-size-sm);
  opacity: 0.9;
  margin: 0;
}

.status-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: rgba(255, 255, 255, 0.2);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.status-icon {
  font-size: var(--font-size-md);
  animation: spin 2s linear infinite;
}

.status-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* Messages Container */
.messages-container {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.message {
  display: flex;
  max-width: 85%;
}

.ai-message {
  justify-content: flex-start;
}

.user-message {
  justify-content: flex-end;
  align-self: flex-end;
}

.system-message {
  justify-content: center;
  max-width: 100%;
}

.message-content {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  line-height: 1.6;
  box-shadow: var(--shadow-sm);
}

.ai-message .message-content {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-top-left-radius: var(--radius-xs);
}

/* Streaming Response Magic - Cosmic Shimmer */
.streaming-response {
  position: relative;
  overflow: hidden;
}

.streaming-response.is-streaming::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(153, 50, 204, 0.1) 50%,
    transparent 100%
  );
  animation: typewriter-shimmer 2s ease-in-out infinite;
}

@keyframes typewriter-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.streaming-response.is-streaming {
  animation: cosmic-glow 3s ease-in-out infinite;
}

@keyframes cosmic-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(153, 50, 204, 0.1);
  }
  50% {
    box-shadow: 0 0 20px rgba(153, 50, 204, 0.2);
  }
}

.user-message .message-content {
  background: var(--info);
  color: var(--text-inverse);
  border-top-right-radius: var(--radius-xs);
}

.welcome-message .message-content {
  background: linear-gradient(135deg, var(--info-lighter) 0%, var(--purple-star-lighter) 100%);
  color: var(--text-primary);
  text-align: center;
  font-weight: var(--font-weight-medium);
}

.limit-message {
  background: linear-gradient(135deg, var(--warning-lighter) 0%, var(--warning-lightest) 100%);
  border-left: 4px solid var(--warning);
  color: var(--text-primary);
  font-style: italic;
}

.validation-error {
  background: linear-gradient(135deg, var(--info-lighter) 0%, var(--info-lightest) 100%);
  border-left: 4px solid var(--info);
  color: var(--text-primary);
}

.thinking-message {
  justify-content: flex-start;
}

.thinking-dots {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border-top-left-radius: var(--radius-xs);
}

.thinking-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--info);
  animation: thinking 1.4s infinite ease-in-out both;
}

.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }

/* Input Section */
.input-section {
  padding: var(--space-lg) var(--space-xl);
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
}

.daily-limit-display {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: linear-gradient(135deg, var(--info-lightest) 0%, var(--purple-star-lightest) 100%);
  border: 1px solid var(--info-lighter);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.limit-icon {
  font-size: var(--font-size-md);
  color: var(--info);
}

.limit-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.quick-prompt-btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--info-lightest);
  color: var(--info);
  border: 1px solid var(--info-lighter);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-prompt-btn:hover {
  background: var(--info-lighter);
  transform: translateY(-1px);
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.question-input {
  font-size: var(--font-size-md);
}

/* Elevated Ask Button - Purple Cosmic Theme */
.ask-button {
  align-self: flex-end;
  padding: var(--space-md) var(--space-xl);
  font-size: var(--font-size-md);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: 48px;
  background: var(--gradient-purple);
  border: none;
  box-shadow: var(--shadow-purple);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.ask-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.ask-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(153, 50, 204, 0.3);
}

.ask-button:hover:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

.ask-button:active:not(:disabled) {
  transform: translateY(0);
}

.ask-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations - Loading states only (acceptable continuous animations) */
@keyframes thinking {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Accessibility: Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .status-indicator,
  .status-icon,
  .thinking-dots span,
  .panel-header::before,
  .streaming-response.is-streaming,
  .streaming-response.is-streaming::after {
    animation: none !important;
  }

  .status-indicator {
    opacity: 1; /* Show as static indicator */
  }

  .status-icon {
    transform: none; /* Show as static icon */
  }

  .panel-header::before {
    opacity: 0.3; /* Show static starfield */
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ============================================
   CONVERSATIONAL MARKDOWN STYLING
   Transform formal report to friendly chat
   ============================================ */

/* Normalize all headers to chat-friendly sizes */
.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3),
.message-content :deep(h4) {
  font-size: 1em !important;
  font-weight: var(--font-weight-semibold);
  margin: 0.75em 0 0.5em 0;
  line-height: 1.5;
  color: var(--text-primary);
  border: none;
  padding: 0;
}

/* Remove any header styling that looks too "document-like" */
.message-content :deep(h1)::before,
.message-content :deep(h2)::before {
  content: none !important;
}

/* Natural paragraph flow - reduce spacing for conversation feel */
.message-content :deep(p) {
  margin: 0.5em 0;
  line-height: 1.7;
}

/* First paragraph - no top margin for natural flow */
.message-content :deep(p:first-child) {
  margin-top: 0;
}

/* Last paragraph - no bottom margin */
.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

/* Compact list styling - friendly and readable */
.message-content :deep(ul),
.message-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.message-content :deep(li) {
  margin: 0.25em 0;
  line-height: 1.6;
}

/* Purple-themed blockquote for key insights */
.message-content :deep(blockquote) {
  margin: 0.75em 0;
  padding: 0.75em 1em;
  border-left: 3px solid var(--purple-star);
  background: linear-gradient(135deg, var(--purple-star-lightest) 0%, rgba(153, 50, 204, 0.05) 100%);
  border-radius: var(--radius-sm);
  font-style: normal;
}

.message-content :deep(blockquote p) {
  margin: 0.25em 0;
}

/* Bold text - purple tint for brand alignment */
.message-content :deep(strong),
.message-content :deep(b) {
  font-weight: var(--font-weight-bold);
  color: var(--purple-star);
}

/* Inline code - subtle purple theme */
.message-content :deep(code) {
  padding: 0.15em 0.4em;
  background: var(--purple-star-lightest);
  border: 1px solid var(--purple-star-lighter);
  border-radius: var(--radius-xs);
  font-size: 0.9em;
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  color: var(--purple-star);
}

/* Code blocks - minimal styling */
.message-content :deep(pre) {
  margin: 0.75em 0;
  padding: 1em;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.message-content :deep(pre code) {
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
}

/* Horizontal rules - subtle dividers */
.message-content :deep(hr) {
  margin: 1em 0;
  border: none;
  border-top: 1px solid var(--border-light);
  opacity: 0.5;
}

/* Links - purple theme */
.message-content :deep(a) {
  color: var(--purple-star);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all var(--transition-fast);
}

.message-content :deep(a:hover) {
  border-bottom-color: var(--purple-star);
}

/* Tables - if AI generates them (rare, but handle gracefully) */
.message-content :deep(table) {
  width: 100%;
  margin: 0.75em 0;
  border-collapse: collapse;
  font-size: 0.95em;
}

.message-content :deep(th),
.message-content :deep(td) {
  padding: 0.5em;
  border: 1px solid var(--border-light);
  text-align: left;
}

.message-content :deep(th) {
  background: var(--bg-tertiary);
  font-weight: var(--font-weight-semibold);
}

/* Emoji - ensure consistent rendering */
.message-content :deep(img.emoji) {
  display: inline;
  width: 1.2em;
  height: 1.2em;
  vertical-align: middle;
  margin: 0 0.1em;
}

/* Remove excessive margins between consecutive elements */
.message-content :deep(* + *) {
  margin-top: 0.5em;
}

/* Specific overrides for tight element combinations */
.message-content :deep(ul + p),
.message-content :deep(ol + p),
.message-content :deep(p + ul),
.message-content :deep(p + ol) {
  margin-top: 0.5em;
}

/* Responsive Design */
@media (max-width: 768px) {
  .panel-header {
    padding: var(--space-lg);
    flex-direction: column;
    gap: var(--space-md);
    text-align: center;
  }
  
  .messages-container {
    padding: var(--space-md);
    max-height: 300px;
  }
  
  .message {
    max-width: 95%;
  }
  
  .input-section {
    padding: var(--space-md);
  }
  
  .quick-prompts {
    justify-content: center;
  }
  
  .ask-button {
    align-self: stretch;
  }
}
</style>
