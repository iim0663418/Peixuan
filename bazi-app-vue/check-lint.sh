#!/bin/bash
cd /Users/shengfanwu/GitHub/佩璇專案/Peixuan/bazi-app-vue
npx eslint . --format=compact 2>&1 | grep "no-undef" | wc -l
