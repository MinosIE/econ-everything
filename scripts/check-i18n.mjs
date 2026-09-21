// 校验双语完整性与数据一致性：
//   1) 数据字段缺失 *En  → 失败（退出码 1）
//   2) 界面词表 I18N 的 zh / en 键不一致 → 失败
//   3) related 引用了不存在的 id → 警告（不阻断）
import path from "node:path";
import { I18N_SPECS, INDEX_SPECS, ROOT, readData, readJSON } from "./lib.mjs";

const missing = [];
const warnings = [];

const isEmpty = (v) =>
  v == null || v === "" || (Array.isArray(v) && v.length === 0);

/* ---------- 1. 数据字段 ---------- */
for (const [file, spec] of Object.entries(I18N_SPECS)) {
  let items;
  try {
    items = readData(file);
  } catch (e) {
    missing.push(`[${file}] 读取失败：${e.message}`);
    continue;
  }

  items.forEach((item, i) => {
    const at = `${file} :: ${item.id || `#${i}`}`;
    for (const f of spec.plain || []) {
      if (!isEmpty(item[f]) && isEmpty(item[f + "En"]))
        missing.push(`${at} :: 缺少 ${f}En（原文：${item[f]}）`);
    }
    for (const nest of spec.nested || []) {
      const arr = item[nest.key];
      if (!Array.isArray(arr)) continue;
      arr.forEach((sub, j) => {
        for (const f of nest.fields) {
          if (!isEmpty(sub?.[f]) && isEmpty(sub?.[f + "En"])) {
            missing.push(`${at} :: ${nest.key}[${j}] 缺少 ${f}En`);
          }
        }
      });
    }
    for (const p of spec.parallel || []) {
      const zh = item[p.zh];
      if (isEmpty(zh)) continue;
      const en = item[p.en];
      if (isEmpty(en))
        missing.push(`${at} :: 缺少 ${p.en}（${p.zh} 有 ${zh.length} 项）`);
      else if (en.length !== zh.length) {
        missing.push(
          `${at} :: ${p.en} 长度 ${en.length} ≠ ${p.zh} 长度 ${zh.length}`,
        );
      }
    }
  });
}

/* ---------- 2. 界面词表（src/core/i18n.json，直接 JSON 解析，不再正则扫源码） ---------- */
try {
  const wb = readJSON(path.join(ROOT, "src", "core", "i18n.json"));
  if (!wb.zh || !wb.en) {
    missing.push("i18n.json :: 缺少 zh / en 词表对象");
  } else {
    const zhKeys = new Set(Object.keys(wb.zh));
    const enKeys = new Set(Object.keys(wb.en));
    for (const k of zhKeys)
      if (!enKeys.has(k)) missing.push(`i18n.json :: en 缺少键 ${k}`);
    for (const k of enKeys)
      if (!zhKeys.has(k)) missing.push(`i18n.json :: zh 缺少键 ${k}`);
    if (!zhKeys.size || !enKeys.size)
      missing.push("i18n.json :: 词表为空，请检查内容");
  }
} catch (e) {
  missing.push(`i18n.json :: 读取失败：${e.message}`);
}

/* ---------- 3. related / concept 引用可解析性（警告） ---------- */
const idToModules = new Map();
for (const spec of INDEX_SPECS) {
  for (const it of readData(spec.file)) {
    if (!idToModules.has(it.id)) idToModules.set(it.id, []);
    const list = idToModules.get(it.id);
    if (!list.includes(spec.m)) list.push(spec.m);
  }
}
for (const spec of INDEX_SPECS) {
  for (const it of readData(spec.file)) {
    for (const ref of it.related || []) {
      if (!idToModules.has(ref))
        warnings.push(
          `[${spec.file}] ${it.id} 的 related 引用了不存在的 id：${ref}`,
        );
    }
    if (it.concept && !idToModules.has(it.concept)) {
      warnings.push(
        `[${spec.file}] ${it.id} 的 concept 引用了不存在的 id：${it.concept}`,
      );
    }
  }
}

/* ---------- 输出 ---------- */
if (warnings.length) {
  console.warn(`⚠ ${warnings.length} 条警告（不阻断）：`);
  for (const w of warnings) console.warn("  - " + w);
}

if (missing.length) {
  console.error(`✗ 发现 ${missing.length} 处问题：`);
  for (const m of missing) console.error("  - " + m);
  process.exit(1);
}

const total = Object.entries(I18N_SPECS).reduce(
  (n, [file]) => n + readData(file).length,
  0,
);
console.log(
  `✓ 双语与词表校验通过：${Object.keys(I18N_SPECS).length} 个数据文件、${total} 个条目、词表 zh/en 键一致`,
);
