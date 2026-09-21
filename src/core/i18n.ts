import wordbook from './i18n.json';
import type { LObj, Lang } from './types';

/**
 * 界面词表：内容在 i18n.json（zh / en 两套键）。
 * 键对齐由此处类型约束（en 缺键会编译报错）+ scripts/check-i18n.mjs（多余/缺失键都报错）双重保障。
 */
const zh = wordbook.zh;
const en: typeof zh = wordbook.en;

export const I18N: Record<Lang, typeof zh> = { zh, en };

let lang: Lang = 'zh';
const listeners: ((l: Lang) => void)[] = [];

function detectLang(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q) return q === 'en' ? 'en' : 'zh';
    const stored = localStorage.getItem('lang');
    if (stored) return stored === 'en' ? 'en' : 'zh';
    return (navigator.language || 'zh').toLowerCase().startsWith('en') ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

export function initLang(): Lang {
  lang = detectLang();
  return lang;
}

export function getLang(): Lang {
  return lang;
}

export function onLangChange(cb: (l: Lang) => void): void {
  listeners.push(cb);
}

export function setLang(next: Lang): void {
  if (next === lang) return;
  lang = next;
  try {
    localStorage.setItem('lang', lang);
  } catch {
    /* 隐私模式下忽略 */
  }
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  document.documentElement.setAttribute('data-lang', lang);
  applyStaticLang();
  listeners.forEach((cb) => cb(lang));
}

/** 取界面文案：当前语言缺失时回退中文，再回退 key 本身。 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const dict = I18N[lang] as Record<string, string>;
  const base = zh as Record<string, string>;
  let s = dict[key] ?? base[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return s;
}

/** 取数据字段：en 模式优先 `key+'En'`，缺失回退中文原字段。 */
export function L<T = string>(o: LObj | undefined | null, key: string): T {
  if (!o) return undefined as unknown as T;
  if (lang === 'en') {
    const v = o[key + 'En'];
    if (v !== undefined && v !== null && v !== '') return v as T;
  }
  return o[key] as T;
}

/** 把 `data-i18n` / `data-i18n-attr` 节点按当前语言重写。 */
export function applyStaticLang(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    const spec = el.dataset.i18nAttr || '';
    spec.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    });
  });
}
