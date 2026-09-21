import { app } from '../core/app';
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

export interface Everyday extends LObj {
  id: string;
  icon?: string;
  question: string;
  questionEn?: string;
  level?: number;
  econ?: string;
  detail?: string;
  concept?: string;
  related?: string[];
}

function card(item: Everyday): string {
  return `<article class="card js-item" data-key="${item.id}">
    <header class="card-h">
      <span class="card-ic" aria-hidden="true">${escapeInline(item.icon ?? '☕')}</span>
      <span class="card-t">${escapeInline(L(item, 'question'))}</span>
      ${lvlBadge(item.level)}
    </header>
    <p class="card-lead">${escapeInline(L(item, 'econ'))}</p>
    <footer class="card-f">
      <span class="card-go">${t('ui.enter')}</span>
    </footer>
  </article>`;
}

export default async function render(): Promise<ModuleInstance> {
  const grid = await mountGrid<Everyday>({
    file: 'everyday.json',
    hostSel: '#everydayGrid',
    levels: true,
    match: (it, q) =>
      [it.question, it.questionEn, it.econ, it.econEn, it.detail, it.detailEn]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase()),
    card,
    onPick: (item) => openDetail(detail(item)),
  });

  function detail(item: Everyday): DetailPayload {
    const related = relatedButtons(item.related, 'm-everyday');
    if (item.concept) {
      related.unshift({
        label: `${t('ui.concept')}：${String(item.conceptLabel ?? item.concept)}`,
        onClick: () => app().openTarget('m-concepts', String(item.concept)),
      });
    }
    return {
      eyebrow: t('nav.everyday'),
      title: L<string>(item, 'question'),
      subtitle: L<string>(item, 'questionEn'),
      level: item.level,
      tags: tagsOf(item),
      sections: compact([
        textSection('🎯', t('ui.econ'), L<string>(item, 'econ') ?? ''),
        textSection('📘', t('ui.detail'), L<string>(item, 'detail') ?? ''),
      ]),
      related,
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
