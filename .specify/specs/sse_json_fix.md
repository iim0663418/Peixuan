```typescript
            try {
              const textContent = line.slice(6);
              if (textContent === '[DONE]' || textContent === '{}') continue;

              const data = JSON.parse(textContent);

              // Handle memory metadata events
              if (data.type === 'meta' && data.data) {
                if (data.data.hasMemoryContext) {
                  hasMemoryContext.value = true;
                  memoryReference.value = data.data.memoryReference || '';
                }
              } else if (data.state) {
                currentStatus.value = data.state;
              } else {
                // Extract meaningful content from known fields
                const content = data.text || data.content || data.thought;
                if (content) {
                  response.value += content;
                }
              }
            } catch {
              // Intelligent fallback for JSON objects in plain text/malformed chunks
              const textContent = line.slice(6).trim();
              if (textContent !== '' && textContent !== '[DONE]' && textContent !== '{}') {
                if (textContent.startsWith('{')) {
                  // Try to extract content via regex if JSON.parse failed (e.g. literal newlines)
                  const thoughtMatch = textContent.match(/"thought"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                  const textMatch = textContent.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                  const contentMatch = textContent.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                  
                  const extracted = thoughtMatch?.[1] || textMatch?.[1] || contentMatch?.[1];
                  if (extracted) {
                    // Simple unescape for common characters
                    response.value += extracted.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                    continue;
                  }
                }
                // Fallback to plain text if not JSON-like or extraction failed
                response.value += textContent;
              }
            }
```
