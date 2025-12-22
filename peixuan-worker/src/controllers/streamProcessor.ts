/**
 * Stream Processor
 * Handles AI stream processing for different providers
 */

/**
 * Process Azure OpenAI text stream
 * @param aiStream - ReadableStream from Azure
 * @param controller - ReadableStream controller
 * @param logPrefix - Prefix for console logs
 * @returns Full text accumulated
 */
export async function processAzureStream(
  aiStream: ReadableStream,
  controller: ReadableStreamDefaultController,
  logPrefix: string
): Promise<string> {
  const reader = aiStream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let fullText = '';
  let chunkCount = 0;

  console.log(`${logPrefix} Processing Azure OpenAI text stream`);

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log(`${logPrefix} Azure stream done, total chunks:`, chunkCount);
      break;
    }

    chunkCount++;
    const text = decoder.decode(value, { stream: true });
    if (text) {
      fullText += text;
      const sseData = `data: ${JSON.stringify({ text })}\n\n`;
      controller.enqueue(encoder.encode(sseData));
      console.log(`${logPrefix} Chunk`, chunkCount, 'sent, length:', text.length);
    }
  }

  return fullText;
}

/**
 * Process Gemini JSON array stream
 * @param aiStream - ReadableStream from Gemini
 * @param controller - ReadableStream controller
 * @param logPrefix - Prefix for console logs
 * @returns Full text accumulated
 */
export async function processGeminiStream(
  aiStream: ReadableStream,
  controller: ReadableStreamDefaultController,
  logPrefix: string
): Promise<string> {
  const reader = aiStream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  let chunkCount = 0;

  console.log(`${logPrefix} Processing Gemini JSON array stream`);

  // Step 1: Accumulate entire buffer
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log(`${logPrefix} Gemini stream done, total chunks received:`, chunkCount);
      break;
    }

    chunkCount++;
    console.log(`${logPrefix} Chunk`, chunkCount, 'received, bytes:', value.length);
    buffer += decoder.decode(value, { stream: true });
  }

  console.log(`${logPrefix} Complete buffer accumulated, size:`, buffer.length);

  // Step 2: Parse and send JSON array
  return parseAndSendGeminiResponse(buffer, controller, encoder, logPrefix);
}

/**
 * Parse Gemini JSON response and send via SSE
 * @param buffer - Accumulated response buffer
 * @param controller - ReadableStream controller
 * @param encoder - TextEncoder instance
 * @param logPrefix - Prefix for console logs
 * @returns Full text extracted
 */
export function parseAndSendGeminiResponse(
  buffer: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  logPrefix: string
): string {
  let fullText = '';

  try {
    const jsonArray = JSON.parse(buffer);

    if (!Array.isArray(jsonArray)) {
      throw new Error('Expected JSON array from Gemini API');
    }

    console.log(`${logPrefix} Parsed JSON array, length:`, jsonArray.length);

    // Extract and send text from each object
    for (let i = 0; i < jsonArray.length; i++) {
      const obj = jsonArray[i];
      const text = obj?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (text) {
        fullText += text;
        console.log(`${logPrefix} Object`, i + 1, '- text chunk extracted, length:', text.length);
        const sseData = `data: ${JSON.stringify({ text })}\n\n`;
        controller.enqueue(encoder.encode(sseData));
      } else {
        console.log(`${logPrefix} Object`, i + 1, '- no text content found');
      }
    }

    console.log(`${logPrefix} All text chunks sent, total text length:`, fullText.length);
  } catch (parseError) {
    console.error(`${logPrefix} JSON parse failed:`, parseError);
    console.error(`${logPrefix} Buffer preview:`, buffer.substring(0, 500));
    throw new Error(`Failed to parse Gemini response: ${parseError}`);
  }

  return fullText;
}

/**
 * Accumulate stream buffer from reader
 * @param reader - ReadableStreamDefaultReader
 * @param decoder - TextDecoder instance
 * @returns Accumulated buffer string
 */
export async function accumulateStreamBuffer(
  reader: ReadableStreamDefaultReader,
  decoder: TextDecoder
): Promise<string> {
  let buffer = '';
  let chunkCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log('[accumulateStreamBuffer] Stream done, total chunks received:', chunkCount);
      break;
    }

    chunkCount++;
    console.log('[accumulateStreamBuffer] Chunk', chunkCount, 'received, bytes:', value.length);
    buffer += decoder.decode(value, { stream: true });
  }

  console.log('[accumulateStreamBuffer] Complete buffer accumulated, size:', buffer.length);
  return buffer;
}

/**
 * Create SSE stream from cached analysis
 * @param cachedText - The cached analysis text
 * @returns ReadableStream in SSE format
 */
export function createCachedSSEStream(cachedText: string, forceRequested?: boolean): ReadableStream {
  const encoder = new TextEncoder();
  // Split by lines to preserve Markdown formatting
  const lines = cachedText.split('\n');

  return new ReadableStream({
    async start(controller) {
      console.log('[createCachedSSEStream] Sending', lines.length, 'cached lines');

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

      for (const line of lines) {
        // Send each line with newline preserved
        const sseData = `data: ${JSON.stringify({ text: `${line}\n` })}\n\n`;
        controller.enqueue(encoder.encode(sseData));
        // Shorter delay for faster playback
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Send [DONE] signal
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
      console.log('[createCachedSSEStream] Stream complete');
    }
  });
}
