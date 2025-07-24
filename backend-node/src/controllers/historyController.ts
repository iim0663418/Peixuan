import { Request, Response } from 'express';
import { HistoryService } from '../services/historyService';
import { logger } from '../utils/logger';

export class HistoryController {
  private historyService = new HistoryService();

  async getChartHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 'anonymous';
      const { page = 1, limit = 10, type } = req.query;
      
      const history = await this.historyService.getChartHistory(userId, {
        page: Number(page),
        limit: Number(limit),
        type: type as string
      });
      
      res.json(history);
    } catch (error) {
      logger.error('獲取命盤歷史失敗:', error);
      res.status(500).json({ error: '獲取歷史記錄失敗' });
    }
  }

  async saveChart(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 'anonymous';
      const chartData = req.body;
      
      const savedChart = await this.historyService.saveChart(userId, chartData);
      res.status(201).json({ message: '命盤保存成功', chart: savedChart });
    } catch (error) {
      logger.error('保存命盤失敗:', error);
      res.status(500).json({ error: '保存失敗' });
    }
  }

  async getChart(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'anonymous';
      
      const chart = await this.historyService.getChart(id, userId);
      if (!chart) {
        return res.status(404).json({ error: '命盤記錄不存在' });
      }
      
      res.json({ chart });
    } catch (error) {
      res.status(500).json({ error: '獲取命盤失敗' });
    }
  }

  async deleteChart(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const deleted = await this.historyService.deleteChart(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: '記錄不存在或無權限刪除' });
      }
      
      res.json({ message: '刪除成功' });
    } catch (error) {
      res.status(500).json({ error: '刪除失敗' });
    }
  }

  async getAnalysisHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 'anonymous';
      const { page = 1, limit = 10 } = req.query;
      
      const history = await this.historyService.getAnalysisHistory(userId, {
        page: Number(page),
        limit: Number(limit)
      });
      
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: '獲取分析歷史失敗' });
    }
  }

  async saveAnalysis(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 'anonymous';
      const analysisData = req.body;
      
      const savedAnalysis = await this.historyService.saveAnalysis(userId, analysisData);
      res.status(201).json({ message: '分析保存成功', analysis: savedAnalysis });
    } catch (error) {
      res.status(500).json({ error: '保存分析失敗' });
    }
  }

  async exportHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { format = 'json' } = req.query;
      
      const exportData = await this.historyService.exportHistory(userId, format as string);
      
      res.setHeader('Content-Disposition', `attachment; filename="history.${format}"`);
      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
      res.send(exportData);
    } catch (error) {
      res.status(500).json({ error: '匯出失敗' });
    }
  }

  async batchDelete(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { ids } = req.body;
      
      const deletedCount = await this.historyService.batchDelete(userId, ids);
      res.json({ message: `成功刪除 ${deletedCount} 筆記錄` });
    } catch (error) {
      res.status(500).json({ error: '批量刪除失敗' });
    }
  }
}