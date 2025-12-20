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
        <div class="message-content" v-html="formattedResponse"></div>
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
}

/* Header Section */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xl);
  background: linear-gradient(135deg, var(--info) 0%, var(--purple-star) 100%);
  color: var(--text-inverse);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
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

.ask-button {
  align-self: flex-end;
  padding: var(--space-md) var(--space-xl);
  font-size: var(--font-size-md);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

/* Animations */
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
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
