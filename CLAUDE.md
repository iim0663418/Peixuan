# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Peixuan (佩璇) is an intelligent astrological analysis platform that combines traditional Chinese astrology (BaZi 八字 and Purple Star 紫微斗數) with modern technology to provide multi-dimensional life insights.

## Architecture

This is a cloud-native serverless application with:
- **Frontend**: Vue 3 + TypeScript + Vite application in `bazi-app-vue/`
- **Backend**: Cloudflare Workers + TypeScript in `peixuan-worker/`
- **Database**: Cloudflare D1 (SQLite-based distributed database)
- **Deployment**: Cloudflare Pages (frontend) + Cloudflare Workers (backend)

## Development Commands

### ⚠️ Cloud-First Development Model
This project uses **cloud-based Staging environment** for all development and testing. Local development servers are NOT supported to avoid esbuild CSRF security risks (GHSA-67mh-4wv8-2f99).

### Frontend (bazi-app-vue/)
```bash
cd bazi-app-vue
npm run build        # Build for production (vue-tsc + vite build)
npm run test         # Run unit tests (Vitest, no dev server)
npm run test:ui      # Run tests with UI (for debugging only)
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting
```

### Backend (peixuan-worker/)
```bash
cd peixuan-worker
npm run build                  # Compile to dist/index.js with esbuild
npm run deploy:staging         # Build + Deploy to Staging environment
npm run deploy:production      # Build + Deploy to Production environment
npm run test                   # Run unit tests (Vitest, no dev server)
npm run lint                   # ESLint with auto-fix
npm run db:generate            # Generate Drizzle ORM migrations
npm run db:migrate:staging     # Apply migrations to Staging D1 database
npm run db:migrate:production  # Apply migrations to Production D1 database
```

### Cloud Development Workflow
```bash
# 1. Local: Write code and run unit tests only
cd peixuan-worker
npm run test

# 2. Deploy to Staging for integration testing
npm run deploy:staging

# 3. Test in Staging environment via browser or curl
curl https://peixuan-worker-staging.your-subdomain.workers.dev/health

# 4. After testing passes, merge to main and deploy to Production
npm run deploy:production
```

### Why No Local Dev Server?
Local development servers (`wrangler dev`, `vite dev`) are disabled because:
1. **Security**: esbuild <=0.24.2 has a CSRF vulnerability (GHSA-67mh-4wv8-2f99) in dev server mode
2. **Consistency**: Cloud-first approach ensures development environment matches production
3. **Simplicity**: Reduces local setup complexity and environment-specific issues

## Core Astrological Calculations

### BaZi (八字) System
- **Implementation**: Unified calculation in `peixuan-worker/src/calculation/BaziCalculator.ts`
- **External Dependency**: Uses `lunar-typescript` library for lunar calendar calculations
- **Frontend Components**: `UnifiedInputForm.vue`, `BaziChart.vue`

### Purple Star (紫微斗數) System
- **Implementation**: Main calculation in `peixuan-worker/src/calculation/ZiweiCalculator.ts`
- **Unified Calculator**: Single source of truth in `UnifiedCalculator.ts`
- **Frontend Components**: `ZiweiChart.vue`, `UnifiedResultView.vue`

### AI Analysis System
- **Service**: `peixuan-worker/src/services/geminiService.ts`
- **Model**: Google Gemini 3.0 Flash Preview
- **Features**: Streaming SSE responses, D1-based caching

## Key Services & Utilities

### Backend Services (peixuan-worker/src/)
- `calculation/UnifiedCalculator.ts` - Single source of truth for all calculations
- `calculation/BaziCalculator.ts` - BaZi four pillars calculation
- `calculation/ZiweiCalculator.ts` - Purple Star chart calculation
- `services/geminiService.ts` - Google Gemini AI integration with SSE streaming
- `services/cacheService.ts` - D1-based caching for AI responses
- `routes/calculateRoutes.ts` - Chart calculation API endpoints
- `routes/analyzeRoutes.ts` - AI analysis API endpoints with SSE

### Frontend Services (bazi-app-vue/src/)
- `services/apiService.ts` - Axios HTTP client for API calls
- `services/unifiedApiService.ts` - Unified API client for chart calculations
- `stores/chartStore.ts` - Pinia store for chart state management
- `stores/analysisStore.ts` - Pinia store for AI analysis state

## API Endpoints

### Core APIs
- `POST /api/v1/calculate` - Unified chart calculation (BaZi + ZiWei)
- `POST /api/v1/analyze/personality` - AI personality analysis (SSE streaming)
- `POST /api/v1/analyze/fortune` - AI fortune analysis (SSE streaming)
- `GET /health` - Health check endpoint
- `GET /` - Serves frontend static files from `public/`

## Internationalization

- **Framework**: Vue i18n
- **Languages**: Chinese Traditional (zh_TW), English (en)
- **Location**: `bazi-app-vue/src/i18n/locales/`

## Testing Strategy

### Unit Testing (Local, No Dev Server)
- **Frontend**: Vitest with Vue Test Utils
  - Component Tests: `bazi-app-vue/src/components/__tests__/`
  - Run with: `npm run test` (no watch mode)

- **Backend**: Vitest with Cloudflare Vitest Pool
  - Calculation Tests: `peixuan-worker/src/calculation/__tests__/`
  - Run with: `npm run test` (no watch mode)

### Integration Testing (Cloud Staging)
- Deploy to Staging environment: `npm run deploy:staging`
- Test via browser or API client (curl, Postman, Insomnia)
- Verify complete user workflows end-to-end

## State Management

- **Store**: Pinia-based stores in `bazi-app-vue/src/stores/`
- **Composables**: Reactive logic in `src/composables/`
- **Display Modes**: `useDisplayMode.ts`, `useLayeredReading.ts`

## Build & Deployment

### Staging Deployment
```bash
# Backend
cd peixuan-worker
npm run deploy:staging

# Frontend (build and copy to Worker public/)
cd bazi-app-vue
npm run build
cp -r dist/* ../peixuan-worker/public/
cd ../peixuan-worker
npm run deploy:staging
```

### Production Deployment
```bash
# Backend
cd peixuan-worker
npm run deploy:production

# Frontend
cd bazi-app-vue
npm run build
cp -r dist/* ../peixuan-worker/public/
cd ../peixuan-worker
npm run deploy:production
```

## Important File Locations

- **Backend Entry**: `peixuan-worker/src/index.ts`
- **Wrangler Config**: `peixuan-worker/wrangler.jsonc`
- **Database Schema**: `peixuan-worker/src/db/schema.ts`
- **Unified Calculator**: `peixuan-worker/src/calculation/UnifiedCalculator.ts`
- **Frontend Entry**: `bazi-app-vue/src/main.ts`
- **Router Config**: `bazi-app-vue/src/router/index.ts`
- **Main App**: `bazi-app-vue/src/App.vue`

## Development Notes

- **Cloud-First Development**: No local dev servers. All integration testing happens in Staging environment.
- **Security**: Local esbuild dev server disabled to mitigate CSRF vulnerability (GHSA-67mh-4wv8-2f99)
- **Lunar Calendar**: Uses `lunar-typescript` library for accurate Chinese calendar calculations
- **AI Streaming**: Google Gemini API with Server-Sent Events (SSE) for real-time analysis
- **Caching**: Cloudflare D1 database used for AI response caching
- **Single Source of Truth**: UnifiedCalculator ensures frontend and backend use identical calculation logic
- **Serverless Architecture**: Runs on Cloudflare Workers edge network for global low-latency access