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

export interface EconEvent extends LObj {
  id: string;
  y: number;
  yearLabel?: string;
  title: string;
  titleEn?: string;
  place?: string;
  level?: number;
  what?: string;
  why?: string;
  impact?: string;
  related?: string[];
}

function card(item: EconEvent): string {
  return `<article class="tl js-item" data-key="${item.id}">
    <span class="tl-year">${escapeInline(L(item, 'yearLabel') ?? item.y)}</span>
    <span class="tl-dot" aria-hidden="true"></span>
    <div class="tl-main">
      <header class="tl-h">
        <h3 class="tl-t">${escapeInline(L(item, 'title'))}</h3>
        ${lvlBadge(item.level)}
      </header>
      <p class="tl-x">${escapeInline(L(item, 'what'))}</p>
      <footer class="tl-f">
        ${item.place ? `<span class="tag">${escapeInline(L(item, 'place'))}</span>` : ''}
        <span class="card-go">${t('ui.enter')}</span>
      </footer>
    </div>
  </article>`;
}

export default async function render(): Promise<ModuleInstance> {
  const grid = await mountGrid<EconEvent>({
    file: 'events.json',
    hostSel: '#eventsList',
    levels: true,
    sortBy: (a, b) => Number(a.y) - Number(b.y),
    match: (it, q) =>
      [it.title, it.titleEn, it.place, it.placeEn, it.what, it.whatEn, it.why, it.whyEn, it.impact, it.impactEn]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase()),
    card,
    onPick: (item) => openDetail(detail(item)),
  });

  function detail(item: EconEvent): DetailPayload {
    return {
      eyebrow: t('nav.events'),
      title: L<string>(item, 'title'),
      subtitle: [L<string>(item, 'yearLabel') ?? String(item.y), L<string>(item, 'place')]
        .filter(Boolean)
        .join(' · '),
      level: item.level,
      tags: tagsOf(item),
      sections: compact([
        textSection('📌', t('ui.what'), L<string>(item, 'what') ?? ''),
        textSection('🔍', t('ui.why'), L<string>(item, 'why') ?? ''),
        textSection('🌊', t('ui.impact'), L<string>(item, 'impact') ?? ''),
      ]),
      related: relatedButtons(item.related, 'm-events'),
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
