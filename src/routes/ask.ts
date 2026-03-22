/**
 * NLWeb /ask endpoint — natural language query interface
 *
 * Accepts a `query` parameter and returns Schema.org-aligned ItemList results.
 * Modes: list (default), summarize
 */

import { json, error } from 'itty-router';
import { UnifiedCalculator } from '../calculation/integration/calculator';
import type { BirthInfo } from '../calculation/types';

const calculator = new UnifiedCalculator();

// Simple birth data extraction from natural language
function parseBirthQuery(query: string): BirthInfo | null {
  const dateMatch = query.match(/(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/);
  const timeMatch = query.match(/(\d{1,2})[:\s時](\d{0,2})/);
  const genderMatch = query.match(/\b(male|female|男|女)\b/i);

  if (!dateMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  const hour = timeMatch ? Number(timeMatch[1]) : 12;
  const minute = timeMatch?.[2] ? Number(timeMatch[2]) : 0;

  let gender: 'male' | 'female' = 'male';
  if (genderMatch) {
    const g = genderMatch[1].toLowerCase();
    gender = (g === 'female' || g === '女') ? 'female' : 'male';
  }

  return {
    solarDate: new Date(year, month - 1, day, hour, minute),
    gender,
    longitude: 121.5,
  };
}

export function handleAsk(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const mode = url.searchParams.get('mode') ?? 'list';
  const queryId = url.searchParams.get('query_id') ?? crypto.randomUUID();

  if (!query) {
    return error(400, 'Missing required parameter: query');
  }

  const birthInfo = parseBirthQuery(query);

  if (!birthInfo) {
    return json({
      query_id: queryId,
      results: [{
        '@type': 'HowTo',
        name: 'How to use Peixuan',
        description: 'Provide birth data in your query. Example: "Calculate chart for 1990-05-15 14:30 male"',
        url: 'https://peixuan-api.csw30454.workers.dev/llms.txt',
      }],
    });
  }

  try {
    const result = calculator.calculate(birthInfo);
    const pillars = result.bazi.fourPillars;
    const label = `${pillars.year.stem}${pillars.year.branch} ${pillars.month.stem}${pillars.month.branch} ${pillars.day.stem}${pillars.day.branch} ${pillars.hour.stem}${pillars.hour.branch}`;

    const response: Record<string, unknown> = {
      query_id: queryId,
      results: [{
        '@type': 'Dataset',
        name: `Astrology Chart: ${label}`,
        description: mode === 'summarize'
          ? `BaZi: ${label}. Day Master: ${pillars.day.stem}. Zi Wei Life Palace at branch ${result.ziwei.lifePalace.branch}. ${result.ziwei.palaces.length} palaces computed.`
          : `Complete BaZi + Zi Wei Dou Shu chart for ${birthInfo.solarDate.toISOString().slice(0, 10)} (${birthInfo.gender}).`,
        url: 'https://peixuan-api.csw30454.workers.dev/calculate/unified',
        schema_object: result,
      }],
    };

    return json(response);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Calculation failed';
    return error(400, msg);
  }
}
