#!/bin/bash

# 佩璇專案快速部署腳本
# 適用於開發和測試環境的快速部署

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函數定義
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查 Docker 是否安裝
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are available"
}

# 環境選擇
select_environment() {
    echo "請選擇部署環境:"
    echo "1) 開發環境 (Development)"
    echo "2) 測試環境 (Testing)"
    echo "3) 生產環境 (Production)"
    read -p "請輸入選項 (1-3): " env_choice
    
    case $env_choice in
        1)
            ENVIRONMENT="dev"
            COMPOSE_FILE="docker-compose.dev.yml"
            ENV_FILE="backend-node/.env"
            PORT_FRONTEND="5173"
            PORT_BACKEND="3000"
            ;;
        2)
            ENVIRONMENT="test"
            COMPOSE_FILE="docker-compose.test.yml"
            ENV_FILE="backend-node/.env.test"
            PORT_FRONTEND="8081"
            PORT_BACKEND="3001"
            ;;
        3)
            ENVIRONMENT="prod"
            COMPOSE_FILE="docker-compose.prod.yml"
            ENV_FILE="backend-node/.env.prod"
            PORT_FRONTEND="80"
            PORT_BACKEND="3000"
            log_warning "生產環境部署需要額外的安全配置！"
            ;;
        *)
            log_error "無效選項"
            exit 1
            ;;
    esac
    
    log_info "選擇的環境: $ENVIRONMENT"
}

# 檢查環境文件
check_env_files() {
    log_info "檢查環境配置文件..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_warning "環境文件 $ENV_FILE 不存在"
        
        if [ -f "$ENV_FILE.example" ]; then
            log_info "複製環境文件模板..."
            cp "$ENV_FILE.example" "$ENV_FILE"
            log_warning "請編輯 $ENV_FILE 配置正確的環境變數"
            read -p "是否現在編輯環境文件? (y/n): " edit_env
            if [ "$edit_env" = "y" ]; then
                ${EDITOR:-nano} "$ENV_FILE"
            fi
        else
            log_error "環境文件模板 $ENV_FILE.example 也不存在"
            exit 1
        fi
    fi
    
    log_success "環境文件檢查完成"
}

# 停止現有服務
stop_services() {
    log_info "停止現有服務..."
    
    if [ -f "$COMPOSE_FILE" ]; then
        docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    fi
    
    log_success "服務已停止"
}

# 清理資源 (可選)
cleanup_resources() {
    read -p "是否清理 Docker 資源? (y/n): " cleanup_choice
    
    if [ "$cleanup_choice" = "y" ]; then
        log_info "清理 Docker 資源..."
        docker system prune -f
        log_success "Docker 資源清理完成"
    fi
}

# 構建和啟動服務
build_and_start() {
    log_info "構建並啟動服務..."
    
    if [ "$ENVIRONMENT" = "dev" ]; then
        # 開發環境 - 不需要構建，使用開發映像
        docker-compose -f "$COMPOSE_FILE" up -d
    else
        # 測試和生產環境 - 需要構建
        docker-compose -f "$COMPOSE_FILE" up -d --build
    fi
    
    log_success "服務啟動中..."
}

# 等待服務就緒
wait_for_services() {
    log_info "等待服務就緒..."
    
    # 等待後端服務
    log_info "等待後端服務 (端口 $PORT_BACKEND)..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f "http://localhost:$PORT_BACKEND/health" >/dev/null 2>&1; then
            log_success "後端服務已就緒"
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        log_error "後端服務啟動超時"
        show_logs
        exit 1
    fi
    
    # 等待前端服務 (跳過生產環境的 Nginx 檢查)
    if [ "$ENVIRONMENT" != "prod" ]; then
        log_info "等待前端服務 (端口 $PORT_FRONTEND)..."
        timeout=30
        while [ $timeout -gt 0 ]; do
            if curl -f "http://localhost:$PORT_FRONTEND" >/dev/null 2>&1; then
                log_success "前端服務已就緒"
                break
            fi
            sleep 2
            timeout=$((timeout-2))
        done
        
        if [ $timeout -le 0 ]; then
            log_warning "前端服務可能需要更多時間啟動"
        fi
    fi
}

# 顯示服務日誌
show_logs() {
    log_info "顯示最近的服務日誌..."
    docker-compose -f "$COMPOSE_FILE" logs --tail=20
}

# 運行健康檢查
health_check() {
    log_info "執行健康檢查..."
    
    # 後端健康檢查
    if curl -f "http://localhost:$PORT_BACKEND/health" >/dev/null 2>&1; then
        log_success "後端健康檢查通過"
    else
        log_error "後端健康檢查失敗"
        return 1
    fi
    
    # API 端點檢查
    if curl -f "http://localhost:$PORT_BACKEND/api/v1/purple-star/health" >/dev/null 2>&1; then
        log_success "紫微斗數 API 健康檢查通過"
    else
        log_warning "紫微斗數 API 健康檢查失敗"
    fi
    
    if curl -f "http://localhost:$PORT_BACKEND/api/v1/astrology/health" >/dev/null 2>&1; then
        log_success "命理整合 API 健康檢查通過"
    else
        log_warning "命理整合 API 健康檢查失敗"
    fi
    
    log_success "健康檢查完成"
}

# 顯示部署信息
show_deployment_info() {
    echo ""
    echo "======================================"
    echo "🎉 部署完成!"
    echo "======================================"
    echo "環境: $ENVIRONMENT"
    echo ""
    
    if [ "$ENVIRONMENT" = "dev" ]; then
        echo "🌐 前端: http://localhost:$PORT_FRONTEND"
        echo "🔗 後端: http://localhost:$PORT_BACKEND"
        echo "📚 API 文檔: http://localhost:$PORT_BACKEND/api-docs"
    elif [ "$ENVIRONMENT" = "test" ]; then
        echo "🌐 前端: http://localhost:$PORT_FRONTEND"
        echo "🔗 後端: http://localhost:$PORT_BACKEND"
        echo "📚 API 文檔: http://localhost:$PORT_BACKEND/api-docs"
    else
        echo "🌐 網站: https://peixuan.app (需配置域名)"
        echo "🔗 API: https://peixuan.app/api/v1"
    fi
    
    echo ""
    echo "🔧 管理命令:"
    echo "  查看狀態: docker-compose -f $COMPOSE_FILE ps"
    echo "  查看日誌: docker-compose -f $COMPOSE_FILE logs -f"
    echo "  停止服務: docker-compose -f $COMPOSE_FILE down"
    echo "  重啟服務: docker-compose -f $COMPOSE_FILE restart"
    echo ""
    echo "📊 監控端點:"
    echo "  健康檢查: http://localhost:$PORT_BACKEND/health"
    echo "  系統指標: http://localhost:$PORT_BACKEND/metrics"
    echo ""
}

# 主函數
main() {
    echo "======================================"
    echo "🚀 佩璇智慧命理分析平台 - 快速部署"
    echo "======================================"
    echo ""
    
    # 檢查依賴
    check_docker
    
    # 選擇環境
    select_environment
    
    # 檢查環境文件
    check_env_files
    
    # 停止現有服務
    stop_services
    
    # 可選清理
    if [ "$ENVIRONMENT" != "prod" ]; then
        cleanup_resources
    fi
    
    # 構建和啟動
    build_and_start
    
    # 等待服務就緒
    wait_for_services
    
    # 運行健康檢查
    if ! health_check; then
        log_error "健康檢查失敗，顯示日誌..."
        show_logs
        exit 1
    fi
    
    # 顯示部署信息
    show_deployment_info
    
    # 詢問是否查看日誌
    read -p "是否查看實時日誌? (y/n): " show_logs_choice
    if [ "$show_logs_choice" = "y" ]; then
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

# 錯誤處理
trap 'log_error "部署過程中發生錯誤"; exit 1' ERR

# 執行主函數
main "$@"