# DEV-PLAN · 小弓宝 ArchPal 大动脉炎工作台（品牌占位）

版本：0.1.0 ｜ 创建：2026-11-05 夜班 ｜ 模式：无人值守夜间（不提问、不停等，默认值进 DEV-REQUIREMENTS §五）
认领：Issue #59（claimed 标签 2026-11-05 01:38 机器人确认）｜ 仓：github.com/xyb-openharness-dsh-plugins/takayasu-workbench（private）

## 一、选病种理由（自动领取，按 BACKLOG §4.2）

1. **T1 + 🔥 优先招募且无人认领**：BACKLOG §2.2 #76 大动脉炎（页 454）是 R2 非肿瘤线仅剩的 🔥 优先招募未认领项（白塞病已由 #56 开发中、大动脉炎 issue/仓库双实查 2026-11-05 01:36 均不存在）。
2. **随访天然结构化**：ESR/CRP 周期化验、四肢血压成对测量、CTA/MRA/血管超声影像随访、激素/免疫抑制剂剂量阶梯、并发症筛查节奏——全部天然表格化，符合 R2「确诊档案 + 功能与日常 + 并发症筛查 + 医保与资源」形态。
3. **与已有仓差异化明显**：38 个已启动仓中无大血管炎病种；ANCA（小血管炎）仅 v0.1.0 脚手架。本仓以「受累血管节段图谱 + 四肢血压成对差值 + 活动期—稳定期」三维度区分。
4. **非肿瘤红线适配**：无肿瘤分期/线序/疗效语义；用「活动期—稳定期 + 受累血管 + 随访节律」表达，遵守夜班提示词 §1.3 替换表。

## 二、里程碑与闸口

| 阶段 | 内容 | 闸口 |
| --- | --- | --- |
| M0 | 认领四步 + 文档九件 + 基线 check staticPass=true | — |
| M1 | 三路并行调研（医学约束/用户研究/家族对比）→ DIFF-MATRIX 重名率实测 ≤70%、SPEC、USER-RESEARCH、INTERACTION-DESIGN（28 号 IP1） | G1 |
| M2 | demo 构建器两套档案 + prototypes/v0.2 四件套 + 独立评审 P0 清零 + README 截图 ≥4 | G2 |
| M3 | schema/0001_initial.sql + freeze-contract sha256 + 判读列断言 | G3 |
| M4 | scripts/fetch-takayasu-trials-2026.mjs（四在线通道）→ research/ 四件套 | — |
| M5 | 七步移植 + MinerU 六部件 + apiBase 契约 + test 五套 + check 全绿 | V1 |
| M6 | pack → 06 号四要素 → profile 装机 → 真机走查 + 截图 | V2/V3 |
| M7 | tag + release + CHANGELOG 发版段（**冻结：只备草稿 docs/release-draft/**） | — |
| M8 | BACKLOG 状态行回填 PR（**冻结：只备草稿**） | — |
| M9 | 经验收敛回流 starter + 下一轮直接受益项 ≥1 | — |

## 三、参考基准（第 3 节第 2 步，写死）

- **移植样板（客户端链路底本）**：cervical-workbench（prototypes/v0.2 四件套 + src→build→lib 链路）。
- **成熟对比基准（26 号口径）**：breast-cancer-workbench/prototypes/v0.4（首页 hero、五 Tab、分类眉题、最近值/差值/次数/来源卡、最近报告表）。
- **结构基准（小橙宝）**：aml-workbench/prototypes/v0.2 #mind/mind-burden（导航分组、生活影响线、事件泳道）。
- 只抄结构与元素体系，不抄病种语义（宫颈癌分期/HPV/SCC-Ag 与 AML 粒缺/MRD/Day+N 均不得出现）。

## 四、无人值守执行规则

- 时间盒 23:00–08:00；到期停止开新里程碑，完成当前原子步骤即收尾。
- 额度/鉴权/套餐类错误同一处最多重试 2 次，仍失败立即停跑写报告。
- 每闸口写 docs/signoffs/<闸口>-自动签认.md，结论只许「自动签认通过（待晨审追认）」「返工」「停闸」。
- M7/M8 对外动作冻结：只备草稿 docs/release-draft/，不 tag 不 push PR。
- 收尾写 MORNING-REVIEW.md 六节。
- 模型：仅免费档 glm flash（会话默认模型），不调用任何付费模型。

## 五、风险与已知限制

- 0 患者访谈、0 临床审核：全部场景为假设，文档显式标注。
- 《86 个罕见病病种诊疗指南（2025 年版）》原件未取得：证据台账按「未取得原件，据二次来源」标注。
- ITAS2012 等活动度评分只作「医生原文 + 待核」占位，不做自动判定。
- 离线试验语料只有胰腺癌：TAK 走四在线通道，失败如实记 FAILED 不写零结果。
