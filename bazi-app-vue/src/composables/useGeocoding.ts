/**
 * Geocoding composable for address-to-coordinate conversion
 * Supports both autocomplete and manual geocoding modes
 */
import { ref, reactive } from 'vue';
import {
  GeocodeService,
  type GeocodeCandidate,
} from '../services/geocodeService';
import type { CityOption } from './useFormData';

export interface AutocompleteOption {
  value: string;
  label: string;
  type: 'address' | 'city';
  candidate?: GeocodeCandidate;
  cityData?: CityOption;
}

export function useGeocoding() {
  const addressInput = ref('');
  const geocoding = ref(false);
  const candidateAddresses = ref<GeocodeCandidate[]>([]);
  const selectedCandidateIndex = ref<number | null>(null);
  const autocompleteOptions = ref<AutocompleteOption[]>([]);
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

  // Autocomplete query search - combines geocoding and city suggestions
  const queryAutocompleteSearch = async (
    queryString: string,
    cb: (results: AutocompleteOption[]) => void,
    majorCities: CityOption[],
  ) => {
    if (!queryString || queryString.trim().length < 2) {
      cb([]);
      return;
    }

    const query = queryString.toLowerCase().trim();
    const results: AutocompleteOption[] = [];

    // Filter major cities that match the query
    const matchingCities = majorCities.filter(
      (city) =>
        city.label.toLowerCase().includes(query) ||
        city.value.toLowerCase().includes(query),
    );

    // Add city suggestions first
    matchingCities.forEach((city) => {
      results.push({
        value: city.label,
        label: `📍 ${city.label}`,
        type: 'city',
        cityData: city,
      });
    });

    // If query is long enough, try geocoding
    if (query.length >= 3) {
      try {
        geocoding.value = true;
        const geocodeResult = await GeocodeService.geocodeAddress(queryString);

        if (geocodeResult.success && geocodeResult.candidates.length > 0) {
          geocodeResult.candidates.slice(0, 5).forEach((candidate) => {
            results.push({
              value: candidate.attributes.Match_addr,
              label: `🔍 ${GeocodeService.formatCandidateForDisplay(candidate)}`,
              type: 'address',
              candidate,
            });
          });
        }
      } catch (error) {
        console.error('Autocomplete geocoding error:', error);
      } finally {
        geocoding.value = false;
      }
    }

    cb(results);
  };

  // Handle autocomplete selection
  const handleAutocompleteSelect = (
    item: AutocompleteOption,
  ): {
    longitude: number;
    latitude: number;
    timezone?: string;
  } | null => {
    if (item.type === 'city' && item.cityData) {
      setGeocodeStatus('已選擇城市座標', 'success');
      return {
        longitude: item.cityData.longitude,
        latitude: item.cityData.latitude,
        timezone: item.cityData.timezone,
      };
    } else if (item.type === 'address' && item.candidate) {
      setGeocodeStatus('已選擇地址座標', 'success');
      return fillCoordinatesFromCandidate(item.candidate);
    }
    return null;
  };

  return {
    addressInput,
    geocoding,
    candidateAddresses,
    selectedCandidateIndex,
    autocompleteOptions,
    geocodeStatus,
    handleAddressInput,
    geocodeCurrentAddress,
    fillCoordinatesFromCandidate,
    selectCandidate,
    formatCandidateDisplay,
    clearGeocodeStatus,
    queryAutocompleteSearch,
    handleAutocompleteSelect,
  };
}
