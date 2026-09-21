import { openDetail } from '../core/detail';
import { L, t } from '../core/i18n';
import type { DetailPayload, LObj } from '../core/types';
import { lvlBadge } from '../core/ui';
import {
  compact,
  listSection,
  mountGrid,
  pairList,
  pointList,
  relatedButtons,
  tagsOf,
  textSection,
  topicCard,
} from './shared';
import type { ModuleInstance, ModuleRender } from './types';

export interface Topic extends LObj {
  id: string;
  title: string;
  titleEn?: string;
  icon?: string;
  level?: number;
  category?: string;
  lead?: string;
  points?: { k?: string; v?: string; kEn?: string; vEn?: string }[];
  watch?: string[];
  related?: string[];
}

/** 宏观 / 微观 / 货币金融 三个模块结构一致，共用同一套渲染逻辑。 */
export function makeTopicModule(
  file: string,
  hostSel: string,
  filterSel: string,
  eyebrowKey: string,
  moduleId: string,
): ModuleRender {
  return async function renderTopic(): Promise<ModuleInstance> {
    const grid = await mountGrid<Topic>({
      file,
      hostSel,
      filterSel,
      levels: true,
      sortBy: (a, b) =>
        String(a.category ?? '').localeCompare(String(b.category ?? '')) ||
        Number(a.level ?? 1) - Number(b.level ?? 1),
      match: (it, q) =>
        [
          it.title,
          it.titleEn,
          it.lead,
          it.leadEn,
          it.category,
          ...(it.points ?? []).flatMap((p) => [p.k, p.kEn, p.v, p.vEn]),
        ]
          .join(' ')
          .toLowerCase()
          .includes(q.toLowerCase()),
      card: (it) => topicCard(it, lvlBadge(it.level)),
      onPick: (item) => openDetail(detail(item)),
    });

    function detail(item: Topic): DetailPayload {
      return {
        eyebrow: t(eyebrowKey),
        title: L<string>(item, 'title'),
        subtitle: L<string>(item, 'titleEn'),
        level: item.level,
        tags: tagsOf(item),
        sections: compact([
          textSection('🎯', t('ui.oneLiner'), L<string>(item, 'lead') ?? ''),
          listSection('🔑', t('ui.points'), pointList(item)),
          listSection('⚠️', t('ui.watch'), pairList(item, 'watch')),
        ]),
        related: relatedButtons(item.related, moduleId),
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
  };
}
