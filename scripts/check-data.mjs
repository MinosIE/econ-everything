// 数据层结构校验（与 check-i18n 的双语校验互补，规则全部可机判）：
//   1) id 存在、kebab-case、文件内唯一 → 失败；跨文件重复 → 警告（related 解析会有歧义）
//   2) 各文件的命名/描述必备字段非空、level ∈ {1,2,3}、related 为字符串数组 → 失败
//   3) sources 规范：要求来源的文件必须非空，元素含非空 label，year（如有）为合理年份 → 失败
//   4) 模块专项：quiz 选项与答案下标、charts 的 {y,v} 数据点、compare 的 cases 对照 → 失败
import { INDEX_SPECS, readData } from "./lib.mjs";

const errors = [];
const warnings = [];

const isStr = (v) => typeof v === "string" && v.trim() !== "";
const ID_RE = /^[a-z][a-z0-9-]*$/;

/**
 * 每个内容文件的规格：
 *  name/desc = 必备非空字段（标题类 / 一句话说明类）
 *  level     = 是否要求难度分级（glossary 无 level）
 *  sources   = 是否强制要求来源（glossary/quiz 暂不强制：术语释义随概念/专题条目引用）
 */
const SPECS = {
  "concepts.json": {
    name: "term",
    desc: "oneLiner",
    level: true,
    sources: true,
  },
  "glossary.json": { name: "term", desc: "def", level: false, sources: false },
  "macro.json": { name: "title", desc: "lead", level: true, sources: true },
  "micro.json": { name: "title", desc: "lead", level: true, sources: true },
  "money.json": { name: "title", desc: "lead", level: true, sources: true },
  "thinkers.json": {
    name: "name",
    desc: "oneLiner",
    level: true,
    sources: true,
  },
  "schools.json": { name: "name", desc: "core", level: true, sources: true },
  "events.json": { name: "title", desc: "what", level: true, sources: true },
  "behavioral.json": {
    name: "name",
    desc: "oneLiner",
    level: true,
    sources: true,
  },
  "gametheory.json": {
    name: "name",
    desc: "oneLiner",
    level: true,
    sources: true,
  },
  "trade.json": { name: "topic", desc: "oneLiner", level: true, sources: true },
  "everyday.json": {
    name: "question",
    desc: "econ",
    level: true,
    sources: true,
  },
  "charts.json": { name: "title", desc: "note", level: true, sources: true },
  "myths.json": { name: "myth", desc: "truth", level: true, sources: true },
  "quiz.json": { name: "q", desc: "explain", level: true, sources: false },
  "compare.json": {
    name: "question",
    desc: "takeaway",
    level: true,
    sources: true,
  },
};

/** 模块专项校验。 */
const EXTRA = {
  "quiz.json": (at, it) => {
    if (!Array.isArray(it.options) || it.options.length < 2) {
      errors.push(`${at} :: options 至少需要 2 个选项`);
    } else {
      it.options.forEach((o, i) => {
        if (!isStr(o?.k)) errors.push(`${at} :: options[${i}] 缺少非空 k`);
      });
      if (
        !Number.isInteger(it.answer) ||
        it.answer < 0 ||
        it.answer >= it.options.length
      ) {
        errors.push(
          `${at} :: answer=${JSON.stringify(it.answer)} 不是 [0, ${it.options.length}) 内的整数下标`,
        );
      }
    }
  },
  "charts.json": (at, it) => {
    if (!Array.isArray(it.series) || it.series.length === 0) {
      errors.push(`${at} :: series 必须是非空数据点数组`);
      return;
    }
    it.series.forEach((p, i) => {
      if (!Number.isInteger(p?.y) || p.y < 1000 || p.y > 2100)
        errors.push(
          `${at} :: series[${i}].y 年份非法：${JSON.stringify(p?.y)}`,
        );
      if (typeof p?.v !== "number" || !Number.isFinite(p.v))
        errors.push(
          `${at} :: series[${i}].v 不是有限数值：${JSON.stringify(p?.v)}`,
        );
    });
    let prev = -Infinity;
    for (const p of it.series) {
      if (p.y < prev)
        errors.push(
          `${at} :: series 年份未按升序排列（${p.y} 出现在 ${prev} 之后）`,
        );
      prev = p.y;
    }
  },
  "compare.json": (at, it) => {
    if (!Array.isArray(it.cases) || it.cases.length < 2) {
      errors.push(`${at} :: cases 至少需要 2 个对照案例`);
    } else {
      it.cases.forEach((c, i) => {
        if (!isStr(c?.who) || !isStr(c?.how))
          errors.push(`${at} :: cases[${i}] 缺少非空 who/how`);
      });
    }
  },
  "events.json": (at, it) => {
    if (!Number.isInteger(it.y) || it.y < 0 || it.y > 2100)
      errors.push(`${at} :: y 年份非法：${JSON.stringify(it.y)}`);
  },
};

const seenIds = new Map(); // id -> 首次出现的文件（用于跨文件重复警告）

for (const { file } of INDEX_SPECS) {
  const spec = SPECS[file];
  let items;
  try {
    items = readData(file);
  } catch (e) {
    errors.push(`[${file}] 读取失败：${e.message}`);
    continue;
  }
  if (!Array.isArray(items)) {
    errors.push(`[${file}] 顶层必须是数组`);
    continue;
  }

  const fileIds = new Set();
  items.forEach((it, i) => {
    const at = `${file} :: ${it?.id || `#${i}`}`;

    // 1) id
    if (!isStr(it?.id)) {
      errors.push(`${at} :: 缺少非空字符串 id`);
    } else {
      if (!ID_RE.test(it.id))
        errors.push(`${at} :: id 不是 kebab-case（^[a-z][a-z0-9-]*$）`);
      if (fileIds.has(it.id)) errors.push(`${at} :: id 在文件内重复`);
      fileIds.add(it.id);
      if (seenIds.has(it.id))
        warnings.push(
          `${at} :: id 与 ${seenIds.get(it.id)} 跨文件重复，related 引用解析会有歧义`,
        );
      else seenIds.set(it.id, file);
    }

    // 2) 必备字段 / level / related
    for (const f of ["name", "desc"]) {
      if (!isStr(it?.[spec[f]]))
        errors.push(`${at} :: 必备字段 ${spec[f]} 缺失或为空`);
    }
    if (spec.level && ![1, 2, 3].includes(it?.level)) {
      errors.push(`${at} :: level=${JSON.stringify(it?.level)} 必须为 1|2|3`);
    }
    if (it?.related !== undefined) {
      if (!Array.isArray(it.related) || it.related.some((r) => !isStr(r))) {
        errors.push(`${at} :: related 必须是非空字符串数组`);
      }
    }

    // 3) sources
    if (spec.sources) {
      if (!Array.isArray(it?.sources) || it.sources.length === 0) {
        errors.push(`${at} :: sources 必须非空（关键结论需标注来源）`);
      } else {
        it.sources.forEach((s, j) => {
          if (!isStr(s?.label))
            errors.push(`${at} :: sources[${j}] 缺少非空 label`);
          if (
            s?.year !== undefined &&
            (typeof s.year !== "number" || s.year < 1500 || s.year > 2100)
          ) {
            errors.push(
              `${at} :: sources[${j}].year 非法：${JSON.stringify(s.year)}`,
            );
          }
        });
      }
    } else if (it?.sources !== undefined && !Array.isArray(it.sources)) {
      errors.push(`${at} :: sources 如存在必须是数组`);
    }

    // 4) 专项
    EXTRA[file]?.(at, it);
  });
}

/* ---------- 输出 ---------- */
if (warnings.length) {
  console.warn(`⚠ check-data：${warnings.length} 条警告（不阻断）：`);
  for (const w of warnings) console.warn("  - " + w);
}

if (errors.length) {
  console.error(`✗ check-data：发现 ${errors.length} 处结构问题：`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

const total = Object.keys(SPECS).reduce((n, f) => n + readData(f).length, 0);
console.log(
  `✓ 数据结构校验通过：${Object.keys(SPECS).length} 个内容文件、${total} 个条目`,
);
