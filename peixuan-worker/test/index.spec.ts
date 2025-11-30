import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('Peixuan Worker API', () => {
	describe('Health Check', () => {
		it('responds with status ok (unit style)', async () => {
			const request = new Request('http://example.com/health');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toEqual({ status: 'ok' });
		});

		it('responds with status ok (integration style)', async () => {
			const request = new Request('http://example.com/health');
			const response = await SELF.fetch(request);
			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toEqual({ status: 'ok' });
		});
	});
});
