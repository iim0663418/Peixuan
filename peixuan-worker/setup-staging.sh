#!/bin/bash

# 佩璇 Staging 環境快速重建腳本
# 使用方法: ./setup-staging.sh

set -e  # 遇到錯誤立即退出

echo "🚀 佩璇 Staging 環境重建腳本"
echo "================================"

# 檢查是否在正確目錄
if [ ! -f "wrangler.jsonc" ]; then
    echo "❌ 錯誤: 請在 peixuan-worker 目錄下執行此腳本"
    exit 1
fi

# 步驟 1: 建置並部署 Staging Worker
echo ""
echo "📦 步驟 1/5: 建置並部署 Staging Worker..."
npm run build
wrangler deploy --env staging

# 步驟 2: 設定 Gemini API Key
echo ""
echo "🔑 步驟 2/5: 設定 Gemini API Key..."
echo "請輸入 Gemini API Key (從 https://aistudio.google.com/app/apikey 取得):"
wrangler secret put GEMINI_API_KEY --env staging

# 步驟 3: 設定 Azure OpenAI API Key
echo ""
echo "🔑 步驟 3/5: 設定 Azure OpenAI API Key..."
echo "請輸入 Azure OpenAI API Key (備援用):"
wrangler secret put AZURE_OPENAI_API_KEY --env staging

# 步驟 4: 設定環境標識
echo ""
echo "🏷️  步驟 4/5: 設定環境標識..."
echo "staging" | wrangler secret put ENVIRONMENT --env staging

# 步驟 5: 執行資料庫遷移
echo ""
echo "🗄️  步驟 5/5: 執行資料庫遷移..."
wrangler d1 migrations apply peixuan-db-staging --env staging

# 驗證部署
echo ""
echo "✅ 驗證部署..."
WORKER_URL=$(wrangler deployments list --env staging --json | jq -r '.[0].url' 2>/dev/null || echo "")

if [ -n "$WORKER_URL" ]; then
    echo "🎉 Staging 環境重建完成！"
    echo ""
    echo "📍 Staging URL: $WORKER_URL"
    echo "🔍 健康檢查: $WORKER_URL/health"
    echo ""
    echo "測試指令:"
    echo "curl $WORKER_URL/health"
else
    echo "⚠️  部署完成，但無法自動取得 URL"
    echo "請手動檢查: wrangler deployments list --env staging"
fi

echo ""
echo "🎯 下次關停指令: wrangler delete --env staging --force"
