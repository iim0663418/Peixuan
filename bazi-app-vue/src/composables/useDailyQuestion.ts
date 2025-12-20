import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useDailyQuestion(chartId: string) {
  const { t } = useI18n()
  
  const question = ref('')
  const response = ref('')
  const isAsking = ref(false)
  const currentStatus = ref('')
  const hasAskedToday = ref(false)
  const error = ref('')

  const dailyLimitMessage = computed(() => {
    return t('dailyQuestion.dailyLimit.message')
  })

  const checkDailyLimit = async () => {
    try {
      const response = await fetch(`/api/v1/daily-insight/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartId })
      })
      
      const data = await response.json()
      hasAskedToday.value = data.hasAskedToday
    } catch (err) {
      console.error('Failed to check daily limit:', err)
    }
  }

  const askQuestion = async (questionText: string, locale: string) => {
    if (!questionText.trim() || hasAskedToday.value) return

    isAsking.value = true
    response.value = ''
    currentStatus.value = ''
    error.value = ''

    try {
      const fetchResponse = await fetch('/api/v1/daily-insight/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chartId,
          question: questionText,
          locale
        })
      })

      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}`)
      }

      const reader = fetchResponse.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.state) {
                // Handle state updates from backend
                currentStatus.value = data.state
              } else if (data.text) {
                // Handle text content
                response.value += data.text
              } else if (data.content) {
                // Handle content updates
                response.value += data.content
              }
            } catch (parseError) {
              // Handle plain text responses
              const textContent = line.slice(6)
              if (textContent && textContent !== '[DONE]') {
                response.value += textContent
              }
            }
          }
        }
      }

    } catch (err) {
      console.error('Failed to start question:', err)
      error.value = t('dailyQuestion.errors.requestFailed')
      isAsking.value = false
      currentStatus.value = ''
    } finally {
      // Always clean up when done
      isAsking.value = false
      currentStatus.value = ''
      if (response.value) {
        hasAskedToday.value = true
      }
    }
  }

  return {
    question,
    response,
    isAsking,
    currentStatus,
    hasAskedToday,
    dailyLimitMessage,
    error,
    askQuestion,
    checkDailyLimit
  }
}
