import type { DetailPayload } from '../core/types';

export interface ModuleCtx {
  root: HTMLElement;
  openDetail: (payload: DetailPayload) => void;
}

/** 每个模块返回的实例：用于跨模块/搜索跳转时直接打开某条目。 */
export interface ModuleInstance {
  openById?: (id: string) => boolean;
}

export type ModuleRender = (ctx: ModuleCtx) => Promise<ModuleInstance | void> | ModuleInstance | void;
