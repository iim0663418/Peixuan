<template>
  <div class="monitoring-dashboard">
    <h1>{{ $t('monitoring.title') }}</h1>
    
    <div class="dashboard-grid">
      <!-- 系統健康狀態 -->
      <div class="dashboard-card">
        <h2>{{ $t('monitoring.health_status') }}</h2>
        <div v-if="healthData" class="health-status">
          <div class="status-indicator" :class="healthData.status">
            {{ healthData.status }}
          </div>
          <div class="health-details">
            <p><strong>{{ $t('monitoring.uptime') }}:</strong> {{ formatUptime(healthData.uptime) }}</p>
            <p><strong>{{ $t('monitoring.environment') }}:</strong> {{ healthData.environment }}</p>
            <p><strong>{{ $t('monitoring.version') }}:</strong> {{ healthData.version }}</p>
            <p><strong>{{ $t('monitoring.last_check') }}:</strong> {{ formatTime(healthData.timestamp) }}</p>
          </div>
        </div>
        <div v-else class="loading">{{ $t('common.loading') }}</div>
      </div>

      <!-- 記憶體使用情況 -->
      <div class="dashboard-card">
        <h2>{{ $t('monitoring.memory_usage') }}</h2>
        <div v-if="metricsData" class="memory-stats">
          <div class="memory-item">
            <span>{{ $t('monitoring.heap_used') }}:</span>
            <span>{{ formatBytes(metricsData.memory.heapUsed) }}</span>
          </div>
          <div class="memory-item">
            <span>{{ $t('monitoring.heap_total') }}:</span>
            <span>{{ formatBytes(metricsData.memory.heapTotal) }}</span>
          </div>
          <div class="memory-item">
            <span>{{ $t('monitoring.external') }}:</span>
            <span>{{ formatBytes(metricsData.memory.external) }}</span>
          </div>
          <div class="memory-usage-bar">
            <div 
              class="usage-fill"
              :style="{ width: memoryUsagePercentage + '%' }"
            ></div>
          </div>
          <div class="usage-text">{{ memoryUsagePercentage.toFixed(1) }}% {{ $t('monitoring.used') }}</div>
        </div>
        <div v-else class="loading">{{ $t('common.loading') }}</div>
      </div>

      <!-- API 效能監控 -->
      <div class="dashboard-card">
        <h2>{{ $t('monitoring.api_performance') }}</h2>
        <div class="api-stats">
          <div class="stat-item">
            <span class="stat-label">{{ $t('monitoring.total_requests') }}:</span>
            <span class="stat-value">{{ apiStats.totalRequests }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('monitoring.avg_response_time') }}:</span>
            <span class="stat-value">{{ apiStats.avgResponseTime }}ms</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('monitoring.error_rate') }}:</span>
            <span class="stat-value">{{ apiStats.errorRate }}%</span>
          </div>
        </div>
      </div>

      <!-- 最近錯誤 -->
      <div class="dashboard-card full-width">
        <h2>{{ $t('monitoring.recent_errors') }}</h2>
        <div v-if="recentErrors.length > 0" class="error-list">
          <div v-for="error in recentErrors" :key="error.id" class="error-item">
            <div class="error-time">{{ formatTime(error.timestamp) }}</div>
            <div class="error-message">{{ error.message }}</div>
            <div class="error-path">{{ error.path }}</div>
          </div>
        </div>
        <div v-else class="no-errors">{{ $t('monitoring.no_recent_errors') }}</div>
      </div>
    </div>

    <div class="dashboard-actions">
      <button @click="refreshData" class="refresh-btn">
        {{ $t('monitoring.refresh') }}
      </button>
      <button @click="exportLogs" class="export-btn">
        {{ $t('monitoring.export_logs') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  version: string;
  environment: string;
}

interface MetricsData {
  timestamp: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  version: string;
  environment: string;
}

interface ErrorItem {
  id: string;
  timestamp: string;
  message: string;
  path: string;
}

const healthData = ref<HealthData | null>(null);
const metricsData = ref<MetricsData | null>(null);
const recentErrors = ref<ErrorItem[]>([]);
const apiStats = ref({
  totalRequests: 0,
  avgResponseTime: 0,
  errorRate: 0
});

const memoryUsagePercentage = computed(() => {
  if (!metricsData.value) return 0;
  return (metricsData.value.memory.heapUsed / metricsData.value.memory.heapTotal) * 100;
});

const formatUptime = (uptime: number): string => {
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

const fetchHealthData = async (): Promise<void> => {
  try {
    const response = await fetch('/api/v1/health');
    if (response.ok) {
      healthData.value = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch health data:', error);
  }
};

const fetchMetricsData = async (): Promise<void> => {
  try {
    const response = await fetch('/api/v1/metrics');
    if (response.ok) {
      metricsData.value = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch metrics data:', error);
  }
};

const fetchRecentErrors = async (): Promise<void> => {
  // 模擬資料，實際應從後端 API 獲取
  recentErrors.value = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      message: 'Database connection timeout',
      path: '/api/v1/purple-star'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      message: 'Invalid token provided',
      path: '/api/v1/auth/verify'
    }
  ];
};

const refreshData = async (): Promise<void> => {
  await Promise.all([
    fetchHealthData(),
    fetchMetricsData(),
    fetchRecentErrors()
  ]);
};

const exportLogs = (): void => {
  // 實作日誌匯出功能
  alert(t('monitoring.export_coming_soon'));
};

onMounted(() => {
  refreshData();
  
  // 每30秒自動刷新資料
  setInterval(refreshData, 30000);
});
</script>

<style scoped>
.monitoring-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.dashboard-card.full-width {
  grid-column: 1 / -1;
}

.dashboard-card h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
}

.status-indicator {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.status-indicator.ok {
  background-color: #4caf50;
  color: white;
}

.health-details p {
  margin: 0.5rem 0;
  color: #666;
}

.memory-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.memory-item {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.memory-usage-bar {
  width: 100%;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin: 1rem 0 0.5rem 0;
}

.usage-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #ff9800 70%, #f44336 90%);
  transition: width 0.3s ease;
}

.usage-text {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.api-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.error-list {
  max-height: 300px;
  overflow-y: auto;
}

.error-item {
  padding: 1rem;
  border: 1px solid #f44336;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: #fff5f5;
}

.error-time {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.error-message {
  font-weight: bold;
  color: #f44336;
  margin-bottom: 0.25rem;
}

.error-path {
  font-size: 0.9rem;
  color: #888;
  font-family: monospace;
}

.no-errors {
  text-align: center;
  color: #4caf50;
  padding: 2rem;
  font-style: italic;
}

.dashboard-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.refresh-btn, .export-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.refresh-btn {
  background-color: #2196f3;
  color: white;
}

.refresh-btn:hover {
  background-color: #1976d2;
}

.export-btn {
  background-color: #4caf50;
  color: white;
}

.export-btn:hover {
  background-color: #388e3c;
}

.loading {
  text-align: center;
  color: #666;
  font-style: italic;
}
</style>
