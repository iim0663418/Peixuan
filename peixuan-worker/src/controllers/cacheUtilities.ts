/**
 * Cache Utilities
 * Helper functions for caching and cache-related operations
 */

interface CachedAnalysisResult {
  text: string;
}

interface CachedAnalysis {
  result: CachedAnalysisResult | string;
}

/**
 * Get loading message based on locale
 * @param locale - Language locale (zh-TW or en)
 * @returns Loading message string
 */
export function getLoadingMessage(locale: string): string {
  return locale === 'en'
    ? 'Let me see~ I am analyzing your chart carefully...\n\n'
    : '好我看看～讓我仔細分析一下你的命盤...\n\n';
}

/**
 * Send cached analysis line by line via SSE
 * @param cachedAnalysis - Cached analysis result
 * @param controller - ReadableStream controller
 * @param encoder - TextEncoder instance
 */
export async function sendCachedAnalysis(
  cachedAnalysis: CachedAnalysis,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  forceRequested?: boolean
): Promise<void> {
  const cachedText = typeof cachedAnalysis.result === 'string'
    ? cachedAnalysis.result
    : cachedAnalysis.result.text;

  // Send consistency metadata if force was requested but ignored
  if (forceRequested) {
    const metaData = `data: ${JSON.stringify({ 
      meta: { 
        consistency_enforced: true,
        message: "今日運勢已定 (Daily destiny is set)"
      }
    })}\n\n`;
    controller.enqueue(encoder.encode(metaData));
  }

  // Send cached content line by line
  const lines = cachedText.split('\n');
  for (const line of lines) {
    const sseData = `data: ${JSON.stringify({ text: `${line}\n` })}\n\n`;
    controller.enqueue(encoder.encode(sseData));
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
