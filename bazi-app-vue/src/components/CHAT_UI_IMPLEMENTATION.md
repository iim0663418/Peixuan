# Chat-Style UI Implementation for Daily Question Feature

## Overview

This document describes the chat-style UI transformation for the Daily Question feature, which converts佩璇's AI responses from centered text blocks into natural, progressive chat conversation bubbles.

## Architecture

### Components

#### 1. **ChatBubble.vue**
Location: `src/components/ChatBubble.vue`

Reusable chat message bubble component with three types:
- **ai**: Purple-themed bubbles for佩璇's responses (left-aligned)
- **user**: Blue bubbles for user questions (right-aligned)
- **system**: Centered gradient bubbles for system messages

**Features**:
- Markdown rendering for AI messages
- Entrance animations (fade + slide)
- Progressive delay support via `delay` prop
- Purple-themed styling (blockquotes, code, bold text)
- Accessibility: respects `prefers-reduced-motion`
- Responsive design

**Props**:
```typescript
interface Props {
  content: string       // Message content (markdown for AI, plain text for user/system)
  type: 'ai' | 'user' | 'system'
  delay?: number        // Delay before showing (for progressive display)
}
```

#### 2. **DailyQuestionPanel.vue** (Updated)
Location: `src/components/DailyQuestionPanel.vue`

Main panel integrating the chat UI.

**Key Changes**:
- Replaced old message divs with ChatBubble components
- Added reactive `chatBubbles` array for progressive display
- Added watcher on `response` to split into bubbles
- Preserved thinking dots animation
- Maintained cosmic header and status indicators

**Progressive Display Logic**:
```typescript
watch(response, (newResponse) => {
  // Split response into sentences and chunks
  const sentences = splitIntoSentences(newResponse)
  const chunks = chunkSentences(sentences, 2) // Max 2 sentences per bubble

  // Show first bubble immediately
  chatBubbles.value = [chunks[0]]

  // Add remaining bubbles with 600ms delay
  chunks.slice(1).forEach((chunk, index) => {
    setTimeout(() => {
      chatBubbles.value.push(chunk)
      scrollToBottom()
    }, (index + 1) * 600)
  })
})
```

### Utilities

#### 3. **textSplitter.ts**
Location: `src/utils/textSplitter.ts`

Smart text splitting utility for natural sentence detection.

**Functions**:

##### `splitIntoSentences(text: string): string[]`
Splits text into natural sentence chunks, handling:
- Chinese punctuation: 。！？；
- English punctuation: . ! ? ;
- Markdown headers (kept separate)
- Lists (kept together)
- Code blocks (kept together)
- Quote preservation: 「」『』
- Paragraph breaks

**Example**:
```typescript
const text = '您好！今天運勢不錯。請繼續保持。'
const sentences = splitIntoSentences(text)
// Result: ['您好！', '今天運勢不錯。', '請繼續保持。']
```

##### `chunkSentences(sentences: string[], maxChunkSize: number = 3): string[]`
Groups sentences into chat bubbles for natural conversation flow.

**Features**:
- Headers and lists get their own bubbles
- Regular sentences grouped up to `maxChunkSize`
- Handles odd numbers gracefully

**Example**:
```typescript
const sentences = ['第一句。', '第二句。', '第三句。']
const chunks = chunkSentences(sentences, 2)
// Result: ['第一句。 第二句。', '第三句。']
```

##### `calculateDelay(sentenceIndex: number, sentenceLength: number): number`
Calculates natural delay for progressive display based on:
- Sentence position (base delay increases)
- Sentence length (reading time)
- Capped at 1000ms for long sentences

### Composables

#### 4. **useDailyQuestion.ts** (Updated)
Location: `src/composables/useDailyQuestion.ts`

**Key Updates**:
- Added comments explaining streaming behavior
- Response accumulation for watcher consumption
- No breaking changes to API

**How It Works**:
1. SSE streaming accumulates in `response` ref
2. Watcher in DailyQuestionPanel detects changes
3. Text splitter breaks response into sentences
4. Chunker groups sentences into bubbles
5. Bubbles display progressively with delays

## User Experience Flow

### 1. Initial State
```
┌─────────────────────────────────────┐
│ [🔮 Avatar] 佩璇每日問答            │
│                                     │
│ [System Bubble - Centered]          │
│ "您好！我是佩璇..."                 │
│                                     │
│ [Quick Prompts]                     │
│ [Input Area]                        │
└─────────────────────────────────────┘
```

### 2. User Asks Question
```
┌─────────────────────────────────────┐
│ [🔮 Avatar] 佩璇每日問答            │
│                                     │
│                    [User Bubble]    │
│                    "我今天運勢?"   │
│                                     │
│ [Thinking Dots]                     │
│ • • •                               │
└─────────────────────────────────────┘
```

### 3. Progressive Response
```
┌─────────────────────────────────────┐
│ [🔮 Avatar] 佩璇每日問答            │
│                                     │
│                    [User Bubble]    │
│                    "我今天運勢?"   │
│                                     │
│ [AI Bubble 1]                       │
│ "今天運勢不錯！木能量旺盛。"       │
│                                     │
│ [AI Bubble 2] (appears 600ms later) │
│ "適合創新思考。避免衝突。"         │
│                                     │
│ [Thinking Dots] (while streaming)   │
│ • • •                               │
└─────────────────────────────────────┘
```

### 4. Complete Response
```
┌─────────────────────────────────────┐
│ [🔮 Avatar] 佩璇每日問答            │
│                                     │
│                    [User Bubble]    │
│                    "我今天運勢?"   │
│                                     │
│ [AI Bubble 1]                       │
│ "今天運勢不錯！木能量旺盛。"       │
│                                     │
│ [AI Bubble 2]                       │
│ "適合創新思考。避免衝突。"         │
│                                     │
│ [AI Bubble 3]                       │
│ "建議保持謙虛態度。"               │
└─────────────────────────────────────┘
```

## Styling

### Color Scheme
- **AI Bubbles**: `var(--bg-tertiary)` background, left-aligned
- **User Bubbles**: `var(--info)` blue background, right-aligned
- **System Bubbles**: Purple-blue gradient, centered
- **Accents**: Purple theme (`var(--purple-star)`) for bold text, code, links

### Animations
- **Entrance**: Fade + slide up (300ms)
- **Progressive Delay**: 600ms between bubbles
- **Thinking Dots**: Pulsing animation
- **Accessibility**: All animations respect `prefers-reduced-motion`

### Responsive Design
- Desktop: Max 85% width bubbles
- Mobile: Max 95% width bubbles
- Scrollable container with auto-scroll

## Performance Considerations

### Optimization Strategies
1. **Immediate First Bubble**: Show first chunk instantly for responsiveness
2. **Debounced Updates**: Watcher only triggers on actual response changes
3. **Timer Cleanup**: All timers cleared on unmount
4. **Lazy Rendering**: Only visible bubbles rendered (via v-for)

### Memory Management
- Timers stored in single ref (not array)
- Old timers cleared before new ones created
- Component unmount cleanup

## Testing

### Unit Tests
Location: `src/utils/__tests__/textSplitter.test.ts`

**Coverage**:
- ✅ Chinese sentence splitting
- ✅ English sentence splitting
- ✅ Mixed language handling
- ✅ Markdown header detection
- ✅ List grouping
- ✅ Code block preservation
- ✅ Quote handling
- ✅ Edge cases (empty input, single sentence)

### Integration Testing
**Staging Environment**:
1. Deploy to staging: `npm run deploy:staging`
2. Navigate to `/daily-question`
3. Test scenarios:
   - Quick prompts
   - Custom questions
   - Long responses (multiple bubbles)
   - Daily limit enforcement
   - Error states

## Migration Notes

### What Changed
- ❌ Removed: Old `.message-content` divs
- ❌ Removed: Streaming shimmer effect (replaced by progressive bubbles)
- ❌ Removed: Inline markdown styling (moved to ChatBubble)
- ✅ Added: ChatBubble component
- ✅ Added: textSplitter utility
- ✅ Added: Progressive display watcher
- ✅ Preserved: Thinking dots animation
- ✅ Preserved: Cosmic header and status indicators
- ✅ Preserved: All existing functionality

### Breaking Changes
**None** - This is a pure UI enhancement with no API changes.

### Backward Compatibility
- All props to DailyQuestionPanel remain the same
- useDailyQuestion composable API unchanged
- Existing translations work without modification

## Future Enhancements

### Potential Improvements
1. **Typing Indicator Evolution**: Show actual characters being typed
2. **Bubble Actions**: Copy, translate, share buttons per bubble
3. **Voice Narration**: Read bubbles aloud with TTS
4. **Bubble Reactions**: Allow users to react with emojis
5. **Smart Chunking**: ML-based semantic sentence grouping
6. **Animation Variants**: Different entrance styles per bubble type

### Configuration Options
Consider adding user preferences:
- Animation speed (slow/normal/fast/off)
- Bubble size (compact/normal/spacious)
- Progressive delay (instant/gradual/slow)

## Troubleshooting

### Common Issues

**Issue**: Bubbles appear all at once
**Solution**: Check watcher is properly set up and timers aren't cleared prematurely

**Issue**: Sentences split incorrectly
**Solution**: Review `splitIntoSentences` logic for edge cases in your content

**Issue**: Animations janky on mobile
**Solution**: Reduce bubble count or delay, test on actual device

**Issue**: Memory leak warnings
**Solution**: Ensure `onUnmounted` cleanup is working

## References

- Main Panel: `src/components/DailyQuestionPanel.vue`
- Chat Bubble: `src/components/ChatBubble.vue`
- Text Splitter: `src/utils/textSplitter.ts`
- Composable: `src/composables/useDailyQuestion.ts`
- Tests: `src/utils/__tests__/textSplitter.test.ts`

---

**Implementation Date**: 2025-12-20
**Status**: ✅ Complete
**Breaking Changes**: None
**Migration Required**: None
