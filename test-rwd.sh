#!/bin/bash

# RWD 自動化測試腳本

echo "🧪 RWD 優化測試開始..."
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 測試計數
PASSED=0
FAILED=0
TOTAL=0

# 測試函數
test_step() {
    local step_name=$1
    local test_command=$2
    
    ((TOTAL++))
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

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📡 基礎服務檢查${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_step "後端服務 (8787)" "curl -s http://localhost:8787/health | grep -q 'ok'"
test_step "前端服務 (5174)" "curl -s http://localhost:5174 | grep -q 'html'"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🎨 CSS 響應式檢查${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 檢查 App.vue 中的 RWD 優化
APP_VUE="bazi-app-vue/src/App.vue"

test_step "App.vue 包含 mobile-first 斷點" "grep -q '@media (min-width: 480px)' $APP_VUE"
test_step "App.vue 包含 clamp() 流動間距" "grep -q 'clamp(' $APP_VUE"
test_step "App.vue 包含 44px 觸控目標" "grep -q 'min-height: 44px' $APP_VUE"

# 檢查 UnifiedInputForm 中的 RWD 優化
FORM_VUE="bazi-app-vue/src/components/UnifiedInputForm.vue"

test_step "UnifiedInputForm 包含 mobile-first 斷點" "grep -q '@media (min-width: 480px)' $FORM_VUE"
test_step "UnifiedInputForm 包含 clamp() 流動間距" "grep -q 'clamp(' $FORM_VUE"
test_step "UnifiedInputForm 包含 44px 觸控目標" "grep -q 'min-height: 44px' $FORM_VUE"
test_step "UnifiedInputForm 包含 iOS 防縮放" "grep -q 'font-size: 16px' $FORM_VUE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔧 功能完整性檢查${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 測試統一計算 API
CHART_RESPONSE=$(curl -s -X POST http://localhost:8787/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"2000-01-01","birthTime":"12:00","gender":"male","longitude":121.5}')

CHART_ID=$(echo "$CHART_RESPONSE" | grep -o '"chartId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$CHART_ID" ]; then
    echo -e "${GREEN}✓ PASS${NC} - 統一計算 API 正常"
    ((PASSED++))
    ((TOTAL++))
else
    echo -e "${RED}✗ FAIL${NC} - 統一計算 API 失敗"
    ((FAILED++))
    ((TOTAL++))
fi

# 測試 AI Streaming
if [ -n "$CHART_ID" ]; then
    SSE_TEST=$(curl -s -N --max-time 5 "http://localhost:8787/api/v1/analyze/stream?chartId=$CHART_ID" | head -3)
    
    if echo "$SSE_TEST" | grep -q "data:"; then
        echo -e "${GREEN}✓ PASS${NC} - AI Streaming API 正常"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - AI Streaming API 失敗"
        ((FAILED++))
    fi
    ((TOTAL++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 測試結果總結${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "通過: ${GREEN}$PASSED${NC}"
echo -e "失敗: ${RED}$FAILED${NC}"
echo -e "總計: $TOTAL"
echo -e "通過率: $(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")%"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📖 詳細測試報告: RWD_TEST_REPORT.md"
echo ""
echo "🔍 手動測試步驟:"
echo "1. 打開 Chrome DevTools (F12)"
echo "2. 切換到設備模式 (Ctrl+Shift+M)"
echo "3. 測試以下設備:"
echo "   - iPhone SE (375px)"
echo "   - iPhone 12 Pro (390px)"
echo "   - iPad (768px)"
echo "   - Desktop (1920px)"
echo "4. 驗證:"
echo "   - 導航欄響應式佈局"
echo "   - 表單欄位堆疊"
echo "   - 觸控目標大小"
echo "   - 按鈕全寬顯示"
echo "   - 過渡動畫流暢"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 所有自動化測試通過！${NC}"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  部分測試失敗，請檢查詳細報告${NC}"
    exit 1
fi
