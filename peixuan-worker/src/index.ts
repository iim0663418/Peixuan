import { ChartController } from './controllers/chartController';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { drizzle } from 'drizzle-orm/d1';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

export interface Env {
	DB: D1Database;
	CACHE?: KVNamespace;
	__STATIC_CONTENT: KVNamespace;
	__STATIC_CONTENT_MANIFEST: string;
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

async function handleAPI(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const path = url.pathname;
	const method = request.method;

	// 健康檢查
	if (path === '/health' && method === 'GET') {
		return new Response(JSON.stringify({ status: 'ok' }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// 確保 anonymous 用戶存在
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
				return await handleAPI(request, env);
			} catch (e: any) {
				return new Response(JSON.stringify({ error: e.message || 'Internal Server Error' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

		// 靜態資源
		try {
			return await getAssetFromKV(
				{ request, waitUntil: (promise) => ctx.waitUntil(promise) },
				{ ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST) }
			);
		} catch (e: any) {
			// 靜態資源不存在時返回 index.html (SPA fallback)
			if (e.status === 404 || e.message.includes('could not find')) {
				try {
					return await getAssetFromKV(
						{ request: new Request(new URL('/', request.url).toString()), waitUntil: (promise) => ctx.waitUntil(promise) },
						{ ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST) }
					);
				} catch {
					return new Response('Not Found', { status: 404 });
				}
			}
			// 真正的錯誤
			return new Response('Internal Server Error', { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
