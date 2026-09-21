import { openDetail } from '../core/detail';
import { L, t } from '../core/i18n';
import type { DetailPayload, LObj } from '../core/types';
import { lvlBadge } from '../core/ui';
import {
  compact,
  escapeInline,
  listSection,
  mountGrid,
  pointList,
  relatedButtons,
  tagsOf,
  textSection,
} from './shared';
import type { ModuleInstance } from './types';

export interface TradeTopic extends LObj {
  id: string;
  topic: string;
  topicEn?: string;
  level?: number;
  oneLiner?: string;
  detail?: string;
  example?: string;
  views?: { k?: string; v?: string; kEn?: string; vEn?: string }[];
  related?: string[];
}

function card(item: TradeTopic): string {
  return `<article class="card js-item" data-key="${item.id}">
    <header class="card-h">
      <span class="card-t">${escapeInline(L(item, 'topic'))}</span>
      ${lvlBadge(item.level)}
    </header>
    <p class="card-lead">${escapeInline(L(item, 'oneLiner'))}</p>
    <footer class="card-f">
      <span class="tag">${escapeInline(t('ui.views'))}</span>
      <span class="card-go">${t('ui.enter')}</span>
    </footer>
  </article>`;
}

export default async function render(): Promise<ModuleInstance> {
  const grid = await mountGrid<TradeTopic>({
    file: 'trade.json',
    hostSel: '#tradeGrid',
    levels: true,
    sortBy: (a, b) => Number(a.level ?? 1) - Number(b.level ?? 1),
    match: (it, q) =>
      [
        it.topic,
        it.topicEn,
        it.oneLiner,
        it.oneLinerEn,
        it.detail,
        it.detailEn,
        it.example,
        it.exampleEn,
        ...(it.views ?? []).flatMap((v) => [v.k, v.kEn, v.v, v.vEn]),
      ]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase()),
    card,
    onPick: (item) => openDetail(detail(item)),
  });

  function detail(item: TradeTopic): DetailPayload {
    return {
      eyebrow: t('nav.trade'),
      title: L<string>(item, 'topic'),
      subtitle: L<string>(item, 'topicEn'),
      level: item.level,
      tags: tagsOf(item),
      sections: compact([
        textSection('🎯', t('ui.oneLiner'), L<string>(item, 'oneLiner') ?? ''),
        textSection('📘', t('ui.detail'), L<string>(item, 'detail') ?? ''),
        textSection('🧺', t('ui.example'), L<string>(item, 'example') ?? ''),
        listSection('⚖️', t('ui.views'), pointList(item, 'views')),
      ]),
      related: relatedButtons(item.related, 'm-trade'),
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
