/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url' // 修改導入
import { visualizer } from 'rollup-plugin-visualizer' // 添加套件分析工具

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
      },
      manifest: {
        name: '佩璇命理智能分析平台',
        short_name: '佩璇大師',
        description: '一個現代化的命理分析工具',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo192.png', // 假設圖示位於 public/logo192.png
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png', // 假設圖示位於 public/logo512.png
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo512.png', // 假設圖示位於 public/logo512.png, for maskable
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [], // 可選，用於全局設置文件
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'src/main.ts',
        'src/vite-env.d.ts',
        'src/i18n/locales/**',
        '**/*.d.ts'
      ]
    }
  },
})
