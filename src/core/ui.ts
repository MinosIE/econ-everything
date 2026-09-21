import { esc, clickable } from './dom';
import { L, t } from './i18n';
import type { DetailSection, LObj, SourceRef } from './types';

/** 难度徽标：1 入门 / 2 进阶 / 3 拓展。 */
export function lvlBadge(level?: number): string {
  if (!level) return '';
  return `<span class="lvl lvl-${level}">${esc(t(`ui.lvl${level}`))}</span>`;
}

/** 统一取来源数组（宽松容错：非数组视为空）。 */
export function sourcesOf(item: LObj): SourceRef[] {
  const s = item.sources;
  return Array.isArray(s) ? (s as SourceRef[]) : [];
}

export function sourceSection(item: LObj): DetailSection[] {
  return sourcesOf(item).length ? [] : [];
}

/** 从数据里归纳「分类」筛选项（保持出现顺序，去重）。 */
export function collectCategories(items: LObj[]): { value: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const it of items) {
    const value = String(it.category ?? '');
    if (!value) continue;
    if (!seen.has(value)) seen.set(value, L(it, 'category'));
  }
  return [...seen.entries()].map(([value, label]) => ({ value, label }));
}

export interface FilterState {
  cat: string;
  level: number;
}

export interface FilterOptions {
  categories?: { value: string; label: string }[];
  levels?: boolean;
}

/** 渲染「分类 + 难度」筛选条；点击后回调，由调用方重渲染列表。 */
export function renderFilters(
  host: HTMLElement,
  state: FilterState,
  opts: FilterOptions,
  onChange: () => void,
): void {
  const parts: string[] = [];
  if (opts.categories?.length) {
    parts.push(
      `<span class="fl-label">${esc(t('ui.all'))}</span>`,
      `<button type="button" class="chip${state.cat === '' ? ' on' : ''}" data-cat="">${esc(t('ui.all'))}</button>`,
      ...opts.categories.map(
        (c) =>
          `<button type="button" class="chip${state.cat === c.value ? ' on' : ''}" data-cat="${esc(c.value)}">${esc(c.label)}</button>`,
      ),
    );
  }
  if (opts.levels) {
    parts.push(
      `<span class="fl-sep" aria-hidden="true"></span><span class="fl-label">${esc(t('ui.level'))}</span>`,
      `<button type="button" class="chip${state.level === 0 ? ' on' : ''}" data-lvl="0">${esc(t('ui.all'))}</button>`,
      ...[1, 2, 3].map(
        (lv) =>
          `<button type="button" class="chip${state.level === lv ? ' on' : ''}" data-lvl="${lv}">${esc(t(`ui.lvl${lv}`))}</button>`,
      ),
    );
  }
  host.innerHTML = parts.join('');
  host.querySelectorAll<HTMLElement>('[data-cat]').forEach((node) => {
    node.addEventListener('click', () => {
      state.cat = node.dataset.cat ?? '';
      onChange();
    });
  });
  host.querySelectorAll<HTMLElement>('[data-lvl]').forEach((node) => {
    node.addEventListener('click', () => {
      state.level = Number(node.dataset.lvl ?? 0);
      onChange();
    });
  });
}

export function matchFilters(item: LObj, state: FilterState): boolean {
  if (state.cat && String(item.category ?? '') !== state.cat) return false;
  if (state.level && Number(item.level ?? 0) !== state.level) return false;
  return true;
}

/** 卡片列表通用渲染：items 过滤后交给 build(item) 产出 HTML，并绑定点击。 */
export function renderList<T extends LObj>(
  host: HTMLElement,
  items: T[],
  build: (item: T) => string,
  onPick: (item: T) => void,
  cardClass = 'card',
): void {
  host.innerHTML = items.map((it) => build(it)).join('');
  host.querySelectorAll<HTMLElement>('.js-item').forEach((node) => {
    const key = node.dataset.key;
    const item = items.find((it) => String(it.id) === key);
    if (item) clickable(node, () => onPick(item));
  });
  host.classList.toggle('is-empty', items.length === 0);
  void cardClass;
}

/** 计数行。 */
export function countText(host: HTMLElement, n: number): void {
  host.textContent = t('ui.count', { n });
  host.hidden = n === 0 ? false : false;
}

export function keyword(text: string, q: string): string {
  const safe = esc(text);
  if (!q) return safe;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return safe;
  const before = esc(text.slice(0, idx));
  const hit = esc(text.slice(idx, idx + q.length));
  const after = esc(text.slice(idx + q.length));
  return `${before}<mark>${hit}</mark>${after}`;
}
