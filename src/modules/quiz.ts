import { fetchData } from '../core/data';
import { esc, need } from '../core/dom';
import { L, t } from '../core/i18n';
import type { LObj } from '../core/types';
import { escapeInline } from './shared';
import type { ModuleInstance } from './types';

export interface Question extends LObj {
  id: string;
  category?: string;
  level?: number;
  q: string;
  qEn?: string;
  options?: { k?: string; kEn?: string }[];
  answer: number;
  explain?: string;
}

const BEST_KEY = 'econ.quiz.best';

let questions: Question[] = [];
let idx = 0;
let score = 0;
let picked = -1;
let done = false;
let host: HTMLElement | null = null;

function readBest(): number | null {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

function writeBest(v: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* ignore */
  }
}

function start(): void {
  idx = 0;
  score = 0;
  picked = -1;
  done = false;
  draw();
}

function next(): void {
  if (idx + 1 >= questions.length) {
    done = true;
    const prev = readBest();
    if (prev === null || score > prev) writeBest(score);
    draw();
    return;
  }
  idx += 1;
  picked = -1;
  draw();
}

function answer(i: number): void {
  if (picked >= 0 || done) return;
  picked = i;
  if (i === Number(questions[idx].answer)) score += 1;
  draw();
}

function draw(): void {
  if (!host) return;
  const total = questions.length;
  const best = readBest();
  const bestLine = best === null ? '' : `<span class="quiz-best">${esc(t('quiz.bestScore', { s: best, n: total }))}</span>`;

  if (done) {
    const pct = total ? Math.round((score / total) * 100) : 0;
    host.innerHTML = `<div class="quiz-card">
      <p class="quiz-eyebrow">${esc(t('quiz.done'))}</p>
      <p class="quiz-score">${esc(t('quiz.score', { s: score, n: total }))}</p>
      <div class="quiz-bar"><span style="width:${pct}%"></span></div>
      <div class="quiz-acts">${bestLine}
        <button type="button" class="btn primary" id="quizRestart">${esc(t('quiz.restart'))}</button>
        <button type="button" class="btn ghost" id="quizClear">${esc(t('quiz.clear'))}</button>
      </div>
    </div>`;
    host.querySelector('#quizRestart')?.addEventListener('click', start);
    host.querySelector('#quizClear')?.addEventListener('click', () => {
      try {
        localStorage.removeItem(BEST_KEY);
      } catch {
        /* ignore */
      }
      draw();
    });
    return;
  }

  const q = questions[idx];
  const opts = q.options ?? [];
  const correct = Number(q.answer);

  host.innerHTML = `<div class="quiz-card">
    <header class="quiz-head">
      <span class="quiz-progress">${esc(t('quiz.progress', { i: idx + 1, n: total }))}</span>
      <span class="tag">${esc(L(q, 'category'))}</span>
      ${bestLine}
    </header>
    <h3 class="quiz-q">${escapeInline(L(q, 'q'))}</h3>
    <div class="quiz-opts">
      ${opts
        .map((o, i) => {
          const cls = ['quiz-opt'];
          if (picked >= 0) {
            if (i === correct) cls.push('ok');
            else if (i === picked) cls.push('no');
          }
          return `<button type="button" class="${cls.join(' ')}" data-i="${i}" ${picked >= 0 ? 'disabled' : ''}>
            <span class="quiz-key">${String.fromCharCode(65 + i)}</span>
            <span class="quiz-text">${escapeInline(L(o as LObj, 'k'))}</span>
          </button>`;
        })
        .join('')}
    </div>
    ${
      picked >= 0
        ? `<div class="quiz-explain ${picked === correct ? 'ok' : 'no'}">
            <b>${esc(picked === correct ? t('quiz.correct') : t('quiz.wrong'))}</b>
            <p>${escapeInline(L(q, 'explain') ?? '')}</p>
          </div>
          <div class="quiz-acts">
            <button type="button" class="btn primary" id="quizNext">
              ${esc(idx + 1 >= total ? t('quiz.finish') : t('quiz.next'))}
            </button>
          </div>`
        : `<p class="quiz-tip">${esc(t('quiz.tipStart'))}</p>`
    }
  </div>`;

  host.querySelectorAll<HTMLElement>('.quiz-opt').forEach((node) => {
    node.addEventListener('click', () => answer(Number(node.dataset.i)));
  });
  host.querySelector('#quizNext')?.addEventListener('click', next);
}

export default async function render(): Promise<ModuleInstance> {
  host = need('#quizBox');
  if (!questions.length) {
    questions = await fetchData<Question[]>('quiz.json');
    idx = 0;
    score = 0;
    picked = -1;
    done = false;
  }
  draw();
  return {};
}
