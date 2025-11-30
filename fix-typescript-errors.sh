#!/bin/bash
# 批量修復 TypeScript 錯誤

cd bazi-app-vue

# 修復所有 yearStemGod -> yearPillar 等
find src/components -name "*.vue" -o -name "*.ts" | while read file; do
  sed -i '' 's/yearStemGod/yearPillar/g' "$file"
  sed -i '' 's/monthStemGod/monthPillar/g' "$file"
  sed -i '' 's/dayStemGod/dayPillar/g' "$file"
  sed -i '' 's/hourStemGod/hourPillar/g' "$file"
done

echo "修復完成"
