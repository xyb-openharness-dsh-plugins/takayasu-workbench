# research/takayasu · TAK 临床试验快照（M4）

- 快照日期：2026-11-05 ｜ 工具：unified-trial-mcp（MCP stdio，唯一入口，绝不手拼 URL）
- 采集脚本：`scripts/fetch-takayasu-trials-2026.mjs`（检索词：大动脉炎 / takayasu arteritis / Takayasu / 大血管炎 / 多发性大动脉炎，limit 200/来源）
- **记录数：104**（合并前 104；合并规则=同一登记号才合并）：ictrp 103 + chinadrugtrials 1

## 四件套

| 文件 | 说明 |
| --- | --- |
| manifest.json | 采集口径、来源终态、sha256、诚实声明 |
| trials-2026.jsonl | 104 行，每行一条登记记录（statusNote=「登记状态，未核实」） |
| takayasu_trials_2026.sqlite | trials 表 104 行 + source_statuses 表 30 行（逐来源终态） |
| README.md | 本文件 |

## 来源终态（如实记录，未查过不写零结果）

- ictrp：3 次查询 SUCCESS（共 103 条）、2 次查询 FAILED（如实记 FAILED，非零结果）
- chinadrugtrials：1 次 SUCCESS（1 条）、其余 NO_RESULTS
- chictr_online：FAILED（服务失败，如实记录——**不能写成"无在研试验"**）
- chictr_pancreatic_archive：NEEDS_SETUP（离线语料仅胰腺癌，TAK 无覆盖，如实声明）
- ctv / xyb_chinadrugtrials_archive：NO_RESULTS

## 口径

- 登记 ≠ 有效 ≠ 安全 ≠ 可入组；所有状态一律「登记状态，未核实」。
- 与 ClinicalTrials.gov API 实查（2026-11-05，docs/CLINICAL-DATA.md C10）交叉验证：78 项注册 / 27 活跃 / 中国站点 25（活跃 9）——本快照 104 条为「登记记录条数」口径（含各来源重复，同登记号才合并），两口径并列不混用。
- 无匹配指数、无判读列；是否适合任何试验由医生评估。
