/**
 * Geocoding composable for address-to-coordinate conversion
 */
import { ref, reactive } from 'vue';
import {
  GeocodeService,
  type GeocodeCandidate,
} from '../services/geocodeService';

export function useGeocoding() {
  const addressInput = ref('');
  const geocoding = ref(false);
  const candidateAddresses = ref<GeocodeCandidate[]>([]);
  const selectedCandidateIndex = ref<number | null>(null);
  const geocodeStatus = reactive<{
    message: string;
    type: 'success' | 'warning' | 'danger' | 'info';
  }>({
    message: '',
    type: 'info',
  });

  let geocodeTimeout: ReturnType<typeof setTimeout> | null = null;

  // 設置地理編碼狀態
  const setGeocodeStatus = (
    message: string,
    type: 'success' | 'warning' | 'danger' | 'info',
  ) => {
    geocodeStatus.message = message;
    geocodeStatus.type = type;
  };

  // 清除地理編碼狀態
  const clearGeocodeStatus = () => {
    geocodeStatus.message = '';
    geocodeStatus.type = 'info';
  };

  // 地址輸入處理（防抖）
  const handleAddressInput = (geocodeCurrentAddress: () => void) => {
    if (geocodeTimeout) {
      clearTimeout(geocodeTimeout);
    }

    // 清除之前的狀態
    clearGeocodeStatus();
    candidateAddresses.value = [];
    selectedCandidateIndex.value = null;

    if (!addressInput.value || addressInput.value.trim().length < 3) {
      return;
    }

    // 防抖處理，避免頻繁請求API
    geocodeTimeout = setTimeout(() => {
      geocodeCurrentAddress();
    }, 800);
  };

  // 執行地址解析
  const geocodeCurrentAddress = async () => {
    if (!addressInput.value || geocoding.value) {
      return;
    }

    geocoding.value = true;
    clearGeocodeStatus();

    try {
      const result = await GeocodeService.geocodeAddress(addressInput.value);

      if (result.success && result.candidates.length > 0) {
        candidateAddresses.value = result.candidates;

        if (result.candidates.length === 1) {
          // 單一結果直接填入
          setGeocodeStatus('地址解析成功！座標已自動填入', 'success');
          return result.candidates[0];
        }
        // 多個結果讓用戶選擇
        setGeocodeStatus(
          `找到 ${result.candidates.length} 個匹配地址，請選擇最準確的`,
          'warning',
        );
        return null;
      }
      setGeocodeStatus(
        result.error || '找不到匹配的地址，請檢查地址格式',
        'danger',
      );
      candidateAddresses.value = [];
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodeStatus('地址解析失敗，請稍後再試', 'danger');
      return null;
    } finally {
      geocoding.value = false;
    }
  };

  // 從候選地址填入座標
  const fillCoordinatesFromCandidate = (candidate: GeocodeCandidate) => {
    const coords = GeocodeService.formatCoordinates(
      candidate.location.x,
      candidate.location.y,
    );

    // 根據地址嘗試設置時區（台灣地區）
    const shouldUseTaipeiTimezone =
      candidate.attributes.Match_addr?.includes('台灣') ||
      candidate.attributes.City?.includes('台') ||
      (candidate.location.x > 119 &&
        candidate.location.x < 122 &&
        candidate.location.y > 21 &&
        candidate.location.y < 26);

    return {
      longitude: coords.longitude,
      latitude: coords.latitude,
      timezone: shouldUseTaipeiTimezone ? 'Asia/Taipei' : undefined,
    };
  };

  // 選擇候選地址
  const selectCandidate = (index: number) => {
    if (candidateAddresses.value[index]) {
      const coords = fillCoordinatesFromCandidate(
        candidateAddresses.value[index],
      );
      setGeocodeStatus('座標已填入，請確認是否正確', 'success');

      // 隱藏候選列表
      setTimeout(() => {
        candidateAddresses.value = [candidateAddresses.value[index]];
      }, 1000);

      return coords;
    }
    return null;
  };

  // 格式化候選地址顯示
  const formatCandidateDisplay = (candidate: GeocodeCandidate): string => {
    return GeocodeService.formatCandidateForDisplay(candidate);
  };

  return {
    addressInput,
    geocoding,
    candidateAddresses,
    selectedCandidateIndex,
    geocodeStatus,
    handleAddressInput,
    geocodeCurrentAddress,
    fillCoordinatesFromCandidate,
    selectCandidate,
    formatCandidateDisplay,
    clearGeocodeStatus,
  };
}
