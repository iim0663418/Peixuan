/**
 * Landing page — content negotiation based on Accept header
 */

export function handleLanding(request: Request) {
  const accept = request.headers.get('Accept') || '';
  // LLM/agent requesting plain text → serve llms.txt content
  if (accept.includes('text/plain') && !accept.includes('text/html')) {
    return new Response(null, { status: 302, headers: { 'Location': '/llms.txt' } });
  }
  // Agent requesting JSON → serve OpenAPI spec
  if (accept.includes('application/json') && !accept.includes('text/html')) {
    return new Response(null, { status: 302, headers: { 'Location': '/openapi.json' } });
  }
  return serveLandingHtml();
}

function serveLandingHtml() {
  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>佩璇 Peixuan — Chinese Astrology API for LLMs</title>
<meta name="description" content="Free Chinese astrology calculation API. BaZi (八字) + Zi Wei Dou Shu (紫微斗數). Built for LLMs, usable by humans.">
<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM instructions">
<link rel="alternate" type="application/json" href="/openapi.json" title="OpenAPI spec">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebAPI","name":"佩璇 Peixuan","description":"Chinese astrology calculation API — BaZi (八字) and Zi Wei Dou Shu (紫微斗數). Returns structured JSON for LLM interpretation.","url":"https://peixuan.sfan-tech.com","documentation":"https://peixuan.sfan-tech.com/llms-full.txt","provider":{"@type":"Organization","name":"Peixuan"},"termsOfService":"CC BY-NC-SA 4.0","license":"https://creativecommons.org/licenses/by-nc-sa/4.0/"}
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0a0f;--card:#12121a;--border:#1e1e2e;--text:#e0e0e0;--dim:#888;--accent:#a78bfa;--accent2:#818cf8;--glow:rgba(167,139,250,.15)}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;min-height:100vh}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.container{max-width:800px;margin:0 auto;padding:2rem 1.5rem}
header{text-align:center;padding:4rem 0 2rem}
h1{font-size:2.5rem;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.tagline{color:var(--dim);font-size:1.1rem;margin-top:.5rem}
.badge{display:inline-block;background:var(--glow);color:var(--accent);padding:.25rem .75rem;border-radius:2rem;font-size:.8rem;margin-top:1rem;border:1px solid var(--border)}
.section{margin:2.5rem 0}
.section h2{font-size:1.3rem;margin-bottom:1rem;color:var(--accent)}
.card{background:var(--card);border:1px solid var(--border);border-radius:.75rem;padding:1.25rem;margin:.75rem 0}
.card h3{font-size:1rem;margin-bottom:.5rem}
.card p{color:var(--dim);font-size:.9rem}
code{background:#1a1a2e;padding:.15rem .4rem;border-radius:.25rem;font-size:.85rem;color:#c4b5fd}
pre{background:#1a1a2e;padding:1rem;border-radius:.5rem;overflow-x:auto;font-size:.85rem;line-height:1.5;color:#c4b5fd;margin:.75rem 0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
@media(max-width:600px){.grid{grid-template-columns:1fr}}
.endpoint{display:flex;align-items:center;gap:.5rem;padding:.5rem 0;font-size:.9rem}
.method{font-size:.75rem;font-weight:700;padding:.15rem .5rem;border-radius:.25rem;min-width:3rem;text-align:center}
.get{background:#065f46;color:#6ee7b7}
.post{background:#7c2d12;color:#fdba74}
.proto{display:flex;align-items:center;gap:.75rem;padding:.75rem 0;border-bottom:1px solid var(--border)}
.proto:last-child{border:none}
.proto-icon{font-size:1.5rem;width:2rem;text-align:center}
.proto-info{flex:1}
.proto-info strong{font-size:.95rem}
.proto-info p{color:var(--dim);font-size:.8rem;margin-top:.15rem}
footer{text-align:center;color:var(--dim);font-size:.8rem;padding:3rem 0 2rem;border-top:1px solid var(--border);margin-top:3rem}
</style>
</head>
<body>
<div class="container">

<header>
  <div style="font-size:3rem">🔮</div>
  <h1>佩璇 Peixuan</h1>
  <p class="tagline">中國命理 API — 為 LLM 而生，人類也能用</p>
  <span class="badge">免費 · 開源 · 無需 API Key</span>
</header>

<div class="section">
  <h2>這是什麼？</h2>
  <p>佩璇是一個中國命理的<strong>計算引擎</strong>，根據出生資料計算八字（BaZi）與紫微斗數（Zi Wei Dou Shu）命盤，回傳結構化 JSON。</p>
  <p style="margin-top:.75rem">不同於傳統命理網站，佩璇是一個 <strong>LLM 原生服務</strong> — AI agents 可以透過標準協定自動發現、查詢、呼叫它。人類也可以透過任何 LLM 來使用。</p>
</div>

<div class="section">
  <h2>怎麼用？</h2>
  <p>把這段話貼給你常用的 AI 聊天助手（ChatGPT、Claude、Gemini 都行）：</p>
  <div class="card" style="background:#1a1a2e;cursor:pointer;position:relative" onclick="navigator.clipboard.writeText(this.querySelector('.prompt').textContent.trim());this.querySelector('.copied').style.opacity=1;setTimeout(()=>this.querySelector('.copied').style.opacity=0,1500)">
    <p class="prompt" style="color:#c4b5fd;font-size:.95rem;line-height:1.7">請參考 https://peixuan.sfan-tech.com 這個網站，幫我用八字和紫微斗數算命。我的出生資料：1990 年 5 月 15 日，下午 2 點 30 分，男性。</p>
    <span class="copied" style="position:absolute;top:.5rem;right:.75rem;font-size:.75rem;color:var(--accent);opacity:0;transition:opacity .3s">已複製 ✓</span>
    <p style="color:var(--dim);font-size:.75rem;margin-top:.5rem">👆 點擊複製，把出生資料換成你自己的</p>
  </div>
  <p style="color:var(--dim);font-size:.85rem;margin-top:.75rem">AI 會自動讀取本站的 API 說明、呼叫計算引擎、取得你的命盤資料，然後為你解讀。</p>
</div>

<div class="section">
  <h2>開發者？直接呼叫 API</h2>
  <pre>curl -X POST https://peixuan.sfan-tech.com/calculate/unified \\
  -H "Content-Type: application/json" \\
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","gender":"male"}'</pre>
  <p style="color:var(--dim);font-size:.85rem">或用自然語言查詢：</p>
  <pre>curl "https://peixuan.sfan-tech.com/ask?query=1990-05-15+14:30+male"</pre>
</div>

<div class="section">
  <h2>進階整合</h2>
  <p style="color:var(--dim);font-size:.9rem;margin-bottom:.75rem">想讓你的 AI 助手隨時都能算命？可以做更深度的整合：</p>
  <div class="grid">
    <div class="card">
      <h3>💬 ChatGPT</h3>
      <p>建立 Custom GPT → Actions → 匯入 <code>/openapi.json</code>，使用者說「幫我算命」就會自動呼叫 API</p>
    </div>
    <div class="card">
      <h3>🤖 Claude / Kiro</h3>
      <p>加入 MCP 設定：<br><code>"command": "npx", "args": ["-y", "peixuan-mcp"]</code></p>
    </div>
    <div class="card">
      <h3>✨ Gemini</h3>
      <p>建立 Gem → 貼上 <code>/persona/character</code> 的人設 → 在對話中分享命盤資料</p>
    </div>
    <div class="card">
      <h3>🌐 任何 LLM</h3>
      <p>呼叫 API，把 JSON 貼進對話，請 LLM 解讀</p>
    </div>
  </div>
</div>

<div class="section">
  <h2>API 端點</h2>
  <div class="card">
    <div class="endpoint"><span class="method post">POST</span> <code>/calculate/unified</code> <span style="color:var(--dim)">— 完整命盤（八字 + 紫微）</span></div>
    <div class="endpoint"><span class="method post">POST</span> <code>/calculate/bazi</code> <span style="color:var(--dim)">— 八字四柱</span></div>
    <div class="endpoint"><span class="method post">POST</span> <code>/calculate/ziwei</code> <span style="color:var(--dim)">— 紫微斗數</span></div>
    <div class="endpoint"><span class="method get">GET</span> <code>/ask?query=...</code> <span style="color:var(--dim)">— 自然語言查詢</span></div>
    <div class="endpoint"><span class="method get">GET</span> <code>/persona/character</code> <span style="color:var(--dim)">— 佩璇人設</span></div>
    <div class="endpoint"><span class="method get">GET</span> <code>/persona/personality-guide</code> <span style="color:var(--dim)">— 性格解讀指南</span></div>
    <div class="endpoint"><span class="method get">GET</span> <code>/persona/fortune-guide</code> <span style="color:var(--dim)">— 運勢解讀指南</span></div>
    <div class="endpoint"><span class="method get">GET</span> <code>/glossary</code> <span style="color:var(--dim)">— 命理術語表</span></div>
  </div>
</div>

<div class="section">
  <h2>Agent 協定</h2>
  <p style="color:var(--dim);font-size:.9rem;margin-bottom:.75rem">本站支援所有主流 agent 協定：</p>
  <div class="card">
    <div class="proto">
      <div class="proto-icon">📋</div>
      <div class="proto-info">
        <strong><a href="/llms.txt">llms.txt</a></strong>
        <p>LLM 探索索引 — 描述本站的功能與用途</p>
      </div>
    </div>
    <div class="proto">
      <div class="proto-icon">🔧</div>
      <div class="proto-info">
        <strong><a href="https://www.npmjs.com/package/peixuan-mcp">MCP Server</a></strong>
        <p><code>npx -y peixuan-mcp</code> — 供 Claude、Kiro、Cursor 使用的工具與資源</p>
      </div>
    </div>
    <div class="proto">
      <div class="proto-icon">💬</div>
      <div class="proto-info">
        <strong><a href="/ask?query=1990-05-15+14:30+male">/ask (NLWeb)</a></strong>
        <p>自然語言查詢端點 — 回傳 Schema.org 格式結果</p>
      </div>
    </div>
    <div class="proto">
      <div class="proto-icon">🤝</div>
      <div class="proto-info">
        <strong><a href="/.well-known/agent-card.json">A2A Agent Card</a></strong>
        <p>Agent 間探索 — 技能、能力、提供者資訊</p>
      </div>
    </div>
    <div class="proto">
      <div class="proto-icon">⚡</div>
      <div class="proto-info">
        <strong><a href="/.well-known/agents.json">agents.json</a></strong>
        <p>多步驟工作流程定義 — 供 agent 編排使用</p>
      </div>
    </div>
    <div class="proto">
      <div class="proto-icon">📄</div>
      <div class="proto-info">
        <strong><a href="/openapi.json">OpenAPI 3.1</a></strong>
        <p>相容 ChatGPT GPT Actions 的 API 規格</p>
      </div>
    </div>
  </div>
</div>

<div class="section">
  <h2>回傳資料</h2>
  <div class="grid">
    <div class="card">
      <h3>八字 BaZi</h3>
      <p>四柱（年月日時）、十神、藏干、五行分佈、大運、起運日</p>
    </div>
    <div class="card">
      <h3>紫微斗數 Zi Wei</h3>
      <p>十二宮與星曜、紫微天府定位、四化飛星、星曜對稱</p>
    </div>
  </div>
</div>

<footer>
  <p><strong>佩璇 Peixuan</strong> — 讓你的 LLM 擁有中國命理的智慧 🔮</p>
  <p style="margin-top:.5rem"><a href="https://github.com/iim0663418/Peixuan">GitHub</a> · <a href="/llms-full.txt">完整文件</a> · CC BY-NC-SA 4.0</p>
</footer>

</div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
