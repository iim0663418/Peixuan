/**
 * 定義顯示深度/模式的可用選項
 */
export type DisplayMode = 'minimal' | 'compact' | 'standard' | 'comprehensive';

/**
 * 元件 Props 介面定義，用於接收顯示模式
 */
export interface DisplayModeProps {
  displayMode?: DisplayMode;
}

/**
 * 元件 Emits 介面定義，用於更新顯示模式
 */
export interface DisplayModeEmits {
  (_event: 'update:displayMode', _mode: DisplayMode): void;
}
