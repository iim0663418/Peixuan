import { describe, it, expect } from 'vitest'
import { splitIntoSentences, chunkSentences, calculateDelay } from '../textSplitter'

describe('textSplitter', () => {
  describe('splitIntoSentences', () => {
    it('should split Chinese text by sentence endings', () => {
      const text = '您好！今天運勢不錯。請繼續保持。'
      const sentences = splitIntoSentences(text)
      expect(sentences).toHaveLength(3)
      expect(sentences[0]).toBe('您好！')
      expect(sentences[1]).toBe('今天運勢不錯。')
      expect(sentences[2]).toBe('請繼續保持。')
    })

    it('should split English text by sentence endings', () => {
      const text = 'Hello! Today is a good day. Keep going.'
      const sentences = splitIntoSentences(text)
      expect(sentences).toHaveLength(3)
      expect(sentences[0]).toBe('Hello!')
      expect(sentences[1]).toBe('Today is a good day.')
      expect(sentences[2]).toBe('Keep going.')
    })

    it('should handle mixed Chinese and English', () => {
      const text = '您的運勢Good！繼續加油Keep going。'
      const sentences = splitIntoSentences(text)
      expect(sentences).toHaveLength(2)
    })

    it('should keep markdown headers separate', () => {
      const text = '## 運勢分析\n今天很好。明天也不錯。'
      const sentences = splitIntoSentences(text)
      expect(sentences[0]).toBe('## 運勢分析')
      expect(sentences.length).toBeGreaterThan(1)
    })

    it('should keep lists together', () => {
      const text = '建議如下：\n- 保持冷靜\n- 謹慎決策\n接下來會更好。'
      const sentences = splitIntoSentences(text)
      const listItem = sentences.find(s => s.includes('- 保持冷靜'))
      expect(listItem).toBeDefined()
    })

    it('should handle quotes at sentence end', () => {
      const text = '他說「今天很好」。我同意。'
      const sentences = splitIntoSentences(text)
      expect(sentences[0]).toContain('「今天很好」。')
    })

    it('should return empty array for empty input', () => {
      expect(splitIntoSentences('')).toEqual([])
      expect(splitIntoSentences('   ')).toEqual([])
    })

    it('should keep code blocks together', () => {
      const text = '看這個例子：\n```\nconst x = 1;\n```\n很簡單。'
      const sentences = splitIntoSentences(text)
      const codeBlock = sentences.find(s => s.includes('```'))
      expect(codeBlock).toBeDefined()
    })

    it('should preserve content across empty lines without forcing split', () => {
      const text = '這是第一段內容\n\n繼續同一個句子。'
      const sentences = splitIntoSentences(text)
      // Should only split at the period, not at empty line
      expect(sentences).toHaveLength(1)
      expect(sentences[0]).toContain('這是第一段內容')
      expect(sentences[0]).toContain('繼續同一個句子。')
    })

    it('should handle multiple paragraphs with proper sentence endings', () => {
      const text = '第一段結束。\n\n第二段開始。'
      const sentences = splitIntoSentences(text)
      // Should split at both periods
      expect(sentences).toHaveLength(2)
      expect(sentences[0]).toBe('第一段結束。')
      expect(sentences[1]).toBe('第二段開始。')
    })
  })

  describe('chunkSentences', () => {
    it('should group sentences into chunks', () => {
      const sentences = ['第一句。', '第二句。', '第三句。', '第四句。']
      const chunks = chunkSentences(sentences, 2)
      expect(chunks).toHaveLength(2)
      expect(chunks[0]).toBe('第一句。 第二句。')
      expect(chunks[1]).toBe('第三句。 第四句。')
    })

    it('should handle headers separately', () => {
      const sentences = ['## 標題', '內容一。', '內容二。']
      const chunks = chunkSentences(sentences, 2)
      expect(chunks[0]).toBe('## 標題')
      expect(chunks[1]).toBe('內容一。 內容二。')
    })

    it('should handle odd number of sentences', () => {
      const sentences = ['第一句。', '第二句。', '第三句。']
      const chunks = chunkSentences(sentences, 2)
      expect(chunks).toHaveLength(2)
      expect(chunks[1]).toBe('第三句。')
    })
  })

  describe('calculateDelay', () => {
    it('should increase delay for later sentences', () => {
      const delay1 = calculateDelay(0, 20)
      const delay2 = calculateDelay(1, 20)
      expect(delay2).toBeGreaterThan(delay1)
    })

    it('should increase delay for longer sentences', () => {
      const shortDelay = calculateDelay(0, 10)
      const longDelay = calculateDelay(0, 100)
      expect(longDelay).toBeGreaterThan(shortDelay)
    })

    it('should cap reading delay at 1000ms', () => {
      const delay = calculateDelay(0, 10000)
      const maxExpected = 800 + 1000 // base + max reading delay
      expect(delay).toBeLessThanOrEqual(maxExpected)
    })
  })
})
