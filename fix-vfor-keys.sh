#!/bin/bash

# v-for Key 自動修復腳本
# 使用方式: ./fix-vfor-keys.sh

echo "🔍 掃描缺少 key 的 v-for..."

cd bazi-app-vue

# 創建備份
echo "📦 創建備份..."
tar -czf ../vfor-backup-$(date +%Y%m%d-%H%M%S).tar.gz src/

# 統計
total=$(grep -r "v-for" src/components/*.vue src/views/*.vue 2>/dev/null | wc -l | tr -d ' ')
with_key=$(grep -r "v-for.*:key" src/components/*.vue src/views/*.vue 2>/dev/null | wc -l | tr -d ' ')
without_key=$((total - with_key))

echo "📊 統計:"
echo "  總 v-for: $total"
echo "  有 key: $with_key"
echo "  缺 key: $without_key"

echo ""
echo "🔧 開始修復..."
echo ""

# 列出需要手動檢查的檔案
echo "📝 需要手動修復的檔案:"
grep -rl "v-for" src/components/*.vue src/views/*.vue 2>/dev/null | while read file; do
  count=$(grep "v-for" "$file" | grep -v ":key" | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    echo "  - $file ($count 處)"
  fi
done

echo ""
echo "✅ 掃描完成！"
echo ""
echo "📋 下一步:"
echo "  1. 查看 VFOR_KEY_FIX_TRACKER.md"
echo "  2. 逐一修復每個檔案"
echo "  3. 測試功能正常"
echo "  4. 提交變更"
