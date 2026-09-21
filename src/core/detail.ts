import { esc, need } from './dom';
import { t } from './i18n';
import type { DetailPayload, SourceRef } from './types';

let root: HTMLElement;
let lastFocus: HTMLElement | null = null;
let closeTimer: number | null = null;

function levelLabel(level?: number): string {
  if (!level) return '';
  return t(`ui.lvl${level}`);
}

function sourcesHtml(sources?: SourceRef[]): string {
  if (!sources?.length) return '';
  const items = sources
    .map((s) => {
      const label = `${esc(s.label)}${s.year ? `（${s.year}）` : ''}`;
      return s.url
        ? `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${label}</a></li>`
        : `<li>${label}</li>`;
    })
    .join('');
  return `<div class="detail-src"><b>${esc(t('ui.sources'))}</b><ul>${items}</ul></div>`;
}

export function closeDetail(): void {
  if (!root || root.hidden) return;
  root.classList.remove('open');
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => {
    root.hidden = true;
    root.innerHTML = '';
    document.body.classList.remove('no-scroll');
    lastFocus?.focus();
    lastFocus = null;
    closeTimer = null;
  }, 400);
}

export function openDetail(p: DetailPayload): void {
  if (!root) initDetail();
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  root.classList.remove('open');
  lastFocus = (document.activeElement as HTMLElement) ?? null;

  const eyebrow = [p.eyebrow, levelLabel(p.level)].filter(Boolean).join(' · ');
  const tags = p.tags?.length
    ? `<div class="detail-tags">${p.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>`
    : '';

  const body = p.sections
    .map((sec) => {
      const head = `${
        sec.icon ? `<span class="dsec-ic" aria-hidden="true">${sec.icon}</span>` : ''
      }<span class="dsec-t">${esc(sec.title)}</span>`;
      const content = sec.items?.length
        ? `<ul class="dsec-list">${sec.items.map((i) => `<li>${i}</li>`).join('')}</ul>`
        : sec.html
          ? `<div class="dsec-body">${sec.html}</div>`
          : '';
      return `<section class="dsec"><h4 class="dsec-h">${head}</h4>${content}</section>`;
    })
    .join('');

  root.innerHTML = `
    <div class="detail-backdrop" data-close="1"></div>
    <aside class="detail-panel" role="dialog" aria-modal="true" aria-label="${esc(p.title)}">
      <button class="detail-close" type="button" data-close="1" aria-label="${esc(t('ui.close'))}">✕</button>
      <header class="detail-head">
        ${eyebrow ? `<p class="detail-eyebrow">${esc(eyebrow)}</p>` : ''}
        <h3 class="detail-title">${esc(p.title)}</h3>
        ${p.subtitle ? `<p class="detail-sub">${esc(p.subtitle)}</p>` : ''}
        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}
        ${tags}
      </header>
      <div class="detail-body">${body}</div>
      ${
        p.related?.length
          ? `<div class="detail-rel"><b>${esc(t('ui.related'))}</b><div class="rel-chips">${p.related
              .map((r, i) => `<button type="button" class="chip" data-rel="${i}">${esc(r.label)}</button>`)
              .join('')}</div></div>`
          : ''
      }
      ${sourcesHtml(p.sources)}
    </aside>`;

  root.querySelectorAll<HTMLElement>('[data-close]').forEach((node) => {
    node.addEventListener('click', closeDetail);
  });
  root.querySelectorAll<HTMLElement>('[data-rel]').forEach((node) => {
    node.addEventListener('click', () => {
      const idx = Number(node.dataset.rel);
      const target = p.related?.[idx];
      if (!target) return;
      closeDetail();
      target.onClick();
    });
  });

  root.hidden = false;
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => root.classList.add('open'));
  root.querySelector<HTMLElement>('.detail-panel')?.focus();
}

export function initDetail(): void {
  root = need('#detailRoot');
  root.hidden = true;
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeDetail();
  });
}
