/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable complexity */
/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
// @ts-nocheck
/**
 * Peixuan Worker v1.0.1 (2025-11-30)
 * Include annual fortune calculation modules
 */
import { ChartController } from './controllers/chartController';
import { drizzle } from 'drizzle-orm/d1';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { createUnifiedRoutes } from './routes/unifiedRoutes';
import { createAnalyzeRoutes } from './routes/analyzeRoutes';
import { createChartRoutes } from './routes/chartRoutes';
import { createDailyReminderRoutes } from './routes/dailyReminderRoutes';
import { AutoRouter } from 'itty-router';

export interface Env {
	DB: D1Database;
	CACHE?: KVNamespace;
	// Gemini API Configuration
	GEMINI_API_KEY?: string;
	// Azure OpenAI Configuration
	AZURE_OPENAI_API_KEY?: string;
	AZURE_OPENAI_ENDPOINT?: string;
	AZURE_OPENAI_DEPLOYMENT?: string;
	AZURE_OPENAI_API_VERSION?: string;
	// AI Service Configuration
	AI_PROVIDER_TIMEOUT_MS?: number;
	ENABLE_AI_FALLBACK?: boolean;
}

// 確保 anonymous 用戶存在
async function ensureAnonymousUser(db: D1Database): Promise<void> {
	const orm = drizzle(db);
	const existing = await orm.select().from(users).where(eq(users.id, 'anonymous')).get();
	
	if (!existing) {
		await orm.insert(users).values({
			id: 'anonymous',
			email: 'anonymous@peixuan.app',
			password: 'none',
			name: 'Anonymous User'
		}).run();
	}
}

async function handleAPI(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const url = new URL(request.url);
	const path = url.pathname;
	const {method} = request;

	// 健康檢查
	if (path === '/health' && method === 'GET') {
		return new Response(JSON.stringify({ status: 'ok' }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// 錯誤報告端點
	if (path === '/api/error-report' && method === 'POST') {
		try {
			const errorData = await request.json();
			// 記錄錯誤到控制台（在 Cloudflare Workers 中會記錄到日誌）
			console.error('[ERROR_REPORT]', {
				timestamp: new Date().toISOString(),
				userAgent: request.headers.get('user-agent'),
				...errorData
			});

			// TODO: 可以選擇將錯誤保存到資料庫或發送到監控服務
			// 例如：await saveErrorToDatabase(env.DB, errorData);

			return new Response(JSON.stringify({
				success: true,
				message: '錯誤報告已記錄'
			}), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		} catch (error: any) {
			console.error('[ERROR_REPORT] Failed to process error report:', error);
			return new Response(JSON.stringify({
				success: false,
				error: '無法處理錯誤報告'
			}), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	// Register unified routes with AutoRouter
	const router = AutoRouter();
	createUnifiedRoutes(router);
	createAnalyzeRoutes(router, env, ctx);
	createChartRoutes(router);
	createDailyReminderRoutes(router, env);

	// Debug: Log incoming request
	console.log('[handleAPI] Incoming request:', method, path);

	// Try unified routes first using fetch() instead of handle()
	try {
		const unifiedResponse = await router.fetch(request, env);
		console.log('[handleAPI] Router response status:', unifiedResponse?.status);
		if (unifiedResponse && unifiedResponse.status !== 404) {
			return unifiedResponse;
		}
		console.log('[handleAPI] Router returned 404, continuing to legacy routes');
	} catch (error) {
		console.error('[handleAPI] Router error:', error);
		// Continue to other routes
	}

	// 確保 anonymous 用戶存在 (only for non-unified routes)
	await ensureAnonymousUser(env.DB);

	const controller = new ChartController(env.CACHE);

	// GET /api/charts
	if (path === '/api/charts' && method === 'GET') {
		const userId = 'anonymous';
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const type = url.searchParams.get('type') || undefined;
		
		const result = await controller.getChartHistory(env.DB, userId, page, limit, type);
		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// POST /api/charts
	if (path === '/api/charts' && method === 'POST') {
		const userId = 'anonymous';
		const data = await request.json();
		
		const chart = await controller.saveChart(env.DB, userId, data);
		return new Response(JSON.stringify({ message: '命盤保存成功', chart }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// GET /api/charts/:id
	const chartMatch = path.match(/^\/api\/charts\/([^\/]+)$/);
	if (chartMatch && method === 'GET') {
		const userId = 'anonymous';
		const chart = await controller.getChart(env.DB, chartMatch[1], userId);
		
		if (!chart) {
			return new Response(JSON.stringify({ error: '命盤記錄不存在' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		return new Response(JSON.stringify({ chart }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// GET /api/analyses
	if (path === '/api/analyses' && method === 'GET') {
		const userId = 'anonymous';
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '10');
		
		const result = await controller.getAnalysisHistory(env.DB, userId, page, limit);
		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// POST /api/analyses
	if (path === '/api/analyses' && method === 'POST') {
		const userId = 'anonymous';
		const data = await request.json();
		
		const analysis = await controller.saveAnalysis(env.DB, userId, data);
		return new Response(JSON.stringify({ message: '分析保存成功', analysis }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// POST /api/v1/purple-star/calculate
	if (path === '/api/v1/purple-star/calculate' && method === 'POST') {
		try {
			const { PurpleStarController } = await import('./controllers/purpleStarController');
			const purpleStarController = new PurpleStarController();
			const input = await request.json();
			
			const result = await purpleStarController.calculate(input);
			
			return new Response(JSON.stringify(result), {
				headers: { 'Content-Type': 'application/json' }
			});
		} catch (error: any) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	return new Response(JSON.stringify({ error: 'Not Found' }), {
		status: 404,
		headers: { 'Content-Type': 'application/json' }
	});
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// API 路由
		if (url.pathname.startsWith('/api/') || url.pathname === '/health') {
			try {
				return await handleAPI(request, env, ctx);
			} catch (e: any) {
				return new Response(JSON.stringify({ error: e.message || 'Internal Server Error' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

		// 靜態資源由 Wrangler assets 自動處理
		// 如果到達這裡，表示不是 API 路由，返回 404 或讓 assets 處理
		return new Response('Not Found', {
			status: 404,
			headers: { 'Content-Type': 'text/plain' }
		});
	},

	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		// Cleanup chart_records older than 6 months
		// Runs daily at 2:00 AM UTC
		try {
			const orm = drizzle(env.DB);
			const sixMonthsAgo = new Date();
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
			const cutoffDate = sixMonthsAgo.toISOString();

			// Using raw SQL since Drizzle ORM doesn't have direct support for SQLite datetime functions
			const result = await env.DB.prepare(
				`DELETE FROM chart_records WHERE created_at < datetime('now', '-6 months')`
			).run();

			console.log(`[scheduled] Cleanup completed: ${result.meta.changes} chart records deleted (older than ${cutoffDate})`);
		} catch (error: any) {
			console.error('[scheduled] Chart cleanup failed:', error.message);
		}
	},
} satisfies ExportedHandler<Env>;
