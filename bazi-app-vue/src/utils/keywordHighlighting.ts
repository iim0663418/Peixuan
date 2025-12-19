import { marked } from 'marked';

/**
 * Configures the marked renderer for star brightness effects and format-based highlighting.
 * This function should be called once when the module is loaded to set up the markdown renderer.
 */
export function setupKeywordHighlighting(): void {
  marked.use({
    renderer: {
      strong({ text }: { text: string }) {
        // Priority 1: Match "星曜名稱(brightness)" pattern
        // Comprehensive list of brightness values for Ziwei Dou Shu
        const brightnessMatch = text.match(
          /(.*)\((廟|旺|得地|利|平|不得地|陷|衰|病|死|墓|絕|胎|養)\)/,
        );
        if (brightnessMatch && brightnessMatch.length === 3) {
          const starName = brightnessMatch[1];
          const brightness = brightnessMatch[2];
          // Return custom HTML with data-brightness attribute
          return `<strong class="star-brightness" data-brightness="${brightness}">${starName}</strong>`;
        }

        // Priority 2: Match palace statistics like 子女宮（入度 8）
        const palaceStatMatch = text.match(/(.+?宮)（(.+?)）/);
        if (palaceStatMatch) {
          // Replace the palace stat portion with styled span
          const styledText = text.replace(
            /(.+?宮)（(.+?)）/g,
            '<span class="palace-stat">$1（$2）</span>',
          );
          return `<strong>${styledText}</strong>`;
        }

        // Priority 3: Match quoted content like 「天府星」 or 「任何內容」
        const quotedMatch = text.match(/「(.+?)」/);
        if (quotedMatch) {
          // Replace the quoted portion with styled span, keep rest as normal strong
          const styledText = text.replace(
            /「(.+?)」/g,
            '<span class="quoted-content">「$1」</span>',
          );
          return `<strong>${styledText}</strong>`;
        }

        // Default: render as a normal strong tag
        return `<strong>${text}</strong>`;
      },
    },
  });
}
