/**
 * 全局錯誤處理插件
 * Global Error Handler Plugin
 */

import type { App } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';

// 錯誤類型定義
export interface ErrorReport {
  message: string;
  stack?: string;
  component?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
}

// 錯誤等級
export enum ErrorLevel {
  // eslint-disable-next-line no-unused-vars
  LOW = 'low',
  // eslint-disable-next-line no-unused-vars
  MEDIUM = 'medium',
  // eslint-disable-next-line no-unused-vars
  HIGH = 'high',
  // eslint-disable-next-line no-unused-vars
  CRITICAL = 'critical',
}

// 錯誤分類
export enum ErrorCategory {
  // eslint-disable-next-line no-unused-vars
  NETWORK = 'network',
  // eslint-disable-next-line no-unused-vars
  COMPONENT = 'component',
  // eslint-disable-next-line no-unused-vars
  ROUTER = 'router',
  // eslint-disable-next-line no-unused-vars
  STORE = 'store',
  // eslint-disable-next-line no-unused-vars
  API = 'api',
  // eslint-disable-next-line no-unused-vars
  UNKNOWN = 'unknown',
}

class ErrorHandler {
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;
  private reportEndpoint = '/api/error-report'; // 錯誤上報端點

  /**
   * 分析錯誤類型和等級
   */
  private analyzeError(error: Error): {
    category: ErrorCategory;
    level: ErrorLevel;
  } {
    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';

    // 網路錯誤
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout')
    ) {
      return { category: ErrorCategory.NETWORK, level: ErrorLevel.MEDIUM };
    }

    // API錯誤
    if (
      message.includes('api') ||
      message.includes('request') ||
      stack.includes('axios')
    ) {
      return { category: ErrorCategory.API, level: ErrorLevel.MEDIUM };
    }

    // 路由錯誤
    if (message.includes('router') || stack.includes('router')) {
      return { category: ErrorCategory.ROUTER, level: ErrorLevel.HIGH };
    }

    // 組件錯誤
    if (stack.includes('.vue') || message.includes('component')) {
      return { category: ErrorCategory.COMPONENT, level: ErrorLevel.MEDIUM };
    }

    // 狀態管理錯誤
    if (
      message.includes('store') ||
      stack.includes('pinia') ||
      stack.includes('vuex')
    ) {
      return { category: ErrorCategory.STORE, level: ErrorLevel.HIGH };
    }

    // 關鍵錯誤關鍵字
    if (
      message.includes('cannot read') ||
      message.includes('undefined') ||
      message.includes('null')
    ) {
      return { category: ErrorCategory.UNKNOWN, level: ErrorLevel.HIGH };
    }

    return { category: ErrorCategory.UNKNOWN, level: ErrorLevel.LOW };
  }

  /**
   * 生成用戶友善的錯誤消息
   */
  private generateUserMessage(
    category: ErrorCategory,
    level: ErrorLevel,
  ): string {
    switch (category) {
      case ErrorCategory.NETWORK:
        return '網路連線發生問題，請檢查您的網路連線';
      case ErrorCategory.API:
        return '服務暫時無法使用，請稍後再試';
      case ErrorCategory.ROUTER:
        return '頁面載入失敗，請重新整理頁面';
      case ErrorCategory.COMPONENT:
        return '頁面顯示異常，請重新整理頁面';
      case ErrorCategory.STORE:
        return '資料同步失敗，請重新整理頁面';
      default:
        if (level === ErrorLevel.CRITICAL) {
          return '系統發生嚴重錯誤，請重新整理頁面或聯繫客服';
        }
        return '系統發生錯誤，請稍後再試';
    }
  }

  /**
   * 創建錯誤報告
   */
  private createErrorReport(
    error: Error,
    component?: string,
    userId?: string,
  ): ErrorReport {
    return {
      message: error.message,
      stack: error.stack,
      component,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId,
    };
  }

  /**
   * 顯示用戶通知
   */
  private showUserNotification(
    category: ErrorCategory,
    level: ErrorLevel,
  ): void {
    const message = this.generateUserMessage(category, level);

    if (level === ErrorLevel.CRITICAL || level === ErrorLevel.HIGH) {
      ElNotification({
        title: '系統錯誤',
        message,
        type: 'error',
        duration: 8000,
        showClose: true,
      });
    } else {
      ElMessage({
        message,
        type: 'error',
        duration: 5000,
        showClose: true,
      });
    }
  }

  /**
   * 上報錯誤到服務器
   */
  private async reportError(errorReport: ErrorReport): Promise<void> {
    try {
      // 添加到隊列
      this.errorQueue.push(errorReport);

      // 限制隊列大小
      if (this.errorQueue.length > this.maxQueueSize) {
        this.errorQueue.shift();
      }

      // 實際項目中可以發送到錯誤監控服務
      if (import.meta.env.PROD) {
        await fetch(this.reportEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport),
        });
      } else {
        // 開發環境下只記錄到控制台
        console.group('🚨 錯誤報告');
        console.error('Error:', errorReport.message);
        console.error('Stack:', errorReport.stack);
        console.error('Component:', errorReport.component);
        console.error('URL:', errorReport.url);
        console.error('Time:', errorReport.timestamp);
        console.groupEnd();
      }
    } catch (reportingError) {
      console.error('錯誤上報失敗:', reportingError);
    }
  }

  /**
   * 處理Vue應用錯誤
   */
  public handleVueError(
    error: unknown,
    instance: any,
    info: string,
    userId?: string,
  ): void {
    const err = error instanceof Error ? error : new Error(String(error));
    const { category, level } = this.analyzeError(err);

    // 獲取組件名稱
    const componentName =
      instance?.$options?.__name ||
      instance?.$options?.name ||
      'Unknown Component';

    const errorReport = this.createErrorReport(
      err,
      `${componentName} (${info})`,
      userId,
    );

    // 顯示用戶通知
    this.showUserNotification(category, level);

    // 上報錯誤
    this.reportError(errorReport);
  }

  /**
   * 處理全局JavaScript錯誤
   */
  public handleGlobalError(event: ErrorEvent, userId?: string): void {
    const error = new Error(event.message);
    error.stack = `at ${event.filename}:${event.lineno}:${event.colno}`;

    const { category, level } = this.analyzeError(error);
    const errorReport = this.createErrorReport(error, 'Global', userId);

    this.showUserNotification(category, level);
    this.reportError(errorReport);
  }

  /**
   * 處理未捕獲的Promise拒絕
   */
  public handleUnhandledRejection(
    event: PromiseRejectionEvent,
    userId?: string,
  ): void {
    let error: Error;
    
    if (event.reason instanceof Error) {
      error = event.reason;
    } else if (typeof event.reason === 'object' && event.reason !== null) {
      // 如果是物件，嘗試序列化
      try {
        const reasonStr = JSON.stringify(event.reason);
        error = new Error(`Promise rejected with: ${reasonStr}`);
      } catch {
        // JSON.stringify 失敗時的備用方案
        error = new Error(`Promise rejected with non-serializable object`);
      }
    } else {
      // 其他類型直接轉字串
      error = new Error(`Promise rejected with: ${String(event.reason)}`);
    }

    const { category, level } = this.analyzeError(error);
    const errorReport = this.createErrorReport(
      error,
      'Promise Rejection',
      userId,
    );

    this.showUserNotification(category, level);
    this.reportError(errorReport);
  }

  /**
   * 獲取錯誤統計
   */
  public getErrorStats(): {
    totalErrors: number;
    recentErrors: ErrorReport[];
    errorsByCategory: Record<ErrorCategory, number>;
  } {
    const errorsByCategory = Object.values(ErrorCategory).reduce(
      (acc, category) => {
        acc[category] = 0;
        return acc;
      },
      {} as Record<ErrorCategory, number>,
    );

    // 這裡可以添加分類統計邏輯

    return {
      totalErrors: this.errorQueue.length,
      recentErrors: this.errorQueue.slice(-10),
      errorsByCategory,
    };
  }

  /**
   * 清除錯誤隊列
   */
  public clearErrorQueue(): void {
    this.errorQueue = [];
  }
}

// 創建錯誤處理器實例
const errorHandler = new ErrorHandler();

// Vue插件接口
export const errorHandlerPlugin = {
  install(app: App) {
    // 設置Vue錯誤處理器
    app.config.errorHandler = (error: unknown, instance: any, info: string) => {
      errorHandler.handleVueError(error, instance, info);
    };

    // 設置全局錯誤處理
    window.addEventListener('error', (event: ErrorEvent) => {
      errorHandler.handleGlobalError(event);
    });

    // 設置未捕獲Promise錯誤處理
    window.addEventListener(
      'unhandledrejection',
      (event: PromiseRejectionEvent) => {
        errorHandler.handleUnhandledRejection(event);
      },
    );

    // 提供錯誤處理器實例到全局屬性
    app.config.globalProperties.$errorHandler = errorHandler;
    app.provide('errorHandler', errorHandler);
  },
};

export default errorHandler;
