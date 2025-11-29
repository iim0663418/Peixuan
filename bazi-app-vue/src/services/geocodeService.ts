import axios from 'axios';

export interface GeocodeCandidate {
  address: string;
  location: {
    x: number; // longitude
    y: number; // latitude
  };
  score: number;
  attributes: {
    Addr_type: string;
    Match_addr: string;
    StAddr?: string;
    City?: string;
  };
}

export interface GeocodeResponse {
  candidates: GeocodeCandidate[];
}

export interface GeocodeResult {
  success: boolean;
  candidates: GeocodeCandidate[];
  error?: string;
}

export class GeocodeService {
  private static readonly BASE_URL =
    'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';

  static async geocodeAddress(address: string): Promise<GeocodeResult> {
    try {
      if (!address || address.trim().length === 0) {
        return {
          success: false,
          candidates: [],
          error: '請輸入有效地址',
        };
      }

      const params = {
        SingleLine: address.trim(),
        f: 'json',
        outSR: JSON.stringify({ wkid: 4326 }),
        outFields: 'Addr_type,Match_addr,StAddr,City',
        maxLocations: 6,
      };

      const response = await axios.get<GeocodeResponse>(this.BASE_URL, {
        params,
        timeout: 10000, // 10 seconds timeout
      });

      if (!response.data || !response.data.candidates) {
        return {
          success: false,
          candidates: [],
          error: 'API 回應格式錯誤',
        };
      }

      // Filter candidates with reasonable score (>=60)
      const validCandidates = response.data.candidates.filter(
        (candidate) => candidate.score >= 60,
      );

      return {
        success: true,
        candidates: validCandidates,
        error:
          validCandidates.length === 0
            ? '找不到匹配的地址，請檢查地址格式'
            : undefined,
      };
    } catch (error) {
      console.error('Geocoding API error:', error);

      let errorMessage = '地址解析服務暫時無法使用，請稍後再試';

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = '請求超時，請檢查網路連線';
        } else if (error.response?.status === 429) {
          errorMessage = '請求過於頻繁，請稍後再試';
        } else if (error.response && error.response.status >= 500) {
          errorMessage = '服務器錯誤，請稍後再試';
        }
      }

      return {
        success: false,
        candidates: [],
        error: errorMessage,
      };
    }
  }

  static formatCandidateForDisplay(candidate: GeocodeCandidate): string {
    const accuracy = this.getAccuracyText(candidate.score);
    return `${candidate.attributes.Match_addr} (${accuracy})`;
  }

  private static getAccuracyText(score: number): string {
    if (score >= 95) {
      return '準確';
    }
    if (score >= 80) {
      return '良好';
    }
    if (score >= 60) {
      return '模糊';
    }
    return '不準確';
  }

  static formatCoordinates(
    longitude: number,
    latitude: number,
  ): { longitude: number; latitude: number } {
    return {
      longitude: Number(longitude.toFixed(6)),
      latitude: Number(latitude.toFixed(6)),
    };
  }
}
