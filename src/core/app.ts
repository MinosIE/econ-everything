/** 应用级能力注入点：避免模块 → main 的循环依赖。 */

export interface AppApi {
  /** 切换到某个模块（DOM id，如 m-concepts）。 */
  switchModule(id: string): void;
  /** 切到模块并定位/打开某条目（跨模块跳转、搜索跳转、相关条目跳转）。 */
  openTarget(moduleId: string, key: string): void;
  /** 当前模块 id。 */
  currentModule(): string;
}

let api: AppApi | null = null;

export function provideApp(next: AppApi): void {
  api = next;
}

export function app(): AppApi {
  if (!api) throw new Error('[econ] AppApi 尚未初始化');
  return api;
}
