import {
  getSeasonFromBranch,
  getSeasonalityCoefficient,
  applySeasonalityAdjustment,
  type Season,
} from '../seasonality';
import type { WuXing } from '../../core/wuXing/relations';

describe('WuXing Seasonality Module', () => {
  describe('getSeasonFromBranch', () => {
    it('maps 寅卯 to Spring', () => {
      expect(getSeasonFromBranch('寅')).toBe('Spring');
      expect(getSeasonFromBranch('卯')).toBe('Spring');
    });

    it('maps 巳午 to Summer', () => {
      expect(getSeasonFromBranch('巳')).toBe('Summer');
      expect(getSeasonFromBranch('午')).toBe('Summer');
    });

    it('maps 申酉 to Autumn', () => {
      expect(getSeasonFromBranch('申')).toBe('Autumn');
      expect(getSeasonFromBranch('酉')).toBe('Autumn');
    });

    it('maps 亥子 to Winter', () => {
      expect(getSeasonFromBranch('亥')).toBe('Winter');
      expect(getSeasonFromBranch('子')).toBe('Winter');
    });

    it('maps 辰戌丑未 to Transitional', () => {
      expect(getSeasonFromBranch('辰')).toBe('Transitional');
      expect(getSeasonFromBranch('戌')).toBe('Transitional');
      expect(getSeasonFromBranch('丑')).toBe('Transitional');
      expect(getSeasonFromBranch('未')).toBe('Transitional');
    });

    it('throws error for invalid branch', () => {
      expect(() => getSeasonFromBranch('invalid')).toThrow('Invalid month branch');
    });
  });

  describe('getSeasonalityCoefficient', () => {
    it('returns correct Spring coefficients', () => {
      expect(getSeasonalityCoefficient('Wood', 'Spring')).toBe(1.5);
      expect(getSeasonalityCoefficient('Fire', 'Spring')).toBe(1.3);
      expect(getSeasonalityCoefficient('Water', 'Spring')).toBe(1.0);
      expect(getSeasonalityCoefficient('Earth', 'Spring')).toBe(0.7);
      expect(getSeasonalityCoefficient('Metal', 'Spring')).toBe(0.5);
    });

    it('returns correct Summer coefficients', () => {
      expect(getSeasonalityCoefficient('Fire', 'Summer')).toBe(1.5);
      expect(getSeasonalityCoefficient('Earth', 'Summer')).toBe(1.3);
      expect(getSeasonalityCoefficient('Wood', 'Summer')).toBe(1.0);
      expect(getSeasonalityCoefficient('Metal', 'Summer')).toBe(0.7);
      expect(getSeasonalityCoefficient('Water', 'Summer')).toBe(0.5);
    });

    it('returns correct Autumn coefficients', () => {
      expect(getSeasonalityCoefficient('Metal', 'Autumn')).toBe(1.5);
      expect(getSeasonalityCoefficient('Water', 'Autumn')).toBe(1.3);
      expect(getSeasonalityCoefficient('Earth', 'Autumn')).toBe(1.0);
      expect(getSeasonalityCoefficient('Wood', 'Autumn')).toBe(0.7);
      expect(getSeasonalityCoefficient('Fire', 'Autumn')).toBe(0.5);
    });

    it('returns correct Winter coefficients', () => {
      expect(getSeasonalityCoefficient('Water', 'Winter')).toBe(1.5);
      expect(getSeasonalityCoefficient('Wood', 'Winter')).toBe(1.3);
      expect(getSeasonalityCoefficient('Metal', 'Winter')).toBe(1.0);
      expect(getSeasonalityCoefficient('Fire', 'Winter')).toBe(0.7);
      expect(getSeasonalityCoefficient('Earth', 'Winter')).toBe(0.5);
    });

    it('returns correct Transitional coefficients', () => {
      expect(getSeasonalityCoefficient('Earth', 'Transitional')).toBe(1.5);
      expect(getSeasonalityCoefficient('Metal', 'Transitional')).toBe(1.3);
      expect(getSeasonalityCoefficient('Fire', 'Transitional')).toBe(1.0);
      expect(getSeasonalityCoefficient('Water', 'Transitional')).toBe(0.7);
      expect(getSeasonalityCoefficient('Wood', 'Transitional')).toBe(0.5);
    });
  });

  describe('applySeasonalityAdjustment', () => {
    const baseScores: Record<WuXing, number> = {
      Wood: 10,
      Fire: 10,
      Earth: 10,
      Metal: 10,
      Water: 10,
    };

    it('applies Spring adjustment correctly', () => {
      const result = applySeasonalityAdjustment(baseScores, '寅');
      expect(result.Wood).toBe(15);
      expect(result.Fire).toBe(13);
      expect(result.Water).toBe(10);
      expect(result.Earth).toBe(7);
      expect(result.Metal).toBe(5);
    });

    it('applies Summer adjustment correctly', () => {
      const result = applySeasonalityAdjustment(baseScores, '午');
      expect(result.Fire).toBe(15);
      expect(result.Earth).toBe(13);
      expect(result.Wood).toBe(10);
      expect(result.Metal).toBe(7);
      expect(result.Water).toBe(5);
    });

    it('applies Autumn adjustment correctly', () => {
      const result = applySeasonalityAdjustment(baseScores, '酉');
      expect(result.Metal).toBe(15);
      expect(result.Water).toBe(13);
      expect(result.Earth).toBe(10);
      expect(result.Wood).toBe(7);
      expect(result.Fire).toBe(5);
    });

    it('applies Winter adjustment correctly', () => {
      const result = applySeasonalityAdjustment(baseScores, '子');
      expect(result.Water).toBe(15);
      expect(result.Wood).toBe(13);
      expect(result.Metal).toBe(10);
      expect(result.Fire).toBe(7);
      expect(result.Earth).toBe(5);
    });

    it('applies Transitional adjustment correctly', () => {
      const result = applySeasonalityAdjustment(baseScores, '辰');
      expect(result.Earth).toBe(15);
      expect(result.Metal).toBe(13);
      expect(result.Fire).toBe(10);
      expect(result.Water).toBe(7);
      expect(result.Wood).toBe(5);
    });

    it('handles non-uniform scores correctly', () => {
      const customScores: Record<WuXing, number> = {
        Wood: 20,
        Fire: 15,
        Earth: 10,
        Metal: 5,
        Water: 25,
      };
      const result = applySeasonalityAdjustment(customScores, '寅');
      expect(result.Wood).toBe(30);
      expect(result.Fire).toBe(19.5);
      expect(result.Water).toBe(25);
      expect(result.Earth).toBe(7);
      expect(result.Metal).toBe(2.5);
    });
  });
});
