/**
 * Peixuan API — LLM-Friendly Astrology Calculation Service
 *
 * Pure calculation endpoints + persona resources.
 * No AI analysis — your LLM interprets the data.
 */

import { AutoRouter, cors, json, error } from 'itty-router';
import { handleCalculateUnified, handleCalculateBazi, handleCalculateZiwei } from './routes/calculate';
import { handleGetPersona, handleGetGlossary, handleGetGuide } from './routes/persona';
import { openApiSpec } from './routes/openapi';

const { preflight, corsify } = cors({ origin: '*' });

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
});

// Health
router.get('/health', () => json({ status: 'ok', version: '2.0.0' }));

// OpenAPI spec (for ChatGPT GPT Actions)
router.get('/openapi.json', () => json(openApiSpec));

// Persona resources (LLM reads these to initialize)
router.get('/persona/character', handleGetPersona);
router.get('/persona/personality-guide', handleGetGuide('personality'));
router.get('/persona/fortune-guide', handleGetGuide('fortune'));
router.get('/glossary', handleGetGlossary);

// Calculation endpoints
router.post('/calculate/unified', handleCalculateUnified);
router.post('/calculate/bazi', handleCalculateBazi);
router.post('/calculate/ziwei', handleCalculateZiwei);

// 404
router.all('*', () => error(404, 'Not found. See /openapi.json for available endpoints.'));

export default router;
