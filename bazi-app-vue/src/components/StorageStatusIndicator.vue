<template>
  <div class="storage-status">
    <div class="status-badge" :class="statusClass">
      <span class="status-icon">{{ statusIcon }}</span>
      <span class="status-text">{{ statusText }}</span>
    </div>
    <div v-if="showDetails" class="storage-details">
      <div class="detail-item">
        <span class="label">{{ $t('storage.totalSize') }}:</span>
        <span class="value">{{ formatSize(storageStats?.totalSize || 0) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">{{ $t('storage.usage') }}:</span>
        <span class="value">{{ formatPercentage(storageStats?.usagePercentage || 0) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">{{ $t('storage.itemCount') }}:</span>
        <span class="value">{{ storageStats?.itemCount || 0 }}</span>
      </div>
      <div class="detail-item">
        <span class="label">{{ $t('storage.lastUpdated') }}:</span>
        <span class="value">{{ formatTime(storageStats?.lastUpdated) }}</span>
      </div>
    </div>
    <div class="storage-actions">
      <el-button 
        size="small" 
        type="info" 
        @click="toggleDetails"
      >
        {{ showDetails ? $t('storage.hideDetails') : $t('storage.showDetails') }}
      </el-button>
      <el-button 
        size="small" 
        type="danger" 
        @click="clearAllData"
      >
        {{ $t('storage.clearAll') }}
      </el-button>
      <el-button 
        size="small" 
        type="success" 
        @click="validateData"
      >
        {{ $t('storage.validate') }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { enhancedStorageService, StorageStats } from '../utils/enhancedStorageService';

export default defineComponent({
  name: 'StorageStatusIndicator',
  setup() {
    const { t } = useI18n();
    const storageStats = ref<StorageStats | null>(null);
    const storageAvailable = ref(true);
    const showDetails = ref(false);
    const validationStatus = ref<'success' | 'warning' | 'error' | null>(null);
    
    // 格式化檔案大小
    const formatSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    // 格式化百分比
    const formatPercentage = (percentage: number): string => {
      return percentage.toFixed(2) + '%';
    };
    
    // 格式化時間
    const formatTime = (timestamp?: number): string => {
      if (!timestamp) return t('storage.never');
      return new Date(timestamp).toLocaleString();
    };
    
    // 狀態計算屬性
    const statusClass = computed(() => {
      if (!storageAvailable.value) return 'status-error';
      if (validationStatus.value === 'error') return 'status-error';
      if (validationStatus.value === 'warning') return 'status-warning';
      if (storageStats.value && storageStats.value.usagePercentage > 80) return 'status-warning';
      return 'status-ok';
    });
    
    const statusIcon = computed(() => {
      if (!storageAvailable.value) return '❌';
      if (validationStatus.value === 'error') return '⚠️';
      if (validationStatus.value === 'warning') return '⚠️';
      if (storageStats.value && storageStats.value.usagePercentage > 80) return '⚠️';
      return '✅';
    });
    
    const statusText = computed(() => {
      if (!storageAvailable.value) return t('storage.unavailable');
      if (validationStatus.value === 'error') return t('storage.dataInconsistent');
      if (validationStatus.value === 'warning') return t('storage.dataWarning');
      if (storageStats.value && storageStats.value.usagePercentage > 80) return t('storage.almostFull');
      return t('storage.healthy');
    });
    
    // 更新存儲統計數據
    const updateStats = () => {
      storageAvailable.value = enhancedStorageService.isStorageAvailable();
      if (storageAvailable.value) {
        storageStats.value = enhancedStorageService.getStorageUsage();
      }
    };
    
    // 切換詳細信息顯示
    const toggleDetails = () => {
      showDetails.value = !showDetails.value;
      if (showDetails.value) {
        updateStats();
      }
    };
    
    // 清除所有數據
    const clearAllData = async () => {
      try {
        enhancedStorageService.clearChartData();
        ElMessage.success(t('storage.dataCleared'));
        updateStats();
      } catch (error) {
        console.error('清除數據時發生錯誤:', error);
        ElMessage.error(t('storage.clearError'));
      }
    };
    
    // 驗證數據
    const validateData = () => {
      try {
        const isValid = enhancedStorageService.validateStorageData();
        if (isValid) {
          validationStatus.value = 'success';
          ElMessage.success(t('storage.validationSuccess'));
        } else {
          validationStatus.value = 'warning';
          ElMessage.warning(t('storage.validationWarning'));
        }
      } catch (error) {
        console.error('驗證數據時發生錯誤:', error);
        validationStatus.value = 'error';
        ElMessage.error(t('storage.validationError'));
      }
      
      updateStats();
    };
    
    // 組件掛載時初始化
    onMounted(() => {
      updateStats();
    });
    
    return {
      storageStats,
      storageAvailable,
      showDetails,
      validationStatus,
      statusClass,
      statusIcon,
      statusText,
      formatSize,
      formatPercentage,
      formatTime,
      toggleDetails,
      clearAllData,
      validateData
    };
  }
});
</script>

<style scoped>
.storage-status {
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  background-color: #f8f9fa;
  font-size: 14px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.status-ok {
  background-color: #e7f6e7;
  color: #2d8a2d;
}

.status-warning {
  background-color: #fdf3e4;
  color: #e0a800;
}

.status-error {
  background-color: #feebee;
  color: #dc3545;
}

.status-icon {
  margin-right: 5px;
}

.storage-details {
  margin: 10px 0;
  padding: 10px;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.detail-item {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: bold;
}

.storage-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
</style>
