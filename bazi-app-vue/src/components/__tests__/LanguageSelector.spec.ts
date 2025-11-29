/* eslint-disable no-unused-vars */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import LanguageSelector from '@/components/LanguageSelector.vue';

// 模擬 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// 創建測試用的 i18n 實例
const createTestI18n = (locale = 'en') => {
  return createI18n({
    locale,
    fallbackLocale: 'en',
    messages: {
      en: {
        common: {
          language: 'Language',
        },
      },
      zh: {
        common: {
          language: '语言',
        },
      },
      zh_TW: {
        common: {
          language: '語言',
        },
      },
    },
    legacy: false,
    globalInjection: true,
  });
};

describe('LanguageSelector', () => {
  beforeEach(() => {
    // 清除所有模擬調用
    vi.clearAllMocks();
  });

  it('renders correctly with default locale', () => {
    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('select').exists()).toBe(true);
    expect(wrapper.find('option[value="en"]').exists()).toBe(true);
    expect(wrapper.find('option[value="zh"]').exists()).toBe(true);
    expect(wrapper.find('option[value="zh_TW"]').exists()).toBe(true);
  });

  it('changes language when select value changes', async () => {
    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    const select = wrapper.find('select');

    // 模擬選擇繁體中文
    await select.setValue('zh_TW');
    await select.trigger('change');

    // 驗證 locale 已更改
    expect(i18n.global.locale.value).toBe('zh_TW');

    // 驗證 localStorage 被調用
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'preferred-language',
      'zh_TW',
    );
  });

  it('loads saved language preference from localStorage', () => {
    // 模擬 localStorage 返回保存的語言設定
    localStorageMock.getItem.mockReturnValue('zh');

    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    // 驗證 localStorage 被調用
    expect(localStorageMock.getItem).toHaveBeenCalledWith('preferred-language');

    // 驗證語言已設定為保存的值
    expect(i18n.global.locale.value).toBe('zh');
  });

  it('handles invalid localStorage values gracefully', () => {
    // 模擬 localStorage 返回無效值
    localStorageMock.getItem.mockReturnValue('invalid-locale');

    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    // 應該回退到預設語言
    expect(i18n.global.locale.value).toBe('en');
  });

  it('handles localStorage errors gracefully', () => {
    // 模擬 localStorage 拋出錯誤
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    // 應該記錄警告並使用預設語言
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to load language preference from localStorage:',
      expect.any(Error),
    );
    expect(i18n.global.locale.value).toBe('en');

    consoleWarnSpy.mockRestore();
  });

  it('saves language preference when changed', async () => {
    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    const select = wrapper.find('select');

    // 模擬選擇簡體中文
    await select.setValue('zh');
    await select.trigger('change');

    // 驗證 localStorage 保存了新的語言偏好
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'preferred-language',
      'zh',
    );
  });

  it('handles save errors gracefully', async () => {
    // 模擬 localStorage.setItem 拋出錯誤
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage quota exceeded');
    });

    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    const select = wrapper.find('select');

    // 模擬選擇語言
    await select.setValue('zh_TW');
    await select.trigger('change');

    // 應該記錄警告但不影響語言切換
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to save language preference to localStorage:',
      expect.any(Error),
    );
    expect(i18n.global.locale.value).toBe('zh_TW');

    consoleWarnSpy.mockRestore();
  });

  it('syncs currentLocale with external locale changes', async () => {
    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    // 外部更改 locale
    i18n.global.locale.value = 'zh';
    await wrapper.vm.$nextTick();

    // 驗證選擇框的值已同步更新
    const select = wrapper.find('select');
    expect((select.element as HTMLSelectElement).value).toBe('zh');
  });

  it('has proper accessibility attributes', () => {
    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    const select = wrapper.find('select');
    const label = wrapper.find('label');

    // 驗證無障礙屬性
    expect(select.attributes('id')).toBe('language-select');
    expect(select.attributes('aria-label')).toBe('Language');
    expect(label.attributes('for')).toBe('language-select');
    expect(label.classes()).toContain('sr-only');
  });
});
