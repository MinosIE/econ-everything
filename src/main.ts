import "./styles/index.css";

import { provideApp } from "./core/app";
import { fetchData } from "./core/data";
import { initDetail, openDetail } from "./core/detail";
import { esc, need } from "./core/dom";
import {
  applyStaticLang,
  getLang,
  initLang,
  onLangChange,
  setLang,
  t,
} from "./core/i18n";
import { preloadRelated } from "./core/related";
import { initSearch } from "./core/search";
import { initTheme } from "./core/theme";
import type { LObj, OverviewFile, SearchEntry } from "./core/types";
import { MODULES, moduleByKey, type ModuleDef } from "./modules";
import type { ModuleInstance } from "./modules/types";

const BASE = import.meta.env.BASE_URL;
// 邮箱分段存放：避免 HTML/源码里出现可直接采集的完整地址（index.html 静态默认 href="#"）。
const MAIL_USER = "417913012";
const MAIL_DOMAIN = "qq.com";
const instances = new Map<string, ModuleInstance>();
const pending = new Map<string, Promise<void>>();
let current = "m-home";
let booted = false;

/** 按当前语言生成预填主题/正文的 mailto 链接，唤起默认邮箱客户端。 */
function mailtoHref(): string {
  const subject = encodeURIComponent(t("mail.subject"));
  const body = encodeURIComponent(t("mail.body"));
  return `mailto:${MAIL_USER}@${MAIL_DOMAIN}?subject=${subject}&body=${body}`;
}

/** 把预填邮件链接应用到 hero 节点，语言切换时同步刷新。 */
function updateMailLinks(): void {
  const href = mailtoHref();
  document.querySelectorAll<HTMLAnchorElement>("#heroMailLink").forEach((a) => {
    a.href = href;
  });
}

/* ---------------- 模块切换 / 加载提示 ---------------- */

const loadingEl = document.createElement("div");
loadingEl.id = "loading";
loadingEl.className = "loading-overlay";
loadingEl.hidden = true;
loadingEl.innerHTML =
  '<span class="spinner" aria-hidden="true"></span><span class="loading-text"></span>';

function showLoading(def: ModuleDef): void {
  const label = loadingEl.querySelector<HTMLElement>(".loading-text");
  if (label) label.textContent = t("ui.loading");
  const root = document.getElementById(def.id);
  if (root) root.appendChild(loadingEl);
  loadingEl.hidden = false;
}
function hideLoading(): void {
  loadingEl.hidden = true;
  loadingEl.remove();
}

function setActive(id: string, entryId?: string): void {
  current = id;
  document.querySelectorAll<HTMLElement>("#modNav .mod").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.go === id);
  });
  document.querySelectorAll<HTMLElement>(".module").forEach((sec) => {
    sec.classList.toggle("active", sec.id === id);
  });
  const def = MODULES.find((m) => m.id === id);
  // 条目级深链：#concepts/opportunity-cost；模块级：#concepts
  const hash = def ? `#${entryId ? `${def.key}/${entryId}` : def.key}` : "";
  history.replaceState(null, "", hash || location.pathname + location.search);
}

function flash(key: string): void {
  const node = document.querySelector<HTMLElement>(
    `#${current} [data-key="${key}"]`,
  );
  if (!node) return;
  node.scrollIntoView({ block: "center", behavior: "smooth" });
  node.classList.add("flash");
  window.setTimeout(() => node.classList.remove("flash"), 1600);
}

async function ensureModule(def: ModuleDef): Promise<void> {
  if (!pending.has(def.id)) {
    pending.set(
      def.id,
      (async () => {
        const root = document.getElementById(def.id);
        if (!root) return;
        try {
          const mod = await def.load();
          const inst = await mod.default({ root, openDetail });
          if (inst) instances.set(def.id, inst);
        } catch (err) {
          console.error("[econ] 模块渲染失败:", def.id, err);
          root.innerHTML = `<p class="empty">${esc(t("ui.loadFail"))}</p>`;
        }
      })(),
    );
  }
  await pending.get(def.id);
}

async function activate(
  id: string,
  openKey?: string,
  scroll = false,
): Promise<void> {
  setActive(id, openKey);
  const def = MODULES.find((m) => m.id === id);
  if (!def) return;
  if (!instances.has(def.id)) showLoading(def);
  await ensureModule(def);
  hideLoading();
  if (openKey) {
    const inst = instances.get(id);
    if (!inst?.openById?.(openKey)) flash(openKey);
  }
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------- 首页 / KPI / 页脚 ---------------- */

function renderHome(): void {
  const host = need("#homeGrid");
  host.innerHTML = MODULES.map(
    (m) => `<button class="entry" type="button" data-go="${m.id}">
      <span class="entry-ic" aria-hidden="true">${m.icon}</span>
      <span class="entry-t">${esc(t(`entry.${m.key}.t`))}</span>
      <span class="entry-d">${esc(t(`entry.${m.key}.d`))}</span>
      <span class="entry-go">${esc(t("ui.enter"))}</span>
    </button>`,
  ).join("");
  host.querySelectorAll<HTMLElement>("[data-go]").forEach((btn) => {
    btn.addEventListener(
      "click",
      () => void activate(btn.dataset.go ?? "m-home", undefined, true),
    );
  });
}

async function renderKpis(): Promise<void> {
  const host = need("#kpis");
  try {
    const ov = await fetchData<OverviewFile>("overview.json");
    host.innerHTML = ov.kpis
      .map(
        (k) => `<div class="kpi">
          <span class="kpi-ic" aria-hidden="true">${esc(k.icon)}</span>
          <span class="kpi-body"><b class="kpi-v">${esc(k.value)}</b><span class="kpi-l">${esc(t(`kpi.${k.key}`))}</span></span>
        </div>`,
      )
      .join("");
  } catch {
    host.innerHTML = "";
  }
}

async function renderRefs(): Promise<void> {
  const box = need("#refsBox");
  const list = need("#refList");
  try {
    const items = await fetchData<LObj[]>("sources.json");
    if (!items.length) {
      box.hidden = true;
      return;
    }
    list.innerHTML = items
      .map((s) => {
        const label = `${esc(s.label)}${s.year ? `（${esc(s.year)}）` : ""}`;
        const text = s.url
          ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${label}</a>`
          : label;
        return `<li>${text}<span class="ref-type">${esc(s.type ?? "")}</span></li>`;
      })
      .join("");
    box.hidden = false;
  } catch {
    box.hidden = true;
  }
}

function renderFooter(): void {
  const foot = need("#foot");
  foot.innerHTML = `
    <p>${esc(t("foot.tip"))}</p>
    <p>${esc(t("foot.sister"))}：<a href="https://MinosIE.github.io/chinese-dynasty-timeline/" target="_blank" rel="noopener noreferrer">中华王朝 · 千年脉络</a>
      · ${esc(t("foot.data"))}：<a href="${BASE}data/overview.json">overview.json</a>
      · <a href="${BASE}data/concepts.json">concepts.json</a>
      · ${esc(t("foot.llms"))}：<a href="${BASE}llms.txt">llms.txt</a>
      · <a href="${BASE}llms-full.txt">llms-full.txt</a>
    </p>
    <p>${esc(t("foot.copy"))}</p>`;
}

/* ---------------- 深链 / 顶栏 ---------------- */

function bindTop(): void {
  const top = need("#toTop");
  const onScroll = () => top.classList.toggle("show", window.scrollY > 420);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  top.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

function bindNav(): void {
  document.querySelectorAll<HTMLElement>("#modNav .mod").forEach((btn) => {
    btn.addEventListener(
      "click",
      () => void activate(btn.dataset.go ?? "m-home", undefined, true),
    );
  });
}

function deepLink(): void {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!raw) return;
  // 支持 #concepts 与 #concepts/opportunity-cost 两种形态（与 setActive 写入的 hash 格式对称）
  const [key, id] = raw.split("/");
  const def = moduleByKey(key);
  if (def) void activate(def.id, id || undefined);
}

/* ---------------- 启动 ---------------- */

function boot(): void {
  if (booted) return;
  booted = true;

  initLang();
  applyStaticLang();
  initTheme();
  initDetail();
  void preloadRelated();

  renderHome();
  void renderKpis();
  void renderRefs();
  renderFooter();
  updateMailLinks();
  bindNav();
  bindTop();

  initSearch((entry: SearchEntry) => {
    void activate(entry.m, entry.id, true);
  });

  provideApp({
    switchModule: (id: string) => setActive(id),
    openTarget: (moduleId: string, key: string) =>
      void activate(moduleId, key, true),
    currentModule: () => current,
  });

  deepLink();

  onLangChange(() => {
    renderHome();
    renderFooter();
    void renderKpis();
    void renderRefs();
    updateMailLinks();
    if (current !== "m-home") {
      const def = MODULES.find((m) => m.id === current);
      pending.delete(current);
      instances.delete(current);
      if (def) void ensureModule(def);
    }
  });

  // 语言切换按钮：按钮文案 = 点击后切换到的语言
  const langBtn = need("#langBtn");
  const label = need("#langLabel");
  const syncLangLabel = () => {
    label.textContent = getLang() === "zh" ? "EN" : "中文";
    langBtn.setAttribute("title", t("langLabel"));
  };
  syncLangLabel();
  langBtn.addEventListener("click", () =>
    setLang(getLang() === "zh" ? "en" : "zh"),
  );
  onLangChange(syncLangLabel);

  // 标题 / 描述 / 语言属性随语言切换
  onLangChange(() => {
    document.title = t("docTitle");
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t("docDesc"));
  });
  document.title = t("docTitle");
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", t("docDesc"));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
