#!/bin/bash
cd bazi-app-vue
npx eslint src --format=json | jq -r '.[] | select(.messages | length > 0) | .filePath as $file | .messages[] | select(.ruleId == "no-unused-vars" or .ruleId == "@typescript-eslint/no-unused-vars") | "\($file):\(.line):\(.column) - \(.message)"' | sort
