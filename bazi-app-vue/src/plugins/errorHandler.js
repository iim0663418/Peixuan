/**
 * 全局錯誤處理插件
 * Global Error Handler Plugin
 */
import { ElMessage, ElNotification } from 'element-plus';
// 錯誤等級
export var ErrorLevel;
(function (ErrorLevel) {
    ErrorLevel["LOW"] = "low";
    ErrorLevel["MEDIUM"] = "medium";
    ErrorLevel["HIGH"] = "high";
    ErrorLevel["CRITICAL"] = "critical";
})(ErrorLevel || (ErrorLevel = {}));
// 錯誤分類
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["COMPONENT"] = "component";
    ErrorCategory["ROUTER"] = "router";
    ErrorCategory["STORE"] = "store";
    ErrorCategory["API"] = "api";
    ErrorCategory["UNKNOWN"] = "unknown";
})(ErrorCategory || (ErrorCategory = {}));
class ErrorHandler {
    errorQueue = [];
    maxQueueSize = 50;
    reportEndpoint = '/api/error-report'; // 錯誤上報端點
    /**
     * 分析錯誤類型和等級
     */
    analyzeError(error) {
        const message = error.message?.toLowerCase() || '';
        const stack = error.stack?.toLowerCase() || '';
        // 網路錯誤
        if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
            return { category: ErrorCategory.NETWORK, level: ErrorLevel.MEDIUM };
        }
        // API錯誤
        if (message.includes('api') || message.includes('request') || stack.includes('axios')) {
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
        if (message.includes('store') || stack.includes('pinia') || stack.includes('vuex')) {
            return { category: ErrorCategory.STORE, level: ErrorLevel.HIGH };
        }
        // 關鍵錯誤關鍵字
        if (message.includes('cannot read') || message.includes('undefined') || message.includes('null')) {
            return { category: ErrorCategory.UNKNOWN, level: ErrorLevel.HIGH };
        }
        return { category: ErrorCategory.UNKNOWN, level: ErrorLevel.LOW };
    }
    /**
     * 生成用戶友善的錯誤消息
     */
    generateUserMessage(category, level) {
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
    createErrorReport(error, component, userId) {
        return {
            message: error.message,
            stack: error.stack,
            component,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId
        };
    }
    /**
     * 顯示用戶通知
     */
    showUserNotification(category, level) {
        const message = this.generateUserMessage(category, level);
        if (level === ErrorLevel.CRITICAL || level === ErrorLevel.HIGH) {
            ElNotification({
                title: '系統錯誤',
                message,
                type: 'error',
                duration: 8000,
                showClose: true
            });
        }
        else {
            ElMessage({
                message,
                type: 'error',
                duration: 5000,
                showClose: true
            });
        }
    }
    /**
     * 上報錯誤到服務器
     */
    async reportError(errorReport) {
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
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(errorReport)
                });
            }
            else {
                // 開發環境下只記錄到控制台
                console.group('🚨 錯誤報告');
                console.error('Error:', errorReport.message);
                console.error('Stack:', errorReport.stack);
                console.error('Component:', errorReport.component);
                console.error('URL:', errorReport.url);
                console.error('Time:', errorReport.timestamp);
                console.groupEnd();
            }
        }
        catch (reportingError) {
            console.error('錯誤上報失敗:', reportingError);
        }
    }
    /**
     * 處理Vue應用錯誤
     */
    handleVueError(error, instance, info, userId) {
        const err = error instanceof Error ? error : new Error(String(error));
        const { category, level } = this.analyzeError(err);
        // 獲取組件名稱
        const componentName = instance?.$options?.__name ||
            instance?.$options?.name ||
            'Unknown Component';
        const errorReport = this.createErrorReport(err, `${componentName} (${info})`, userId);
        // 顯示用戶通知
        this.showUserNotification(category, level);
        // 上報錯誤
        this.reportError(errorReport);
    }
    /**
     * 處理全局JavaScript錯誤
     */
    handleGlobalError(event, userId) {
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
    handleUnhandledRejection(event, userId) {
        const error = event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason));
        const { category, level } = this.analyzeError(error);
        const errorReport = this.createErrorReport(error, 'Promise Rejection', userId);
        this.showUserNotification(category, level);
        this.reportError(errorReport);
    }
    /**
     * 獲取錯誤統計
     */
    getErrorStats() {
        const errorsByCategory = Object.values(ErrorCategory).reduce((acc, category) => {
            acc[category] = 0;
            return acc;
        }, {});
        // 這裡可以添加分類統計邏輯
        return {
            totalErrors: this.errorQueue.length,
            recentErrors: this.errorQueue.slice(-10),
            errorsByCategory
        };
    }
    /**
     * 清除錯誤隊列
     */
    clearErrorQueue() {
        this.errorQueue = [];
    }
}
// 創建錯誤處理器實例
const errorHandler = new ErrorHandler();
// Vue插件接口
export const errorHandlerPlugin = {
    install(app) {
        // 設置Vue錯誤處理器
        app.config.errorHandler = (error, instance, info) => {
            errorHandler.handleVueError(error, instance, info);
        };
        // 設置全局錯誤處理
        window.addEventListener('error', (event) => {
            errorHandler.handleGlobalError(event);
        });
        // 設置未捕獲Promise錯誤處理
        window.addEventListener('unhandledrejection', (event) => {
            errorHandler.handleUnhandledRejection(event);
        });
        // 提供錯誤處理器實例到全局屬性
        app.config.globalProperties.$errorHandler = errorHandler;
        app.provide('errorHandler', errorHandler);
    }
};
export default errorHandler;
//# sourceMappingURL=errorHandler.js.map