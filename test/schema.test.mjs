/* schema 冻结合同测试（G3）：内存建库 + 判读列断言 + 通用约定断言
 * 铁律：先证明被测对象非空，再断言相等。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SQL = readFileSync(join(ROOT, 'schema/0001_initial.sql'), 'utf-8')
const BANNED = /diagnosis|risk_level|activity_score|severity|stenosis_grade|flare_flag|remission_flag|relapse|eligible|verdict|recommend/i

function build() {
  const db = new DatabaseSync(':memory:')
  db.exec(SQL)
  return db
}

test('schema: 20 tables build in memory', () => {
  const db = build()
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all()
  assert.equal(tables.length, 20, `期望 20 表，实得 ${tables.length}`)
})

test('schema: 判读列断言（全表全列 0 命中）', () => {
  const db = build()
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name)
  const hits = []
  for (const t of tables) {
    for (const c of db.prepare(`PRAGMA table_info(${t})`).all()) {
      if (BANNED.test(c.name)) hits.push(`${t}.${c.name}`)
    }
  }
  assert.deepEqual(hits, [], `发现判读列：${hits.join(', ')}`)
})

test('schema: 通用约定（in_use/revision/visibility/author_role/date_precision 存在于事实表）', () => {
  const db = build()
  for (const t of ['metric_point', 'medication', 'event', 'vessel_record', 'bp_pair', 'document', 'screening_item']) {
    const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name)
    for (const need of ['in_use', 'revision', 'visibility', 'author_role']) {
      assert.ok(cols.includes(need), `${t} 缺 ${need}`)
    }
  }
  const dpc = db.prepare("SELECT sql FROM sqlite_master WHERE name='event'").get().sql
  assert.ok(/date_precision/.test(dpc), 'event 缺 date_precision（未知日期显式口径）')
})

test('schema: 血压成对列独立且可空（K5 显式 null）', () => {
  const db = build()
  const cols = db.prepare("SELECT sql FROM sqlite_master WHERE name='bp_pair'").get().sql
  for (const c of ['arm_l_sys', 'arm_r_sys', 'ankle_l_sys', 'ankle_r_sys']) {
    assert.ok(new RegExp(c).test(cols), `bp_pair 缺 ${c}`)
    assert.ok(!new RegExp(`${c} NOT NULL`).test(cols), `${c} 不应 NOT NULL（缺测=显式 null）`)
  }
})

test('schema: feeling_note 默认私密（K6）', () => {
  const db = build()
  const sql = db.prepare("SELECT sql FROM sqlite_master WHERE name='feeling_note'").get().sql
  assert.ok(/DEFAULT 'private'/.test(sql), 'feeling_note.visibility 应 DEFAULT private')
})

test('schema: freeze-contract sha256 与 0001_initial.sql 一致', () => {
  const sha = createHash('sha256').update(SQL).digest('hex')
  const doc = readFileSync(join(ROOT, 'schema/freeze-contract.md'), 'utf-8')
  assert.ok(doc.includes(sha), `freeze-contract.md 未包含当前 sha256 ${sha}——冻结被破坏或忘更新`)
})
