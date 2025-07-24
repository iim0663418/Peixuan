# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Peixuan (佩璇) is an intelligent astrological analysis platform that combines traditional Chinese astrology (BaZi 八字 and Purple Star 紫微斗數) with modern technology to provide multi-dimensional life insights.

## Architecture

This is a full-stack application with:
- **Frontend**: Vue 3 + TypeScript + Vite application in `bazi-app-vue/`
- **Backend**: Node.js + Express + TypeScript API server in `backend-node/`
- **Containerization**: Docker Compose setup with PostgreSQL and Redis

## Development Commands

### Frontend (bazi-app-vue/)
```bash
cd bazi-app-vue
npm run dev          # Start development server (Vite)
npm run build        # Build for production (vue-tsc + vite build)
npm run preview      # Preview production build
npm run test         # Run tests (Vitest)
npm run test:ui      # Run tests with UI
npm run lint         # ESLint with auto-fix
npm run format      # Prettier formatting
```

### Backend (backend-node/)
```bash
cd backend-node
npm run dev          # Start development server (nodemon)
npm run build        # Compile TypeScript (tsc)
npm run start        # Start production server
npm run test         # Run tests (Jest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:integration # Run integration tests
npm run test:api     # Run API tests
```

### Docker Development
```bash
docker-compose up -d  # Start all services
docker-compose logs -f # View logs
```

## Core Astrological Calculations

### BaZi (八字) System
- **Frontend Implementation**: Calculation logic in `bazi-app-vue/src/utils/baziCalc.ts`
- **External Dependency**: Uses `lunar.min.js` library for lunar calendar calculations
- **Components**: `BaziInputForm.vue`, `BaziChart.vue`, `BaziChartDisplay.vue`

### Purple Star (紫微斗數) System
- **Backend Implementation**: Main calculation service in `backend-node/src/services/purpleStarCalculationService.ts`
- **Enhanced Service**: Advanced calculations in `enhancedPurpleStarCalculationService.ts`
- **Transformation Stars**: Four transformations (四化) logic in `transformationStarService.ts`
- **Frontend Components**: `PurpleStarInputForm.vue`, `PurpleStarChartDisplay.vue`

### Cross-Validation System
- **Integration Service**: `astrologyIntegrationService.ts` (both frontend and backend)
- **Layered Responses**: Role-based analysis depth in `layeredResponseService.ts`

## Key Services & Utilities

### Backend Services
- `purpleStarCalculationService.ts` - Core purple star calculations
- `astrologyIntegrationService.ts` - Cross-validation between BaZi and Purple Star
- `layeredResponseService.ts` - Role-based response depth (anonymous/member/VIP)
- `transformationStarService.ts` - Four transformations (四化飛星) calculations
- `astronomicalTimeService.ts` - Time and astronomical calculations

### Frontend Services
- `apiService.ts` - HTTP client for backend API calls
- `enhancedStorageService.ts` - Local storage management with versioning
- `baziCalc.ts` - BaZi calculation utilities
- `ziweiCalc.ts` - Purple star calculation helpers

## API Endpoints

### Core APIs
- `POST /api/v1/purple-star/calculate` - Purple star chart calculation
- `POST /api/v1/astrology/integrated-analysis` - Cross-validation analysis
- `POST /api/v1/auth/login` - User authentication
- `GET /health` - Health check endpoint
- `GET /metrics` - Application metrics

## Internationalization

- **Framework**: Vue i18n
- **Languages**: Chinese Traditional (zh_TW), Chinese Simplified (zh), English (en)
- **Location**: `bazi-app-vue/src/i18n/locales/`

## Testing Strategy

### Frontend Testing
- **Framework**: Vitest
- **Component Tests**: Located in `src/components/__tests__/`
- **Utility Tests**: Located in `src/utils/__tests__/`

### Backend Testing
- **Framework**: Jest + Supertest
- **API Tests**: Located in `src/__tests__/routes/`
- **Test Configuration**: `jest.config.js`

## State Management

- **Store**: Pinia-based stores in `bazi-app-vue/src/stores/`
- **Composables**: Reactive logic in `src/composables/`
- **Display Modes**: `useDisplayMode.ts`, `useLayeredReading.ts`

## Build & Production

### Production Build
```bash
# Frontend
cd bazi-app-vue && npm run build

# Backend  
cd backend-node && npm run build
```

### Docker Production
```bash
docker-compose up --build
```

## Important File Locations

- **Type Definitions**: `backend-node/src/types/purpleStarTypes.ts`
- **Router Configuration**: `bazi-app-vue/src/router/index.ts`
- **Main Application**: `bazi-app-vue/src/App.vue`
- **Backend Entry**: `backend-node/src/index.ts`
- **Logging**: `backend-node/src/utils/logger.ts`

## Development Notes

- The application uses lunar-javascript library for Chinese calendar calculations
- Authentication uses JWT tokens with role-based access control
- Storage service includes data versioning and migration capabilities
- Monitoring and logging are implemented with Winston on backend
- Error handling includes both global error handlers and component-level handling
- The system supports layered analysis depth based on user roles (anonymous/member/VIP)