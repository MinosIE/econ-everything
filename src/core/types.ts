/** 全站共享的轻量类型定义（内容以 JSON 为准，这里只描述渲染所需的最小契约）。 */

export type Lang = 'zh' | 'en';

/** 带 `*En` 双语副本的任意内容对象（英文缺失时渲染层回退中文）。 */
export type LObj = Record<string, unknown>;

export interface SourceRef {
  label: string;
  labelEn?: string;
  year?: number;
  url?: string;
}

/** 详情面板的通用「分区」结构。 */
export interface DetailSection {
  icon?: string;
  title: string;
  /** 已转义的 HTML 片段（内部只由渲染层拼接，不接受外部输入）。 */
  html?: string;
  /** 纯文本行列表（自动加列表标记）。 */
  items?: string[];
}

export interface DetailPayload {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  level?: number;
  tags?: string[];
  sections: DetailSection[];
  related?: { label: string; onClick: () => void }[];
  sources?: SourceRef[];
}

/** 派生文件 data/overview.json 的结构。 */
export interface OverviewFile {
  version: string;
  counts: Record<string, number>;
  kpis: { key: string; icon: string; value: number }[];
}

/** 搜索索引条目 data/search.json。 */
export interface SearchEntry {
  /** 目标模块 DOM id，如 m-concepts */
  m: string;
  /** 目标条目 id（用于跳转高亮） */
  id: string;
  /** 类型 i18n key，如 search.t.concept */
  t: string;
  n: string;
  x: string;
  nEn?: string;
  xEn?: string;
}

export interface ThemeMode {
  current: 'light' | 'dark';
}
