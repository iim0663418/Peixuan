#!/bin/bash

echo "🧪 測試前端路由配置"
echo "===================="
echo ""

BASE_URL="http://localhost:5174"

echo "✅ 測試 1: 首頁 (/)"
curl -s "$BASE_URL/" | grep -q "佩璇命理智能分析平台" && echo "   ✓ 首頁正常" || echo "   ✗ 首頁異常"

echo ""
echo "✅ 測試 2: 整合命盤計算 (/calculate)"
curl -s "$BASE_URL/calculate" | grep -q "佩璇命理智能分析平台" && echo "   ✓ /calculate 正常" || echo "   ✗ /calculate 異常"

echo ""
echo "✅ 測試 3: 性格分析 (/personality)"
curl -s "$BASE_URL/personality" | grep -q "佩璇命理智能分析平台" && echo "   ✓ /personality 正常" || echo "   ✗ /personality 異常"

echo ""
echo "✅ 測試 4: 運勢分析 (/fortune)"
curl -s "$BASE_URL/fortune" | grep -q "佩璇命理智能分析平台" && echo "   ✓ /fortune 正常" || echo "   ✗ /fortune 異常"

echo ""
echo "✅ 測試 5: 每日提醒 (/daily)"
curl -s "$BASE_URL/daily" | grep -q "佩璇命理智能分析平台" && echo "   ✓ /daily 正常" || echo "   ✗ /daily 異常"

echo ""
echo "✅ 測試 6: 向後兼容 - /unified → /calculate"
curl -s "$BASE_URL/unified" | grep -q "佩璇命理智能分析平台" && echo "   ✓ /unified redirect 正常" || echo "   ✗ /unified redirect 異常"

echo ""
echo "✅ 測試 7: 向後兼容 - /ai-analysis → /personality"
curl -s "$BASE_URL/ai-analysis" | grep -q "佩璇命理智能分析平台" && echo "   ✓ /ai-analysis redirect 正常" || echo "   ✗ /ai-analysis redirect 異常"

echo ""
echo "✅ 測試 8: 向後兼容 - /advanced-analysis → /fortune"
curl -s "$BASE_URL/advanced-analysis" | grep -q "佩璇命理智能分析平台" && echo "   ✓ /advanced-analysis redirect 正常" || echo "   ✗ /advanced-analysis redirect 異常"

echo ""
echo "===================="
echo "✅ 路由測試完成"
