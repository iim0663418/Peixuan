// 全局類型聲明
declare const Solar: any;
declare const Lunar: any;
declare const EightChar: any;

declare global {
  interface Window {
    Solar: any;
    Lunar: any;
    LunarMonth: any;
  }
}

export {};
