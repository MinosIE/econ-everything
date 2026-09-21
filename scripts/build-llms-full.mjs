// ⚙派生：生成 public/llms-full.txt 与 llms-full-en.txt（整站结构化数据的纯文本全文）。
import { SITE, readData, writePub } from './lib.mjs';

const D = {
  concepts: readData('concepts.json'),
  glossary: readData('glossary.json'),
  macro: readData('macro.json'),
  micro: readData('micro.json'),
  money: readData('money.json'),
  thinkers: readData('thinkers.json'),
  schools: readData('schools.json'),
  events: readData('events.json'),
  behavioral: readData('behavioral.json'),
  game: readData('gametheory.json'),
  trade: readData('trade.json'),
  everyday: readData('everyday.json'),
  charts: readData('charts.json'),
  myths: readData('myths.json'),
  quiz: readData('quiz.json'),
  compare: readData('compare.json'),
  sources: readData('sources.json'),
};

const g = (o, k, lang) => (lang === 'en' ? (o?.[k + 'En'] ?? o?.[k]) : o?.[k]);
const pair = (o, k, lang) => {
  const zh = o?.[k];
  if (!Array.isArray(zh)) return [];
  const en = o?.[k + 'En'];
  return zh.map((v, i) => (lang === 'en' ? (Array.isArray(en) ? (en[i] ?? v) : v) : v));
};
const pts = (arr, lang) =>
  (arr || [])
    .map((p) => {
      const k = g(p, 'k', lang);
      const v = g(p, 'v', lang);
      return v ? (k ? `${k}：${v}` : v) : '';
    })
    .filter(Boolean);
const H = (lang, zh, en) => (lang === 'en' ? en : zh);

function sections(lang) {
  const out = [];

  out.push(`## ${H(lang, '核心概念', 'Core Concepts')}`);
  for (const c of D.concepts) {
    out.push(
      '',
      `### ${g(c, 'term', lang)}（${g(c, 'category', lang)}，${H(lang, '难度', 'level')} ${c.level}）`,
      `- ${H(lang, '一句话', 'In one line')}：${g(c, 'oneLiner', lang)}`,
      `- ${H(lang, '详解', 'Details')}：${g(c, 'detail', lang)}`,
      `- ${H(lang, '例子', 'Example')}：${g(c, 'example', lang)}`,
      pair(c, 'watch', lang).length ? `- ${H(lang, '再想一想', 'Worth thinking about')}：${pair(c, 'watch', lang).join('；')}` : '',
    );
  }

  out.push('', `## ${H(lang, '名词词典', 'Glossary')}`);
  for (const t of D.glossary) {
    const abbr = t.abbr ? `（${t.abbr}）` : '';
    out.push(
      `- **${g(t, 'term', lang)}**${abbr}［${g(t, 'category', lang)}］：${g(t, 'def', lang)} ${H(lang, '通俗说', 'Plainly')}：${g(t, 'plain', lang)}`,
    );
  }

  for (const [key, zhName, enName] of [
    ['macro', '宏观经济', 'Macroeconomics'],
    ['micro', '微观经济', 'Microeconomics'],
    ['money', '货币与金融', 'Money & Finance'],
  ]) {
    out.push('', `## ${H(lang, zhName, enName)}`);
    for (const topic of D[key]) {
      out.push(
        '',
        `### ${g(topic, 'title', lang)}（${g(topic, 'category', lang)}）`,
        `- ${H(lang, '概要', 'Summary')}：${g(topic, 'lead', lang)}`,
        ...pts(topic.points, lang).map((p) => `- ${p}`),
        pair(topic, 'watch', lang).length ? `- ${H(lang, '再想一想', 'Worth thinking about')}：${pair(topic, 'watch', lang).join('；')}` : '',
      );
    }
  }

  out.push('', `## ${H(lang, '经济思想家', 'Thinkers')}`);
  for (const t of D.thinkers) {
    out.push(
      '',
      `### ${g(t, 'name', lang)}（${g(t, 'life', lang)}，${g(t, 'school', lang)}，${g(t, 'country', lang)}）`,
      `- ${H(lang, '一句话', 'In one line')}：${g(t, 'oneLiner', lang)}`,
      `- ${H(lang, '简介', 'Profile')}：${g(t, 'bio', lang)}`,
      ...pts(t.ideas, lang).map((p) => `- ${p}`),
      (t.works || []).length
        ? `- ${H(lang, '代表著作', 'Major works')}：${(t.works || []).map((w) => `《${g(w, 'title', lang)}》(${w.year})`).join('；')}`
        : '',
      (t.quotes || []).length ? `- ${H(lang, '名言', 'Quotes')}：${(t.quotes || []).map((q) => `“${g(q, 'q', lang)}”`).join('；')}` : '',
    );
  }

  out.push('', `## ${H(lang, '经济学流派', 'Schools of Thought')}`);
  for (const s of D.schools) {
    out.push(
      '',
      `### ${g(s, 'name', lang)}（${g(s, 'span', lang)}）`,
      `- ${H(lang, '核心主张', 'Core claim')}：${g(s, 'core', lang)}`,
      `- ${H(lang, '代表人物', 'Key figures')}：${pair(s, 'founders', lang).join('、')}`,
      ...pair(s, 'keyIdeas', lang).map((k) => `- ${k}`),
      pair(s, 'strengths', lang).length ? `- ${H(lang, '说服力', 'Why it persuades')}：${pair(s, 'strengths', lang).join('；')}` : '',
      pair(s, 'criticisms', lang).length ? `- ${H(lang, '主要批评', 'Criticisms')}：${pair(s, 'criticisms', lang).join('；')}` : '',
    );
  }

  out.push('', `## ${H(lang, '经济发展史', 'Economic History')}`);
  for (const e of D.events) {
    out.push(
      '',
      `### ${g(e, 'yearLabel', lang)}　${g(e, 'title', lang)}（${g(e, 'place', lang)}）`,
      `- ${H(lang, '发生了什么', 'What happened')}：${g(e, 'what', lang)}`,
      `- ${H(lang, '为什么', 'Why')}：${g(e, 'why', lang)}`,
      `- ${H(lang, '影响', 'Impact')}：${g(e, 'impact', lang)}`,
    );
  }

  out.push('', `## ${H(lang, '行为经济学', 'Behavioral Economics')}`);
  for (const b of D.behavioral) {
    out.push(
      '',
      `### ${g(b, 'name', lang)}（${g(b, 'category', lang)}）`,
      `- ${H(lang, '一句话', 'In one line')}：${g(b, 'oneLiner', lang)}`,
      `- ${H(lang, '详解', 'Details')}：${g(b, 'detail', lang)}`,
      `- ${H(lang, '经典实验', 'Classic experiment')}：${g(b, 'experiment', lang)}`,
      `- ${H(lang, '日常例子', 'Everyday example')}：${g(b, 'everyday', lang)}`,
    );
  }

  out.push('', `## ${H(lang, '博弈论', 'Game Theory')}`);
  for (const x of D.game) {
    out.push(
      '',
      `### ${g(x, 'name', lang)}（${g(x, 'category', lang)}）`,
      `- ${H(lang, '一句话', 'In one line')}：${g(x, 'oneLiner', lang)}`,
      `- ${H(lang, '详解', 'Details')}：${g(x, 'detail', lang)}`,
      `- ${H(lang, '例子', 'Example')}：${g(x, 'example', lang)}`,
      ...pair(x, 'takeaways', lang).map((k) => `- ${k}`),
    );
  }

  out.push('', `## ${H(lang, '国际贸易', 'Trade & Globalization')}`);
  for (const x of D.trade) {
    out.push(
      '',
      `### ${g(x, 'topic', lang)}`,
      `- ${H(lang, '一句话', 'In one line')}：${g(x, 'oneLiner', lang)}`,
      `- ${H(lang, '详解', 'Details')}：${g(x, 'detail', lang)}`,
      `- ${H(lang, '例子', 'Example')}：${g(x, 'example', lang)}`,
      ...pts(x.views, lang).map((p) => `- ${p}`),
    );
  }

  out.push('', `## ${H(lang, '生活中的经济学', 'Everyday Economics')}`);
  for (const x of D.everyday) {
    out.push(
      '',
      `### ${g(x, 'question', lang)}`,
      `- ${H(lang, '经济学解释', 'Economic reading')}：${g(x, 'econ', lang)}`,
      `- ${H(lang, '详解', 'Details')}：${g(x, 'detail', lang)}`,
    );
  }

  out.push('', `## ${H(lang, '数据可视化', 'Data & Charts')}`);
  for (const c of D.charts) {
    out.push(
      `- **${g(c, 'title', lang)}**（${H(lang, '单位', 'unit')}：${g(c, 'unit', lang)}）：${g(c, 'note', lang)}`,
      `  ${H(lang, '数据点', 'Data points')}：${(c.series || []).map((p) => `${p.y}=${p.v}`).join(', ')}`,
    );
  }

  out.push('', `## ${H(lang, '常见误区', 'Myths Busted')}`);
  for (const m of D.myths) {
    out.push(
      '',
      `### ${g(m, 'myth', lang)}`,
      `- ${H(lang, '更准确的说法', 'More accurate version')}：${g(m, 'truth', lang)}`,
      `- ${H(lang, '为什么会搞错', 'Why it is tempting')}：${g(m, 'why', lang)}`,
    );
  }

  out.push('', `## ${H(lang, '小测验', 'Quiz')}`);
  D.quiz.forEach((q, i) => {
    const opts = (q.options || []).map((o, j) => `${String.fromCharCode(65 + j)}. ${g(o, 'k', lang)}`).join(' ');
    out.push(
      `${i + 1}. ${g(q, 'q', lang)} ${opts} —— ${H(lang, '答案', 'Answer')}：${String.fromCharCode(65 + q.answer)}。${g(q, 'explain', lang)}`,
    );
  });

  out.push('', `## ${H(lang, '中外对比', 'Compare')}`);
  for (const c of D.compare) {
    out.push('', `### ${g(c, 'question', lang)}`);
    for (const cs of c.cases || []) out.push(`- ${g(cs, 'who', lang)}：${g(cs, 'how', lang)}`);
    out.push(`- ${H(lang, '小结', 'Takeaway')}：${g(c, 'takeaway', lang)}`);
  }

  out.push('', `## ${H(lang, '参考资料', 'References')}`);
  out.push(...D.sources.map((s) => `- ${g(s, 'label', lang)}（${s.year || ''}）`));

  return out.filter((x) => x !== '' || true).join('\n');
}

function build(lang) {
  const head =
    lang === 'en'
      ? [
          '# Economics of Everything — Full Text',
          '',
          '> Complete plain-text dump of all structured data from a bilingual, ad-free educational site on economics. For LLM ingestion and citation.',
          '',
          `Source: ${SITE}`,
          '',
        ]
      : [
          '# 万物经济学 · Economics of Everything —— 全站文本',
          '',
          '> 本站全部结构化数据的纯文本全文，便于 AI 搜索引擎整站引用。内容为通识性整理，不构成投资建议。',
          '',
          `数据来源：${SITE}`,
          '',
        ];
  return [...head, sections(lang), ''].join('\n');
}

writePub('llms-full.txt', build('zh'));
writePub('llms-full-en.txt', build('en'));
console.log(
  `llms-full.txt / llms-full-en.txt 已生成（概念 ${D.concepts.length} · 术语 ${D.glossary.length} · 专题 ${D.macro.length + D.micro.length + D.money.length} · 思想家 ${D.thinkers.length} · 事件 ${D.events.length} · 图表 ${D.charts.length} · 测验 ${D.quiz.length}）`,
);
