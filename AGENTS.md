# AGENTS.md — 万物经济学（econ-everything）

供 AI Agent（与未来的自己）快速理解本工程、在不破坏既有约定的前提下改动代码/数据。

## 这是什么

一个**纯静态**经济学通识科普站，用原生 DOM + 字符串模板渲染，零运行时框架。数据全部是 `public/data/*.json`，前端只读取 JSON，不注入业务逻辑。技术栈 Vite + TypeScript，按模块代码分割。

姊妹项目 [`chinese-dynasty-timeline`](https://MinosIE.github.io/chinese-dynasty-timeline/) 是同一工程范式（无框架静态站 + GEO 派生文件），可对照参考。

## 核心约定（务必遵守）

1. **数据驱动 / 无后端**：所有展示内容来自 `public/data/*.json`。不要在前端硬写内容文案。新增/修改内容 = 改 JSON。
2. **中英双语成对**：每个展示字段都成对出现 —— 中文原文（如 `term`）与其英译（`termEn`）。新增任何带 `*En` 对应物的字段，必须同时补上 `*En`，否则 `scripts/check-i18n.mjs` 会报错。**界面词表**在 `src/core/i18n.ts` 的 `zh` / `en` 两个对象里，键必须完全对齐。
3. **派生文件由脚本生成，不要手改**：`overview.json` / `search.json` / `related.json` / `llms*.txt` / `robots.txt` / `sitemap.xml` 均由 `scripts/` 生成。改动数据后跑 `npm run gen`。
4. **防 LLM 误读**：数据里关键数字要给 `sources`（label/year，尽量带 `url`），有争议的话题（如最低工资、贸易、医疗筹资）并列多方观点，不站队、不预测、不产生投资建议。
5. **XSS 安全**：所有外部数据都经过 `src/core/dom.ts` 的 `esc()` 转义后才进 `innerHTML`。新增渲染代码时，**绝不要**把未经 `esc()` 的字段直接拼进模板。
6. **跨模块相关跳转**用 `related` 字段（id 列表）指向任意模块条目，由 `src/core/related.ts` 通过生成的 `related.json` 解析，支持跨模块跳转。id 必须真实存在（`check-i18n` 会警告悬空引用）。

## 目录速查

- `public/data/`：人工维护的源数据（16 个内容文件 + 3 个脚本生成的派生文件）。
- `scripts/`：`build-all` / `build-overview` / `build-search` / `build-geo` / `build-llms-full` / `check-i18n`（Node ESM，读取 `scripts/lib.mjs` 的规格配置）。
- `src/core/`：`i18n` `theme` `data` `dom` `app` `detail` `search` `related` `ui` `types`。
- `src/modules/`：16 个内容模块 + `shared.ts`（卡片网格/详情/相关按钮的通用渲染器）+ `types.ts`（各模块的 TS 接口）。
- `src/styles/`：设计令牌 `tokens.css`、基础 `base.css`、组件 `components.css`、入口 `index.css`（深青 `#0E7490` + 琥珀金 `#C79A3A`，含深/浅色主题）。
- `index.html`：SPA 骨架，包含导航 `#modNav`、首页 `#homeGrid`、每个模块的 `<section class="module" id="m-xxx">` 及内部 host 节点（如 `#conceptsGrid`）、详情面板 `#detailRoot`、搜索 `#search`/`#searchResults`、页脚 `#foot`。

## 新增一个内容模块的标准流程

1. 在 `public/data/` 新增 `xxx.json`（字段遵循既有模块结构 + 双语成对 + `id` 唯一）。
2. 在 `src/modules/` 写 `xxx.ts`，复用 `shared.ts` 的 `mountGrid`（卡片网格）或自定义渲染；如需详情面板用 `openDetail(detail(payload))`。
3. 在 `index.html` 的 `#content` 内加 `<section id="m-xxx">`（含 `mod-head` 标题、可选 `#xxxFilters` 筛选条、`#xxxGrid` 容器）。
4. 在 `src/modules/index.ts` 注册 `{ id:'m-xxx', key:'xxx', file:'xxx.json', icon, load: () => import('./xxx') }`。
5. 在 `src/core/i18n.ts` 补 `nav.xxx` / `entry.xxx` / `xxx.title` / `xxx.sub` 的中英双语。
6. 在 `scripts/lib.mjs` 的 `INDEX_SPECS`、`I18N_SPECS`、`MODULE_LABELS`、`DATA_FILES` 中登记（search/sitemap/双语校验需要）。
7. `npm run gen` → `npm run build` → 本地预览验证。

## 校验 / 构建

- `npm run gen`：生成全部派生文件并做双语校验。提交前必跑。
- `npm run build`：生产构建到 `dist/`（base 已设为 `/econ-everything/`）。
- `npx tsc --noEmit`：类型检查。
- 本地预览：`npm run build` 后用任意静态服务器以 **子路径 `/econ-everything/`** 提供 `dist/`（如 `python3 -m http.server --directory /tmp/ghpages` 且 `dist` 位于 `/tmp/ghpages/econ-everything/`）。

## 已验证

- 16 个模块全部渲染；首页 KPI/入口/参考文献/JSON-LD 正常。
- 搜索跨模块命中并跳转；详情面板含相关条目与来源；中英切换全局生效。
- `tsc --noEmit` 通过；生产构建在 GitHub Pages 路径下零 console 报错。
- `npm run gen` 双语校验全绿（17 个数据文件、185 条目、zh/en 键对齐）。
