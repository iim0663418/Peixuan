/**
 * Unit tests for Tai Sui Detection
 */

import { describe, it, expect } from 'vitest';
import {
  detectZhiTaiSui,
  detectChongTaiSui,
  detectXingTaiSui,
  detectPoTaiSui,
  detectHaiTaiSui,
} from '../taiSuiDetection';
import type { EarthlyBranch } from '../../types';

describe('Tai Sui Detection', () => {
  describe('detectZhiTaiSui (值太歲)', () => {
    it('should detect same branch (本命年)', () => {
      expect(detectZhiTaiSui('巳', '巳')).toBe(true);
      expect(detectZhiTaiSui('子', '子')).toBe(true);
    });

    it('should not detect different branches', () => {
      expect(detectZhiTaiSui('巳', '亥')).toBe(false);
      expect(detectZhiTaiSui('子', '午')).toBe(false);
    });

    it('should handle all 12 branches', () => {
      const branches: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      branches.forEach(branch => {
        expect(detectZhiTaiSui(branch, branch)).toBe(true);
      });
    });
  });

  describe('detectChongTaiSui (沖太歲)', () => {
    it('should detect six clashes', () => {
      expect(detectChongTaiSui('子', '午')).toBe(true);
      expect(detectChongTaiSui('午', '子')).toBe(true);
      expect(detectChongTaiSui('丑', '未')).toBe(true);
      expect(detectChongTaiSui('寅', '申')).toBe(true);
      expect(detectChongTaiSui('卯', '酉')).toBe(true);
      expect(detectChongTaiSui('辰', '戌')).toBe(true);
      expect(detectChongTaiSui('巳', '亥')).toBe(true);
    });

    it('should not detect non-clashing branches', () => {
      expect(detectChongTaiSui('子', '丑')).toBe(false);
      expect(detectChongTaiSui('寅', '卯')).toBe(false);
    });
  });

  describe('detectXingTaiSui (刑太歲)', () => {
    it('should detect san xing (三刑) - 寅巳申', () => {
      const result = detectXingTaiSui('寅', ['巳', '子', '午', '卯']);
      expect(result.hasXing).toBe(true);
      expect(result.xingType).toBe('san_xing');
    });

    it('should detect san xing (三刑) - 丑戌未', () => {
      const result = detectXingTaiSui('丑', ['戌', '子', '午', '卯']);
      expect(result.hasXing).toBe(true);
      expect(result.xingType).toBe('san_xing');
    });

    it('should detect zi xing (自刑)', () => {
      const result = detectXingTaiSui('辰', ['辰', '子', '午', '卯']);
      expect(result.hasXing).toBe(true);
      expect(result.xingType).toBe('zi_xing');
    });

    it('should detect wu en xing (無恩之刑) - 子卯', () => {
      const result = detectXingTaiSui('子', ['卯', '寅', '午', '申']);
      expect(result.hasXing).toBe(true);
      expect(result.xingType).toBe('wu_en_xing');
    });

    it('should not detect xing when no matching branches', () => {
      const result = detectXingTaiSui('子', ['丑', '寅', '午', '申']);
      expect(result.hasXing).toBe(false);
    });
  });

  describe('detectPoTaiSui (破太歲)', () => {
    it('should detect six destructions', () => {
      expect(detectPoTaiSui('子', '酉')).toBe(true);
      expect(detectPoTaiSui('酉', '子')).toBe(true);
      expect(detectPoTaiSui('丑', '辰')).toBe(true);
      expect(detectPoTaiSui('寅', '亥')).toBe(true);
      expect(detectPoTaiSui('卯', '午')).toBe(true);
      expect(detectPoTaiSui('巳', '申')).toBe(true);
      expect(detectPoTaiSui('未', '戌')).toBe(true);
    });

    it('should not detect non-destructive branches', () => {
      expect(detectPoTaiSui('子', '丑')).toBe(false);
      expect(detectPoTaiSui('寅', '卯')).toBe(false);
    });
  });

  describe('detectHaiTaiSui (害太歲)', () => {
    it('should detect six harms', () => {
      expect(detectHaiTaiSui('子', '未')).toBe(true); // 羊鼠相逢
      expect(detectHaiTaiSui('未', '子')).toBe(true);
      expect(detectHaiTaiSui('丑', '午')).toBe(true);
      expect(detectHaiTaiSui('寅', '巳')).toBe(true); // 蛇虎害
      expect(detectHaiTaiSui('卯', '辰')).toBe(true);
      expect(detectHaiTaiSui('申', '亥')).toBe(true);
      expect(detectHaiTaiSui('酉', '戌')).toBe(true);
    });

    it('should not detect non-harmful branches', () => {
      expect(detectHaiTaiSui('子', '丑')).toBe(false);
      expect(detectHaiTaiSui('寅', '卯')).toBe(false);
    });
  });
});
