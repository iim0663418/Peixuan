# 佩璇 Peixuan — Chinese Astrology API for LLMs

> **Give your LLM the power of BaZi (八字) and Zi Wei Dou Shu (紫微斗數).**

Peixuan is a free, open API that calculates Chinese astrology charts. It returns structured data that any LLM can interpret — no API key required.

**Base URL**: `https://peixuan.sfan-tech.com`

---

## Quick Start — For Any LLM

### 1. Get the persona (optional)
```
GET https://peixuan.sfan-tech.com/persona/character
```
→ Returns Peixuan's character definition. Paste into your system prompt to role-play as a Chinese astrology consultant.

### 2. Calculate a chart
```bash
curl -X POST https://peixuan.sfan-tech.com/calculate/unified \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","gender":"male"}'
```
→ Returns complete BaZi + Zi Wei Dou Shu chart data.

### 3. Let your LLM interpret
Feed the chart data to your LLM along with the persona. It will analyze personality, fortune, relationships, and career — in Peixuan's warm, conversational style.

---

## API Reference

### Calculation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/calculate/unified` | Complete chart (BaZi + Zi Wei) |
| POST | `/calculate/bazi` | BaZi Four Pillars only |
| POST | `/calculate/ziwei` | Zi Wei Dou Shu only |

**Request body** (all endpoints):
```json
{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "gender": "male",
  "longitude": 121.5
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `birthDate` | ✅ | `YYYY-MM-DD` format |
| `birthTime` | ✅ | `HH:MM` 24-hour format |
| `gender` | ✅ | `"male"` or `"female"` |
| `longitude` | ❌ | Birth location longitude (default: 121.5 = Taipei) |

### Persona & Reference Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/persona/character` | Peixuan persona definition |
| GET | `/persona/personality-guide` | How to interpret personality data |
| GET | `/persona/fortune-guide` | How to interpret fortune data |
| GET | `/glossary` | Chinese astrology terminology |
| GET | `/openapi.json` | OpenAPI 3.1 spec |

---

## Platform Integration Guides

### ChatGPT (Custom GPT)

1. Go to [ChatGPT GPT Editor](https://chatgpt.com/gpts/editor)
2. **Name**: 佩璇 Peixuan
3. **Instructions**: Paste the content from `GET /persona/character`
4. **Actions** → Create new action → Import URL:
   ```
   https://peixuan.sfan-tech.com/openapi.json
   ```
5. Save & publish. Users can now ask "幫我算命" and the GPT will call the API automatically.

### Google Gemini

**Option A — Gemini Gems (Web)**:
1. Create a new Gem at [gemini.google.com](https://gemini.google.com)
2. Paste the persona from `GET /persona/character` as custom instructions
3. Tell users to share their chart data (from the API) in the conversation

**Option B — Gemini CLI + MCP** (developers):
```bash
# Coming soon: peixuan-mcp package
```

### Claude (Anthropic)

**Option A — Claude Projects**:
1. Create a new Project
2. Add the persona content as Project Instructions
3. Add the glossary as Project Knowledge

**Option B — Claude Desktop / Kiro (MCP)**:
```json
{
  "mcpServers": {
    "peixuan": {
      "command": "npx",
      "args": ["-y", "peixuan-mcp"]
    }
  }
}
```

### Any Other LLM

Works with any LLM that can process text:

1. Call the API (curl, fetch, or any HTTP client)
2. Paste the JSON response into your conversation
3. Ask the LLM to interpret it

Example prompt:
> Here is my Chinese astrology chart data: [paste JSON]. Please analyze my personality based on the BaZi Five Elements and Zi Wei Life Palace.

---

## What Data You Get

### BaZi (八字) Response
- **Four Pillars**: Year, Month, Day, Hour (Heavenly Stem + Earthly Branch)
- **Ten Gods**: Relationship matrix to Day Master
- **Hidden Stems**: Multi-layered personality indicators
- **Five Elements Distribution**: Wood/Fire/Earth/Metal/Water balance with seasonal adjustment
- **Fortune Cycles**: Decade Luck periods, current cycle, Qi Yun date

### Zi Wei Dou Shu (紫微斗數) Response
- **12 Palaces**: Life, Wealth, Career, Spouse, etc. with star placements
- **Main Stars**: Zi Wei, Tian Fu positions
- **Auxiliary Stars**: Wen Chang, Wen Qu, Zuo Fu, You Bi
- **SiHua Transformations**: Energy flow analysis (化祿化權化科化忌)
- **Star Symmetry**: Opposition patterns between main stars

---

## Self-Hosting

Peixuan runs on Cloudflare Workers (free tier).

```bash
git clone https://github.com/iim0663418/Peixuan.git
cd Peixuan
npm install
wrangler deploy
```

No API keys, no database, no secrets. Pure calculation.

---

## License

CC BY-NC-SA 4.0 — Free for non-commercial use.

---

<div align="center">

**佩璇 Peixuan** — Give your LLM the wisdom of Chinese astrology 🔮

</div>
