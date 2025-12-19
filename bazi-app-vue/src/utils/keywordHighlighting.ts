import { marked } from 'marked';

/**
 * Configures the marked renderer for star brightness effects.
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

        // Priority 2: Match quoted star names like 「天府星」 or 「七殺」
        const quotedMatch = text.match(/「(.+?)」/);
        if (quotedMatch) {
          // Replace the quoted portion with styled span, keep rest as normal strong
          const styledText = text.replace(
            /「(.+?)」/g,
            '<span class="quoted-star">「$1」</span>',
          );
          return `<strong>${styledText}</strong>`;
        }

        // Default: render as a normal strong tag
        return `<strong>${text}</strong>`;
      },
    },
  });
}
