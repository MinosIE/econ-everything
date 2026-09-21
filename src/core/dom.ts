/** 极简 DOM 工具：只做「取节点 / 建节点 / 转义」三件事。 */

export function qs<T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(sel);
}

export function need<T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T {
  const node = root.querySelector<T>(sel);
  if (!node) throw new Error(`[econ] 缺少必要节点: ${sel}`);
  return node;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  html?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

export function clear(node: HTMLElement): void {
  node.textContent = '';
}

/** 转义 HTML 文本（内容来自本地 JSON，仍统一转义以防注入）。 */
export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function fragment(html: string): DocumentFragment {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content;
}

export function on<K extends keyof HTMLElementEventMap>(
  node: EventTarget | null,
  type: K | string,
  handler: (ev: Event) => void,
): void {
  node?.addEventListener(type, handler as EventListener);
}

/** 把键盘 Enter / Space 也视为点击（卡片可访问性）。 */
export function clickable(node: HTMLElement, handler: () => void): void {
  node.setAttribute('tabindex', '0');
  node.setAttribute('role', 'button');
  node.addEventListener('click', handler);
  node.addEventListener('keydown', (ev) => {
    const e = ev as KeyboardEvent;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  });
}
