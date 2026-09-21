// 顺序执行全部派生脚本（顺序不可颠倒：search/related 先于 geo/llms-full，最后统一校验）。
import { spawnSync } from "node:child_process";
import path from "node:path";
import { ROOT } from "./lib.mjs";

const STEPS = [
  "build-overview.mjs",
  "build-search.mjs",
  "build-geo.mjs",
  "build-llms-full.mjs",
  "check-data.mjs",
  "check-i18n.mjs",
];

for (const step of STEPS) {
  const res = spawnSync(process.execPath, [path.join(ROOT, "scripts", step)], {
    stdio: "inherit",
  });
  if (res.status !== 0) {
    console.error(`\n✗ ${step} 失败，流水线中断。`);
    process.exit(res.status ?? 1);
  }
}

console.log("\n✓ 派生文件全部生成完毕。");
