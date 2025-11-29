import PurpleStarCalculator from '../services/purpleStarCalculation';
import type { BirthInfo, PurpleStarChart } from '../services/purpleStarCalculation';

export class PurpleStarController {
  /**
   * Calculate purple star chart from birth information
   */
  async calculate(requestData: any): Promise<{ data: { chart: PurpleStarChart } }> {
    // Parse birth date and time
    const birthDateTime = `${requestData.birthDate} ${requestData.birthTime}`;
    const solarDate = new Date(birthDateTime);
    
    // Validate date
    if (isNaN(solarDate.getTime())) {
      throw new Error('Invalid birth date or time');
    }
    
    // Prepare birth info
    const birthInfo: BirthInfo = {
      solarDate,
      gender: requestData.gender
    };
    
    // Calculate chart
    const calculator = new PurpleStarCalculator(birthInfo);
    const chart = calculator.generateChart();
    
    // Return in expected format
    return {
      data: {
        chart
      }
    };
  }
}
