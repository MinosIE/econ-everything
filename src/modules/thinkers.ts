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

export interface Thinker extends LObj {
  id: string;
  name: string;
  nameEn?: string;
  life?: string;
  country?: string;
  school?: string;
  level?: number;
  oneLiner?: string;
  bio?: string;
  ideas?: { k?: string; v?: string; kEn?: string; vEn?: string }[];
  works?: { title?: string; titleEn?: string; year?: number }[];
  quotes?: { q?: string; qEn?: string }[];
  related?: string[];
}

function card(item: Thinker): string {
  return `<article class="card js-item" data-key="${item.id}">
    <header class="card-h">
      <span class="card-t">${escapeInline(L(item, 'name'))}</span>
      ${lvlBadge(item.level)}
    </header>
    <p class="card-sub">${escapeInline([L<string>(item, 'life'), L<string>(item, 'school')].filter(Boolean).join(' · '))}</p>
    <p class="card-lead">${escapeInline(L(item, 'oneLiner'))}</p>
    <footer class="card-f">
      ${item.country ? `<span class="tag">${escapeInline(L(item, 'country'))}</span>` : ''}
      <span class="card-go">${t('ui.enter')}</span>
    </footer>
  </article>`;
}

export default async function render(): Promise<ModuleInstance> {
  const grid = await mountGrid<Thinker>({
    file: 'thinkers.json',
    hostSel: '#thinkersGrid',
    levels: true,
    sortBy: (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0),
    match: (it, q) =>
      [
        it.name,
        it.nameEn,
        it.life,
        it.school,
        it.schoolEn,
        it.country,
        it.countryEn,
        it.oneLiner,
        it.oneLinerEn,
        it.bio,
        it.bioEn,
        ...(it.ideas ?? []).flatMap((p) => [p.k, p.kEn, p.v, p.vEn]),
      ]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase()),
    card,
    onPick: (item) => openDetail(detail(item)),
  });

  function detail(item: Thinker): DetailPayload {
    const works = (item.works ?? [])
      .map((w) => {
        const title = L<string>(w as LObj, 'title');
        return w.year ? `《${escapeInline(title)}》(${w.year})` : `《${escapeInline(title)}》`;
      })
      .filter(Boolean);
    const quotes = (item.quotes ?? [])
      .map((q) => {
        const text = L<string>(q as LObj, 'q');
        return text ? `“${escapeInline(text)}”` : '';
      })
      .filter(Boolean);
    return {
      eyebrow: t('nav.thinkers'),
      title: L<string>(item, 'name'),
      subtitle: [L<string>(item, 'life'), L<string>(item, 'school'), L<string>(item, 'country')]
        .filter(Boolean)
        .join(' · '),
      level: item.level,
      tags: tagsOf(item),
      sections: compact([
        textSection('🎯', t('ui.oneLiner'), L<string>(item, 'oneLiner') ?? ''),
        textSection('🧭', t('ui.detail'), L<string>(item, 'bio') ?? ''),
        listSection('🔑', t('ui.ideas'), pointList(item, 'ideas')),
        listSection('📚', t('ui.works'), works),
        listSection('💬', t('ui.quotes'), quotes),
      ]),
      related: relatedButtons(item.related, 'm-thinkers'),
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
