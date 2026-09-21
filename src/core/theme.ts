import { need } from './dom';
import { onLangChange, t } from './i18n';

type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function syncLabel(): void {
  const label = document.getElementById('themeLabel');
  const btn = document.getElementById('themeBtn');
  if (!label || !btn) return;
  // 按钮文案描述「点击后会切到」的主题
  const next = currentTheme() === 'light' ? 'dark' : 'light';
  label.textContent = next === 'dark' ? t('themeToDark') : t('themeToLight');
  btn.setAttribute('title', next === 'dark' ? t('themeToDark') : t('themeToLight'));
}

export function initTheme(): void {
  const btn = need('#themeBtn');
  btn.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* 隐私模式下忽略 */
    }
    syncLabel();
  });
  // 系统主题跟随（用户未手动选择时）
  const mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener?.('change', (ev) => {
    try {
      if (localStorage.getItem('theme')) return;
    } catch {
      /* ignore */
    }
    const next: Theme = ev.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    syncLabel();
  });
  onLangChange(syncLabel);
  syncLabel();
}
