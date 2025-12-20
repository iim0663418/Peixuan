<template>
  <div
    class="chat-bubble"
    :class="[`bubble-${type}`, { 'bubble-entering': isEntering }]"
  >
    <div class="bubble-content" v-html="formattedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'

interface Props {
  content: string
  type: 'ai' | 'user' | 'system'
  delay?: number // Delay before showing (for progressive display)
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0
})

const isEntering = ref(true)

const formattedContent = computed(() => {
  if (props.type === 'user' || props.type === 'system') {
    // Plain text for user/system messages
    return props.content
  }
  // Markdown for AI messages
  return marked(props.content)
})

onMounted(() => {
  // Remove entering class after animation
  setTimeout(() => {
    isEntering.value = false
  }, 300 + props.delay)
})
</script>

<style scoped>
.chat-bubble {
  display: flex;
  max-width: 80%;
  margin-bottom: var(--space-xs);
}

.bubble-ai {
  /* Container aligned to left side of chat area */
  align-self: flex-start;
}

.bubble-user {
  /* Container aligned to right side of chat area */
  align-self: flex-end;
}

.bubble-system {
  /* Container centered in chat area */
  align-self: center;
  max-width: 100%;
}

.bubble-content {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  box-shadow: var(--shadow-sm);
  word-wrap: break-word;
  width: 100%;
}

.bubble-ai .bubble-content {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-top-left-radius: var(--radius-xs);
  text-align: left;
}

.bubble-user .bubble-content {
  background: var(--info);
  color: var(--text-inverse);
  border-top-right-radius: var(--radius-xs);
  text-align: left;
}

.bubble-system .bubble-content {
  background: linear-gradient(135deg, var(--info-lighter) 0%, var(--purple-star-lighter) 100%);
  color: var(--text-primary);
  text-align: center;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

/* Entrance Animation */
.bubble-entering {
  opacity: 0;
  animation: fadeSlideIn 0.3s ease-out forwards;
  will-change: opacity, transform;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px) translateZ(0);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateZ(0);
  }
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px) translateZ(0);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateZ(0);
  }
}

/* ============================================
   CONVERSATIONAL MARKDOWN STYLING
   Transform formal report to friendly chat
   ============================================ */

/* Normalize all headers to chat-friendly sizes */
.bubble-content :deep(h1),
.bubble-content :deep(h2),
.bubble-content :deep(h3),
.bubble-content :deep(h4) {
  font-size: 1em !important;
  font-weight: var(--font-weight-semibold);
  margin: 0.75em 0 0.5em 0;
  line-height: 1.5;
  color: var(--text-primary);
  border: none;
  padding: 0;
}

/* Remove any header styling that looks too "document-like" */
.bubble-content :deep(h1)::before,
.bubble-content :deep(h2)::before {
  content: none !important;
}

/* Natural paragraph flow - reduce spacing for conversation feel */
.bubble-content :deep(p) {
  margin: 0.5em 0;
  line-height: 1.7;
}

/* First paragraph - no top margin for natural flow */
.bubble-content :deep(p:first-child) {
  margin-top: 0;
}

/* Last paragraph - no bottom margin */
.bubble-content :deep(p:last-child) {
  margin-bottom: 0;
}

/* Compact list styling - friendly and readable */
.bubble-content :deep(ul),
.bubble-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.bubble-content :deep(li) {
  margin: 0.25em 0;
  line-height: 1.6;
}

/* Purple-themed blockquote for key insights */
.bubble-content :deep(blockquote) {
  margin: 0.75em 0;
  padding: 0.75em 1em;
  border-left: 3px solid var(--purple-star);
  background: var(--purple-star-lightest);
  border-radius: var(--radius-sm);
  font-style: normal;
}

.bubble-content :deep(blockquote p) {
  margin: 0.25em 0;
}

/* Bold text - purple tint for brand alignment */
.bubble-content :deep(strong),
.bubble-content :deep(b) {
  font-weight: var(--font-weight-bold);
  color: var(--purple-star);
}

/* Inline code - subtle purple theme */
.bubble-content :deep(code) {
  padding: 0.15em 0.4em;
  background: var(--purple-star-lightest);
  border: 1px solid var(--purple-star-lighter);
  border-radius: var(--radius-xs);
  font-size: 0.9em;
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  color: var(--purple-star);
}

/* Code blocks - minimal styling */
.bubble-content :deep(pre) {
  margin: 0.75em 0;
  padding: 1em;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.bubble-content :deep(pre code) {
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
}

/* Horizontal rules - subtle dividers */
.bubble-content :deep(hr) {
  margin: 1em 0;
  border: none;
  border-top: 1px solid var(--border-light);
  opacity: 0.5;
}

/* Links - purple theme */
.bubble-content :deep(a) {
  color: var(--purple-star);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all var(--transition-fast);
}

.bubble-content :deep(a:hover) {
  border-bottom-color: var(--purple-star);
}

/* Tables - if AI generates them (rare, but handle gracefully) */
.bubble-content :deep(table) {
  width: 100%;
  margin: 0.75em 0;
  border-collapse: collapse;
  font-size: 0.95em;
}

.bubble-content :deep(th),
.bubble-content :deep(td) {
  padding: 0.5em;
  border: 1px solid var(--border-light);
  text-align: left;
}

.bubble-content :deep(th) {
  background: var(--bg-tertiary);
  font-weight: var(--font-weight-semibold);
}

/* Emoji - ensure consistent rendering */
.bubble-content :deep(img.emoji) {
  display: inline;
  width: 1.2em;
  height: 1.2em;
  vertical-align: middle;
  margin: 0 0.1em;
}

/* Remove excessive margins between consecutive elements */
.bubble-content :deep(* + *) {
  margin-top: 0.5em;
}

/* Specific overrides for tight element combinations */
.bubble-content :deep(ul + p),
.bubble-content :deep(ol + p),
.bubble-content :deep(p + ul),
.bubble-content :deep(p + ol) {
  margin-top: 0.5em;
}

/* Accessibility: Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .chat-bubble,
  .bubble-entering {
    animation: none !important;
  }

  .bubble-entering {
    opacity: 1;
    transform: none;
  }
}

/* 移動端動畫優化 */
@media (max-width: 768px) {
  .bubble-entering {
    animation-duration: 0.2s;
    animation-timing-function: ease-out;
  }
  
  .thinking-dots span {
    animation-duration: 1.8s;
  }
}

/* 減少動畫偏好設定 */
@media (prefers-reduced-motion: reduce) {
  .bubble-entering {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
}

/* RWD 響應式優化 */
@media (max-width: 768px) {
  .chat-bubble {
    max-width: 90%;
    margin-bottom: 6px;
  }
  
  .bubble-content {
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .chat-bubble {
    max-width: 75%;
  }
}

@media (min-width: 1025px) {
  .chat-bubble {
    max-width: 70%;
  }
  
  .bubble-content {
    padding: var(--space-md) var(--space-lg);
    font-size: var(--font-size-md);
  }
}

/* 深色模式文字對比度優化 */
@media (prefers-color-scheme: dark) {
  .bubble-content {
    color: #ffffff !important;
  }
  
  .bubble-content :deep(p) {
    color: #ffffff !important;
  }
  
  .bubble-content :deep(h1),
  .bubble-content :deep(h2),
  .bubble-content :deep(h3),
  .bubble-content :deep(h4) {
    color: #ffffff !important;
  }
  
  .bubble-content :deep(li) {
    color: #ffffff !important;
  }
  
  .bubble-content :deep(strong),
  .bubble-content :deep(b) {
    color: #fbbf24 !important;
    font-weight: var(--font-weight-bold);
  }
  
  .bubble-ai .bubble-content {
    color: #ffffff !important;
    background: #374151 !important;
  }
  
  .bubble-system .bubble-content {
    color: #ffffff !important;
    background: #4b5563 !important;
  }
}
</style>
