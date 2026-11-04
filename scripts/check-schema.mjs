/* 判读列断言（G3 落进 check 链）：schema/0001_initial.sql 全表全列扫描禁用判定列名
 * 同时校验 freeze-contract.md 的 sha256 与文件一致（改包必升版/改 schema 必更新冻结）
 */
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = process.argv[2] ? resolve(process.argv[2]) : ROOT
const sqlPath = join(target, 'schema/0001_initial.sql')
if (!existsSync(sqlPath)) { console.log(JSON.stringify({ check: 'schema', skip: 'no schema dir yet' })); process.exit(0) }
const sql = readFileSync(sqlPath, 'utf-8')
const BANNED = /diagnosis|risk_level|activity_score|severity|stenosis_grade|flare_flag|remission_flag|relapse|eligible|verdict|recommend/i
const db = new DatabaseSync(':memory:')
db.exec(sql)
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name)
const hits = []
for (const t of tables) for (const c of db.prepare(`PRAGMA table_info(${t})`).all()) if (BANNED.test(c.name)) hits.push(`${t}.${c.name}`)
const sha = createHash('sha256').update(readFileSync(join(target, 'schema/0001_initial.sql'))).digest('hex')
const freezePath = join(target, 'schema/freeze-contract.md')
const freezeOk = existsSync(freezePath) && readFileSync(freezePath, 'utf-8').includes(sha)
const pass = hits.length === 0 && tables.length >= 15 && freezeOk
console.log(JSON.stringify({ check: 'schema', tables: tables.length, judgementHits: hits, sha256: sha.slice(0, 16) + '…', freezeOk, pass }))
process.exit(pass ? 0 : 1)
