# 佩璇智能命理分析平台 - 部署上線流程手冊

## 📋 文檔概覽

本手冊提供佩璇平台從開發環境到生產環境的完整部署流程，包含 CI/CD 自動化、監控配置、安全設定和運維指南。

**適用版本**: v1.0  
**技術棧**: Vue 3 + Node.js + PostgreSQL + Redis + Docker  
**部署方式**: Docker Compose + 容器化部署  

---

## 🏗️ 系統架構概覽

### 核心組件
```
┌─────────────────────────────────────────────────────────────┐
│                      佩璇部署架構                             │
├─────────────────────────────────────────────────────────────┤
│  Load Balancer (Nginx)                                     │
│  ├── SSL終端                                                │
│  ├── 靜態資源服務                                             │
│  └── 反向代理                                                │
├─────────────────────────────────────────────────────────────┤
│  Application Layer                                          │
│  ├── Frontend (Vue 3 SPA)                                  │
│  │   ├── Vite Build                                        │
│  │   ├── PWA Support                                       │
│  │   └── Nginx Container                                   │
│  │                                                         │
│  └── Backend (Node.js API)                                 │
│      ├── Express Server                                    │
│      ├── JWT Authentication                                │
│      ├── API Rate Limiting                                 │
│      └── Swagger Documentation                             │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├── PostgreSQL (Primary Database)                         │
│  │   ├── User Data                                         │
│  │   ├── Chart Records                                     │
│  │   └── Analysis History                                  │
│  │                                                         │
│  └── Redis (Cache & Sessions)                              │
│      ├── API Response Cache                                │
│      ├── Calculation Results                               │
│      └── Session Storage                                   │
├─────────────────────────────────────────────────────────────┤
│  Monitoring & Logging                                       │
│  ├── Winston Logging                                       │
│  ├── Health Check Endpoints                                │
│  ├── Performance Metrics                                   │
│  └── Error Tracking                                        │
└─────────────────────────────────────────────────────────────┘
```

### 技術棧詳情
- **前端**: Vue 3 + TypeScript + Vite + Element Plus + PWA
- **後端**: Node.js 18 + Express + TypeScript + JWT + Swagger
- **資料庫**: PostgreSQL 15 + TypeORM + Redis 7
- **容器化**: Docker + Docker Compose
- **代理伺服器**: Nginx (可選)
- **CI/CD**: GitHub Actions (推薦) / GitLab CI

---

## 🛠️ 環境準備

### 系統需求

#### 最低配置
- **CPU**: 2 核心
- **記憶體**: 4GB RAM
- **硬碟**: 20GB 可用空間
- **網路**: 穩定的網路連接

#### 推薦配置
- **CPU**: 4 核心
- **記憶體**: 8GB RAM
- **硬碟**: 50GB SSD
- **網路**: 100Mbps 頻寬

### 軟體依賴

#### 必需軟體
```bash
# Docker & Docker Compose
Docker Engine >= 20.10
Docker Compose >= 2.0

# Git
Git >= 2.30

# Node.js (開發環境)
Node.js >= 18.0
npm >= 8.0
```

#### 安裝 Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 驗證安裝
docker --version
docker-compose --version
```

---

## 🔧 開發環境部署

### 快速啟動

#### 1. 克隆專案
```bash
git clone https://github.com/your-org/peixuan.git
cd peixuan
```

#### 2. 環境配置
```bash
# 複製環境變數模板
cp .env.example .env
cp backend-node/.env.example backend-node/.env.dev

# 編輯環境變數
nano backend-node/.env.dev
```

#### 3. 開發環境變數配置
```bash
# backend-node/.env.dev
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=devpassword
DB_NAME=peixuan_dev

# Redis Configuration  
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRES_IN=24h

# API Configuration
API_RATE_LIMIT=1000
CALCULATION_RATE_LIMIT=100

# Swagger Configuration
ENABLE_API_DOCS=true
```

#### 4. 容器啟動
```bash
# 啟動開發環境
docker-compose -f docker-compose.dev.yml up -d

# 查看日誌
docker-compose -f docker-compose.dev.yml logs -f

# 停止服務
docker-compose -f docker-compose.dev.yml down
```

### 開發環境 Docker Compose 配置

創建 `docker-compose.dev.yml`：
```yaml
version: '3.8'

services:
  # PostgreSQL 開發資料庫
  postgres-dev:
    image: postgres:15-alpine
    container_name: peixuan-postgres-dev
    environment:
      POSTGRES_DB: peixuan_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5433:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./backend-node/scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - peixuan-dev-network

  # Redis 開發快取
  redis-dev:
    image: redis:7-alpine
    container_name: peixuan-redis-dev
    ports:
      - "6380:6379"
    volumes:
      - redis_dev_data:/data
    networks:
      - peixuan-dev-network

  # 後端開發服務
  backend-dev:
    build:
      context: ./backend-node
      dockerfile: Dockerfile.dev
    container_name: peixuan-backend-dev
    environment:
      NODE_ENV: development
      DB_HOST: postgres-dev
      REDIS_HOST: redis-dev
    env_file:
      - ./backend-node/.env.dev
    ports:
      - "3000:3000"
    volumes:
      - ./backend-node:/app
      - /app/node_modules
    depends_on:
      - postgres-dev
      - redis-dev
    networks:
      - peixuan-dev-network
    restart: unless-stopped

  # 前端開發服務
  frontend-dev:
    build:
      context: ./bazi-app-vue
      dockerfile: Dockerfile.dev
    container_name: peixuan-frontend-dev
    ports:
      - "5173:5173"
    volumes:
      - ./bazi-app-vue:/app
      - /app/node_modules
    networks:
      - peixuan-dev-network
    environment:
      - VITE_API_BASE_URL=http://localhost:3000/api/v1
    restart: unless-stopped

volumes:
  postgres_dev_data:
  redis_dev_data:

networks:
  peixuan-dev-network:
    driver: bridge
```

### 開發環境驗證

#### 健康檢查
```bash
# 檢查服務狀態
curl http://localhost:3000/health
curl http://localhost:5173

# 檢查 API 文檔
curl http://localhost:3000/api-docs

# 檢查資料庫連接
docker exec peixuan-backend-dev npm run db:check
```

#### 日誌監控
```bash
# 實時查看所有服務日誌
docker-compose -f docker-compose.dev.yml logs -f

# 查看特定服務日誌
docker-compose -f docker-compose.dev.yml logs -f backend-dev
docker-compose -f docker-compose.dev.yml logs -f frontend-dev
```

---

## 🧪 測試環境部署

### 測試環境配置

#### 1. 測試環境變數
```bash
# backend-node/.env.test
NODE_ENV=test
PORT=3000

# Database Configuration
DB_HOST=postgres-test
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=testpassword
DB_NAME=peixuan_test

# Redis Configuration
REDIS_HOST=redis-test
REDIS_PORT=6379

# JWT Configuration (測試用密鑰)
JWT_SECRET=test-jwt-secret-for-testing-only
JWT_EXPIRES_IN=1h

# Testing Configuration
ENABLE_API_DOCS=true
TEST_MODE=true
```

#### 2. 測試環境 Docker Compose
創建 `docker-compose.test.yml`：
```yaml
version: '3.8'

services:
  postgres-test:
    image: postgres:15-alpine
    container_name: peixuan-postgres-test
    environment:
      POSTGRES_DB: peixuan_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: testpassword
    ports:
      - "5434:5432"
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
    networks:
      - peixuan-test-network

  redis-test:
    image: redis:7-alpine
    container_name: peixuan-redis-test
    ports:
      - "6381:6379"
    networks:
      - peixuan-test-network

  backend-test:
    build:
      context: ./backend-node
      dockerfile: Dockerfile
    container_name: peixuan-backend-test
    environment:
      NODE_ENV: test
      DB_HOST: postgres-test
      REDIS_HOST: redis-test
    env_file:
      - ./backend-node/.env.test
    ports:
      - "3001:3000"
    depends_on:
      - postgres-test
      - redis-test
    networks:
      - peixuan-test-network
    command: ["npm", "run", "start:test"]

  frontend-test:
    build:
      context: ./bazi-app-vue
      dockerfile: Dockerfile.prod
    container_name: peixuan-frontend-test
    ports:
      - "8081:80"
    networks:
      - peixuan-test-network
    environment:
      - VITE_API_BASE_URL=http://backend-test:3000/api/v1

volumes:
  postgres_test_data:

networks:
  peixuan-test-network:
    driver: bridge
```

#### 3. 測試自動化腳本
創建 `scripts/test-deploy.sh`：
```bash
#!/bin/bash

echo "🧪 Starting Test Environment Deployment..."

# 停止現有容器
docker-compose -f docker-compose.test.yml down

# 清理舊數據
docker volume rm peixuan_postgres_test_data 2>/dev/null || true

# 構建並啟動測試環境
docker-compose -f docker-compose.test.yml up -d --build

# 等待服務啟動
echo "⏳ Waiting for services to start..."
sleep 30

# 執行健康檢查
echo "🔍 Running Health Checks..."
curl -f http://localhost:3001/health || exit 1
curl -f http://localhost:8081 || exit 1

# 運行自動化測試
echo "🏃 Running Automated Tests..."
docker exec peixuan-backend-test npm run test
docker exec peixuan-backend-test npm run test:integration

echo "✅ Test Environment Deployment Complete!"
echo "🌐 Frontend: http://localhost:8081"
echo "🔗 Backend: http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api-docs"
```

---

## 🚀 生產環境部署

### 生產環境準備

#### 1. 安全配置
```bash
# 生成強密碼
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 16  # DB_PASSWORD
```

#### 2. 生產環境變數
```bash
# backend-node/.env.prod
NODE_ENV=production
PORT=3000

# Database Configuration (使用外部資料庫)
DB_HOST=your-postgres-host.com
DB_PORT=5432
DB_USERNAME=peixuan_user
DB_PASSWORD=your-secure-password
DB_NAME=peixuan_prod

# Redis Configuration (使用外部 Redis)
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT Configuration (強密鑰)
JWT_SECRET=your-super-secure-jwt-secret-256-bits
JWT_EXPIRES_IN=24h

# Security Configuration
CORS_ORIGINS=https://peixuan.app,https://www.peixuan.app
API_RATE_LIMIT=100
CALCULATION_RATE_LIMIT=20

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

#### 3. 生產環境 Docker Compose
創建 `docker-compose.prod.yml`：
```yaml
version: '3.8'

services:
  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: peixuan-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend
      - frontend
    networks:
      - peixuan-network
    restart: unless-stopped

  # 前端生產服務
  frontend:
    build:
      context: ./bazi-app-vue
      dockerfile: Dockerfile.prod
    container_name: peixuan-frontend
    networks:
      - peixuan-network
    environment:
      - VITE_API_BASE_URL=https://api.peixuan.app/api/v1
    restart: unless-stopped

  # 後端生產服務
  backend:
    build:
      context: ./backend-node
      dockerfile: Dockerfile.prod
    container_name: peixuan-backend
    env_file:
      - ./backend-node/.env.prod
    networks:
      - peixuan-network
    volumes:
      - ./logs/backend:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL 生產資料庫
  postgres:
    image: postgres:15-alpine
    container_name: peixuan-postgres
    environment:
      POSTGRES_DB: peixuan_prod
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backup:/backup
    networks:
      - peixuan-network
    restart: unless-stopped

  # Redis 生產快取
  redis:
    image: redis:7-alpine
    container_name: peixuan-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_prod_data:/data
    networks:
      - peixuan-network
    restart: unless-stopped

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  peixuan-network:
    driver: bridge
```

### Nginx 配置

創建 `nginx/nginx.conf`：
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 日誌格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # 基本設定
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # 安全標頭
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 上游服務
    upstream backend {
        server backend:3000;
    }

    # HTTPS 重定向
    server {
        listen 80;
        server_name peixuan.app www.peixuan.app;
        return 301 https://$server_name$request_uri;
    }

    # 主站配置
    server {
        listen 443 ssl http2;
        server_name peixuan.app www.peixuan.app;

        # SSL 配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # 前端靜態文件
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API 端點
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # API 限制
            limit_req zone=api burst=10 nodelay;
        }

        # 健康檢查
        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }
    }

    # 速率限制
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

### 生產部署腳本

創建 `scripts/prod-deploy.sh`：
```bash
#!/bin/bash

set -e

echo "🚀 Starting Production Deployment..."

# 檢查必要文件
if [ ! -f "backend-node/.env.prod" ]; then
    echo "❌ Production environment file not found!"
    exit 1
fi

# 備份現有資料
echo "💾 Creating database backup..."
./scripts/backup-db.sh

# 停止現有服務
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

# 拉取最新代碼
echo "📥 Pulling latest code..."
git pull origin main

# 構建新鏡像
echo "🔨 Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 啟動服務
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服務啟動
echo "⏳ Waiting for services to be ready..."
sleep 60

# 執行資料庫遷移
echo "🗄️ Running database migrations..."
docker exec peixuan-backend npm run db:migrate

# 健康檢查
echo "🔍 Running health checks..."
curl -f https://peixuan.app/health || exit 1

# 清理舊鏡像
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Production deployment completed successfully!"
echo "🌐 Website: https://peixuan.app"
echo "📊 Health: https://peixuan.app/health"
```

---

## 🔄 CI/CD 自動化流程

### GitHub Actions 配置

創建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  DOCKER_BUILDKIT: 1

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: |
          backend-node/package-lock.json
          bazi-app-vue/package-lock.json

    # 後端測試
    - name: Install backend dependencies
      run: |
        cd backend-node
        npm ci

    - name: Run backend linting
      run: |
        cd backend-node
        npm run lint

    - name: Run backend tests
      run: |
        cd backend-node
        npm run test
      env:
        NODE_ENV: test
        DB_HOST: localhost
        DB_PORT: 5432
        DB_USERNAME: postgres
        DB_PASSWORD: postgres
        DB_NAME: test_db
        REDIS_HOST: localhost
        REDIS_PORT: 6379

    # 前端測試
    - name: Install frontend dependencies
      run: |
        cd bazi-app-vue
        npm ci

    - name: Run frontend linting
      run: |
        cd bazi-app-vue
        npm run lint

    - name: Run frontend tests
      run: |
        cd bazi-app-vue
        npm run test:coverage

    - name: Build frontend
      run: |
        cd bazi-app-vue
        npm run build

    # 安全掃描
    - name: Run security audit
      run: |
        cd backend-node && npm audit --audit-level high
        cd ../bazi-app-vue && npm audit --audit-level high

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push images
      run: |
        # 構建並推送後端鏡像
        docker buildx build \
          --platform linux/amd64,linux/arm64 \
          --push \
          --tag ghcr.io/${{ github.repository }}/backend:latest \
          --tag ghcr.io/${{ github.repository }}/backend:${{ github.sha }} \
          ./backend-node

        # 構建並推送前端鏡像
        docker buildx build \
          --platform linux/amd64,linux/arm64 \
          --push \
          --tag ghcr.io/${{ github.repository }}/frontend:latest \
          --tag ghcr.io/${{ github.repository }}/frontend:${{ github.sha }} \
          ./bazi-app-vue

    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.PROD_SSH_KEY }}
        script: |
          cd /opt/peixuan
          git pull origin main
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          docker system prune -f

    - name: Health check
      run: |
        sleep 60
        curl -f https://peixuan.app/health
```

### 部署腳本優化

創建 `scripts/deploy-with-rollback.sh`：
```bash
#!/bin/bash

set -e

BACKUP_DIR="/opt/backups/peixuan"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 創建備份目錄
mkdir -p "$BACKUP_DIR"

echo "🚀 Starting zero-downtime deployment..."

# 1. 預部署檢查
echo "🔍 Pre-deployment checks..."
./scripts/pre-deploy-check.sh

# 2. 創建資料備份
echo "💾 Creating database backup..."
docker exec peixuan-postgres pg_dump -U postgres peixuan_prod > "$BACKUP_DIR/db_$TIMESTAMP.sql"

# 3. 構建新版本
echo "🔨 Building new version..."
docker-compose -f docker-compose.prod.yml build

# 4. 滾動更新
echo "🔄 Rolling update..."
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
sleep 30

# 5. 健康檢查
echo "🔍 Health check..."
if ! curl -f http://localhost:3000/health; then
    echo "❌ Health check failed, rolling back..."
    ./scripts/rollback.sh "$TIMESTAMP"
    exit 1
fi

# 6. 更新前端
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend

# 7. 最終檢查
echo "✅ Final verification..."
sleep 10
curl -f https://peixuan.app/health

echo "🎉 Deployment completed successfully!"
```

---

## 📊 監控與日誌

### 日誌配置

#### Winston 日誌配置 (已實現)
```typescript
// backend-node/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'peixuan-backend' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### 健康檢查端點 (已實現)

系統已實現以下監控端點：
- `GET /health` - 系統健康狀態
- `GET /metrics` - 性能指標
- `GET /api/v1/purple-star/health` - 紫微斗數服務健康
- `GET /api/v1/astrology/health` - 命理整合服務健康

### 監控儀表板配置

創建 `monitoring/docker-compose.monitoring.yml`：
```yaml
version: '3.8'

services:
  # Prometheus 監控
  prometheus:
    image: prom/prometheus:latest
    container_name: peixuan-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - monitoring
    restart: unless-stopped

  # Grafana 儀表板
  grafana:
    image: grafana/grafana:latest
    container_name: peixuan-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    networks:
      - monitoring
    restart: unless-stopped

  # Node Exporter
  node-exporter:
    image: prom/node-exporter:latest
    container_name: peixuan-node-exporter
    ports:
      - "9100:9100"
    networks:
      - monitoring
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
    driver: bridge
```

---

## 🔒 安全配置指南

### SSL/TLS 配置

#### 1. 獲取 SSL 證書
```bash
# 使用 Let's Encrypt
sudo certbot --nginx -d peixuan.app -d www.peixuan.app

# 或使用 Docker
docker run -it --rm --name certbot \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  certbot/certbot certonly --webroot \
  -w /var/lib/letsencrypt/ \
  -d peixuan.app -d www.peixuan.app
```

#### 2. 自動續期
```bash
# 添加到 crontab
0 12 * * * /usr/bin/certbot renew --quiet
```

### 安全檢查清單

#### 系統安全
- [ ] ✅ HTTPS 強制啟用
- [ ] ✅ 強密碼策略 (JWT Secret, DB Password)
- [ ] ✅ CORS 限制設定
- [ ] ✅ API 頻率限制
- [ ] ✅ 輸入驗證和消毒
- [ ] ✅ SQL 注入防護
- [ ] ✅ XSS 防護標頭
- [ ] ❌ 防火牆規則配置
- [ ] ❌ 定期安全更新
- [ ] ❌ 入侵檢測系統

#### 應用安全
- [ ] ✅ JWT Token 安全配置
- [ ] ✅ 敏感資料加密
- [ ] ✅ 錯誤信息過濾
- [ ] ✅ 日誌安全記錄
- [ ] ❌ 定期安全掃描
- [ ] ❌ 依賴漏洞檢查

### 資料備份策略

創建 `scripts/backup-db.sh`：
```bash
#!/bin/bash

BACKUP_DIR="/opt/backups/peixuan"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# 創建備份目錄
mkdir -p "$BACKUP_DIR"

# 資料庫備份
echo "📦 Creating database backup..."
docker exec peixuan-postgres pg_dump -U postgres peixuan_prod > "$BACKUP_DIR/db_$TIMESTAMP.sql"

# 壓縮備份
gzip "$BACKUP_DIR/db_$TIMESTAMP.sql"

# 上傳到 S3 (可選)
if [ -n "$AWS_S3_BUCKET" ]; then
    aws s3 cp "$BACKUP_DIR/db_$TIMESTAMP.sql.gz" "s3://$AWS_S3_BUCKET/backups/"
fi

# 清理舊備份
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed: db_$TIMESTAMP.sql.gz"
```

---

## 🛠️ 運維手冊

### 常用運維命令

#### 服務管理
```bash
# 查看服務狀態
docker-compose -f docker-compose.prod.yml ps

# 重啟單個服務
docker-compose -f docker-compose.prod.yml restart backend

# 查看日誌
docker-compose -f docker-compose.prod.yml logs -f --tail=100 backend

# 進入容器
docker exec -it peixuan-backend bash

# 檢查資源使用
docker stats
```

#### 資料庫管理
```bash
# 連接資料庫
docker exec -it peixuan-postgres psql -U postgres -d peixuan_prod

# 執行 SQL 文件
docker exec -i peixuan-postgres psql -U postgres -d peixuan_prod < backup.sql

# 查看資料庫大小
docker exec peixuan-postgres psql -U postgres -d peixuan_prod -c "
SELECT pg_size_pretty(pg_database_size('peixuan_prod'));"
```

#### 快取管理
```bash
# 連接 Redis
docker exec -it peixuan-redis redis-cli

# 清空快取
docker exec peixuan-redis redis-cli FLUSHALL

# 查看快取統計
docker exec peixuan-redis redis-cli INFO memory
```

### 故障排除指南

#### 常見問題

**1. 後端服務無法啟動**
```bash
# 檢查日誌
docker logs peixuan-backend

# 檢查環境變數
docker exec peixuan-backend env | grep -E "(DB_|REDIS_|JWT_)"

# 檢查資料庫連接
docker exec peixuan-backend npm run db:check
```

**2. 前端頁面無法載入**
```bash
# 檢查 Nginx 配置
docker exec peixuan-nginx nginx -t

# 重新載入配置
docker exec peixuan-nginx nginx -s reload

# 檢查前端構建
docker exec peixuan-frontend ls -la /usr/share/nginx/html
```

**3. API 請求緩慢**
```bash
# 檢查資料庫性能
docker exec peixuan-postgres psql -U postgres -d peixuan_prod -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"

# 檢查 Redis 性能
docker exec peixuan-redis redis-cli --latency-history -i 1
```

### 性能調優

#### 後端優化
```bash
# 增加 Node.js 記憶體限制
docker run --memory=2g --memory-swap=4g peixuan-backend

# 調整 PostgreSQL 配置
echo "shared_buffers = 256MB" >> postgresql.conf
echo "effective_cache_size = 1GB" >> postgresql.conf
```

#### 前端優化
```bash
# 啟用 Nginx 快取
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public";
}
```

### 定期維護

創建 `scripts/maintenance.sh`：
```bash
#!/bin/bash

echo "🔧 Starting system maintenance..."

# 1. 清理 Docker 資源
echo "🧹 Cleaning Docker resources..."
docker system prune -f
docker volume prune -f

# 2. 資料庫維護
echo "🗄️ Database maintenance..."
docker exec peixuan-postgres psql -U postgres -d peixuan_prod -c "VACUUM ANALYZE;"

# 3. 日誌輪轉
echo "📝 Log rotation..."
find /opt/peixuan/logs -name "*.log" -size +100M -exec gzip {} \;
find /opt/peixuan/logs -name "*.gz" -mtime +30 -delete

# 4. 更新系統
echo "🔄 System updates..."
sudo apt update && sudo apt upgrade -y

# 5. 重啟服務 (如需要)
if [ "$1" = "--restart" ]; then
    echo "🔄 Restarting services..."
    docker-compose -f docker-compose.prod.yml restart
fi

echo "✅ Maintenance completed!"
```

---

## 🚨 應急處理流程

### 緊急回滾

創建 `scripts/emergency-rollback.sh`：
```bash
#!/bin/bash

set -e

echo "🚨 EMERGENCY ROLLBACK INITIATED"

ROLLBACK_TAG=${1:-"previous"}
BACKUP_FILE=${2}

# 1. 立即切換到維護模式
echo "🔧 Enabling maintenance mode..."
docker run --rm -v $(pwd)/nginx:/etc/nginx nginx:alpine cp /etc/nginx/maintenance.conf /etc/nginx/nginx.conf

# 2. 回滾應用
echo "🔄 Rolling back application..."
docker-compose -f docker-compose.prod.yml down
git checkout $ROLLBACK_TAG
docker-compose -f docker-compose.prod.yml up -d

# 3. 恢復資料庫 (如有提供備份)
if [ -n "$BACKUP_FILE" ]; then
    echo "🗄️ Restoring database..."
    docker exec peixuan-postgres psql -U postgres -d peixuan_prod < "$BACKUP_FILE"
fi

# 4. 健康檢查
echo "🔍 Health check..."
sleep 30
curl -f http://localhost:3000/health

# 5. 恢復正常模式
echo "✅ Disabling maintenance mode..."
docker run --rm -v $(pwd)/nginx:/etc/nginx nginx:alpine cp /etc/nginx/production.conf /etc/nginx/nginx.conf
docker exec peixuan-nginx nginx -s reload

echo "✅ Emergency rollback completed!"
```

### 災難恢復

創建 `scripts/disaster-recovery.sh`：
```bash
#!/bin/bash

echo "🆘 DISASTER RECOVERY INITIATED"

# 1. 從備份恢復完整系統
LATEST_BACKUP=$(find /opt/backups/peixuan -name "db_*.sql.gz" | sort | tail -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found!"
    exit 1
fi

# 2. 重新部署基礎設施
docker-compose -f docker-compose.prod.yml down
docker system prune -af
docker-compose -f docker-compose.prod.yml up -d

# 3. 恢復資料庫
echo "🗄️ Restoring database from $LATEST_BACKUP..."
gunzip -c "$LATEST_BACKUP" | docker exec -i peixuan-postgres psql -U postgres -d peixuan_prod

# 4. 驗證恢復
echo "🔍 Verifying recovery..."
./scripts/health-check.sh

echo "✅ Disaster recovery completed!"
```

---

## 📈 監控與告警

### 監控指標

#### 應用層監控
- API 響應時間
- 錯誤率
- 請求量 (QPS)
- 資料庫連接數
- 快取命中率

#### 系統層監控
- CPU 使用率
- 記憶體使用率
- 磁盤使用率
- 網路流量

#### 業務監控
- 用戶註冊數
- 命盤計算次數
- API 調用分布

### 告警配置

創建 `monitoring/alerts.yml`：
```yaml
# Prometheus 告警規則
groups:
- name: peixuan-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      
  - alert: DatabaseDown
    expr: up{job="postgres"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database is down"
      
  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage"
```

---

## 📋 部署檢查清單

### 部署前檢查
- [ ] ✅ 代碼已合併到 main 分支
- [ ] ✅ 所有測試通過
- [ ] ✅ 安全掃描完成
- [ ] ✅ 環境變數已配置
- [ ] ✅ SSL 證書有效
- [ ] ✅ 資料庫備份完成
- [ ] ✅ 監控告警已設置

### 部署後檢查
- [ ] ✅ 健康檢查通過
- [ ] ✅ API 端點正常響應
- [ ] ✅ 前端頁面載入正常
- [ ] ✅ 資料庫連接正常
- [ ] ✅ 快取服務正常
- [ ] ✅ 日誌正常記錄
- [ ] ✅ 監控指標正常

### 回滾計劃
- [ ] ✅ 回滾腳本已準備
- [ ] ✅ 資料庫備份可用
- [ ] ✅ 回滾觸發條件明確
- [ ] ✅ 回滾責任人指定

---

## 🎯 總結

本部署手冊涵蓋了佩璇智能命理分析平台從開發到生產的完整部署流程，包含：

### ✅ 已實現功能
- Docker 容器化部署
- 多環境配置管理
- 健康檢查端點
- 日誌記錄系統
- API 文檔自動生成
- 頻率限制保護
- 錯誤處理機制

### 🔧 待完善功能
- CI/CD 自動化流程
- SSL 證書配置
- 監控儀表板
- 自動化備份
- 災難恢復流程
- 性能調優

### 🚀 下一步行動
1. 實施 CI/CD 流程
2. 配置生產環境監控
3. 建立災難恢復計劃
4. 進行負載測試
5. 優化性能配置

**維護團隊**: DevOps 團隊  
**文檔版本**: v1.0  
**最後更新**: 2025年1月24日

---

*此文檔將隨著系統發展持續更新，確保部署流程的準確性和完整性。*