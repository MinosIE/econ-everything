import { openDetail } from '../core/detail';
import { L, t } from '../core/i18n';
import type { DetailPayload, LObj } from '../core/types';
import { lvlBadge } from '../core/ui';
import {
  compact,
  escapeInline,
  listSection,
  mountGrid,
  pairList,
  relatedButtons,
  tagsOf,
  textSection,
} from './shared';
import type { ModuleInstance } from './types';

export interface Concept extends LObj {
  id: string;
  term: string;
  termEn?: string;
  category?: string;
  level?: number;
  oneLiner?: string;
  detail?: string;
  example?: string;
  related?: string[];
}

function card(item: Concept): string {
  return `<article class="card js-item" data-key="${item.id}">
    <header class="card-h">
      <span class="card-t">${escapeInline(L(item, 'term'))}</span>
      ${lvlBadge(item.level)}
    </header>
    <p class="card-lead">${escapeInline(L(item, 'oneLiner'))}</p>
    <footer class="card-f">
      ${item.category ? `<span class="tag">${escapeInline(L(item, 'category'))}</span>` : ''}
      <span class="card-go">${t('ui.enter')}</span>
    </footer>
  </article>`;
}

export default async function render(): Promise<ModuleInstance> {
  const grid = await mountGrid<Concept>({
    file: 'concepts.json',
    hostSel: '#conceptsGrid',
    filterSel: '#conceptsFilters',
    countSel: '#conceptsCount',
    levels: true,
    sortBy: (a, b) =>
      Number(a.level ?? 1) - Number(b.level ?? 1) || String(a.id).localeCompare(String(b.id)),
    match: (it, q) =>
      [
        it.term,
        it.termEn,
        it.oneLiner,
        it.oneLinerEn,
        it.detail,
        it.detailEn,
        it.example,
        it.exampleEn,
        it.category,
        it.categoryEn,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase()),
    card,
    onPick: (item) => openDetail(detail(item)),
  });

  function detail(item: Concept): DetailPayload {
    return {
      eyebrow: t('nav.concepts'),
      title: L<string>(item, 'term'),
      subtitle: L<string>(item, 'termEn'),
      level: item.level,
      tags: tagsOf(item),
      sections: compact([
        textSection('💡', t('ui.oneLiner'), L<string>(item, 'oneLiner') ?? ''),
        textSection('📘', t('ui.detail'), L<string>(item, 'detail') ?? ''),
        textSection('🧺', t('ui.example'), L<string>(item, 'example') ?? ''),
        listSection('⚠️', t('ui.watch'), pairList(item, 'watch')),
      ]),
      related: relatedButtons(item.related, 'm-concepts'),
      sources: Array.isArray(item.sources) ? item.sources : [],
    };
  }

  return {
    openById: (id: string) => {
      const item = grid.byId.get(id);
      if (!item) return false;
      openDetail(detail(item));
      return true;
    },
  };
}
