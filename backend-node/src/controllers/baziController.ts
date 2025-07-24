import { Request, Response } from 'express';
import { BaziService } from '../services/baziService';
import { HistoryService } from '../services/historyService';
import { logger } from '../utils/logger';

export class BaziController {
  private baziService = new BaziService();
  private historyService = new HistoryService();

  async calculate(req: Request, res: Response) {
    try {
      const { birthDate, birthTime, gender, location } = req.body;
      
      const baziChart = await this.baziService.calculate({
        birthDate,
        birthTime,
        gender,
        location
      });

      // 保存到歷史記錄
      if (req.user) {
        await this.historyService.saveChart(req.user.id, {
          type: 'bazi',
          data: baziChart,
          birthDate,
          birthTime,
          location
        });
      }

      res.json({
        success: true,
        data: baziChart,
        message: '八字計算完成'
      });
    } catch (error) {
      logger.error('八字計算失敗:', error);
      res.status(500).json({ error: '計算失敗' });
    }
  }

  async analyze(req: Request, res: Response) {
    try {
      const { chartData, analysisType = 'comprehensive' } = req.body;
      
      const analysis = await this.baziService.analyze(chartData, analysisType);
      
      // 保存分析結果
      if (req.user) {
        await this.historyService.saveAnalysis(req.user.id, {
          type: 'bazi-analysis',
          result: analysis,
          chartId: chartData.id
        });
      }

      res.json({
        success: true,
        data: analysis,
        message: '八字分析完成'
      });
    } catch (error) {
      logger.error('八字分析失敗:', error);
      res.status(500).json({ error: '分析失敗' });
    }
  }

  async getElementsAnalysis(req: Request, res: Response) {
    try {
      const { fourPillars } = req.query;
      
      if (!fourPillars) {
        return res.status(400).json({ error: '缺少四柱資料' });
      }

      const elementsAnalysis = this.baziService.analyzeElements(JSON.parse(fourPillars as string));
      
      res.json({
        success: true,
        data: elementsAnalysis
      });
    } catch (error) {
      logger.error('五行分析失敗:', error);
      res.status(500).json({ error: '五行分析失敗' });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 'anonymous';
      const { page = 1, limit = 10 } = req.query;
      
      const history = await this.historyService.getChartHistory(userId, {
        page: Number(page),
        limit: Number(limit),
        type: 'bazi'
      });
      
      res.json(history);
    } catch (error) {
      logger.error('獲取八字歷史失敗:', error);
      res.status(500).json({ error: '獲取歷史記錄失敗' });
    }
  }

  async healthCheck(req: Request, res: Response) {
    res.json({ 
      status: 'ok', 
      service: 'bazi-api',
      timestamp: new Date().toISOString()
    });
  }
}