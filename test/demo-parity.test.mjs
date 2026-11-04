/* 演示唯一源 parity 测试：readBootstrap（db）与 demo-data.js 形状一致
 * 口径：canonical JSON（递归删除 null/undefined 键后逐字节比对）——demo-data 手写数据
 * 允许可选键缺省与显式 null 两种写法，读模型输出固定键集（null 显式），两边语义等价。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical).filter((x) => x !== undefined)
  if (v && typeof v === 'object') {
    const out = {}
    for (const k of Object.keys(v)) {
      const c = canonical(v[k])
      if (c !== null && c !== undefined) out[k] = c
    }
    return out
  }
  return v
}

function loadDemo() {
  return new Function('window', readFileSync(join(ROOT, 'prototypes/v0.2/demo-data.js'), 'utf-8') + '; return window.TAK_DEMO;')({})
}

function bootFromDb() {
  const db = new DatabaseSync(':memory:')
  const dir = join(ROOT, 'schema')
  for (const f of readdirSync(dir).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort()) {
    db.exec(readFileSync(join(dir, f), 'utf-8'))
  }
  return import(join(ROOT, 'dsh/readmodels.js')).then(async (rm) => {
    const demo = await import(join(ROOT, 'dsh/demo.js'))
    demo.seedDemoData(db)
    return rm.readBootstrap(db)
  })
}

test('parity: segments 与 metricDefs 与 demo-data 逐字节一致', async () => {
  const [b, demo] = await Promise.all([bootFromDb(), Promise.resolve(loadDemo())])
  assert.equal(b.segments.length, demo.segments.length)
  assert.deepEqual(canonical(b.segments), canonical(demo.segments))
  assert.equal(b.metricDefs.length, demo.metricDefs.length)
  assert.deepEqual(canonical(b.metricDefs), canonical(demo.metricDefs))
})

test('parity: A/B 档案全部字段 canonical 一致（先证两边非空）', async () => {
  const [b, demo] = await Promise.all([bootFromDb(), Promise.resolve(loadDemo())])
  for (const k of Object.keys(demo.profiles)) {
    const a = b.profiles[k], e = demo.profiles[k]
    assert.ok(a && e, `档案 ${k} 两边都存在`)
    const fields = Object.keys(e)
    assert.ok(fields.length >= 20, `档案 ${k} 参照字段数 ${fields.length}`)
    const diffs = []
    for (const f of fields) {
      if (JSON.stringify(canonical(a[f])) !== JSON.stringify(canonical(e[f]))) diffs.push(f)
    }
    assert.deepEqual(diffs, [], `档案 ${k} 字段差异：${diffs.join(', ')}`)
  }
})

test('parity: 空库与有库行为（播种幂等）', async () => {
  const db = new DatabaseSync(':memory:')
  const { readdirSync } = await import('node:fs')
  const dir = join(ROOT, 'schema')
  for (const f of readdirSync(dir).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort()) {
    db.exec(readFileSync(join(dir, f), 'utf-8'))
  }
  const demo = await import(join(ROOT, 'dsh/demo.js'))
  const r1 = demo.seedDemoData(db)
  const r2 = demo.seedDemoData(db)
  assert.equal(r1.skipped, false)
  assert.equal(r2.skipped, true)
  assert.equal(r2.profiles, 2)
})
