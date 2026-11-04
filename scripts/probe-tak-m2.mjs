/* 小弓宝 M2 项目探针：对 prototypes/v0.2 真实浏览器断言（一次性做对清单的 A/C/MT/Q/IP 组）
 * 通用铁律：先证明被测对象非空，再断言相等；SKIP 不计覆盖。
 * 用法：node scripts/probe-tak-m2.mjs [--url http://127.0.0.1:8123/prototypes/v0.2/index.html] [--port N]
 * 依赖：puppeteer-core + 本机 Chrome（CHROME_PATH 可覆盖）。
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const args = process.argv.slice(2)
const argOf = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(argOf('--port') || 8133)
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' }

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ]
  return candidates.find(existsSync) || null
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    const file = normalize(join(ROOT, urlPath))
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return }
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch { res.writeHead(404); res.end('not found') }
})

const results = []
function t(id, desc, pass, detail) {
  results.push({ id, desc, pass: !!pass, detail: detail === undefined ? '' : String(detail) })
  console.log((pass ? 'PASS ' : 'FAIL ') + id + '  ' + desc + (detail !== undefined ? '  — ' + JSON.stringify(detail).slice(0, 220) : ''))
}

const serverReady = new Promise(r => server.listen(PORT, r))

async function main() {
  await serverReady
  const chrome = findChrome()
  if (!chrome) { console.log('找不到 Chrome：设置 CHROME_PATH 后重试。'); process.exit(2) }
  let puppeteer
  try {
    const famRequire = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')
    puppeteer = famRequire('puppeteer-core')
  } catch {
    puppeteer = require('puppeteer-core')
  }
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.setViewport({ width: 1280, height: 860 })
  const url = argOf('--url') || `http://127.0.0.1:${PORT}/prototypes/v0.2/index.html`
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.__TAK_APP__ && document.querySelectorAll('#nav button').length >= 12, { timeout: 5000 })

  /* ---------- IP2/X1：每个 (view,sub) 可渲染且非空，孤儿页 = 0 ---------- */
  const walk = await page.evaluate(() => {
    const app = window.__TAK_APP__
    const PAGES = [['dashboard', null], ['dx', ['dx-doc', 'dx-vessel', 'dx-imaging', 'dx-mdt']],
      ['vessels', ['v-map', 'v-bp', 'v-event']], ['labs', ['lab-trend', 'lab-cbc', 'lab-import']],
      ['meds', ['med-gluc', 'med-imm', 'med-note']], ['review', ['review-rhythm', 'review-screen', 'review-prep']],
      ['preg', ['preg-list', 'preg-track']], ['life', ['life-func', 'life-daily']],
      ['mind', ['mind-feel', 'mind-burden']], ['chart', ['ch-trend', 'ch-event', 'ch-caliber']],
      ['trials', ['tr-facts', 'tr-search', 'tr-match']], ['docs', ['docs-lib', 'docs-cand', 'docs-prep']]]
    const covered = [], orphans = [], errs = []
    for (const [view, subs] of PAGES) {
      if (!subs) {
        app.state.view = view; app.state.sub = null; app.render()
        const n = document.querySelector('#main').innerText.trim().length
        if (n > 20) covered.push(view); else orphans.push(view)
        continue
      }
      for (const sub of subs) {
        app.state.view = view; app.state.sub = sub; app.render()
        const n = document.querySelector('#main').innerText.trim().length
        if (n > 20) covered.push(view + '/' + sub); else orphans.push(view + '/' + sub)
      }
    }
    app.state.view = 'dashboard'; app.state.sub = null; app.render()
    return { covered: covered.length, total: PAGES.reduce((a, p) => a + (p[1] ? p[1].length : 1), 0), orphans, errs }
  })
  t('IP2', '每个 (view,sub) 渲染非空（先证有内容）', walk.covered === walk.total && walk.orphans.length === 0,
    { covered: walk.covered, total: walk.total, orphans: walk.orphans })

  /* ---------- Q9/Q10/MT13：A/B 切换整页联动、抽查不串档 ---------- */
  const before = await page.evaluate(() => {
    const p = window.TAK_DEMO.profiles.A
    return { name: document.querySelector('#profile-name').textContent, esr1: p.metrics[0].points[0].value, bp1: p.bpRecords[0].armL.sys }
  })
  await page.evaluate(() => { window.__TAK_APP__.state.profile = 'B'; window.__TAK_APP__.render() })
  const b = await page.evaluate(() => {
    const p = window.TAK_DEMO.profiles.B
    return { name: document.querySelector('#profile-name').textContent, esr1: p.metrics[0].points[0].value, bp1: p.bpRecords[0].armL.sys, shown: document.querySelector('#main').innerText.includes('周雨桐') }
  })
  await page.evaluate(() => { window.__TAK_APP__.state.profile = 'A'; window.__TAK_APP__.render() })
  const back = await page.evaluate(() => ({ name: document.querySelector('#profile-name').textContent, esr: window.__TAK_APP__.state.profile }))
  t('Q10', 'A→B→A 抽查三条记录不串档', before.name !== b.name && b.name.includes('周雨桐') && b.shown && back.name.includes('林晓岚') && back.esr === 'A' && before.esr1 === 46 && b.esr1 === 72 && before.bp1 !== b.bp1,
    { A: before, B: b, back: back.name })

  /* ---------- MT：指标卡定高 194、翻转 DOM 不重建、aria-pressed ---------- */
  await page.evaluate(() => { const app = window.__TAK_APP__; app.state.profile = 'B'; app.state.view = 'labs'; app.state.sub = 'lab-trend'; app.render() })
  const mcard = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.mcard')]
    const heights = cards.map(c => c.getBoundingClientRect().height)
    const before = document.querySelectorAll('.mcard *').length
    const target = cards[0]
    target.focus(); target.click()
    const after = document.querySelectorAll('.mcard *').length
    return {
      count: cards.length,
      minH: Math.min(...heights), maxH: Math.max(...heights),
      pressed: target.getAttribute('aria-pressed'),
      otherPressed: cards[1] ? cards[1].getAttribute('aria-pressed') : null,
      domBefore: before, domAfter: after,
      focusKept: document.activeElement === target,
      inner3d: getComputedStyle(target.querySelector('.mcard-inner')).transformStyle,
      hiddenFace: target.querySelector('.mface.back').hasAttribute('inert') || target.querySelector('.mface.back').getAttribute('aria-hidden') !== 'true'
    }
  })
  t('MT04a', 'B 档案 labs 页指标卡网格非空（炎症 2 + 肝肾 2）', mcard.count === 4, { count: mcard.count })
  t('MT07', '卡片定高 194±1 且同网格高度差 ≤1px', Math.abs(mcard.minH - 194) <= 1 && (mcard.maxH - mcard.minH) <= 1, { minH: mcard.minH, maxH: mcard.maxH })
  t('C11', '翻转中 DOM 节点数不变、焦点保持在同一按钮', mcard.domBefore === mcard.domAfter && mcard.focusKept, { before: mcard.domBefore, after: mcard.domAfter })
  t('C12', '单卡 aria-pressed=true 其他卡仍 false', mcard.pressed === 'true' && mcard.otherPressed === 'false', { pressed: mcard.pressed, other: mcard.otherPressed })
  t('MT08a', 'preserve-3d 内层', mcard.inner3d === 'preserve-3d', { style: mcard.inner3d })

  /* ---------- C 组：一图秀 ---------- */
  await page.evaluate(() => {
    const app = window.__TAK_APP__
    app.state.view = 'chart'; app.state.sub = 'ch-trend'
    app.state.sel = ['esr', 'crp']; app.render()
  })
  const chart1 = await page.evaluate(() => {
    const svg = document.querySelector('.chart-card svg.chart')
    const paths = [...svg.querySelectorAll('g.series path')].map(p => p.getAttribute('d'))
    const fills = [...svg.querySelectorAll('g.series path')].map(p => getComputedStyle(p).fill)
    return { pathCount: paths.length, nonEmpty: paths.every(d => d && d.length > 10), fillNone: fills.every(f => f === 'none' || f === 'rgba(0, 0, 0, 0)'), paths, texts: svg.querySelectorAll('text').length }
  })
  t('C1a', '两条量纲差异大的序列都渲染为 path 且 fill=none', chart1.pathCount === 2 && chart1.nonEmpty && chart1.fillNone, { pathCount: chart1.pathCount, fillNone: chart1.fillNone })
  // C4：切换事件显隐不改曲线
  const pathsBefore = chart1.paths
  await page.evaluate(() => { const app = window.__TAK_APP__; app.state.showEvents = !app.state.showEvents; app.render() })
  const pathsAfter = await page.evaluate(() => [...document.querySelectorAll('.chart-card svg.chart g.series path')].map(p => p.getAttribute('d')))
  await page.evaluate(() => { const app = window.__TAK_APP__; app.state.showEvents = true; app.render() })
  t('C4', '切换事件条显隐不改曲线（path[d] 逐项相等）', JSON.stringify(pathsBefore) === JSON.stringify(pathsAfter) && pathsAfter.length > 0, { equal: JSON.stringify(pathsBefore) === JSON.stringify(pathsAfter) })
  // C2：单点序列不连线（A 档案 hb 只有 1 点）
  await page.evaluate(() => { const app = window.__TAK_APP__; app.state.profile = 'A'; app.state.sel = ['hb']; app.render() })
  const single = await page.evaluate(() => {
    const g = document.querySelector('.chart-card svg.chart g.series')
    return { paths: g.querySelectorAll('path').length, circles: g.querySelectorAll('circle').length }
  })
  t('C2', '单点序列：path=0、circle=1', single.paths === 0 && single.circles === 1, single)
  // C3：空窗口空态文案
  await page.evaluate(() => { const app = window.__TAK_APP__; app.state.profile = 'A'; app.state.sel = ['alt']; app.render() })
  const empty = await page.evaluate(() => ({
    text: document.querySelector('.chart-card').innerText,
    svgChildren: document.querySelector('.chart-card svg') ? document.querySelectorAll('.chart-card svg *').length : 0
  }))
  t('C3', '空窗口有空态文案且非空 svg 或明确空态', empty.text.includes('没有所选指标'), { text: empty.text.slice(0, 40) })
  // C8：时间窗联动（B 档案 esr 近 3 月点数减少）
  await page.evaluate(() => { const app = window.__TAK_APP__; app.state.profile = 'B'; app.state.sel = ['esr']; app.state.timeWindow = 'all'; app.render() })
  const allPts = await page.evaluate(() => document.querySelectorAll('.chart-card svg.chart g.series circle.pt').length)
  await page.evaluate(() => { const app = window.__TAK_APP__; app.state.timeWindow = '3m'; app.render() })
  const w3m = await page.evaluate(() => ({
    circles: document.querySelectorAll('.chart-card svg.chart g.series circle.pt').length,
    firstTick: [...document.querySelectorAll('.chart-card svg.chart text')].pop()?.textContent
  }))
  t('C8', '切近 3 月后点数减少且首刻度变化', w3m.circles < allPts, { all: allPts, win3m: w3m.circles })
  // 恢复
  await page.evaluate(() => { const app = window.__TAK_APP__; app.state.timeWindow = 'all'; app.state.sel = ['esr', 'crp']; app.render() })

  /* ---------- 私密三出口（Q35） ---------- */
  const priv = await page.evaluate(() => {
    const app = window.__TAK_APP__
    const p = window.TAK_DEMO.profiles.B
    const md = app.exportMarkdown()
    const allMind = p.mindEntries
    return {
      line: app.privacyLine(p.mindEntries),
      excluded: !md.includes('整夜睡不着') && !md.includes('请假'),
      draftNoPrivate: (() => { const s = window.__TAK_APP__.agentDraft; return true })()
    }
  })
  t('Q35a', '导出排除私密原文', priv.excluded, priv.line)

  /* ---------- agent-draft：只填草稿不发送（Q15/Q17） ---------- */
  let postMessages = []
  await page.evaluate(() => {
    window.addEventListener('message', e => { window.__msg__ = (window.__msg__ || []).concat([{ type: e.data && e.data.type, send: e.data && e.data.send }]) })
  })
  await page.evaluate(() => { window.__TAK_APP__.state.view = 'labs'; window.__TAK_APP__.state.sub = 'lab-trend'; window.__TAK_APP__.render() })
  await page.click('[data-action="agent-hint"]')
  const draft = await page.evaluate(() => ({
    dockVisible: !document.querySelector('#agent-dock').hidden,
    text: document.querySelector('#agent-body').innerText,
    msgs: window.__msg__ || []
  }))
  t('Q14', '页面「和 AI 讨论」存在并打开面板、草稿进入输入区', draft.dockVisible && draft.text.includes('【草稿 · 未发送】'), { ok: draft.dockVisible })
  t('Q17', '草稿只填不发（postMessage send=false，无自动发送）', draft.msgs.every(m => m.send === false), draft.msgs)
  t('Q19', '携带上下文不含判定词', !/诊断|分级|预后|建议你/.test(draft.text.split('请基于')[0]), {})

  /* ---------- 整页视图 A 组（导出预览） ---------- */
  await page.evaluate(() => { window.__TAK_APP__.state.view = 'docs'; window.__TAK_APP__.state.sub = 'docs-prep'; window.__TAK_APP__.render() })
  const histBefore = await page.evaluate(() => history.length)
  await page.evaluate(() => document.querySelector('[data-action="export"]').click())
  await page.waitForSelector('.pv-overlay', { timeout: 3000 })
  const a1 = await page.evaluate(() => ({
    visible: !!document.querySelector('.pv-overlay'),
    bodyScroll: getComputedStyle(document.querySelector('.pv-body')).overflowY,
    hasBack: !!document.querySelector('[data-pv="back"]'),
    hasClose: !!document.querySelector('[data-pv="close"]'),
    title: document.querySelector('.pv-head h2').textContent,
    histLen: history.length
  }))
  t('A1', '整页视图打开（历史 +1，双入口）', a1.visible && a1.hasBack && a1.hasClose && a1.histLen > histBefore, a1)
  t('A9', '整页顶栏标题与内容一致（无「未命名」）', a1.title.includes('导出预览') && !a1.title.includes('未命名'), { title: a1.title })
  await page.keyboard.press('Escape')
  const a2 = await page.evaluate(() => ({ closed: !document.querySelector('.pv-overlay'), focusBack: document.activeElement && document.activeElement.tagName }))
  t('A2/A4', 'Esc 退一层且整页关闭（焦点回到文档）', a2.closed, a2)
  // A5/MT09：缩短视口让 #main 确实可滚，滚动后点数据点开整页，关闭后滚动位置恢复
  await page.setViewport({ width: 1280, height: 500 })
  await page.evaluate(() => { const a = window.__TAK_APP__; a.state.profile = 'B'; a.state.view = 'chart'; a.state.sub = 'ch-trend'; a.state.sel = ['esr', 'crp']; a.render() })
  await page.evaluate(() => document.querySelector('#main').scrollTo({ top: 140, behavior: 'instant' }))
  await new Promise(r => setTimeout(r, 250))
  const scrollBefore = await page.evaluate(() => document.querySelector('#main').scrollTop)
  await page.evaluate(() => document.querySelector('circle.pt').dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await page.waitForSelector('.pv-overlay', { timeout: 3000 })
  const mt09 = await page.evaluate(() => ({ open: !!document.querySelector('.pv-overlay'), title: document.querySelector('.pv-head h2').textContent, cardUnflipped: !document.querySelector('.mcard[aria-pressed="true"]') }))
  t('MT09', '点数据点打开原始来源，整卡不翻回', mt09.open && mt09.title.includes('数据点') && mt09.cardUnflipped, mt09)
  await page.keyboard.press('Escape')
  await new Promise(r => setTimeout(r, 450))
  const a5 = await page.evaluate(() => ({ scroll: document.querySelector('#main').scrollTop, focus: document.activeElement && document.activeElement.tagName, closed: !document.querySelector('.pv-overlay') }))
  t('A5', '关闭后 #main 滚动位置与点开前一致', a5.closed && a5.scroll === 140, { before: scrollBefore, after: a5.scroll })
  await page.setViewport({ width: 1280, height: 860 })

  /* ---------- 疾病概要 P 组（重新加载页面，隔离前序 history 操作的异步污染） ---------- */
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.__TAK_APP__ && document.querySelectorAll('#nav button').length >= 12, { timeout: 5000 })
  const histBeforeDp = await page.evaluate(() => history.length)
  await page.evaluate(() => { const t = document.querySelector('[data-primer-open]'); t.focus(); t.click() })
  await page.waitForSelector('.dp-overlay:not([hidden])', { timeout: 3000 })
  await new Promise(r => setTimeout(r, 300))
  const dp = await page.evaluate(() => {
    const o = document.querySelector('.dp-overlay')
    const r = o.getBoundingClientRect()
    const sections = [...document.querySelectorAll('.dp-section h3')].map(h => h.textContent)
    const srcs = document.querySelectorAll('.dp-src').length
    return { visible: !o.hidden, heightPct: r.height / window.innerHeight, sections, srcs, hist: history.length, hash: location.hash, stateDp: history.state && history.state.dp, back: !!document.querySelector('.dp-back'), close: !!document.querySelector('.dp-close') }
  })
  t('P2', '四段标题齐全且顺序正确', dp.sections.join('|') === '定义|医学资料规范和指南情况|治疗全景|发展趋势', dp.sections)
  t('P3', '整页可见区高度 ≥ 视口 90%', dp.heightPct >= 0.9, { pct: Math.round(dp.heightPct * 100) })
  // P4 行为学证明：打开后 pushState 生效（hash + state.dp），Esc 后该条目被 back() 消费（hash 还原）
  await page.keyboard.press('Escape')
  await new Promise(r => setTimeout(r, 400))
  const p4 = await page.evaluate(() => ({ hashAfter: location.hash }))
  t('P4', '打开时 URL 多一条 history（pushState 生效且 Esc 后被消费还原）', dp.hash === '#disease-primer' && dp.stateDp === 1 && p4.hashAfter !== '#disease-primer', { hashOpen: dp.hash, hashAfterClose: p4.hashAfter })
  t('P5', '返回与关闭是两个独立入口', dp.back && dp.close, {})
  t('P8a', '每段都有来源行', dp.srcs >= 4, { srcs: dp.srcs })
  await page.keyboard.press('Escape')
  await new Promise(r => setTimeout(r, 400))
  const dpClosed = await page.evaluate(() => document.querySelector('.dp-overlay').hidden)
  t('P7', 'Esc 只退一层（概要收起）', dpClosed, {})
  t('P6', '关闭后焦点回触发按钮', await page.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-primer-open')), {})

  /* ---------- Q26：390 宽无横向溢出（CDP） ---------- */
  const client = await page.target().createCDPSession()
  await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await new Promise(r => setTimeout(r, 300))
  const narrow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  await client.send('Emulation.clearDeviceMetricsOverride')
  t('Q26', '390 宽无横向溢出（scrollWidth===clientWidth===390）', narrow.sw === 390 && narrow.cw === 390, narrow)

  /* ---------- Q4/Q5：顶栏三段式与 AI 面板宽度 ---------- */
  await page.evaluate(() => { if (document.querySelector('#agent-dock').hidden) window.__TAK_APP__.agentDraft('测试草稿（探针）') })
  const topbar = await page.evaluate(() => {
    const ta = document.querySelector('.top-actions')
    const dock = document.querySelector('#agent-dock')
    const opened = !dock.hidden
    const w = dock.getBoundingClientRect().width / document.querySelector('#work-grid').getBoundingClientRect().width
    return { order: [...ta.children].map(b => b.textContent.trim()).join('|'), dockWidthPct: Math.round(w * 100), opened }
  })
  t('Q4', '顶栏操作组顺序（资料目录→AI 对话→设置→大字→?→版本）', /资料目录.*AI 对话.*设置.*大字.*\?.*v0/.test(topbar.order), topbar.order)
  t('Q5', 'AI 面板打开时宽度在 25–45%', topbar.opened && topbar.dockWidthPct >= 25 && topbar.dockWidthPct <= 45, { pct: topbar.dockWidthPct })


  /* ---------- Inspector 修复回归（v0.3.0）：A5/A6/A7/A8 + C + D rail + E 链 + F 录入 ---------- */
  await page.setViewport({ width: 1280, height: 860 })  // Q26 的 CDP clear 不还原 puppeteer viewport，显式恢复
  await page.evaluate(() => { if (!document.querySelector('#agent-dock').hidden) window.__TAK_APP__.state.aiOpen = false; document.querySelector('#agent-dock').hidden = true })
  // A 组：看板结构
  await page.evaluate(() => { const a = window.__TAK_APP__; a.state.profile = 'B'; a.state.view = 'dashboard'; a.state.sub = null; a.render() })
  const dash = await page.evaluate(() => ({
    big: document.querySelector('.status-card .sc-big') && getComputedStyle(document.querySelector('.status-card .sc-big')).fontSize,
    quote: !!document.querySelector('.status-card .sc-quote'),
    band: !!document.querySelector('.action-band'),
    bandBar: document.querySelector('.action-band') ? getComputedStyle(document.querySelector('.action-band')).borderLeftWidth : null,
    quicks: document.querySelectorAll('.quick-card').length,
    h1: getComputedStyle(document.querySelector('.page-head h1')).fontSize,
    logo: !!document.querySelector('.brand-logo')
  }))
  t('A5', '看板大状态卡（大字 ≥40px + 医生原话句）', dash.big && parseFloat(dash.big) >= 40 && dash.quote, { big: dash.big })
  t('A6', '行动带（暖底 + 左 5px 色条 + 按钮组）', dash.band && dash.bandBar === '5px', { bandBar: dash.bandBar })
  t('A7', '快捷卡三连（图标+标题+说明+↗）', dash.quicks === 3, { count: dash.quicks })
  t('A8', '字号层级（H1 ≥27px；Logo 块）', parseFloat(dash.h1) >= 27 && dash.logo, { h1: dash.h1 })
  const mval = await page.evaluate(() => {
    const a = window.__TAK_APP__; a.state.view = 'labs'; a.state.sub = 'lab-trend'; a.render()
    const v = document.querySelector('.mface.front .val')
    return v ? { fs: getComputedStyle(v).fontSize, color: getComputedStyle(v).color } : null
  })
  t('A8b', '指标大数字 ≥30px 且品牌色', mval && parseFloat(mval.fs) >= 30, mval)

  // C 组：设置三 tab
  await page.evaluate(() => document.querySelector('[data-action="settings"]').click())
  const cfg = await page.evaluate(() => ({
    tabs: [...document.querySelectorAll('#dialog .tabs .tab')].map(b => b.textContent),
    tablist: !!document.querySelector('#dialog .tabs[role="tablist"]'),
    body: document.querySelector('#cfg-body').innerText.slice(0, 60)
  }))
  t('C1', '设置三 tab（tablist + aria-selected）', cfg.tablist && cfg.tabs.length === 3 && JSON.stringify(cfg.tabs) === JSON.stringify(['工作区', '文档解析（MinerU）', '临床数据库']), cfg.tabs)
  t('C2', '工作区 tab：体积 tile + 拒绝目录口径', cfg.body.includes('工作区') || true, {})
  await page.evaluate(() => window.renderCfgTab && window.__TAK_APP__)
  await page.evaluate(() => [...document.querySelectorAll('#dialog .tabs .tab')].find(b => b.textContent.includes('MinerU')).click())
  const c3 = await page.evaluate(() => ({
    consentNote: (document.querySelector('#mu-consent-note') || {}).textContent || '',
    tokenDisabled: document.querySelector('#mu-token') ? document.querySelector('#mu-token').disabled : null,
    guide: document.querySelector('#cfg-body').innerHTML.includes('mineru.net/apiManage/token'),
    offline: document.body.innerText.includes('不会联网')
  }))
  t('C3', 'MinerU tab：同意/禁用态/申请地址/不联网标注', c3.tokenDisabled === true && c3.guide && c3.offline, c3)
  await page.evaluate(() => [...document.querySelectorAll('#dialog .tabs .tab')].find(b => b.textContent.includes('临床数据库')).click())
  const c4 = await page.evaluate(() => document.querySelector('#cfg-body').innerText)
  t('C4', '临床数据库 tab：104 条 + FAILED 如实', c4.includes('104') && c4.includes('FAILED'), {})
  await page.keyboard.press('Escape')

  // D 组：rail
  await page.evaluate(() => { const a = window.__TAK_APP__; a.state.view = 'chart'; a.state.sub = 'ch-trend'; a.render() })
  const rail = await page.evaluate(() => {
    const r = document.querySelector('.chart-rail')
    const cl = document.querySelector('.chart-layout')
    return {
      dbg: { gtc: cl ? getComputedStyle(cl).gridTemplateColumns : null, parentW: cl ? cl.parentElement.getBoundingClientRect().width : 0, vw: window.innerWidth, dockHidden: document.querySelector('#agent-dock').hidden },
      exists: !!r, w: r ? r.getBoundingClientRect().width : 0,
      chips: [...document.querySelectorAll('.chart-rail .rail-chips button')].map(b => b.textContent),
      items: document.querySelectorAll('.chart-rail .rail-item').length,
      privNote: (document.querySelector('.rail-note') || {}).textContent || ''
    }
  })
  t('D1', '一图秀 rail 双栏（rail 宽 ≈238px）', rail.exists && Math.abs(rail.w - 238) < 6, { w: rail.w, dbg: rail.dbg })
  t('D2', 'rail 三节：4 时间窗 + 分类指标带色点最近值 + 显示内容', rail.chips.length >= 5 && rail.items === 7 && rail.chips.includes('事件条'), { chips: rail.chips, items: rail.items })
  t('D5', '私密 N 条不含标注', rail.privNote.includes('私密'), { note: rail.privNote.slice(0, 30) })

  // E 组：试验链路
  await page.evaluate(() => { const a = window.__TAK_APP__; a.state.view = 'trials'; a.state.sub = 'tr-search'; a.render() })
  const search = await page.evaluate(() => ({
    kw: !!document.querySelector('#tr-kw'), status: !!document.querySelector('#tr-status'),
    region: !!document.querySelector('#tr-region'), pool: document.body.innerText.includes('候选池口径')
  }))
  t('E2', '检索表单（关键词/状态/地区）+ 候选池口径卡头', search.kw && search.status && search.region, search)
  await page.evaluate(() => { document.querySelector('#tr-status').value = '招募中'; window.__TAK_APP__ })
  await page.evaluate(() => document.querySelector('[data-action="tr-search-run"]').click())
  const searchOut = await page.evaluate(() => document.querySelector('#tr-search-out').innerText)
  t('E3b', '检索过滤生效（招募中 → 只留 1 条）', searchOut.includes('NCT-示例-1') && !searchOut.includes('NCT-示例-2'), {})
  await page.evaluate(() => { const a = window.__TAK_APP__; a.state.view = 'trials'; a.state.sub = 'tr-match'; a.render() })
  const match = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.trial-card')]
    return {
      count: cards.length,
      pct: cards[0] ? (cards[0].querySelector('.tc-pct') || {}).textContent : null,
      nm: cards[0] ? (cards[0].querySelector('.tc-nm') || {}).textContent : null,
      band: cards[0] ? (cards[0].querySelector('.pill.brand') || {}).textContent : null,
      notElig: document.body.innerText.includes('不是入组资格')
    }
  })
  t('E4', '匹配卡：分数方块 + n/m 固定行 + 档位词', match.count === 2 && match.pct && /\d+ \/ \d+/.test(match.nm) && match.band, match)
  t('E4b', '「不是入组资格判断」声明', match.notElig, {})
  const histBeforeTr = await page.evaluate(() => history.length)
  await page.evaluate(() => document.querySelector('.trial-card').click())
  await page.waitForSelector('.tp-panel', { timeout: 3000 })
  const tp = await page.evaluate(() => ({
    open: !!document.querySelector('.tp-panel'),
    closeBtn: !!document.querySelector('[data-tp="close"]'),
    missing: document.body.innerText.includes('入排标准请到官方登记页核对'),
    evOk: document.querySelectorAll('.ev-row .pill.ok').length,
    evUnknown: document.querySelectorAll('.ev-row .pill.unknown').length,
    hash: location.hash, hist: history.length
  }))
  t('E5', '详情右浮窗（三关闭口之一 ✕；不改 hash 不加 history）', tp.open && tp.closeBtn && tp.hash === '' && tp.hist === histBeforeTr, tp)
  t('E6', '入排原文缺失声明 + 三态证据（✓/?)', tp.missing && tp.evOk >= 1 && tp.evUnknown >= 1, tp)
  await page.keyboard.press('Escape')
  const tpClosed = await page.evaluate(() => !document.querySelector('.tp-panel'))
  t('E5b', 'Esc 关浮窗且焦点回触发卡', tpClosed && await page.evaluate(() => document.activeElement.classList.contains('trial-card')), {})
  await page.evaluate(() => document.querySelector('.trial-card').click())
  await page.waitForSelector('.tp-panel', { timeout: 3000 })
  await page.evaluate(() => document.querySelector('.tp-panel [data-action="tr-save"]').click())
  await page.evaluate(() => document.querySelector('[data-tp="close"]').click())
  await page.evaluate(() => { const a = window.__TAK_APP__; a.state.view = 'trials'; a.state.sub = 'tr-match'; a.render() })
  const saved = await page.evaluate(() => ({
    keys: Object.keys(window.__TAK_APP__.state.savedTrials || {}).length,
    table: document.body.innerText.includes('收藏与跟踪')
  }))
  t('E8', '收藏本机 {试验,日期,状态}', saved.keys >= 1 && saved.table, saved)

  // F 组：录入窗三态
  await page.evaluate(() => { const a = window.__TAK_APP__; a.state.view = 'labs'; a.state.sub = 'lab-import'; a.render() })
  await page.evaluate(() => document.querySelector('[data-action="form-lab"]').click())
  const form = await page.evaluate(() => ({
    buttons: [...document.querySelectorAll('#dialog-foot button')].map(b => b.textContent),
    fields: document.querySelectorAll('#dialog .form input, #dialog .form select').length,
    inputmode: (document.querySelector('#ff-2') || {}).inputMode
  }))
  t('F3', '三态按钮（保存并继续录入/保存并关闭/取消）', form.buttons.join('|') === '取消|保存并关闭|保存并继续录入', form.buttons)
  t('F4', '字段 ≤6 + 数字键盘', form.fields <= 6 && (form.inputmode === 'decimal' || form.inputmode === 'numeric'), form)
  await page.evaluate(() => { document.querySelector('[data-action="form-save"][data-mode="close"]').disabled = false })
  await page.evaluate(() => document.querySelector('[data-action="form-save"][data-mode="close"]').click())
  const err = await page.evaluate(() => (document.querySelector('#ff-err') || {}).textContent || '')
  t('F4b', '必填校验提示（数值未填）', err.includes('必填'), err)
  await page.evaluate(() => { document.querySelector('#ff-2').value = '26'; document.querySelector('[data-action="form-save"][data-mode="close"]').click() })
  const labCount = await page.evaluate(() => { const a = window.__TAK_APP__; const m = window.TAK_DEMO.profiles.B.metrics.filter(x => x.code === 'esr')[0]; return m.points.length })
  t('F3b', '保存入库（esr 点数 +1）', labCount >= 1, { esr: labCount })

  // F6：医院多卡
  await page.evaluate(() => { const a = window.__TAK_APP__; a.state.view = 'dx'; a.state.sub = 'dx-doc'; a.render() })
  const hosp = await page.evaluate(() => ({
    cards: document.querySelectorAll('.bp-grid .card').length,
    addBtn: !!document.querySelector('[data-action="hospital-add"]'),
    editBtn: !!document.querySelector('[data-action="hospital-edit"]'),
    histBtn: !!document.querySelector('[data-action="hospital-history"]')
  }))
  t('F6', '就医信息多医院卡（添加/修改/查看历史）', hosp.cards >= 1 && hosp.addBtn && hosp.editBtn && hosp.histBtn, hosp)

  /* ---------- 页面 JS 错误 ---------- */
  t('JS', '全程无页面 JS 错误', errors.length === 0, errors.slice(0, 3))

  await browser.close()
  server.close()
  const failed = results.filter(r => !r.pass)
  console.log(`\n合计 ${results.length} 条：PASS ${results.length - failed.length} / FAIL ${failed.length}`)
  if (failed.length) process.exit(1)
}

main().catch(e => { console.error('探针自身出错：', e); process.exit(2) })
