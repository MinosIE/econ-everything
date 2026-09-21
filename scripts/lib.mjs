// 构建期共享工具与数据规格（源数据在 public/data，派生文件也写入 public/）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = path.join(ROOT, 'public', 'data');
export const PUB = path.join(ROOT, 'public');
export const SITE = 'https://MinosIE.github.io/econ-everything/';

export const readJSON = (p) => JSON.parse(fs.readFileSync(path.isAbsolute(p) ? p : path.join(ROOT, p), 'utf8'));
export const readData = (file) => readJSON(path.join(DATA_DIR, file));

/** 只在内容变化时写入，避免 CI 里出现无意义的 diff。 */
export function writeIfChanged(absPath, content) {
  const prev = fs.existsSync(absPath) ? fs.readFileSync(absPath, 'utf8') : null;
  if (prev === content) return false;
  fs.writeFileSync(absPath, content);
  return true;
}

export const writeData = (file, obj) => writeIfChanged(path.join(DATA_DIR, file), JSON.stringify(obj, null, 2) + '\n');
export const writeJsonLine = (file, obj) => writeIfChanged(path.join(DATA_DIR, file), JSON.stringify(obj) + '\n');
export const writePub = (file, text) => writeIfChanged(path.join(PUB, file), text);

/** 索引/搜索/相关条目 的数据规格：n=名称，x=补充说明。 */
export const INDEX_SPECS = [
  {
    m: 'm-concepts',
    file: 'concepts.json',
    t: 'search.t.concept',
    n: (it) => it.term,
    nEn: (it) => it.termEn,
    x: (it) => [it.oneLiner, it.category, ...(it.tags || [])].filter(Boolean).join(' '),
    xEn: (it) => [it.oneLinerEn, it.categoryEn, ...(it.tagsEn || [])].filter(Boolean).join(' '),
    extra: (it) => [it.detail, it.example],
    extraEn: (it) => [it.detailEn, it.exampleEn],
  },
  {
    m: 'm-glossary',
    file: 'glossary.json',
    t: 'search.t.term',
    n: (it) => (it.abbr ? `${it.term}（${it.abbr}）` : it.term),
    nEn: (it) => (it.abbr ? `${it.termEn} (${it.abbr})` : it.termEn),
    x: (it) => [it.plain, it.category].filter(Boolean).join(' '),
    xEn: (it) => [it.plainEn, it.categoryEn].filter(Boolean).join(' '),
    extra: (it) => [it.def],
    extraEn: (it) => [it.defEn],
  },
  {
    m: 'm-macro',
    file: 'macro.json',
    t: 'search.t.topic',
    n: (it) => it.title,
    nEn: (it) => it.titleEn,
    x: (it) => [it.lead, it.category].filter(Boolean).join(' '),
    xEn: (it) => [it.leadEn, it.categoryEn].filter(Boolean).join(' '),
    extra: (it) => (it.points || []).map((p) => `${p.k} ${p.v}`),
    extraEn: (it) => (it.points || []).map((p) => `${p.kEn} ${p.vEn}`),
  },
  {
    m: 'm-micro',
    file: 'micro.json',
    t: 'search.t.topic',
    n: (it) => it.title,
    nEn: (it) => it.titleEn,
    x: (it) => [it.lead, it.category].filter(Boolean).join(' '),
    xEn: (it) => [it.leadEn, it.categoryEn].filter(Boolean).join(' '),
    extra: (it) => (it.points || []).map((p) => `${p.k} ${p.v}`),
    extraEn: (it) => (it.points || []).map((p) => `${p.kEn} ${p.vEn}`),
  },
  {
    m: 'm-money',
    file: 'money.json',
    t: 'search.t.topic',
    n: (it) => it.title,
    nEn: (it) => it.titleEn,
    x: (it) => [it.lead, it.category].filter(Boolean).join(' '),
    xEn: (it) => [it.leadEn, it.categoryEn].filter(Boolean).join(' '),
    extra: (it) => (it.points || []).map((p) => `${p.k} ${p.v}`),
    extraEn: (it) => (it.points || []).map((p) => `${p.kEn} ${p.vEn}`),
  },
  {
    m: 'm-thinkers',
    file: 'thinkers.json',
    t: 'search.t.thinker',
    n: (it) => it.name,
    nEn: (it) => it.nameEn,
    x: (it) => [it.oneLiner, it.school, it.country, it.life].filter(Boolean).join(' '),
    xEn: (it) => [it.oneLinerEn, it.schoolEn, it.countryEn, it.lifeEn].filter(Boolean).join(' '),
    extra: (it) => [it.bio, ...(it.ideas || []).map((i) => `${i.k} ${i.v}`)],
    extraEn: (it) => [it.bioEn, ...(it.ideas || []).map((i) => `${i.kEn} ${i.vEn}`)],
  },
  {
    m: 'm-schools',
    file: 'schools.json',
    t: 'search.t.school',
    n: (it) => it.name,
    nEn: (it) => it.nameEn,
    x: (it) => [it.core, it.span, ...(it.founders || [])].filter(Boolean).join(' '),
    xEn: (it) => [it.coreEn, it.spanEn, ...(it.foundersEn || [])].filter(Boolean).join(' '),
    extra: (it) => [...(it.keyIdeas || []), ...(it.strengths || []), ...(it.criticisms || [])],
    extraEn: (it) => [...(it.keyIdeasEn || []), ...(it.strengthsEn || []), ...(it.criticismsEn || [])],
  },
  {
    m: 'm-events',
    file: 'events.json',
    t: 'search.t.event',
    n: (it) => it.title,
    nEn: (it) => it.titleEn,
    x: (it) => [it.yearLabel, it.place, it.what].filter(Boolean).join(' '),
    xEn: (it) => [it.yearLabelEn, it.placeEn, it.whatEn].filter(Boolean).join(' '),
    extra: (it) => [it.why, it.impact],
    extraEn: (it) => [it.whyEn, it.impactEn],
  },
  {
    m: 'm-behavioral',
    file: 'behavioral.json',
    t: 'search.t.behavior',
    n: (it) => it.name,
    nEn: (it) => it.nameEn,
    x: (it) => [it.oneLiner, it.category].filter(Boolean).join(' '),
    xEn: (it) => [it.oneLinerEn, it.categoryEn].filter(Boolean).join(' '),
    extra: (it) => [it.detail, it.experiment, it.everyday],
    extraEn: (it) => [it.detailEn, it.experimentEn, it.everydayEn],
  },
  {
    m: 'm-game',
    file: 'gametheory.json',
    t: 'search.t.game',
    n: (it) => it.name,
    nEn: (it) => it.nameEn,
    x: (it) => [it.oneLiner, it.category].filter(Boolean).join(' '),
    xEn: (it) => [it.oneLinerEn, it.categoryEn].filter(Boolean).join(' '),
    extra: (it) => [it.detail, it.example],
    extraEn: (it) => [it.detailEn, it.exampleEn],
  },
  {
    m: 'm-trade',
    file: 'trade.json',
    t: 'search.t.trade',
    n: (it) => it.topic,
    nEn: (it) => it.topicEn,
    x: (it) => [it.oneLiner].filter(Boolean).join(' '),
    xEn: (it) => [it.oneLinerEn].filter(Boolean).join(' '),
    extra: (it) => [it.detail, it.example, ...(it.views || []).map((v) => `${v.k} ${v.v}`)],
    extraEn: (it) => [it.detailEn, it.exampleEn, ...(it.views || []).map((v) => `${v.kEn} ${v.vEn}`)],
  },
  {
    m: 'm-everyday',
    file: 'everyday.json',
    t: 'search.t.everyday',
    n: (it) => it.question,
    nEn: (it) => it.questionEn,
    x: (it) => [it.econ].filter(Boolean).join(' '),
    xEn: (it) => [it.econEn].filter(Boolean).join(' '),
    extra: (it) => [it.detail],
    extraEn: (it) => [it.detailEn],
  },
  {
    m: 'm-charts',
    file: 'charts.json',
    t: 'search.t.chart',
    n: (it) => it.title,
    nEn: (it) => it.titleEn,
    x: (it) => [it.unit, it.note].filter(Boolean).join(' '),
    xEn: (it) => [it.unitEn, it.noteEn].filter(Boolean).join(' '),
    extra: () => [],
    extraEn: () => [],
  },
  {
    m: 'm-myths',
    file: 'myths.json',
    t: 'search.t.myth',
    n: (it) => it.myth,
    nEn: (it) => it.mythEn,
    x: (it) => [it.truth].filter(Boolean).join(' '),
    xEn: (it) => [it.truthEn].filter(Boolean).join(' '),
    extra: (it) => [it.why],
    extraEn: (it) => [it.whyEn],
  },
  {
    m: 'm-quiz',
    file: 'quiz.json',
    t: 'search.t.topic',
    n: (it) => it.q,
    nEn: (it) => it.qEn,
    x: (it) => [it.category, it.explain].filter(Boolean).join(' '),
    xEn: (it) => [it.categoryEn, it.explainEn].filter(Boolean).join(' '),
    extra: () => [],
    extraEn: () => [],
  },
  {
    m: 'm-compare',
    file: 'compare.json',
    t: 'search.t.compare',
    n: (it) => it.question,
    nEn: (it) => it.questionEn,
    x: (it) => [it.takeaway].filter(Boolean).join(' '),
    xEn: (it) => [it.takeawayEn].filter(Boolean).join(' '),
    extra: (it) => (it.cases || []).map((c) => `${c.who} ${c.how}`),
    extraEn: (it) => (it.cases || []).map((c) => `${c.whoEn} ${c.howEn}`),
  },
];

/** 双语校验规格：plain=同级字段对；nested=子对象字段对；parallel=并行数组。 */
export const I18N_SPECS = {
  'concepts.json': {
    plain: ['term', 'category', 'oneLiner', 'detail', 'example'],
    parallel: [{ zh: 'tags', en: 'tagsEn' }],
  },
  'glossary.json': { plain: ['term', 'category', 'def', 'plain'] },
  'macro.json': {
    plain: ['title', 'category', 'lead'],
    nested: [{ key: 'points', fields: ['k', 'v'] }],
    parallel: [{ zh: 'watch', en: 'watchEn' }],
  },
  'micro.json': {
    plain: ['title', 'category', 'lead'],
    nested: [{ key: 'points', fields: ['k', 'v'] }],
    parallel: [{ zh: 'watch', en: 'watchEn' }],
  },
  'money.json': {
    plain: ['title', 'category', 'lead'],
    nested: [{ key: 'points', fields: ['k', 'v'] }],
    parallel: [{ zh: 'watch', en: 'watchEn' }],
  },
  'thinkers.json': {
    plain: ['name', 'life', 'country', 'school', 'oneLiner', 'bio'],
    nested: [{ key: 'ideas', fields: ['k', 'v'] }, { key: 'works', fields: ['title'] }, { key: 'quotes', fields: ['q'] }],
  },
  'schools.json': {
    plain: ['name', 'span', 'core'],
    parallel: [
      { zh: 'founders', en: 'foundersEn' },
      { zh: 'keyIdeas', en: 'keyIdeasEn' },
      { zh: 'strengths', en: 'strengthsEn' },
      { zh: 'criticisms', en: 'criticismsEn' },
    ],
  },
  'events.json': { plain: ['yearLabel', 'title', 'place', 'what', 'why', 'impact'] },
  'behavioral.json': { plain: ['name', 'category', 'oneLiner', 'detail', 'experiment', 'everyday'] },
  'gametheory.json': {
    plain: ['name', 'category', 'oneLiner', 'detail', 'example'],
    parallel: [{ zh: 'takeaways', en: 'takeawaysEn' }],
  },
  'trade.json': {
    plain: ['topic', 'oneLiner', 'detail', 'example'],
    nested: [{ key: 'views', fields: ['k', 'v'] }],
  },
  'everyday.json': { plain: ['question', 'econ', 'detail', 'conceptLabel'] },
  'charts.json': { plain: ['title', 'unit', 'note'] },
  'myths.json': { plain: ['myth', 'truth', 'why'] },
  'quiz.json': { plain: ['category', 'q', 'explain'], nested: [{ key: 'options', fields: ['k'] }] },
  'compare.json': { plain: ['question', 'takeaway'], nested: [{ key: 'cases', fields: ['who', 'how'] }] },
  'sources.json': { plain: ['label', 'type'] },
};

/** 供 llms / sitemap 使用的数据文件清单。 */
export const DATA_FILES = [
  'overview',
  'concepts',
  'glossary',
  'macro',
  'micro',
  'money',
  'thinkers',
  'schools',
  'events',
  'behavioral',
  'gametheory',
  'trade',
  'everyday',
  'charts',
  'myths',
  'quiz',
  'compare',
  'sources',
  'search',
  'related',
];

export const MODULE_LABELS = [
  ['m-concepts', '核心概念', 'Core Concepts'],
  ['m-glossary', '名词词典', 'Glossary'],
  ['m-macro', '宏观经济', 'Macroeconomics'],
  ['m-micro', '微观经济', 'Microeconomics'],
  ['m-money', '货币与金融', 'Money & Finance'],
  ['m-thinkers', '经济思想家', 'Thinkers'],
  ['m-schools', '经济学流派', 'Schools of Thought'],
  ['m-events', '经济发展史', 'Economic History'],
  ['m-behavioral', '行为经济学', 'Behavioral Economics'],
  ['m-game', '博弈论', 'Game Theory'],
  ['m-trade', '国际贸易', 'Trade & Globalization'],
  ['m-everyday', '生活中的经济学', 'Everyday Economics'],
  ['m-charts', '数据可视化', 'Data & Charts'],
  ['m-myths', '常见误区', 'Myths Busted'],
  ['m-quiz', '小测验', 'Quiz'],
  ['m-compare', '中外对比', 'Compare'],
];
