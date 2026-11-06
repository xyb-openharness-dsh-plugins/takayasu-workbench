/* 部署态 AI 行为探针（34 号 / Q14–Q19 部署面）：
 * 用外层页面包住 public/（模拟宿主外壳 iframe），断言：
 *   H1 部署态本地演示坞移除（AI 由宿主原生面板承载，无重复 AI UI）
 *   H2 顶栏「AI 对话」→ postMessage {type:'takayasu:agent-open'}
 *   H3 「和 AI 讨论本页」→ postMessage {type:'takayasu:agent-draft', send:false}（只填不发）
 *   H4 「模拟回复自检」演示按钮不在部署包
 *   H5 独立打开（非 iframe）→ 演示坞保留（Q16 降级路径）
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, normalize, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let PORT = 0
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }
const server = createServer(async (req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (pathname.startsWith('/blocked-primer/')) {
    pathname = pathname.replace('/blocked-primer/', '/')
    if (pathname.endsWith('primer.js')) { res.writeHead(404); res.end(); return }
  }
  if (pathname === '/hosted-wrap.html') {
    const html = `<!doctype html><html><body><iframe id="wb" src="/public/index.html" style="width:1200px;height:800px"></iframe>
<script>window.__MSGS__=[];window.addEventListener('message',function(e){window.__MSGS__.push({type:e.data&&e.data.type,send:e.data&&e.data.send,prompt:e.data&&e.data.prompt})})</script>
</body></html>`
    res.writeHead(200, { 'content-type': 'text/html' })
    res.end(html)
    return
  }
  try {
    const f = normalize(join(ROOT, pathname))
    const b = await readFile(f)
    let out = b.toString('utf-8')
    if (extname(f) === '.html' || extname(f) === '.js') {
      out = out.replace(/__API_BASE__/g, '/api/takayasu').replace(/__VERSION_DISPLAY__/g, 'v0.3.4').replace(/__VERSION__/g, '0.3.4').replace(/__BUILD_DATE__/g, '2026-11-06')
    }
    res.writeHead(200, { 'content-type': MIME[extname(f)] || 'text/plain' })
    res.end(out)
  } catch { res.writeHead(404); res.end() }
})

const results = []
function t(id, desc, pass, detail) {
  results.push(pass)
  console.log((pass ? 'PASS ' : 'FAIL ') + id + '  ' + desc + (detail !== undefined ? '  — ' + JSON.stringify(detail).slice(0, 180) : ''))
}

server.listen(0, async () => {
  PORT = server.address().port
  const require2 = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')
  const puppeteer = require2('puppeteer-core')
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  const errs = []
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  await page.goto(`http://127.0.0.1:${PORT}/hosted-wrap.html`, { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1500))
  const probe1 = await page.evaluate(() => {
    const f = document.querySelector('#wb')
    return { hasFrame: !!f, cw: !!f.contentWindow, app: !!f.contentWindow.__TAK_APP__, ready: f.contentDocument.readyState, src: f.src }
  })
  console.log('iframe probe:', JSON.stringify(probe1), 'errors:', errs.slice(0, 2))

  const h1 = await page.evaluate(() => {
    const d = document.querySelector('#wb').contentDocument
    return { dock: !!d.getElementById('agent-dock'), demoBtn: d.body.innerText.includes('模拟回复自检') }
  })
  t('H1', '部署态本地演示坞已移除（无重复 AI UI）', !h1.dock, h1)
  t('H4', '「模拟回复自检」不在部署包', !h1.demoBtn, h1)

  await page.evaluate(() => { const d = document.querySelector('#wb').contentDocument; d.querySelector('[data-action="agent"]').click() })
  await new Promise(r => setTimeout(r, 300))
  const h2 = await page.evaluate(() => (window.__MSGS__ || []).filter(m => m.type === 'takayasu:agent-open').length)
  t('H2', '顶栏「AI 对话」→ takayasu:agent-open 给宿主', h2 === 1, { count: h2 })

  await page.evaluate(() => { const d = document.querySelector('#wb').contentDocument; const b = d.querySelector('[data-action="agent-hint"]'); b.click() })
  await new Promise(r => setTimeout(r, 300))
  const h3 = await page.evaluate(() => (window.__MSGS__ || []).filter(m => m.type === 'takayasu:agent-draft'))
  t('H3', '「和 AI 讨论」→ agent-draft（send:false 只填不发）', h3.length === 1 && h3[0].send === false && (h3[0].prompt || '').length > 20, h3[0] || {})
  t('Q19', '草稿 prompt 无判定词（诊断/分级/预后）', h3.length === 1 && !/诊断|分级|预后/.test((h3[0].prompt || '').split('请基于')[0]), {})

  // H5：独立打开降级路径（非 iframe）——演示坞保留
  const p2 = await browser.newPage()
  await p2.setViewport({ width: 1280, height: 900 })
  await p2.goto(`http://127.0.0.1:${PORT}/public/index.html`, { waitUntil: 'networkidle0' })
  await p2.waitForFunction(() => window.__TAK_APP__, { timeout: 8000 })
  const h5 = await p2.evaluate(() => ({ dock: !!document.getElementById('agent-dock') }))
  t('H5', '独立打开保留演示坞（Q16 降级）', h5.dock, h5)

  // H6：正常路径无双开（overlay 打开，dialog 未开）
  await page.evaluate(() => { const d = document.querySelector('#wb').contentDocument; const b = [...d.querySelectorAll('[data-action]')].find(x => x.getAttribute('data-action') === 'primer-open-soft'); b.click() })
  await new Promise(r => setTimeout(r, 500))
  const h6 = await page.evaluate(() => {
    const d = document.querySelector('#wb').contentDocument
    const over = d.querySelector('.dp-overlay')
    return { overlayOpen: !!over && !over.hidden, dialogOpen: !!(d.querySelector('dialog') && d.querySelector('dialog').open), sectionsInOverlay: d.querySelectorAll('.dp-section').length }
  })
  t('H6', '正常路径：primer 覆盖层打开且兜底 dialog 不双开', h6.overlayOpen && !h6.dialogOpen && h6.sectionsInOverlay === 4, h6)

  // H7：primer.js 被阻断时，hero 按钮仍能打开兜底 dialog（4 段）
  await page.goto(`http://127.0.0.1:${PORT}/blocked-primer/public/index.html`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.__TAK_APP__, { timeout: 8000 })
  await page.evaluate(() => { const b = [...document.querySelectorAll('[data-action]')].find(x => x.getAttribute('data-action') === 'primer-open-soft'); b.click() })
  await new Promise(r => setTimeout(r, 500))
  const h7 = await page.evaluate(() => {
    const dlg = document.querySelector('dialog')
    return { dialogOpen: !!(dlg && dlg.open), sections: document.querySelectorAll('.dp-section').length, title: dlg ? dlg.querySelector('#dialog-title').textContent : '' }
  })
  t('H7', 'primer.js 失效时兜底 dialog 打开（4 段全渲染）', h7.dialogOpen && h7.sections === 4, { sections: h7.sections, title: h7.title })

  await browser.close()
  server.close()
  const failed = results.filter(x => !x).length
  console.log(`\n合计 ${results.length} 条：PASS ${results.length - failed} / FAIL ${failed}`)
  process.exit(failed ? 1 : 0)
})
