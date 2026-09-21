import type { ModuleRender } from './types';

export interface ModuleDef {
  /** DOM 中的 section id */
  id: string;
  /** i18n 键后缀（nav.<key> / entry.<key>.t / entry.<key>.d） */
  key: string;
  icon: string;
  /** 对应数据文件（供脚本文档与调试使用） */
  file: string;
  priority: 0 | 1 | 2;
  /** 动态 import → Vite 自动切成独立 chunk，首屏只加载入口模块 */
  load: () => Promise<{ default: ModuleRender }>;
}

export const MODULES: ModuleDef[] = [
  { id: 'm-concepts', key: 'concepts', icon: '💡', file: 'concepts.json', priority: 0, load: () => import('./concepts') },
  { id: 'm-glossary', key: 'glossary', icon: '📖', file: 'glossary.json', priority: 0, load: () => import('./glossary') },
  { id: 'm-macro', key: 'macro', icon: '📈', file: 'macro.json', priority: 0, load: () => import('./macro') },
  { id: 'm-micro', key: 'micro', icon: '🛒', file: 'micro.json', priority: 0, load: () => import('./micro') },
  { id: 'm-money', key: 'money', icon: '💰', file: 'money.json', priority: 0, load: () => import('./money') },
  { id: 'm-thinkers', key: 'thinkers', icon: '👤', file: 'thinkers.json', priority: 1, load: () => import('./thinkers') },
  { id: 'm-schools', key: 'schools', icon: '🏛️', file: 'schools.json', priority: 1, load: () => import('./schools') },
  { id: 'm-events', key: 'events', icon: '🗓️', file: 'events.json', priority: 1, load: () => import('./events') },
  { id: 'm-behavioral', key: 'behavioral', icon: '🧠', file: 'behavioral.json', priority: 1, load: () => import('./behavioral') },
  { id: 'm-game', key: 'game', icon: '♟️', file: 'gametheory.json', priority: 1, load: () => import('./game') },
  { id: 'm-trade', key: 'trade', icon: '🚢', file: 'trade.json', priority: 1, load: () => import('./trade') },
  { id: 'm-everyday', key: 'everyday', icon: '☕', file: 'everyday.json', priority: 1, load: () => import('./everyday') },
  { id: 'm-charts', key: 'charts', icon: '📊', file: 'charts.json', priority: 2, load: () => import('./charts') },
  { id: 'm-myths', key: 'myths', icon: '🔍', file: 'myths.json', priority: 2, load: () => import('./myths') },
  { id: 'm-quiz', key: 'quiz', icon: '✅', file: 'quiz.json', priority: 2, load: () => import('./quiz') },
  { id: 'm-compare', key: 'compare', icon: '🌐', file: 'compare.json', priority: 2, load: () => import('./compare') },
];

export function moduleByKey(key: string): ModuleDef | undefined {
  return MODULES.find((m) => m.key === key || m.id === key);
}
