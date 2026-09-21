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
  textSection,
} from './shared';
import type { ModuleInstance } from './types';

export interface School extends LObj {
  id: string;
  name: string;
  nameEn?: string;
  span?: string;
  level?: number;
  core?: string;
  founders?: string[];
  keyIdeas?: string[];
  strengths?: string[];
  criticisms?: string[];
  related?: string[];
}

function card(item: School): string {
  return `<article class="card js-item" data-key="${item.id}">
    <header class="card-h">
      <span class="card-t">${escapeInline(L(item, 'name'))}</span>
      ${lvlBadge(item.level)}
    </header>
    <p class="card-sub">${escapeInline(L<string>(item, 'span') ?? '')}</p>
    <p class="card-lead">${escapeInline(L(item, 'core'))}</p>
    <footer class="card-f">
      <span class="tag">${escapeInline(pairList(item, 'founders').slice(0, 3).join(' / '))}</span>
      <span class="card-go">${t('ui.enter')}</span>
    </footer>
  </article>`;
}

export default async function render(): Promise<ModuleInstance> {
  const grid = await mountGrid<School>({
    file: 'schools.json',
    hostSel: '#schoolsGrid',
    levels: true,
    sortBy: (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0),
    match: (it, q) =>
      [it.name, it.nameEn, it.span, it.core, it.coreEn, ...pairList(it, 'founders'), ...pairList(it, 'keyIdeas')]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase()),
    card,
    onPick: (item) => openDetail(detail(item)),
  });

  function detail(item: School): DetailPayload {
    return {
      eyebrow: t('nav.schools'),
      title: L<string>(item, 'name'),
      subtitle: L<string>(item, 'span') ?? '',
      level: item.level,
      sections: compact([
        textSection('🎯', t('ui.core'), L<string>(item, 'core') ?? ''),
        listSection('👤', t('ui.founders'), pairList(item, 'founders')),
        listSection('🔑', t('ui.keyIdeas'), pairList(item, 'keyIdeas')),
        listSection('✅', t('ui.strengths'), pairList(item, 'strengths')),
        listSection('❌', t('ui.criticisms'), pairList(item, 'criticisms')),
      ]),
      related: relatedButtons(item.related, 'm-schools'),
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
