import { fetchData } from '../core/data';
import { clickable, need } from '../core/dom';
import { L, t } from '../core/i18n';
import { relatedChips } from '../core/related';
import { collectCategories, countText, matchFilters, renderFilters, sourcesOf } from '../core/ui';
import type { DetailSection, LObj, SourceRef } from '../core/types';

export function textSection(icon: string, title: string, body: string): DetailSection | null {
  const clean = (body ?? '').trim();
  return clean ? { icon, title, html: `<p>${escapeInline(clean)}</p>` } : null;
}

export function listSection(icon: string, title: string, items: string[]): DetailSection | null {
  const list = items.map((i) => (i ?? '').trim()).filter(Boolean);
  return list.length ? { icon, title, items: list.map((i) => escapeInline(i)) } : null;
}

/** 详情里的内联文本：转义后保留 `**加粗**` 与 `<br>` 语义的简化写法。 */
export function escapeInline(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function compact<T>(list: (T | null | undefined)[]): T[] {
  return list.filter((x): x is T => x != null);
}

export function sourcesLine(item: LObj): SourceRef[] {
  return sourcesOf(item);
}

/** tags / tagsEn 为并行数组：英文缺失时该项回退中文。 */
export function tagsOf(item: LObj): string[] {
  const zh = item.tags;
  if (!Array.isArray(zh)) return [];
  const en = item.tagsEn;
  return zh.map((tag, i) => {
    const enTag = Array.isArray(en) ? en[i] : undefined;
    return String(L({ v: tag, vEn: enTag ?? tag }, 'v'));
  });
}

/** 并行数组字段（如 points/watch/keyIdeas 的 zh + `*En`）→ 本地化后的字符串数组。 */
export function pairList(item: LObj, key: string): string[] {
  const zh = item[key];
  if (!Array.isArray(zh)) return [];
  const en = item[key + 'En'];
  return zh.map((v, i) => String(L({ v, vEn: Array.isArray(en) ? (en[i] ?? v) : v }, 'v'))).filter(Boolean);
}

/** `{k,kEn,v,vEn}` 结构 → `**要点**：说明` 列表。 */
export function pointList(item: LObj, key = 'points'): string[] {
  const arr = item[key];
  if (!Array.isArray(arr)) return [];
  return arr
    .map((p) => {
      const k = L<string>(p as LObj, 'k');
      const v = L<string>(p as LObj, 'v');
      if (!v) return '';
      return k ? `**${escapeInline(k)}**：${escapeInline(v)}` : escapeInline(v);
    })
    .filter(Boolean);
}

/** 分类 + 难度筛选下的卡片网格：统一负责取数、筛选、渲染、点击绑定。 */
export interface GridOptions<T extends LObj> {
  file: string;
  hostSel: string;
  filterSel?: string;
  countSel?: string;
  levels?: boolean;
  sortBy?: (a: T, b: T) => number;
  match?: (item: T, query: string) => boolean;
  querySel?: string;
  card: (item: T) => string;
  onPick: (item: T, all: Map<string, T>) => void;
}

export interface GridCtrl<T extends LObj> {
  items: T[];
  byId: Map<string, T>;
  rerender: () => void;
  openById: (id: string) => boolean;
}

export async function mountGrid<T extends LObj>(opts: GridOptions<T>): Promise<GridCtrl<T>> {
  const host = need(opts.hostSel);
  const filterHost = opts.filterSel ? need(opts.filterSel) : null;
  const countHost = opts.countSel ? need(opts.countSel) : null;
  const queryInput = opts.querySel ? need<HTMLInputElement>(opts.querySel) : null;

  const items = await fetchData<T[]>(opts.file);
  const byId = new Map<string, T>(items.map((it) => [String(it.id), it]));
  const state = { cat: '', level: 0 };
  const categories = collectCategories(items);

  if (opts.sortBy) items.sort(opts.sortBy);

  function current(): T[] {
    const q = (queryInput?.value ?? '').trim();
    return items.filter((it) => matchFilters(it, state) && (!q || !opts.match || opts.match(it, q)));
  }

  function draw(): void {
    const list = current();
    host.innerHTML = list.map((it) => opts.card(it)).join('');
    host.classList.toggle('is-empty', list.length === 0);
    if (list.length === 0) {
      host.innerHTML = `<p class="empty">${t('searchEmpty')}</p>`;
    }
    if (countHost) countText(countHost, list.length);
    host.querySelectorAll<HTMLElement>('.js-item').forEach((node) => {
      const item = byId.get(node.dataset.key ?? '');
      if (item) clickable(node, () => opts.onPick(item, byId));
    });
  }

  if (filterHost) {
    const paint = () => {
      renderFilters(filterHost, state, { categories, levels: opts.levels }, () => {
        paint();
        draw();
      });
    };
    paint();
  }
  queryInput?.addEventListener('input', draw);

  draw();
  return { items, byId, rerender: draw, openById: (id: string) => Boolean(byId.get(id)) && (draw(), true) };
}

/**
 * 由 id 列表生成「相关条目」按钮。
 * 依赖 build-search.mjs 生成的 data/related.json，支持跨模块跳转。
 */
export function relatedButtons(ids: unknown, currentModule: string) {
  return relatedChips(ids, currentModule);
}

/** 通用「专题卡」（宏观/微观/货币 复用）。 */
export function topicCard(item: LObj, badge?: string): string {
  const points = Array.isArray(item.points) ? item.points.length : 0;
  return `<article class="card js-item" data-key="${item.id}">
    <header class="card-h">
      <span class="card-ic" aria-hidden="true">${String(item.icon ?? '📄')}</span>
      <span class="card-t">${escapeInline(L(item, 'title'))}</span>
      ${badge ?? ''}
    </header>
    <p class="card-lead">${escapeInline(L(item, 'lead'))}</p>
    <footer class="card-f">
      <span class="card-meta">${points ? `${points} ${t('ui.points')}` : ''}</span>
      <span class="card-go">${t('ui.enter')}</span>
    </footer>
  </article>`;
}
