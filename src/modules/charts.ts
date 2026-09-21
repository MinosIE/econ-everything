import { fetchData } from '../core/data';
import { openDetail } from '../core/detail';
import { clickable, esc, need } from '../core/dom';
import { L, t } from '../core/i18n';
import type { LObj, SourceRef } from '../core/types';
import { escapeInline } from './shared';
import type { ModuleInstance } from './types';

export interface Point {
  y: number;
  v: number;
}

export interface Chart extends LObj {
  id: string;
  title: string;
  titleEn?: string;
  unit?: string;
  note?: string;
  series?: Point[];
  sources?: SourceRef[];
}

const W = 640;
const H = 250;
const PAD = { l: 46, r: 16, t: 18, b: 34 };

function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) return [min];
  const step = (max - min) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(step) || 1)));
  const norm = step / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  const s = nice * mag;
  const start = Math.floor(min / s) * s;
  const end = Math.ceil(max / s) * s;
  const out: number[] = [];
  for (let v = start; v <= end + s / 2; v += s) out.push(Number(v.toFixed(6)));
  return out.length ? out : [min, max];
}

function fmt(v: number): string {
  if (Math.abs(v) >= 1000) return v.toLocaleString('en-US');
  return String(Number(v.toFixed(2)));
}

function chartSvg(item: Chart): string {
  const pts = (item.series ?? []).filter((p) => Number.isFinite(p.y) && Number.isFinite(p.v));
  if (pts.length < 2) return '';
  const ys = pts.map((p) => Number(p.v));
  let min = Math.min(...ys);
  let max = Math.max(...ys);
  if (min > 0) min = Math.min(min, 0);
  const ticks = niceTicks(min, max, 4);
  min = Math.min(min, ticks[0]);
  max = Math.max(max, ticks[ticks.length - 1]);
  if (min === max) max = min + 1;

  const years = pts.map((p) => Number(p.y));
  const y0 = Math.min(...years);
  const y1 = Math.max(...years) || y0 + 1;

  const x = (year: number) =>
    PAD.l + ((year - y0) / (y1 - y0 || 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);

  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(Number(p.y)).toFixed(1)},${y(Number(p.v)).toFixed(1)}`).join(' ');
  const area = `${line} L${x(y1).toFixed(1)},${y(min).toFixed(1)} L${x(y0).toFixed(1)},${y(min).toFixed(1)} Z`;

  const grid = ticks
    .map(
      (tv) =>
        `<line class="c-grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(tv).toFixed(1)}" y2="${y(tv).toFixed(1)}" />
         <text class="c-ylab" x="${PAD.l - 8}" y="${(y(tv) + 4).toFixed(1)}" text-anchor="end">${esc(fmt(tv))}</text>`,
    )
    .join('');

  const zero =
    min < 0 && max > 0
      ? `<line class="c-zero" x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" />`
      : '';

  const step = Math.max(1, Math.ceil(pts.length / 6));
  const xlabs = pts
    .filter((_, i) => i % step === 0 || i === pts.length - 1)
    .map(
      (p) =>
        `<text class="c-xlab" x="${x(Number(p.y)).toFixed(1)}" y="${H - 12}" text-anchor="middle">${esc(String(p.y))}</text>`,
    )
    .join('');

  const dots = pts
    .map((p) => `<circle class="c-dot" cx="${x(Number(p.y)).toFixed(1)}" cy="${y(Number(p.v)).toFixed(1)}" r="2.6" />`)
    .join('');

  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(L(item, 'title'))}">
    ${grid}${zero}
    <path class="c-area" d="${area}" />
    <path class="c-line" d="${line}" />
    ${dots}${xlabs}
  </svg>`;
}

export default async function render(): Promise<ModuleInstance> {
  const host = need('#chartsWrap');
  const items = await fetchData<Chart[]>('charts.json');
  const byId = new Map(items.map((it) => [String(it.id), it]));

  host.innerHTML = items
    .map((it) => {
      const src = (it.sources ?? [])[0];
      const srcLabel = src ? `${src.label}${src.year ? ` ${src.year}` : ''}` : '';
      return `<article class="chart-card js-item" data-key="${it.id}">
        <header class="chart-h">
          <h3 class="chart-t">${escapeInline(L(it, 'title'))}</h3>
          <span class="chart-unit">${escapeInline(L(it, 'unit') ?? '')}</span>
        </header>
        ${chartSvg(it)}
        <p class="chart-note">${escapeInline(L(it, 'note') ?? t('ui.chartNote'))}</p>
        <footer class="card-f">
          <span class="tag">${esc(srcLabel)}</span>
          <span class="card-go">${t('ui.enter')}</span>
        </footer>
      </article>`;
    })
    .join('');

  function detail(item: Chart): void {
    const pts = item.series ?? [];
    openDetail({
      eyebrow: t('nav.charts'),
      title: L<string>(item, 'title'),
      subtitle: L<string>(item, 'titleEn'),
      tags: [L<string>(item, 'unit') ?? ''].filter(Boolean),
      sections: [
        {
          icon: '📊',
          title: t('ui.detail'),
          html: `<p>${escapeInline(L(item, 'note') ?? t('ui.chartNote'))}</p>
            <p class="detail-meta">${escapeInline(t('ui.unit'))}：${escapeInline(L(item, 'unit') ?? '-')} · ${pts.length} ${escapeInline(t('ui.points'))}</p>`,
        },
      ],
      sources: Array.isArray(item.sources) ? item.sources : [],
    });
  }

  host.querySelectorAll<HTMLElement>('.js-item').forEach((node) => {
    const item = byId.get(node.dataset.key ?? '');
    if (item) clickable(node, () => detail(item));
  });

  return {
    openById: (id: string) => {
      const item = byId.get(id);
      if (!item) return false;
      detail(item);
      return true;
    },
  };
}
