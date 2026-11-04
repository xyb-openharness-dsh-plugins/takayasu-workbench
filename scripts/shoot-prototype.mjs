/* 原型实渲截图（33 号：文件名含版本，一张图一个功能）
 * 用法：node scripts/shoot-prototype.mjs
 * 输出：docs/screenshots/v<version>-<name>.png
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import { join, extname, normalize, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'docs', 'screenshots')
const PORT = 8147
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }
const VERSION = 'v0.3.0'

const server = createServer(async (req, res) => {
  try {
    const f = normalize(join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)))
    const b = await readFile(f)
    res.writeHead(200, { 'content-type': MIME[extname(f)] || 'text/plain' })
    res.end(b)
  } catch { res.writeHead(404); res.end() }
})

async function main() {
  mkdirSync(OUT, { recursive: true })
  await new Promise(r => server.listen(PORT, r))
  const require2 = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')
  const puppeteer = require2('puppeteer-core')
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=2']
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 860, deviceScaleFactor: 2 })
  await page.goto(`http://127.0.0.1:${PORT}/prototypes/v0.2/index.html`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.__TAK_APP__ && document.querySelectorAll('#nav button').length >= 12, { timeout: 5000 })
  await new Promise(r => setTimeout(r, 500))

  const app = (fn) => page.evaluate(fn)
  const shot = async (name) => {
    await new Promise(r => setTimeout(r, 350))
    const file = join(OUT, `${VERSION}-${name}.png`)
    await page.screenshot({ path: file })
    console.log('shot:', file)
  }

  // 1. 看板（A 档案刚确诊）
  await app(() => { const a = window.__TAK_APP__; a.state.profile = 'A'; a.state.view = 'dashboard'; a.state.sub = null; a.render() })
  await shot('dashboard-A')

  // 2. 指标卡（B 档案，labs 页，含正面完整字段）
  await app(() => { const a = window.__TAK_APP__; a.state.profile = 'B'; a.state.view = 'labs'; a.state.sub = 'lab-trend'; a.render() })
  await shot('metric-cards-B')

  // 3. 指标卡翻转背面（折线）
  await app(() => {
    const cards = [...document.querySelectorAll('.mcard')]
    cards[0].focus(); cards[0].click()
  })
  await shot('metric-card-flipped-B')

  // 4. 受累血管图谱
  await app(() => { const a = window.__TAK_APP__; a.state.view = 'vessels'; a.state.sub = 'v-map'; a.render() })
  await shot('vessel-map-B')

  // 5. 四肢血压成对
  await app(() => { const a = window.__TAK_APP__; a.state.view = 'vessels'; a.state.sub = 'v-bp'; a.render() })
  await shot('bp-pairs-B')

  // 6. 一图秀
  await app(() => { const a = window.__TAK_APP__; a.state.view = 'chart'; a.state.sub = 'ch-trend'; a.state.sel = ['esr', 'crp']; a.render() })
  await shot('one-chart-B')

  // 7. 折叠卡收/展两态（dx-vessel 血管记录）
  await app(() => { const a = window.__TAK_APP__; a.state.view = 'dx'; a.state.sub = 'dx-vessel'; a.render() })
  await app(() => { document.querySelectorAll('details.phase-fold').forEach(d => { d.open = false }) })
  await shot('fold-closed-dxvessel-B')
  await app(() => {
    const ds = document.querySelectorAll('details.phase-fold')
    ds.forEach(d => { d.open = true })
  })
  await shot('fold-open-dxvessel-B')

  // 8. 用药与减量（阶梯图）
  await app(() => { const a = window.__TAK_APP__; a.state.view = 'meds'; a.state.sub = 'med-gluc'; a.render() })
  await shot('meds-taper-B')

  // 8b. 设置三 tab（C 组）
  await page.evaluate(() => { const a = window.__TAK_APP__; a.state.view = 'dashboard'; a.render(); document.querySelector('[data-action="settings"]').click() })
  await new Promise(r => setTimeout(r, 400))
  await page.screenshot({ path: join(OUT, `${VERSION}-settings.png`) })
  console.log('shot: settings')
  await page.keyboard.press('Escape')
  // 8c. 临床研究匹配卡（E 组）
  await page.evaluate(() => { const a = window.__TAK_APP__; a.state.view = 'trials'; a.state.sub = 'tr-match'; a.render() })
  await new Promise(r => setTimeout(r, 350))
  await page.screenshot({ path: join(OUT, `${VERSION}-trials-match.png`) })
  console.log('shot: trials-match')

  // 9. 疾病概要整页（P 组）
  await app(() => { const t = document.querySelector('[data-primer-open]'); t.focus(); t.click() })
  await new Promise(r => setTimeout(r, 600))
  await shot('disease-primer-open')
  await page.keyboard.press('Escape')

  // 10. AI 面板（草稿未发送）
  await app(() => { const a = window.__TAK_APP__; a.state.view = 'dashboard'; a.state.sub = null; a.render() })
  await app(() => { const b = document.querySelector('[data-action="agent-hint"]'); b.focus(); b.click() })
  await new Promise(r => setTimeout(r, 400))
  await shot('ai-draft-dashboard')

  await browser.close()
  server.close()
  console.log('done')
}

main().catch(e => { console.error(e); process.exit(1) })
