import { openDetail } from '../core/detail';
import { L, t } from '../core/i18n';
import type { DetailPayload, LObj } from '../core/types';
import { compact, escapeInline, mountGrid, relatedButtons, textSection } from './shared';
import type { ModuleInstance } from './types';

export interface Term extends LObj {
  id: string;
  term: string;
  termEn?: string;
  abbr?: string;
  category?: string;
  def?: string;
  plain?: string;
  related?: string[];
}

function label(item: Term): string {
  const abbr = item.abbr ? ` · ${item.abbr}` : '';
  return `${L(item, 'term')}${abbr}`;
}

function card(item: Term): string {
  return `<article class="gloss js-item" data-key="${item.id}">
    <header class="gloss-h">
      <span class="gloss-t">${escapeInline(L(item, 'term'))}</span>
      ${item.abbr ? `<span class="gloss-abbr">${escapeInline(item.abbr)}</span>` : ''}
      <span class="gloss-en">${escapeInline(L(item, 'termEn'))}</span>
      ${item.category ? `<span class="tag">${escapeInline(L(item, 'category'))}</span>` : ''}
    </header>
    <p class="gloss-plain">${escapeInline(L(item, 'plain'))}</p>
  </article>`;
}

export default async function render(): Promise<ModuleInstance> {
  const grid = await mountGrid<Term>({
    file: 'glossary.json',
    hostSel: '#glossaryList',
    filterSel: '#glossaryFilters',
    countSel: '#glossaryCount',
    querySel: '#glossaryQuery',
    match: (it, q) =>
      [it.term, it.termEn, it.abbr, it.def, it.defEn, it.plain, it.plainEn, it.category]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase()),
    card,
    onPick: (item) => openDetail(detail(item)),
  });

  function detail(item: Term): DetailPayload {
    return {
      eyebrow: t('nav.glossary'),
      title: label(item),
      subtitle: L<string>(item, 'termEn'),
      tags: item.category ? [L<string>(item, 'category')] : [],
      sections: compact([
        textSection('📐', t('ui.def'), L<string>(item, 'def') ?? ''),
        textSection('💬', t('ui.plain'), L<string>(item, 'plain') ?? ''),
      ]),
      related: relatedButtons(item.related, 'm-glossary'),
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
