/**
 * Smart text splitter for chat-style progressive display
 * Splits AI responses into natural sentence chunks for bubble display
 */

/**
 * Split text into natural sentence chunks for chat display
 * Handles Chinese and English punctuation, preserves markdown structure
 */
export function splitIntoSentences(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const sentences: string[] = [];
  let currentSentence = '';
  let inCodeBlock = false;
  let inList = false;

  // Split by lines to handle markdown structure
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      currentSentence += `${line}\n`;

      // If exiting code block, complete the sentence
      if (!inCodeBlock && currentSentence.trim()) {
        sentences.push(currentSentence.trim());
        currentSentence = '';
      }
      continue;
    }

    // Keep code blocks together
    if (inCodeBlock) {
      currentSentence += `${line}\n`;
      continue;
    }

    // Detect markdown headers - treat as separate bubble
    if (line.trim().match(/^#{1,6}\s+/)) {
      if (currentSentence.trim()) {
        sentences.push(currentSentence.trim());
      }
      sentences.push(line);
      currentSentence = '';
      continue;
    }

    // Detect list items
    const isListItem =
      line.trim().match(/^[-*+]\s+/) || line.trim().match(/^\d+\.\s+/);

    if (isListItem) {
      if (!inList && currentSentence.trim()) {
        // Starting a list, finish previous sentence
        sentences.push(currentSentence.trim());
        currentSentence = '';
      }
      inList = true;
      currentSentence += `${line}\n`;
      continue;
    } else if (inList) {
      // Exiting list
      if (currentSentence.trim()) {
        sentences.push(currentSentence.trim());
        currentSentence = '';
      }
      inList = false;
    }

    // Regular text processing
    if (line.trim().length === 0) {
      // Empty line - add spacing for text flow but don't force split
      if (currentSentence.trim()) {
        currentSentence += ' ';
      }
      continue;
    }

    // Process line character by character for sentence detection
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      currentSentence += char;

      // Chinese sentence endings
      const isChineseEnd = ['。', '！', '？', '；'].includes(char);
      // English sentence endings (with lookahead for proper detection)
      const isEnglishEnd =
        ['.', '!', '?', ';'].includes(char) &&
        (j === line.length - 1 || line[j + 1] === ' ' || line[j + 1] === '\n');

      if (isChineseEnd || isEnglishEnd) {
        // Check if next character is quote/bracket (keep together)
        const nextChar = j < line.length - 1 ? line[j + 1] : '';
        const keepTogether = ['」', '』', '）', ')', '"', "'"].includes(
          nextChar,
        );

        if (keepTogether) {
          currentSentence += nextChar;
          j++; // Skip next character
        }

        // Complete the sentence
        if (currentSentence.trim()) {
          sentences.push(currentSentence.trim());
          currentSentence = '';
        }
      }
    }

    // Add newline if sentence continues to next line
    if (currentSentence.trim() && !inList) {
      currentSentence += ' ';
    }
  }

  // Add any remaining text
  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim());
  }

  return sentences.filter((s) => s.length > 0);
}

/**
 * Calculate natural delay for progressive display
 * Based on sentence length and reading speed
 */
export function calculateDelay(
  sentenceIndex: number,
  sentenceLength: number,
): number {
  // Base delay increases slightly for each subsequent sentence
  const baseDelay = 800 + sentenceIndex * 200;

  // Add extra delay for longer sentences (reading time)
  const readingDelay = Math.min(sentenceLength * 20, 1000);

  return baseDelay + readingDelay;
}

/**
 * Chunk sentences into chat bubbles
 * Groups related sentences together for natural conversation flow
 */
export function chunkSentences(
  sentences: string[],
  maxChunkSize = 3,
): string[] {
  const chunks: string[] = [];
  let currentChunk: string[] = [];

  for (const sentence of sentences) {
    // Headers and lists should be in their own bubble
    if (
      sentence.match(/^#{1,6}\s+/) ||
      sentence.match(/^[-*+]\s+/) ||
      sentence.match(/^\d+\.\s+/)
    ) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
      }
      chunks.push(sentence);
      continue;
    }

    currentChunk.push(sentence);

    // Create chunk when reaching max size
    if (currentChunk.length >= maxChunkSize) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
  }

  // Add remaining sentences
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}
