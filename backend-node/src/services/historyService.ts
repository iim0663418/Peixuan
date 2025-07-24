import { AppDataSource } from '../config/database';
import { ChartRecord } from '../models/ChartRecord';
import { AnalysisRecord } from '../models/AnalysisRecord';

export class HistoryService {
  private chartRepository = AppDataSource.getRepository(ChartRecord);
  private analysisRepository = AppDataSource.getRepository(AnalysisRecord);

  async getChartHistory(userId: string, options: { page: number; limit: number; type?: string }) {
    const whereCondition: any = { userId };
    if (options.type) {
      whereCondition.type = options.type;
    }

    const [charts, total] = await this.chartRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip: (options.page - 1) * options.limit,
      take: options.limit
    });

    return {
      charts,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit)
    };
  }

  async saveChart(userId: string, chartData: any): Promise<ChartRecord> {
    const chart = this.chartRepository.create({
      userId,
      type: chartData.type || 'bazi',
      chartData: chartData.data,
      metadata: {
        name: chartData.name,
        birthDate: chartData.birthDate,
        birthTime: chartData.birthTime,
        location: chartData.location
      }
    });

    return await this.chartRepository.save(chart);
  }

  async getChart(id: string, userId: string): Promise<ChartRecord | null> {
    return await this.chartRepository.findOne({ 
      where: { id, userId } 
    });
  }

  async deleteChart(id: string, userId: string): Promise<boolean> {
    const result = await this.chartRepository.delete({ id, userId });
    return result.affected > 0;
  }

  async getAnalysisHistory(userId: string, options: { page: number; limit: number }) {
    const [analyses, total] = await this.analysisRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (options.page - 1) * options.limit,
      take: options.limit
    });

    return {
      analyses,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit)
    };
  }

  async saveAnalysis(userId: string, analysisData: any): Promise<AnalysisRecord> {
    const analysis = this.analysisRepository.create({
      userId,
      chartId: analysisData.chartId,
      analysisType: analysisData.type,
      result: analysisData.result
    });

    return await this.analysisRepository.save(analysis);
  }

  async exportHistory(userId: string, format: string): Promise<string> {
    const userCharts = await this.chartRepository.find({ 
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    if (format === 'json') {
      return JSON.stringify(userCharts, null, 2);
    } else if (format === 'csv') {
      const headers = 'ID,Type,Name,Birth Date,Birth Time,Location,Created At\n';
      const rows = userCharts.map(chart => 
        `${chart.id},${chart.type},${chart.metadata.name || ''},${chart.metadata.birthDate},${chart.metadata.birthTime},${chart.metadata.location},${chart.createdAt.toISOString()}`
      ).join('\n');
      return headers + rows;
    }

    throw new Error('不支援的匯出格式');
  }

  async batchDelete(userId: string, ids: string[]): Promise<number> {
    const result = await this.chartRepository.delete({ 
      id: { $in: ids } as any, 
      userId 
    });
    return result.affected || 0;
  }
}