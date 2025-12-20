/**
 * Annual Interaction Module Tests
 *
 * Comprehensive tests for stem combinations, branch clashes, and harmonious combinations
 */

import {
  detectStemCombinations,
  detectBranchClashes,
  detectHarmoniousCombinations,
  type FourPillars,
  type StemCombination,
  type BranchClash,
  type HarmoniousCombination,
} from '../interaction';

describe('Annual Interaction Module', () => {
  describe('detectStemCombinations', () => {
    const fourPillars: FourPillars = {
      year: { stem: '甲', branch: '子' },
      month: { stem: '己', branch: '丑' },
      day: { stem: '乙', branch: '卯' },
      hour: { stem: '丙', branch: '午' },
    };

    it('should detect 甲己合土 (Jia-Ji combine to Earth)', () => {
      const result = detectStemCombinations('甲', fourPillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'month',
        element: 'Earth',
      });
    });

    it('should detect 乙庚合金 (Yi-Geng combine to Metal)', () => {
      const pillars: FourPillars = {
        year: { stem: '庚', branch: '申' },
        month: { stem: '丁', branch: '丑' },
        day: { stem: '壬', branch: '辰' },
        hour: { stem: '戊', branch: '戌' },
      };

      const result = detectStemCombinations('乙', pillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'year',
        element: 'Metal',
      });
    });

    it('should detect 丙辛合水 (Bing-Xin combine to Water)', () => {
      const pillars: FourPillars = {
        year: { stem: '辛', branch: '酉' },
        month: { stem: '己', branch: '亥' },
        day: { stem: '甲', branch: '寅' },
        hour: { stem: '庚', branch: '申' },
      };

      const result = detectStemCombinations('丙', pillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'year',
        element: 'Water',
      });
    });

    it('should detect 丁壬合木 (Ding-Ren combine to Wood)', () => {
      const pillars: FourPillars = {
        year: { stem: '癸', branch: '亥' },
        month: { stem: '壬', branch: '子' },
        day: { stem: '己', branch: '巳' },
        hour: { stem: '辛', branch: '酉' },
      };

      const result = detectStemCombinations('丁', pillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'month',
        element: 'Wood',
      });
    });

    it('should detect 戊癸合火 (Wu-Gui combine to Fire)', () => {
      const pillars: FourPillars = {
        year: { stem: '癸', branch: '亥' },
        month: { stem: '乙', branch: '卯' },
        day: { stem: '庚', branch: '申' },
        hour: { stem: '壬', branch: '子' },
      };

      const result = detectStemCombinations('戊', pillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'year',
        element: 'Fire',
      });
    });

    it('should detect multiple combinations', () => {
      const pillars: FourPillars = {
        year: { stem: '己', branch: '丑' },
        month: { stem: '己', branch: '巳' },
        day: { stem: '己', branch: '酉' },
        hour: { stem: '甲', branch: '子' },
      };

      const result = detectStemCombinations('甲', pillars);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { pillar: 'year', element: 'Earth' },
        { pillar: 'month', element: 'Earth' },
        { pillar: 'day', element: 'Earth' },
      ]);
    });

    it('should return empty array when no combinations found', () => {
      const pillars: FourPillars = {
        year: { stem: '乙', branch: '卯' },
        month: { stem: '丙', branch: '午' },
        day: { stem: '丁', branch: '未' },
        hour: { stem: '戊', branch: '申' },
      };

      const result = detectStemCombinations('甲', pillars);

      expect(result).toHaveLength(0);
    });
  });

  describe('detectBranchClashes', () => {
    it('should detect 子午沖 (Zi-Wu clash) with high severity on day pillar', () => {
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '寅' },
        month: { stem: '丙', branch: '辰' },
        day: { stem: '戊', branch: '午' },
        hour: { stem: '庚', branch: '申' },
      };

      const result = detectBranchClashes('子', fourPillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'day',
        severity: 'high',
      });
    });

    it('should detect 丑未沖 (Chou-Wei clash) with medium severity on month pillar', () => {
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '子' },
        month: { stem: '丙', branch: '未' },
        day: { stem: '戊', branch: '午' },
        hour: { stem: '庚', branch: '申' },
      };

      const result = detectBranchClashes('丑', fourPillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'month',
        severity: 'medium',
      });
    });

    it('should detect 寅申沖 (Yin-Shen clash) with low severity on year pillar', () => {
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '寅' },
        month: { stem: '丙', branch: '卯' },
        day: { stem: '戊', branch: '辰' },
        hour: { stem: '庚', branch: '巳' },
      };

      const result = detectBranchClashes('申', fourPillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'year',
        severity: 'low',
      });
    });

    it('should detect 卯酉沖 (Mao-You clash) with low severity on hour pillar', () => {
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '子' },
        month: { stem: '丙', branch: '丑' },
        day: { stem: '戊', branch: '寅' },
        hour: { stem: '庚', branch: '卯' },
      };

      const result = detectBranchClashes('酉', fourPillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'hour',
        severity: 'low',
      });
    });

    it('should detect 辰戌沖 (Chen-Xu clash)', () => {
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '子' },
        month: { stem: '丙', branch: '戌' },
        day: { stem: '戊', branch: '午' },
        hour: { stem: '庚', branch: '申' },
      };

      const result = detectBranchClashes('辰', fourPillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'month',
        severity: 'medium',
      });
    });

    it('should detect 巳亥沖 (Si-Hai clash)', () => {
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '亥' },
        month: { stem: '丙', branch: '子' },
        day: { stem: '戊', branch: '丑' },
        hour: { stem: '庚', branch: '寅' },
      };

      const result = detectBranchClashes('巳', fourPillars);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pillar: 'year',
        severity: 'low',
      });
    });

    it('should detect multiple clashes', () => {
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '午' },
        month: { stem: '丙', branch: '午' },
        day: { stem: '戊', branch: '午' },
        hour: { stem: '庚', branch: '午' },
      };

      const result = detectBranchClashes('子', fourPillars);

      expect(result).toHaveLength(4);
      expect(result).toContainEqual({ pillar: 'year', severity: 'low' });
      expect(result).toContainEqual({ pillar: 'month', severity: 'medium' });
      expect(result).toContainEqual({ pillar: 'day', severity: 'high' });
      expect(result).toContainEqual({ pillar: 'hour', severity: 'low' });
    });

    it('should return empty array when no clashes found', () => {
      const fourPillars: FourPillars = {
        year: { stem: '甲', branch: '子' },
        month: { stem: '丙', branch: '丑' },
        day: { stem: '戊', branch: '寅' },
        hour: { stem: '庚', branch: '卯' },
      };

      const result = detectBranchClashes('辰', fourPillars);

      expect(result).toHaveLength(0);
    });
  });

  describe('detectHarmoniousCombinations', () => {
    describe('Triple Harmony (三合)', () => {
      it('should detect 申子辰合水局 (Shen-Zi-Chen Water harmony)', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '申' },
          month: { stem: '丙', branch: '辰' },
          day: { stem: '戊', branch: '午' },
          hour: { stem: '庚', branch: '未' },
        };

        const result = detectHarmoniousCombinations('子', fourPillars);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          type: 'sanhe',
          branches: ['申', '子', '辰'],
          element: 'Water',
        });
      });

      it('should detect 亥卯未合木局 (Hai-Mao-Wei Wood harmony)', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '亥' },
          month: { stem: '丙', branch: '卯' },
          day: { stem: '戊', branch: '午' },
          hour: { stem: '庚', branch: '申' },
        };

        const result = detectHarmoniousCombinations('未', fourPillars);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          type: 'sanhe',
          branches: ['亥', '卯', '未'],
          element: 'Wood',
        });
      });

      it('should detect 寅午戌合火局 (Yin-Wu-Xu Fire harmony)', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '寅' },
          month: { stem: '丙', branch: '午' },
          day: { stem: '戊', branch: '辰' },
          hour: { stem: '庚', branch: '申' },
        };

        const result = detectHarmoniousCombinations('戌', fourPillars);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          type: 'sanhe',
          branches: ['寅', '午', '戌'],
          element: 'Fire',
        });
      });

      it('should detect 巳酉丑合金局 (Si-You-Chou Metal harmony)', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '巳' },
          month: { stem: '丙', branch: '丑' },
          day: { stem: '戊', branch: '午' },
          hour: { stem: '庚', branch: '未' },
        };

        const result = detectHarmoniousCombinations('酉', fourPillars);

        expect(result.length).toBeGreaterThanOrEqual(1); // 可能同時滿足三合和三會
        expect(result.some(r => r.type === 'sanhe' && r.element === 'Metal')).toBe(true);
      });

      it('should detect triple harmony with dayun branch', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '子' },
          month: { stem: '丙', branch: '丑' },
          day: { stem: '戊', branch: '寅' },
          hour: { stem: '庚', branch: '卯' },
        };

        const result = detectHarmoniousCombinations('申', fourPillars, '辰');

        expect(result.length).toBeGreaterThanOrEqual(1); // 可能同時滿足多個組合
        expect(result.some(r => r.type === 'sanhe' && r.element === 'Water')).toBe(true);
      });
    });

    describe('Triple Assembly (三會)', () => {
      it('should detect 寅卯辰會木局 (Yin-Mao-Chen Wood assembly - Spring)', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '寅' },
          month: { stem: '丙', branch: '辰' },
          day: { stem: '戊', branch: '午' },
          hour: { stem: '庚', branch: '申' },
        };

        const result = detectHarmoniousCombinations('卯', fourPillars);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          type: 'sanhui',
          branches: ['寅', '卯', '辰'],
          element: 'Wood',
        });
      });

      it('should detect 巳午未會火局 (Si-Wu-Wei Fire assembly - Summer)', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '巳' },
          month: { stem: '丙', branch: '午' },
          day: { stem: '戊', branch: '子' },
          hour: { stem: '庚', branch: '丑' },
        };

        const result = detectHarmoniousCombinations('未', fourPillars);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          type: 'sanhui',
          branches: ['巳', '午', '未'],
          element: 'Fire',
        });
      });

      it('should detect 申酉戌會金局 (Shen-You-Xu Metal assembly - Autumn)', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '申' },
          month: { stem: '丙', branch: '戌' },
          day: { stem: '戊', branch: '子' },
          hour: { stem: '庚', branch: '丑' },
        };

        const result = detectHarmoniousCombinations('酉', fourPillars);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          type: 'sanhui',
          branches: ['申', '酉', '戌'],
          element: 'Metal',
        });
      });

      it('should detect 亥子丑會水局 (Hai-Zi-Chou Water assembly - Winter)', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '亥' },
          month: { stem: '丙', branch: '子' },
          day: { stem: '戊', branch: '寅' },
          hour: { stem: '庚', branch: '卯' },
        };

        const result = detectHarmoniousCombinations('丑', fourPillars);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          type: 'sanhui',
          branches: ['亥', '子', '丑'],
          element: 'Water',
        });
      });

      it('should detect triple assembly with dayun branch', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '寅' },
          month: { stem: '丙', branch: '辰' },
          day: { stem: '戊', branch: '午' },
          hour: { stem: '庚', branch: '申' },
        };

        const result = detectHarmoniousCombinations('子', fourPillars, '卯');

        expect(result.length).toBeGreaterThanOrEqual(1); // 可能同時滿足多個組合
        expect(result.some(r => r.type === 'sanhui' && r.element === 'Wood')).toBe(true);
      });
    });

    describe('Multiple combinations', () => {
      it('should detect both triple harmony and triple assembly', () => {
        // This is a rare case where both patterns could coexist
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '申' },
          month: { stem: '丙', branch: '酉' },
          day: { stem: '戊', branch: '戌' },
          hour: { stem: '庚', branch: '丑' },
        };

        const result = detectHarmoniousCombinations('巳', fourPillars);

        // Should detect both 申酉戌會金局 and 巳酉丑合金局
        expect(result).toHaveLength(2);
        expect(result).toContainEqual({
          type: 'sanhe',
          branches: ['巳', '酉', '丑'],
          element: 'Metal',
        });
        expect(result).toContainEqual({
          type: 'sanhui',
          branches: ['申', '酉', '戌'],
          element: 'Metal',
        });
      });
    });

    describe('Edge cases', () => {
      it('should return empty array when no harmonious combinations found', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '子' },
          month: { stem: '丙', branch: '丑' },
          day: { stem: '戊', branch: '寅' },
          hour: { stem: '庚', branch: '卯' },
        };

        const result = detectHarmoniousCombinations('巳', fourPillars);

        expect(result).toHaveLength(0);
      });

      it('should handle duplicate branches in four pillars', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '子' },
          month: { stem: '丙', branch: '子' },
          day: { stem: '戊', branch: '申' },
          hour: { stem: '庚', branch: '辰' },
        };

        const result = detectHarmoniousCombinations('子', fourPillars);

        // Should still detect the combination even with duplicate 子
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          type: 'sanhe',
          branches: ['申', '子', '辰'],
          element: 'Water',
        });
      });

      it('should work without dayun branch parameter', () => {
        const fourPillars: FourPillars = {
          year: { stem: '甲', branch: '申' },
          month: { stem: '丙', branch: '子' },
          day: { stem: '戊', branch: '辰' },
          hour: { stem: '庚', branch: '午' },
        };

        const result = detectHarmoniousCombinations('寅', fourPillars);

        // Should detect 申子辰合水局
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          type: 'sanhe',
          branches: ['申', '子', '辰'],
          element: 'Water',
        });
      });
    });
  });

  describe('Integration tests', () => {
    it('should detect multiple interactions simultaneously', () => {
      const fourPillars: FourPillars = {
        year: { stem: '己', branch: '亥' },
        month: { stem: '丙', branch: '卯' },
        day: { stem: '庚', branch: '午' },
        hour: { stem: '辛', branch: '未' },
      };

      // Annual: 甲子
      const stemCombs = detectStemCombinations('甲', fourPillars);
      const branchClashes = detectBranchClashes('子', fourPillars);
      const harmonious = detectHarmoniousCombinations('子', fourPillars);

      // Should detect 甲己合土
      expect(stemCombs).toHaveLength(1);
      expect(stemCombs[0].element).toBe('Earth');

      // Should detect 子午沖 on day pillar
      expect(branchClashes).toHaveLength(1);
      expect(branchClashes[0]).toEqual({ pillar: 'day', severity: 'high' });

      // Should detect 亥卯未合木局
      expect(harmonious).toHaveLength(1);
      expect(harmonious[0]).toEqual({
        type: 'sanhe',
        branches: ['亥', '卯', '未'],
        element: 'Wood',
      });
    });
  });
});
