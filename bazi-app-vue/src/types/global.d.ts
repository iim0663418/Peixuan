// 全局類型聲明
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
declare const Solar: any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
declare const Lunar: any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
declare const EightChar: any;

declare global {
  interface Window {
    Solar: any;
    Lunar: any;
    LunarMonth: any;
  }
}

export {};
