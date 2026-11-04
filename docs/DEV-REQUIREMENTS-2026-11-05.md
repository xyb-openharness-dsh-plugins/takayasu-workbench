# DEV-REQUIREMENTS · 硬性要求清单（2026-11-05 版，每条可被命令或截图验证）

> 通用清单见 docs/DEV-REQUIREMENTS.md；本文件是当日可执行版。`npm run check` 全绿 = 以下断言全部机器验证。

| # | 硬约束 | 验证方式 | 状态 |
| --- | --- | --- | --- |
| D1 | 判读列 0 命中（diagnosis/risk_level/activity_score/severity/stenosis_grade…） | `node scripts/check-schema.mjs`（check 链内） | ✅ |
| D2 | schema 冻结 sha256 一致（改 0001 必破坏冻结） | test/schema.test.mjs + check-schema.mjs | ✅ |
| D3 | 演示唯一源 parity：readBootstrap ≡ demo-data（canonical JSON） | test/demo-parity.test.mjs | ✅ |
| D4 | 原型 → public/ 定点移植逐字符（ui-parity） | `node scripts/migrate-public.mjs --check`（check 链内） | ✅ |
| D5 | 版本十处同源（VERSION/package/lib/version/页面字面量/CHANGELOG…） | build-version --check + check-version-literal（check 链内） | ✅ |
| D6 | apiBase 交界守卫：宿主注入字符串字面量、禁 window.__API_BASE__、双形态 | check-public-tokens + test/api-base.test.mjs | ✅ |
| D7 | 文案红线（禁词：诊断你/自动判定/不可恢复…） | check-wording.mjs（check 链内） | ✅ |
| D8 | 非肿瘤禁词（分期/线序/疗效/预后/生存期/MRD/粒缺/血浆置换） | probe-tak-m2 + 独立评审 grep（G2 记录） | ✅ |
| D9 | 原型 32 条真实浏览器断言 | `node scripts/probe-tak-m2.mjs` | ✅ 32/32 |
| D10 | 疾病概要四段+来源行（36 号家族契约） | probe-disease-primer 10/10 | ✅ |
| D11 | 试验快照一致性（manifest=jsonl=sqlite） | check-trial-snapshot（check 链内） | ✅ |
| D12 | MinerU：Token 文件优先/env 兜底、可手工保存、.secrets 忽略、未配置如实 needsSetup | dsh/mineru.js + audit mineru/* 组 | ✅ |
| D13 | 隐私三出口一致（导出/AI 上下文/摘要预览共用 filterPrivate） | probe-tak-m2 Q35a + 代码级评审（G2） | ✅ |

0 患者访谈、0 临床审核：以上全部为**信息整理层**约束，不含任何医学判定启用。
