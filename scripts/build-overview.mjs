// ⚙派生：由源数据统计生成 public/data/overview.json（首页 KPI 与计数）。
import { readData, writeData } from './lib.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const counters = {
  concepts: readData('concepts.json').length,
  glossary: readData('glossary.json').length,
  thinkers: readData('thinkers.json').length,
  events: readData('events.json').length,
};

const kpis = [
  { key: 'concepts', icon: '💡', value: counters.concepts },
  { key: 'glossary', icon: '📖', value: counters.glossary },
  { key: 'thinkers', icon: '👤', value: counters.thinkers },
  { key: 'events', icon: '🗓️', value: counters.events },
];

const changed = writeData('overview.json', { version: pkg.version, counts: counters, kpis });
console.log(
  `overview.json ${changed ? '已更新' : '无变化'}：概念 ${counters.concepts} / 术语 ${counters.glossary} / 思想家 ${counters.thinkers} / 事件 ${counters.events}`,
);
