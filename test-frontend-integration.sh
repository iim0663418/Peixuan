#!/bin/bash

# 前端整合測試自動化腳本

echo "🧪 前端整合測試開始..."
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 測試計數
PASSED=0
FAILED=0

# 測試函數
test_step() {
    local step_name=$1
    local test_command=$2
    
    echo -n "Testing: $step_name ... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

echo "📡 Step 1: 檢查後端服務"
test_step "後端健康檢查" "curl -s http://localhost:8787/health | grep -q 'ok'"

echo ""
echo "🌐 Step 2: 檢查前端服務"
test_step "前端服務可訪問" "curl -s http://localhost:5174 | grep -q 'html'"

echo ""
echo "🧮 Step 3: 測試統一計算 API"
CHART_RESPONSE=$(curl -s -X POST http://localhost:8787/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"2000-01-01","birthTime":"12:00","gender":"male","longitude":121.5}')

CHART_ID=$(echo "$CHART_RESPONSE" | grep -o '"chartId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$CHART_ID" ]; then
    echo -e "${GREEN}✓ PASS${NC} - chartId 生成成功: $CHART_ID"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - chartId 生成失敗"
    ((FAILED++))
fi

echo ""
echo "🤖 Step 4: 測試 AI Streaming API"
if [ -n "$CHART_ID" ]; then
    echo "測試 SSE 連接..."
    SSE_TEST=$(timeout 5 curl -s -N "http://localhost:8787/api/v1/analyze/stream?chartId=$CHART_ID" | head -5)
    
    if echo "$SSE_TEST" | grep -q "data:"; then
        echo -e "${GREEN}✓ PASS${NC} - SSE 串流正常"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - SSE 串流失敗"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} - 無 chartId，跳過 SSE 測試"
fi

echo ""
echo "📊 測試結果總結"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "通過: ${GREEN}$PASSED${NC}"
echo -e "失敗: ${RED}$FAILED${NC}"
echo -e "總計: $((PASSED + FAILED))"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 所有測試通過！${NC}"
    echo ""
    echo "📖 下一步："
    echo "1. 打開瀏覽器訪問 http://localhost:5174"
    echo "2. 按照 FRONTEND_INTEGRATION_TEST.md 進行手動測試"
    echo "3. 驗證 UI/UX 和 Markdown 渲染"
    exit 0
else
    echo -e "${RED}❌ 部分測試失敗${NC}"
    echo ""
    echo "請檢查："
    echo "- 後端是否運行在 http://localhost:8787"
    echo "- 前端是否運行在 http://localhost:5174"
    echo "- 網絡連接是否正常"
    exit 1
fi
