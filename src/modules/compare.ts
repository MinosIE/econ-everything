import { fetchData } from '../core/data';
import { openDetail } from '../core/detail';
import { clickable, need } from '../core/dom';
import { L, t } from '../core/i18n';
import type { LObj } from '../core/types';
import { escapeInline } from './shared';
import type { ModuleInstance } from './types';

export interface CompareCase {
  who?: string;
  whoEn?: string;
  how?: string;
  howEn?: string;
}

export interface CompareItem extends LObj {
  id: string;
  question: string;
  questionEn?: string;
  level?: number;
  cases?: CompareCase[];
  takeaway?: string;
}

function casesHtml(item: CompareItem): string {
  return (item.cases ?? [])
    .map(
      (c) => `<div class="cmp-case">
        <p class="cmp-who">${escapeInline(L(c as LObj, 'who'))}</p>
        <p class="cmp-how">${escapeInline(L(c as LObj, 'how'))}</p>
      </div>`,
    )
    .join('');
}

export default async function render(): Promise<ModuleInstance> {
  const host = need('#compareList');
  const items = await fetchData<CompareItem[]>('compare.json');
  const byId = new Map(items.map((it) => [String(it.id), it]));

  host.innerHTML = items
    .map(
      (it) => `<article class="cmp js-item" data-key="${it.id}">
        <h3 class="cmp-q">${escapeInline(L(it, 'question'))}</h3>
        <div class="cmp-cases">${casesHtml(it)}</div>
        <footer class="card-f">
          <span class="tag">${escapeInline(t('ui.compareNote'))}</span>
          <span class="card-go">${t('ui.enter')}</span>
        </footer>
      </article>`,
    )
    .join('');

  function detail(item: CompareItem): void {
    openDetail({
      eyebrow: t('nav.compare'),
      title: L<string>(item, 'question'),
      subtitle: L<string>(item, 'questionEn'),
      level: item.level,
      sections: [
        { icon: '⚖️', title: t('ui.compareNote'), html: `<div class="cmp-cases">${casesHtml(item)}</div>` },
        { icon: '🎯', title: t('ui.takeaway'), html: `<p>${escapeInline(L(item, 'takeaway') ?? '')}</p>` },
      ].filter((s) => s.html && !s.html.endsWith('></div>')),
      sources: Array.isArray(item.sources) ? item.sources : [],
    });
  }

  host.querySelectorAll<HTMLElement>('.js-item').forEach((node) => {
    const item = byId.get(node.dataset.key ?? '');
    if (item) clickable(node, () => detail(item));
  });

  return {
    openById: (id: string) => {
      const item = byId.get(id);
      if (!item) return false;
      detail(item);
      return true;
    },
  };
}
