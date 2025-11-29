import { Router } from 'itty-router';
import { ChartController } from '../controllers/chartController';

export function createChartRoutes(router: Router) {
  // GET /api/charts - 獲取命盤歷史
  router.get('/api/charts', async (req: any, env: any) => {
    const controller = new ChartController(env.CACHE);
    const userId = req.userId || 'anonymous';
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type') || undefined;
    
    const result = await controller.getChartHistory(env.DB, userId, page, limit, type);
    return Response.json(result);
  });

  // POST /api/charts - 保存命盤
  router.post('/api/charts', async (req: any, env: any) => {
    const controller = new ChartController(env.CACHE);
    const userId = req.userId || 'anonymous';
    const data = await req.json();
    
    const chart = await controller.saveChart(env.DB, userId, data);
    return Response.json({ message: '命盤保存成功', chart }, { status: 201 });
  });

  // GET /api/charts/:id - 獲取單一命盤
  router.get('/api/charts/:id', async (req: any, env: any) => {
    const controller = new ChartController(env.CACHE);
    const userId = req.userId || 'anonymous';
    const chart = await controller.getChart(env.DB, req.params.id, userId);
    
    if (!chart) {
      return Response.json({ error: '命盤記錄不存在' }, { status: 404 });
    }
    return Response.json({ chart });
  });

  // DELETE /api/charts/:id - 刪除命盤
  router.delete('/api/charts/:id', async (req: any, env: any) => {
    const controller = new ChartController(env.CACHE);
    const userId = req.userId;
    if (!userId) {
      return Response.json({ error: '需要登入' }, { status: 401 });
    }
    
    const deleted = await controller.deleteChart(env.DB, req.params.id, userId);
    if (!deleted) {
      return Response.json({ error: '記錄不存在或無權限刪除' }, { status: 404 });
    }
    return Response.json({ message: '刪除成功' });
  });

  // GET /api/analyses - 獲取分析歷史
  router.get('/api/analyses', async (req: any, env: any) => {
    const controller = new ChartController(env.CACHE);
    const userId = req.userId || 'anonymous';
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const result = await controller.getAnalysisHistory(env.DB, userId, page, limit);
    return Response.json(result);
  });

  // POST /api/analyses - 保存分析
  router.post('/api/analyses', async (req: any, env: any) => {
    const controller = new ChartController(env.CACHE);
    const userId = req.userId || 'anonymous';
    const data = await req.json();
    
    const analysis = await controller.saveAnalysis(env.DB, userId, data);
    return Response.json({ message: '分析保存成功', analysis }, { status: 201 });
  });
}
