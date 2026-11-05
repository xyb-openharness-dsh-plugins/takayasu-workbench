#!/usr/bin/node
/**
 * public/ 定点移植（TAK 版）：**复制原型 → 定点替换**，不手抄。
 *
 * 替换点（只有这些，其它与原型逐字符相同——ui-parity 口径）：
 *   1. index.html：加 noindex；「原型声明」条改开发版措辞；版本 chip/页脚走 __VERSION_DISPLAY__ 占位
 *      （server.js 注入，两种形态同一份文件）；
 *   2. app.js：boot 后追加「bootstrap 混合数据源」块——宿主形态拉 /api/bootstrap（同形状），
 *      file:// 与拉取失败一律回退演示数据（禁裸 throw，禁白屏）。
 *
 * 用法：node scripts/migrate-public.mjs [--check]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = join(ROOT, 'prototypes/v0.2');
const OUT = join(ROOT, 'public');
const CHECK = process.argv.includes('--check');
const FILES = ['index.html', 'app.js', 'style.css', 'demo-data.js', 'primer-data.js', 'primer.js'];

const BAR_OLD = '<div class="prototype-bar"><span><b>交互原型 v0.3.0</b> · 全部为合成示例（临床试验列表为真实登记摘录）</span><span>仅本页演示 · 刷新重置 · 未接入 DSH / AI</span></div>';
const BAR_NEW = '<div class="prototype-bar"><span><b>开发版</b> · 本机数据 · 不上传 · AI 面板由宿主提供 · 业务数据仍为演示内容直到导入真实资料</span><span>版本 <b>__VERSION_DISPLAY__</b></span></div>';

function migrateIndex(s) {
  return s
    .replace('<title>小弓宝 ArchPal · 大动脉炎工作台原型 v0.3.0</title>', '<title>小弓宝 ArchPal · 大动脉炎工作台</title>\n<meta name="robots" content="noindex,nofollow">')
    .replace(BAR_OLD, BAR_NEW)
    .replace('>v0.3.0</button>', '>__VERSION_DISPLAY__</button>')
    .replace('<b id="app-version">v0.3.0</b><em id="app-build">2026-11-05</em>', '<b id="app-version">__VERSION_DISPLAY__</b><em id="app-build">__BUILD_DATE__</em>');
}

function migrateApp(s) {
  return s
    .replace('小弓宝 ArchPal · 大动脉炎工作台原型 v0.3.0', '小弓宝 ArchPal · 大动脉炎工作台（版本走注入占位符）')
    .replace("version: '0.3.0', build: '2026-11-05'", "version: '__VERSION__', build: '__BUILD_DATE__'") + `

/* ── 开发版数据源（scripts/migrate-public.mjs 注入点；原型无此块）──
   宿主形态优先 bootstrap（读模型还原 demo 形状，parity 由测试断言）；
   file:// 与拉取失败回退演示数据：不裸 throw、不白屏。 */
;(function () {
  var apiBase = "__API_BASE__"; /* 令牌会被宿主注入成字符串字面量；禁止把令牌挂在 window 对象上（注入后会语法错误，0.2.0 装机教训） */
  if (location.protocol === 'file:') return;
  /* 部署态：AI 对话由宿主原生面板承载（34 号契约）——本地演示坞与「模拟回复自检」整体退场 */
  if (window.parent !== window) {
    var dock = document.getElementById('agent-dock');
    if (dock && dock.parentNode) dock.parentNode.removeChild(dock);
  }
  fetch(apiBase + '/api/bootstrap').then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (b) {
    if (!b || !b.profiles || !b.metricDefs || !b.segments) throw new Error('bootstrap 形状不符');
    window.TAK_DEMO.profiles = b.profiles;
    window.TAK_DEMO.metricDefs = b.metricDefs;
    window.TAK_DEMO.segments = b.segments;
    var app = window.__TAK_APP__;
    app.state.profile = Object.keys(b.profiles)[0];
    app.state.view = 'dashboard';
    app.state.sub = null;
    app.state.flipped = {};
    app.render();
    console.info('[takayasu] 已切换到本机数据库数据（' + Object.keys(b.profiles).length + ' 个档案）');
  }).catch(function (e) {
    console.warn('[takayasu] bootstrap 不可用，继续使用演示数据：', String(e && e.message || e));
  });
})();
`;
}

const outs = {};
for (const f of FILES) {
  let s = readFileSync(join(SRC, f), 'utf8');
  if (f === 'index.html') s = migrateIndex(s);
  if (f === 'app.js') s = migrateApp(s);
  outs[f] = s;
}

if (CHECK) {
  const problems = [];
  for (const [f, want] of Object.entries(outs)) {
    const p = join(OUT, f);
    if (!existsSync(p)) { problems.push(f + ' 缺失'); continue; }
    const have = readFileSync(p, 'utf8');
    if (have !== want) problems.push(f + ' 与原型定点移植产物不一致（改原型后须重跑 migrate-public）');
  }
  if (problems.length) { console.error('migrate-public --check 失败：\n' + problems.join('\n')); process.exit(1); }
  console.log('migrate-public --check：public/ 与原型定点移植产物一致');
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });
for (const [f, s] of Object.entries(outs)) writeFileSync(join(OUT, f), s);
console.log('public/ 已生成：', Object.keys(outs).join(', '));
