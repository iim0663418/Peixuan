import { DrizzleD1Database } from 'drizzle-orm/d1';
import { dailyQuestionLogs, agentExecutionTraces } from '../db/schema';
import * as schema from '../db/schema';

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

export class AnalyticsService {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  async logInteraction(payload: AnalyticsPayload): Promise<void> {
    const logId = crypto.randomUUID();

    try {
      // 1. 寫入主記錄
      await this.db.insert(dailyQuestionLogs).values({
        id: logId,
        chartId: payload.chartId,
        question: payload.question,
        finalAnswer: payload.finalAnswer,
        isSuccess: payload.isSuccess,
        provider: payload.provider,
        model: payload.model,
        isFallback: payload.isFallback,
        fallbackReason: payload.fallbackReason,
        totalLatencyMs: payload.totalLatencyMs,
      });

      // 2. 寫入執行歷程 (如果有)
      if (payload.steps && payload.steps.length > 0) {
        const traces = payload.steps.map((step, index) => ({
          id: crypto.randomUUID(),
          logId: logId,
          stepNumber: index,
          thought: step.thought,
          action: step.toolName,
          actionInput: step.toolArgs ? JSON.stringify(step.toolArgs) : null,
          observation: step.toolOutput,
          stepLatencyMs: step.latency,
        }));
        await this.db.insert(agentExecutionTraces).values(traces);
      }
    } catch (error) {
      console.error('[Analytics] Failed to log interaction:', error);
      // 靜默失敗：捕獲所有錯誤，確保不影響主流程
    }
  }
}
