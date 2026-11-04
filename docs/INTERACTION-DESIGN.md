# INTERACTION-DESIGN · 交互路径设计（IP1 文档，28 号）

版本：0.1.0 ｜ 本文档即检查点清单 Q1 要求的「已签认交互路径文档」（无人值守：自动签认，待晨审追认）。

## 一、一级导航（12 页，PAGES 注册表唯一来源）

| key | 名称 | 图标 | R2 形态归属 |
| --- | --- | --- | --- |
| dashboard | 看板 | home | 总览 |
| dx | 确诊档案 | dx | 确诊档案 |
| vessels | 受累血管 | vessel | 差异化主打 |
| labs | 检查与指标 | report | 随访结构化 |
| meds | 用药与减量 | pill | 随访结构化 |
| review | 复诊与筛查 | calendar | 并发症筛查节奏 |
| preg | 生育与妊娠 | flower | 人群特有 |
| life | 功能与生活 | leaf | 功能与日常 |
| mind | 心理与家庭 | heart | 心理支持 |
| chart | 病情一图秀 | chart | 跨线视图 |
| trials | 临床研究 | flask | 35 号链路 |
| docs | 资料库 | folder | 通用 |

## 二、二级页签（SUBPAGES，逐字=入口名=渲染文案）

| 一级 | 二级（key, 名称） |
| --- | --- |
| dx | dx-doc 确诊经过与依据 ｜ dx-vessel 报告里的血管 ｜ dx-imaging 影像复查 ｜ dx-mdt 会诊与二次意见 |
| vessels | v-map 受累血管图谱 ｜ v-bp 四肢血压 ｜ v-event 血管事件 |
| labs | lab-trend 炎症指标 ｜ lab-cbc 血常规 ｜ lab-import 待核对候选 |
| meds | med-gluc 糖皮质激素 ｜ med-imm 免疫抑制剂 ｜ med-note 用药说明与医嘱 |
| review | review-rhythm 复查节奏 ｜ review-screen 并发症筛查 ｜ review-prep 就诊准备 |
| preg | preg-list 孕前问题清单 ｜ preg-track 妊娠随访记录 |
| life | life-func 功能与疲劳 ｜ life-daily 日常生活记录 |
| mind | mind-feel 当下感受（默认私密） ｜ mind-burden 家庭负担与照护者 |
| chart | ch-trend 数值曲线 ｜ ch-event 分类与事件 ｜ ch-caliber 数据口径 |
| trials | tr-facts 建档 ｜ tr-search 检索 ｜ tr-match 候选线索 |
| docs | docs-lib 资料库与导入 ｜ docs-cand 整理草稿与核对 ｜ docs-prep 导出与副本 |

（dashboard 无二级；合计二级 29 个。）

## 三、全局交互约定（X 组）

1. 每条路径：入口名逐字 → 步骤 → 可观察产物 → 一步回首页（顶栏返回或 Esc）。
2. 整页视图（32 号）：超 1.5 屏开整页；Esc/返回键一层一退；关闭焦点回触发者；history 是唯一真源。
3. AI 入口：顶栏顺序 资料目录 → AI 对话 → 设置 → 大字 → ? → 版本；每页一处「和 AI 讨论」携带本页上下文（无判定词）；一键发送走 takayasu:agent-draft postMessage。
4. 折叠卡（32 号）：details.phase-fold 原生语义；非肿瘤不套疗程编号，按「一次调药/一次就诊/一次影像」分组。
5. 指标卡（24 号/MT 组）：固定高 194px 3D 翻转；正面 类别/名/值/单位/日期/次数/来源；背面 sparkline；差值只写「较上次」。
6. 一图秀（16 号/C 组）：每序列按全期 min/max 归一化并标「不可比」；单点不连线；空窗口有文案；时间窗联动；390 宽无溢出。
7. 疾病概要（36 号/P 组）：整页浮层四段（定义→医学资料规范和指南情况→治疗全景→发展趋势），每段来源行；非肿瘤固定出口「按受累器官与病情轻重排列」+ 两句登记口径。

## 四、场景↔页面双向映射（IP2 孤儿页 = 0）

| 页面 | 覆盖场景 |
| --- | --- |
| dashboard | S7（档案切换看板入口） |
| dx,doc | S1 ｜ dx,vessel → S2 ｜ dx,imaging → S9 ｜ dx,mdt → S1 补充 |
| vessels,map | S2 ｜ vessels,bp → S4 ｜ vessels,event → S2 补充 |
| labs,import → labs,trend | S3 ｜ labs,cbc → S3 |
| meds,gluc | S5 ｜ meds,imm → S5 ｜ meds,note → S5 |
| review,rhythm/screen/prep | S10/S6 ｜ preg,list/track → S11 ｜ life,func/daily → S15 ｜ mind,feel/burden → S12 |
| chart,trend/event/caliber | S3/S5 汇总视图 ｜ trials,facts/search/match → S13 ｜ docs,lib/cand/prep → S14 |
| 顶栏 ? | S8 |
| 暂缓项 | 医保与救助资源（无可靠来源，不建页） |

映射后孤儿页 0；「数量算术 ≠ 验收通过」，验收以 X2 无头逐条走通为准。
