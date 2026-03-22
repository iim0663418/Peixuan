/**
 * Peixuan API — LLM-Friendly Astrology Calculation Service
 *
 * Pure calculation endpoints + persona resources.
 * No AI analysis — your LLM interprets the data.
 */

import { AutoRouter, cors, json, error } from 'itty-router';
import { handleCalculateUnified, handleCalculateBazi, handleCalculateZiwei } from './routes/calculate';
import { handleGetPersona, handleGetGlossary, handleGetGuide } from './routes/persona';
import { handleAsk } from './routes/ask';
import { handleLanding } from './routes/landing';
import { openApiSpec } from './routes/openapi';
import llmsTxt from './llms.txt';
import llmsFullTxt from './llms-full.txt';
import agentsJson from './agents.json';
import agentCard from './agent-card.json';

const { preflight, corsify } = cors({ origin: '*' });

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
});

// Support HEAD requests for all GET routes (crawlers, Gemini, etc.)
const head = (path: string, handler: (...args: any[]) => any) => {
  router.get(path, handler);
  router.head(path, handler);
};

// Landing page for humans (content-negotiated for LLMs)
head('/', handleLanding);

// robots.txt with LLM discovery hint
head('/robots.txt', () => new Response(
  'User-agent: *\nAllow: /\n\nSitemap: https://peixuan.sfan-tech.com/sitemap.xml\n\n# LLM discovery\n# See /llms.txt for machine-readable site description\n# See /openapi.json for API specification\n',
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
));

// Health
head('/health', () => json({ status: 'ok', version: '2.0.0' }));

// LLM discovery (llms.txt standard)
head('/llms.txt', () => new Response(llmsTxt, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } }));
head('/llms-full.txt', () => new Response(llmsFullTxt, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } }));

// OpenAPI spec (for ChatGPT GPT Actions)
head('/openapi.json', () => json(openApiSpec));

// Agent workflow discovery (agents.json spec)
head('/.well-known/agents.json', () => json(agentsJson));

// A2A Agent Card discovery
head('/.well-known/agent-card.json', () => json(agentCard));

// Persona resources (LLM reads these to initialize)
head('/persona/character', handleGetPersona);
head('/persona/personality-guide', handleGetGuide('personality'));
head('/persona/fortune-guide', handleGetGuide('fortune'));
head('/glossary', handleGetGlossary);

// Calculation endpoints
router.post('/calculate/unified', handleCalculateUnified);
router.post('/calculate/bazi', handleCalculateBazi);
router.post('/calculate/ziwei', handleCalculateZiwei);

// NLWeb natural language query endpoint
head('/ask', handleAsk);

// Google Search Console verification
head('/google38515448333e76da.html', () => new Response(
  'google-site-verification: google38515448333e76da.html',
  { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
));

// Sitemap for search engine indexing
head('/sitemap.xml', () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://peixuan.sfan-tech.com/</loc></url>
<url><loc>https://peixuan.sfan-tech.com/llms.txt</loc></url>
<url><loc>https://peixuan.sfan-tech.com/openapi.json</loc></url>
</urlset>`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
));

// 404
router.all('*', () => error(404, 'Not found. See /openapi.json for available endpoints.'));

export default router;
