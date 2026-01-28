import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { dailyQuestionLogs, agentExecutionTraces } from '../db/schema';
import * as schema from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export interface AnalyticsPayload {
  chartId: string;
  question: string;
  finalAnswer: string;
  isSuccess: boolean;
  provider: 'gemini' | 'azure';
  model?: string;
  isFallback?: boolean;
  fallbackReason?: string;
  totalLatencyMs?: number;
  steps?: Array<{
    thought?: string;
    toolName?: string;
    toolArgs?: any;
    toolOutput?: string;
    latency?: number;
  }>;
}

function truncateText(text: string | null | undefined, maxLength: number): string | null {
  if (text == null) return null;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

export class AnalyticsService {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  async logInteraction(payload: AnalyticsPayload): Promise<void> {
    const logId = crypto.randomUUID();

    try {
      await this.db.insert(dailyQuestionLogs).values({
        id: logId,
        chartId: payload.chartId,
        question: truncateText(payload.question, 500),
        finalAnswer: truncateText(payload.finalAnswer, 2000),
        isSuccess: payload.isSuccess,
        provider: payload.provider,
        model: payload.model,
        isFallback: payload.isFallback,
        fallbackReason: payload.fallbackReason,
        totalLatencyMs: payload.totalLatencyMs,
      });

      if (payload.steps && payload.steps.length > 0) {
        const traces = payload.steps.map((step, index) => ({
          id: crypto.randomUUID(),
          logId,
          stepNumber: index,
          thought: truncateText(step.thought, 1000),
          action: step.toolName,
          actionInput: step.toolArgs ? JSON.stringify(step.toolArgs) : null,
          observation: truncateText(step.toolOutput, 1000),
          stepLatencyMs: step.latency,
        }));
        await this.db.insert(agentExecutionTraces).values(traces);
      }
    } catch (error) {
      console.error('[Analytics] Failed to log interaction:', error);
    }
  }

  /**
   * 獲取用戶最近的對話上下文
   * @param userId 用戶標識 (chartId 或 fingerprint)
   * @param limit 獲取的歷史條數，預設 3
   */
  async getUserRecentContext(userId: string, limit = 3): Promise<string> {
    try {
      // 查詢最近的對話記錄
      const logs = await this.db.select({
        question: schema.dailyQuestionLogs.question,
        answer: schema.dailyQuestionLogs.finalAnswer,
        createdAt: schema.dailyQuestionLogs.createdAt
      })
      .from(schema.dailyQuestionLogs)
      .where(eq(schema.dailyQuestionLogs.chartId, userId))
      .orderBy(desc(schema.dailyQuestionLogs.createdAt))
      .limit(limit);

      if (!logs || logs.length === 0) {return "";}

      // 格式化為 LLM 易讀的上下文文本（時間倒序 → 正序）
      const contextText = logs.reverse().map((log, index) => {
        // 簡單摘要：只取回答的前 100 個字
        const summary = log.answer ? `${log.answer.substring(0, 100)  }...` : "無回答";
        const dateStr = log.createdAt instanceof Date
          ? log.createdAt.toLocaleDateString()
          : new Date(log.createdAt * 1000).toLocaleDateString(); // Unix timestamp to Date
        return `[歷史對話 ${index + 1} - ${dateStr}]\nQ: ${log.question}\nA: ${summary}`;
      }).join("\n\n");

      return `以下是用戶過去 ${limit} 次的提問紀錄，請參考這些背景資訊來回答今日問題，以保持對話連貫性：\n${contextText}`;

    } catch (error) {
      console.error("Failed to fetch user context:", error);
      return ""; // 失敗時優雅降級，不回傳 context 即可
    }
  }
}
