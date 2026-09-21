# 万物经济学 · Economics of Everything

用经济学解释世界的通识科普静态站。把「万物」拆成看得懂的常识：核心概念、名词词典、宏观、微观、货币与金融、经济思想家、经济学流派、经济发展史、行为经济学、博弈论、国际贸易、生活中的经济学、数据可视化、常见误区、小测验与中外对比。

- **纯静态**：数据全部是 `public/data/*.json`，前端只读 JSON，无后端、无构建期注入业务逻辑。
- **中英双语**：每个展示字段都成对（`zh` 原文 + `en` 译文的 `*En` 字段），一键切换。
- **防 LLM 误读**：每条都标注来源与年份，有争议的话题并列多方观点，不站队、不预测、不构成投资建议。
- **GEO 友好**：自动生成 `llms.txt` / `llms-full.txt`、中英索引、JSON-LD、`sitemap.xml`、`robots.txt`，方便 AI 搜索引擎整站引用。

> 姊妹项目：[中华王朝 · 千年脉络](https://MinosIE.github.io/chinese-dynasty-timeline/)

## 技术栈

Vite + TypeScript，零运行时框架（原生 DOM + 字符串模板）。按模块代码分割，首屏只加载入口，进入模块才懒加载对应 chunk。

## 目录结构

```
public/
  data/            # 源数据（人工维护）+ 派生文件（脚本生成）
    concepts.json  glossary.json  macro.json  micro.json  money.json
    thinkers.json  schools.json  events.json  behavioral.json
    gametheory.json  trade.json  everyday.json  charts.json
    myths.json  quiz.json  compare.json  sources.json
    overview.json  search.json  related.json   # 脚本生成
  llms.txt  llms-en.txt  llms-full.txt  llms-full-en.txt  # 脚本生成
  robots.txt  sitemap.xml  favicon.svg  og-cover.svg       # 脚本生成
scripts/           # 派生文件与校验（Node ESM）
  build-all.mjs  build-overview.mjs  build-search.mjs  build-geo.mjs  build-llms-full.mjs  check-i18n.mjs
src/
  core/           # i18n / 主题 / 数据加载 / 详情面板 / 搜索 / 相关跳转 / 工具
  modules/        # 16 个内容模块 + 通用渲染器 shared.ts
  styles/         # 深青 + 琥珀金设计系统（设计令牌 / 基础 / 组件）
index.html        # 单页骨架（导航、首页、16 个模块容器、详情面板、搜索、页脚）
```

## 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（Vite dev server）
npm run gen        # 生成全部派生文件并做双语校验（提交前必跑）
npm run build      # 生产构建 → dist/（base 已设为 /econ-everything/）
npm run preview    # 预览 dist/（注意：vite preview 的 brotli 中间件在本地可能有偶发 404，
                   #   属预览器问题，GitHub Pages 等静态托管不受影响）
```

## 数据贡献

1. 在对应 `public/data/*.json` 中新增条目，**中文原文与 `*En` 译文字段必须成对**（校验脚本 `check-i18n` 会拦截缺失）。
2. 运行 `npm run gen` 重新生成搜索索引、相关跳转表、概览 KPI 与 GEO 文件。
3. 提交，推送到 `main`，GitHub Actions 会自动构建并发布到 GitHub Pages。

数据口径：宏观/微观/货币/图表等数字为**示意性年度近似值**，仅用于展示长期趋势，具体数值以 IMF、BIS、World Bank、OECD、ILO、WTO 等官方发布为准（见 `sources.json`）。

## 部署

通过 `.github/workflows/deploy.yml` 在每次 push 到 `main` 时：
1. `npm ci` → `npm run gen` → `npm run build`
2. 将 `dist/` 上传为 GitHub Pages artifact 并发布。

站点地址：`https://MinosIE.github.io/econ-everything/`

## 许可

[MIT](./LICENSE)
