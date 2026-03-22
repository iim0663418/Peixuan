#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API = process.env.PEIXUAN_API_URL ?? 'https://peixuan.sfan-tech.com';

const server = new McpServer({
  name: 'peixuan',
  version: '1.0.0',
});

// --- Tools ---

const birthInput = {
  birthDate: z.string().describe('Birth date YYYY-MM-DD'),
  birthTime: z.string().describe('Birth time HH:MM (24h)'),
  gender: z.enum(['male', 'female']).describe('Gender'),
  longitude: z.number().optional().describe('Birth longitude (default 121.5 Taipei)'),
};

server.tool(
  'calculate_chart',
  'Calculate complete Chinese astrology chart (BaZi + Zi Wei Dou Shu). Returns Four Pillars, Ten Gods, Five Elements, 12 Palaces, Stars, SiHua, Fortune Cycles.',
  birthInput,
  async (args) => {
    const res = await fetch(`${API}/calculate/unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  'calculate_bazi',
  'Calculate BaZi (八字 Four Pillars) only. Returns Four Pillars, Ten Gods, Hidden Stems, Five Elements distribution, Fortune Cycles.',
  birthInput,
  async (args) => {
    const res = await fetch(`${API}/calculate/bazi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  'calculate_ziwei',
  'Calculate Zi Wei Dou Shu (紫微斗數) only. Returns 12 Palaces, Star positions, SiHua Transformations, Star Symmetry.',
  birthInput,
  async (args) => {
    const res = await fetch(`${API}/calculate/ziwei`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  }
);

// --- Resources ---

async function fetchText(path: string): Promise<string> {
  const res = await fetch(`${API}${path}`);
  const data = await res.json() as Record<string, unknown>;
  return (data.content as string) ?? JSON.stringify(data, null, 2);
}

server.resource(
  'persona',
  'peixuan://persona/character',
  { description: 'Peixuan (佩璇) persona definition — add to system prompt for Chinese astrology consultant role-play', mimeType: 'text/markdown' },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await fetchText('/persona/character') }],
  })
);

server.resource(
  'personality-guide',
  'peixuan://persona/personality-guide',
  { description: 'Guide for interpreting BaZi/ZiWei data as personality analysis', mimeType: 'text/markdown' },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await fetchText('/persona/personality-guide') }],
  })
);

server.resource(
  'fortune-guide',
  'peixuan://persona/fortune-guide',
  { description: 'Guide for interpreting fortune data as 6-month forecast', mimeType: 'text/markdown' },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await fetchText('/persona/fortune-guide') }],
  })
);

server.resource(
  'glossary',
  'peixuan://reference/glossary',
  { description: 'Chinese astrology terminology (BaZi, Zi Wei, Ten Gods, SiHua, etc.)', mimeType: 'text/markdown' },
  async (uri) => ({
    contents: [{ uri: uri.href, text: await fetchText('/glossary') }],
  })
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Peixuan MCP server running on stdio');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
