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

// 模擬 sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
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

    // 驗證 sessionStorage 被調用
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'preferred-language',
      'zh_TW',
    );
  });

  it('loads saved language preference from sessionStorage', () => {
    // 模擬 sessionStorage 返回保存的語言設定
    sessionStorageMock.getItem.mockReturnValue('zh_TW');

    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    // 驗證 sessionStorage 被調用
    expect(sessionStorageMock.getItem).toHaveBeenCalledWith(
      'preferred-language',
    );

    // 驗證語言已設定為保存的值
    expect(i18n.global.locale.value).toBe('zh_TW');
  });

  it('falls back to localStorage when sessionStorage is empty', () => {
    // 模擬 sessionStorage 為空，但 localStorage 有值
    sessionStorageMock.getItem.mockReturnValue(null);
    localStorageMock.getItem.mockReturnValue('en');

    const i18n = createTestI18n('zh_TW');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    // 驗證兩者都被調用
    expect(sessionStorageMock.getItem).toHaveBeenCalledWith(
      'preferred-language',
    );
    expect(localStorageMock.getItem).toHaveBeenCalledWith('preferred-language');

    // 驗證語言設定為 localStorage 的值
    expect(i18n.global.locale.value).toBe('en');
  });

  it('converts simplified Chinese (zh) to traditional Chinese (zh_TW)', () => {
    // 模擬 sessionStorage 返回簡體中文
    sessionStorageMock.getItem.mockReturnValue('zh');

    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    // 驗證語言已轉換為繁體中文
    expect(i18n.global.locale.value).toBe('zh_TW');
  });

  it('handles invalid storage values gracefully', () => {
    // 模擬 sessionStorage 返回無效值
    sessionStorageMock.getItem.mockReturnValue('invalid-locale');
    localStorageMock.getItem.mockReturnValue(null);

    const i18n = createTestI18n('en');
    const wrapper = mount(LanguageSelector, {
      global: {
        plugins: [i18n],
      },
    });

    // 應該回退到預設語言 (zh_TW)
    expect(i18n.global.locale.value).toBe('zh_TW');
  });

  it('handles storage errors gracefully', () => {
    // 模擬 sessionStorage 拋出錯誤
    sessionStorageMock.getItem.mockImplementation(() => {
      throw new Error('sessionStorage not available');
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

    // 應該記錄警告並使用預設語言 (zh_TW)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to load language preference from sessionStorage:',
      expect.any(Error),
    );
    expect(i18n.global.locale.value).toBe('zh_TW');

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

    // 模擬選擇繁體中文
    await select.setValue('zh_TW');
    await select.trigger('change');

    // 驗證 sessionStorage 保存了新的語言偏好
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'preferred-language',
      'zh_TW',
    );
  });

  it('handles save errors gracefully', async () => {
    // 模擬 sessionStorage.setItem 拋出錯誤
    sessionStorageMock.setItem.mockImplementation(() => {
      throw new Error('sessionStorage quota exceeded');
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
      'Failed to save language preference to sessionStorage:',
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
    i18n.global.locale.value = 'zh_TW';
    await wrapper.vm.$nextTick();

    // 驗證選擇框的值已同步更新
    const select = wrapper.find('select');
    expect((select.element as HTMLSelectElement).value).toBe('zh_TW');
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
