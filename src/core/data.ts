/** 数据加载层：统一走 Vite 的 BASE_URL，带内存缓存，失败降级为 reject。 */

const cache = new Map<string, unknown>();

export function dataUrl(file: string): string {
  return `${import.meta.env.BASE_URL}data/${file}`;
}

export async function fetchData<T>(file: string): Promise<T> {
  if (cache.has(file)) return cache.get(file) as T;
  const res = await fetch(dataUrl(file), { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`加载 data/${file} 失败：HTTP ${res.status}`);
  const json = (await res.json()) as T;
  cache.set(file, json);
  return json;
}

/** 已缓存则同步返回，避免二次渲染时的请求抖动。 */
export function peekData<T>(file: string): T | undefined {
  return cache.get(file) as T | undefined;
}
