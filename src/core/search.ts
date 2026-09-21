import { fetchData } from './data';
import { esc, need } from './dom';
import { getLang, t } from './i18n';
import type { SearchEntry } from './types';

let index: SearchEntry[] | null = null;
let loading: Promise<void> | null = null;
let items: SearchEntry[] = [];
let cursor = -1;

async function ensureIndex(): Promise<void> {
  if (index) return;
  if (!loading) {
    loading = fetchData<SearchEntry[]>('search.json')
      .then((data) => {
        index = data;
      })
      .catch(() => {
        index = [];
      });
  }
  await loading;
}

function score(entry: SearchEntry, q: string): number {
  const n = (entry.n || '').toLowerCase();
  const x = (entry.x || '').toLowerCase();
  const nEn = (entry.nEn || '').toLowerCase();
  const xEn = (entry.xEn || '').toLowerCase();
  if (n === q || nEn === q) return 0;
  if (n.startsWith(q) || nEn.startsWith(q)) return 1;
  if (n.includes(q) || nEn.includes(q)) return 2;
  if (x.includes(q) || xEn.includes(q)) return 3;
  return 99;
}

export interface SearchController {
  run(query: string): void;
  close(): void;
}

export function initSearch(onPick: (entry: SearchEntry) => void): SearchController {
  const input = need<HTMLInputElement>('#search');
  const box = need('#searchResults');

  function render(list: SearchEntry[], note: string): void {
    if (!list.length) {
      box.innerHTML = `<p class="sr-empty">${esc(note)}</p>`;
      box.hidden = false;
      return;
    }
    box.innerHTML = list
      .map((e, i) => {
        const asEn = getLang() === 'en';
        const name = (asEn && e.nEn) || e.n;
        const x = (asEn && e.xEn) || e.x || '';
        return `<div class="sr-item${i === cursor ? ' on' : ''}" role="option" data-i="${i}">
          <span class="sr-type">${esc(t(e.t))}</span>
          <span class="sr-name">${esc(name)}</span>
          <span class="sr-x">${esc(x)}</span>
        </div>`;
      })
      .join('');
    box.hidden = false;
  }

  function run(query: string): void {
    const q = query.trim().toLowerCase();
    cursor = -1;
    if (!q) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }
    void ensureIndex().then(() => {
      const all = index ?? [];
      items = all
        .map((e) => ({ e, s: score(e, q) }))
        .filter((r) => r.s < 99)
        .sort((a, b) => a.s - b.s)
        .slice(0, 14)
        .map((r) => r.e);
      render(items, t('searchEmpty'));
    });
  }

  input.addEventListener('input', () => run(input.value));
  input.addEventListener('focus', () => {
    if (!input.value.trim()) {
      box.hidden = true;
    }
  });
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      close();
      return;
    }
    if (!items.length) return;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      cursor = ev.key === 'ArrowDown' ? (cursor + 1) % items.length : (cursor - 1 + items.length) % items.length;
      box.querySelectorAll('.sr-item').forEach((node, i) => node.classList.toggle('on', i === cursor));
      return;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      const picked = items[cursor >= 0 ? cursor : 0];
      if (picked) {
        onPick(picked);
        close();
      }
    }
  });

  box.addEventListener('click', (ev) => {
    const node = (ev.target as HTMLElement).closest<HTMLElement>('.sr-item');
    if (!node) return;
    const picked = items[Number(node.dataset.i)];
    if (picked) {
      onPick(picked);
      close();
    }
  });

  document.addEventListener('click', (ev) => {
    if (!(ev.target as HTMLElement).closest('.search')) close();
  });

  function close(): void {
    box.hidden = true;
    box.innerHTML = '';
    items = [];
    cursor = -1;
  }

  // 预取索引，让首次输入零等待
  void ensureIndex();
  return { run, close };
}
