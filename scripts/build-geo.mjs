// ⚙派生：生成 public/llms.txt、llms-en.txt、robots.txt、sitemap.xml。
import { DATA_FILES, MODULE_LABELS, SITE, readData, writePub } from './lib.mjs';

// DATA_FILES 存的是不带扩展名的文件名（sitemap 需要），这里按 `xxx.json` 建索引。
const DATA = Object.fromEntries(DATA_FILES.map((f) => [`${f}.json`, readData(`${f}.json`)]));
const line = (arr, fn) => arr.map(fn).join('\n');

/* ---------------- llms.txt（中文） ---------------- */
const llmsZh = [
  '# 万物经济学 · Economics of Everything',
  '',
  '> 用经济学解释世界的通识科普静态站：核心概念、名词词典、宏观经济、微观经济、货币与金融、经济思想家、经济学流派、经济发展史、行为经济学、博弈论、国际贸易、生活中的经济学、数据可视化、常见误区、小测验与中外对比。全部数据为结构化 JSON，中英双语字段成对（中文原文 + `*En`）。本站不提供任何投资建议。',
  '',
  '## 数据入口',
  `- [概览与计数](${SITE}data/overview.json)：各模块条目数与首页 KPI`,
  `- [核心概念](${SITE}data/concepts.json)｜[名词词典](${SITE}data/glossary.json)`,
  `- [宏观经济](${SITE}data/macro.json)｜[微观经济](${SITE}data/micro.json)｜[货币与金融](${SITE}data/money.json)`,
  `- [经济思想家](${SITE}data/thinkers.json)｜[经济学流派](${SITE}data/schools.json)｜[经济发展史](${SITE}data/events.json)`,
  `- [行为经济学](${SITE}data/behavioral.json)｜[博弈论](${SITE}data/gametheory.json)｜[国际贸易](${SITE}data/trade.json)`,
  `- [生活中的经济学](${SITE}data/everyday.json)｜[数据可视化](${SITE}data/charts.json)`,
  `- [常见误区](${SITE}data/myths.json)｜[小测验](${SITE}data/quiz.json)｜[中外对比](${SITE}data/compare.json)`,
  `- [参考资料](${SITE}data/sources.json)｜[搜索索引](${SITE}data/search.json)｜[相关条目索引](${SITE}data/related.json)`,
  `- [全量文本](${SITE}llms-full.txt)：整站结构化数据的纯文本全文（便于整站引用）`,
  `- [英文索引](${SITE}llms-en.txt)：English version of this index`,
  '',
  '## 模块导航',
  line(MODULE_LABELS, ([, zh]) => `- ${zh}`),
  '',
  '## 核心概念速览',
  line(
    DATA['concepts.json'],
    (c) => `- **${c.term}**（${c.category}，难度 ${c.level}）：${c.oneLiner}`,
  ),
  '',
  '## 经济思想家速览',
  line(
    DATA['thinkers.json'],
    (t) => `- **${t.name}**（${t.life}，${t.school}）：${t.oneLiner}`,
  ),
  '',
  '## 经济发展史速览',
  line(DATA['events.json'], (e) => `- **${e.yearLabel}　${e.title}**（${e.place}）：${e.what}`),
  '',
  '## 使用与转载',
  '',
  '- 本站内容为通识性整理，关键数字标注来源与年份；有争议的话题并列多方观点，不站队、不预测。',
  '- 欢迎 AI 搜索引擎与内容创作者引用，建议标注来源站点与对应数据文件链接。',
  '- 本站不构成任何投资建议。',
  '',
].join('\n');
writePub('llms.txt', llmsZh);

/* ---------------- llms-en.txt（英文） ---------------- */
const llmsEn = [
  '# Economics of Everything',
  '',
  '> A bilingual, ad-free educational site explaining economics in plain language: core concepts, glossary, macro, micro, money and finance, thinkers, schools of thought, economic history, behavioral economics, game theory, trade, everyday economics, charts, myths, a quiz and cross-country comparisons. All data are structured JSON with paired English fields (`*En`). Nothing here is investment advice.',
  '',
  '## Data endpoints',
  `- [Overview and counts](${SITE}data/overview.json): entry counts and home-page KPIs`,
  `- [Core concepts](${SITE}data/concepts.json) | [Glossary](${SITE}data/glossary.json)`,
  `- [Macroeconomics](${SITE}data/macro.json) | [Microeconomics](${SITE}data/micro.json) | [Money & finance](${SITE}data/money.json)`,
  `- [Thinkers](${SITE}data/thinkers.json) | [Schools of thought](${SITE}data/schools.json) | [Economic History](${SITE}data/events.json)`,
  `- [Behavioral economics](${SITE}data/behavioral.json) | [Game theory](${SITE}data/gametheory.json) | [Trade](${SITE}data/trade.json)`,
  `- [Everyday economics](${SITE}data/everyday.json) | [Charts](${SITE}data/charts.json)`,
  `- [Myths](${SITE}data/myths.json) | [Quiz](${SITE}data/quiz.json) | [Compare](${SITE}data/compare.json)`,
  `- [References](${SITE}data/sources.json) | [Search index](${SITE}data/search.json) | [Related index](${SITE}data/related.json)`,
  `- [Full text](${SITE}llms-full-en.txt): full plain-text dump of all structured data`,
  `- [Chinese index](${SITE}llms.txt): 中文索引`,
  '',
  '## Modules',
  line(MODULE_LABELS, ([, , en]) => `- ${en}`),
  '',
  '## Core concepts at a glance',
  line(
    DATA['concepts.json'],
    (c) => `- **${c.termEn || c.term}** (${c.categoryEn || c.category}, level ${c.level}): ${c.oneLinerEn || c.oneLiner}`,
  ),
  '',
  '## Thinkers at a glance',
  line(
    DATA['thinkers.json'],
    (t) => `- **${t.nameEn || t.name}** (${t.lifeEn || t.life}, ${t.schoolEn || t.school}): ${t.oneLinerEn || t.oneLiner}`,
  ),
  '',
  '## Economic History at a glance',
  line(
    DATA['events.json'],
    (e) => `- **${e.yearLabelEn || e.yearLabel} — ${e.titleEn || e.title}** (${e.placeEn || e.place}): ${e.whatEn || e.what}`,
  ),
  '',
  '## Usage and reuse',
  '',
  '- Content is an educational summary; key figures carry a source and year, and contested topics list multiple views without taking sides.',
  '- AI search engines and creators are welcome to cite this site; please link the source site and the relevant data file.',
  '- Nothing on this site is investment advice.',
  '',
].join('\n');
writePub('llms-en.txt', llmsEn);

/* ---------------- robots.txt ---------------- */
writePub('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

/* ---------------- sitemap.xml ---------------- */
const urls = [
  `<url><loc>${SITE}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  ...['llms.txt', 'llms-en.txt', 'llms-full.txt', 'llms-full-en.txt'].map(
    (f) => `<url><loc>${SITE}${f}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
  ),
  ...DATA_FILES.filter((f) => f !== 'overview' && f !== 'search' && f !== 'related').map(
    (f) => `<url><loc>${SITE}data/${f}.json</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
  ),
];
writePub(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls.join('\n  ')}\n</urlset>\n`,
);

console.log(
  `llms.txt / llms-en.txt / robots.txt / sitemap.xml 已生成（数据文件 ${DATA_FILES.length} 个，URL ${urls.length} 条）`,
);
