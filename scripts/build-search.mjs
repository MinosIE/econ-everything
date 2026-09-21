// ⚙派生：由全部源数据生成 public/data/search.json（搜索索引）与 related.json（跨模块相关跳转表）。
import { INDEX_SPECS, readData, writeData, writeJsonLine } from './lib.mjs';

const search = [];
const related = new Map();

const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

for (const spec of INDEX_SPECS) {
  const items = readData(spec.file);
  for (const it of items) {
    const n = clean(spec.n(it));
    if (!n) continue;
    const nEn = clean(spec.nEn(it));
    const x = clean([spec.x(it), ...(spec.extra(it) ?? [])].join(' '));
    const xEn = clean([spec.xEn(it), ...(spec.extraEn(it) ?? [])].join(' '));

    search.push({ m: spec.m, id: it.id, t: spec.t, n, x, nEn, xEn });

    // 相关跳转表：同一 id 可能在多个模块出现（如 gdp），保留全部候选
    if (!related.has(it.id)) related.set(it.id, []);
    const bucket = related.get(it.id);
    if (!bucket.some((b) => b.m === spec.m)) bucket.push({ m: spec.m, n, nEn: nEn || n });
  }
}

writeJsonLine('search.json', search);
writeData('related.json', Object.fromEntries(related));

console.log(`search.json ${search.length} 条 · related.json ${related.size} 个 id`);
