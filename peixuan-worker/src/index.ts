import { Router } from 'itty-router';
import { createChartRoutes } from './routes/chartRoutes';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export interface Env {
	DB: D1Database;
	__STATIC_CONTENT: KVNamespace;
	__STATIC_CONTENT_MANIFEST: string;
}

const router = Router();

// 註冊路由
createChartRoutes(router);

// 健康檢查
router.get('/health', () => Response.json({ status: 'ok' }));

// 404 處理
router.all('/api/*', () => Response.json({ error: 'Not Found' }, { status: 404 }));

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// API 路由
		if (url.pathname.startsWith('/api/') || url.pathname === '/health') {
			return router.handle(request, env, ctx);
		}

		// 靜態資源
		try {
			return await getAssetFromKV(
				{ request, waitUntil: (promise) => ctx.waitUntil(promise) },
				{ ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST) }
			);
		} catch (e) {
			return new Response('Asset not found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
