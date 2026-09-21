import { openDetail } from '../core/detail';
import { L, t } from '../core/i18n';
import type { DetailPayload, LObj } from '../core/types';
import { lvlBadge } from '../core/ui';
import {
  compact,
  escapeInline,
  mountGrid,
  relatedButtons,
  tagsOf,
  textSection,
} from './shared';
import type { ModuleInstance } from './types';

export interface Myth extends LObj {
  id: string;
  myth: string;
  mythEn?: string;
  truth?: string;
  why?: string;
  level?: number;
  related?: string[];
}

function card(item: Myth): string {
  return `<article class="myth js-item" data-key="${item.id}">
    <header class="myth-h">
      <span class="myth-badge">${escapeInline(t('ui.myth'))}</span>
      ${lvlBadge(item.level)}
    </header>
    <p class="myth-q">${escapeInline(L(item, 'myth'))}</p>
    <p class="myth-a">${escapeInline(L(item, 'truth'))}</p>
    <footer class="card-f">
      <span class="card-go">${t('ui.enter')}</span>
    </footer>
  </article>`;
}

export default async function render(): Promise<ModuleInstance> {
  const grid = await mountGrid<Myth>({
    file: 'myths.json',
    hostSel: '#mythsList',
    levels: true,
    match: (it, q) =>
      [it.myth, it.mythEn, it.truth, it.truthEn, it.why, it.whyEn]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase()),
    card,
    onPick: (item) => openDetail(detail(item)),
  });

  function detail(item: Myth): DetailPayload {
    return {
      eyebrow: t('nav.myths'),
      title: L<string>(item, 'myth'),
      level: item.level,
      tags: tagsOf(item),
      sections: compact([
        textSection('❌', t('ui.myth'), L<string>(item, 'myth') ?? ''),
        textSection('✅', t('ui.truth'), L<string>(item, 'truth') ?? ''),
        textSection('🤔', t('ui.mythWhy'), L<string>(item, 'why') ?? ''),
      ]),
      related: relatedButtons(item.related, 'm-myths'),
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
