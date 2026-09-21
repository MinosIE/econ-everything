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

export interface GameCase extends LObj {
  id: string;
  name: string;
  nameEn?: string;
  category?: string;
  level?: number;
  oneLiner?: string;
  detail?: string;
  example?: string;
  takeaways?: string[];
  related?: string[];
}

function card(item: GameCase): string {
  return `<article class="card js-item" data-key="${item.id}">
    <header class="card-h">
      <span class="card-t">${escapeInline(L(item, 'name'))}</span>
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
  const grid = await mountGrid<GameCase>({
    file: 'gametheory.json',
    hostSel: '#gameGrid',
    filterSel: '#gameFilters',
    levels: true,
    sortBy: (a, b) => Number(a.level ?? 1) - Number(b.level ?? 1),
    match: (it, q) =>
      [it.name, it.nameEn, it.oneLiner, it.oneLinerEn, it.detail, it.detailEn, it.example, it.exampleEn]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase()),
    card,
    onPick: (item) => openDetail(detail(item)),
  });

  function detail(item: GameCase): DetailPayload {
    return {
      eyebrow: t('nav.game'),
      title: L<string>(item, 'name'),
      subtitle: L<string>(item, 'nameEn'),
      level: item.level,
      tags: tagsOf(item),
      sections: compact([
        textSection('🎯', t('ui.oneLiner'), L<string>(item, 'oneLiner') ?? ''),
        textSection('📘', t('ui.detail'), L<string>(item, 'detail') ?? ''),
        textSection('🧺', t('ui.example'), L<string>(item, 'example') ?? ''),
        listSection('🔑', t('ui.points'), pairList(item, 'takeaways')),
      ]),
      related: relatedButtons(item.related, 'm-game'),
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
