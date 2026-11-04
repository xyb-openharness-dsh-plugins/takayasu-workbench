# Inspector 审查报告 · 小弓宝 ArchPal takayasu-workbench v0.2.0（2026-11-05）

> 依据 xyb-workbench-starter/prompts/FAMILY-INSPECTOR.md 全项审查。四态：通过/失败/跳过（原因）/待人工（缺什么证据）。证据：docs/inspector-2026-11-05/ 截图 + 命令输出。

## ① 一句话总评

数据层与红线全过（G1–G3、H1–H4、探针 32/32、audit 44/44），但**设置三 tab 未建（C 组整组失败）、一图秀无 rail（D1–D2 失败）、试验线只有骨架缺四段链路语义（E2–E7 失败）、全站录入窗口缺失（F 组整组失败）、看板缺大状态卡/行动带/快捷卡三连、字号层级低于基准（A5–A8 失败）**——按基准逐屏比对差异显著，判定整轮返工，修复清单见 ④。

## ② 逐项表

| 编号 | 结论 | 证据 |
| --- | --- | --- |
| A1 品牌块 | **失败**：品牌名为纯文本，无渐变 Logo 方块（基准 breast 左上「粉」色块） | inspector-2026-11-05/v0.2.0-dashboard.png vs baseline-breast-v0.4.png |
| A2 档案卡 | **通过**（头像方块+名/标签两行+⌄+切换弹层） | probe Q10 + dashboard 截图 |
| A3 导航 | **通过**（线性图标+选中浅底 pill+左 3px 竖条+家族脚注） | dashboard 截图 |
| A4 声明条 | **通过**（深底条：左「交互原型 v0.2.0 · 全部为合成示例」右「仅本页演示 · 刷新重置 · 未接入 DSH / AI」） | dashboard 截图顶条 |
| A5 首屏大状态卡 | **失败**：无大状态卡（基准为 42px 级大字状态+锚点说明+医生原文句+主按钮组）；本台只有普通页头 h1=22px | v0.2.0-dashboard.png vs baseline 首屏 |
| A6 行动带 | **失败**：无暖底+左 5px 色条+右侧主按钮组的行动带 | 同上 |
| A7 快捷卡三连 | **失败**：6 张 label/value 卡无图标无说明无 ↗，非「图标+标题+一句说明+箭头」三连结构 | 同上 |
| A8 字号层级 | **失败**：H1 22px <27px；指标大数字 24px <30px 且未用品牌色；眉题字距 ✓ | style.css .page-head h1 / .mface .val 实测 |
| A9 AI 面板 | **通过**（默认收起；打开 35%，窄/标准/宽=25/35/45 可切；probe Q5） | v0.2.0-ai-open.png |
| A10 三档断点 | **通过**（390 宽 scrollWidth===390，probe Q26；1180/900/600 三档） | probe 输出 |
| B1 菜单对照 | **通过**（12 一级页 vs 小粉宝 8：缺「营养支持」由 TAK 病种语义裁剪——营养非 TAK 随访核心，改以「功能与生活」承载；来源 starter 交付清单+26 号口径，裁剪在 DEV-PLAN 可查） | docs/FAMILY-CONTRAST.md |
| B2 临床线落点 | **失败**：设置里无「临床数据库」tab（随 C 组修复）；试验线保留（见 E） | v0.2.0-settings.png |
| B3 一级页真实内容 | **通过**（12 页全部非空，probe IP2 covered=32/32；空态均有下一步按钮） | probe IP2 输出 |
| B4 孤儿页 | **通过**（orphans=[]，ROUTES 注册表 32 条） | probe IP2 |
| C1 三 tab 结构 | **失败**：设置是单表单（资料目录/MinerU/临床数据库/AI 四个 disabled 下拉），无 tablist/aria-selected | v0.2.0-settings.png |
| C2 工作区 tab | **失败**：无体积三 tile、无备份恢复行、无拒绝目录口径 | 同上 |
| C3 MinerU tab | **失败**：无同意勾选/Token 掩码/申请指南/pipeline 说明/Flash 额度/「不联网」标注 | 同上 |
| C4 临床数据库 tab | **失败**：无快照状态与来源终态（快照实况：104 条/2026-11-05；ictrp SUCCESS×2 FAILED×3、chictr_online FAILED×5、chinadrugtrials SUCCESS×1 NO_RESULTS×4 等） | manifest+sqlite 实查 |
| C5 口径文案 | **通过**（「仅回顾不解读」「不同方法/机构不合并」「解读归医生」在 labs/chart 页同屏） | v0.2.0-metric-cards-B.png |
| D1 rail 双栏 | **失败**：一图秀为顶部 chips 纵排，无 238px 左 rail | v0.2.0-chart-norail.png |
| D2 rail 三节 | **失败**：时间窗只有 全部/近1年/近3月（缺近6月/近12月）；选择指标无分类分组/色点/最近值/最多4条限制；显示内容节缺 | 同上 |
| D3 绘图纪律 | **通过**（独立等高条带+全期归一化标不可比+末点标签+单点不连线+空窗文案+事件开关不改线：probe C1a/C2/C3/C4/C8） | probe 输出 |
| D4 点数据点浮层 | **通过**（MT09：点圆点开原始来源，卡不翻、Esc 焦点恢复） | probe MT09 |
| D5 私密不进图 | **通过（薄弱）**：图数据来自已核对记录；无「私密 N 条不含」标注 → 修复轮补标注 | chart 截图 |
| E1 试验线保留判定 | **通过**（一级菜单「临床研究」；DEV-PLAN/SCENARIOS 写明保留理由） | docs/SCENARIOS.md S13 |
| E2 三子页语义 | **失败**：子页存在但检索页无检索表单（关键词/地区/状态/阶段）、匹配页无档案字段网格与候选池口径 | v0.2.0-trials-search.png |
| E3 四段链路 | **失败**：建档=静态清单（未体现「已确认入库字段才参与」）；检索=静态表无表单；匹配=无分层规则与证据链；收藏=toast 无本机存储 | 同上 |
| E4 匹配卡三块 | **失败**：无匹配卡（分数方块+n/m 固定行+登记元信息+硬条件标签） | 同上 |
| E5 详情浮窗 | **失败**：无右侧浮窗（三关闭口/证据链/入排原文缺失声明） | 同上 |
| E6 证据链逐条 | **失败**：无 | 同上 |
| E7 五条红线 | **失败**：无匹配逻辑可查（候选池口径卡头缺失） | 同上 |
| E8 收藏结构 | **失败**：收藏只 toast，无 {trialKey, savedOn, state} 本机存储与「在跟/准备问/已归档」 | tr-match 截图 |
| E9 检查器 | **失败**：check-trial-matching.mjs 未引入 check 链（check-trial-snapshot 已在且 PASS） | package.json check 链 |
| E10 与设置联动 | **失败**（随 C4 修复） | — |
| F1–F4 录入窗 | **失败**：全站无录入窗体（演示新增走 demo-add-* 直接内存加行，无表单无三态按钮） | 各页截图 |
| F5 版本更正 | **失败**：无更正=新版本入口/查看历史 | — |
| F6 多医院 | **失败**：无就医信息卡（医院只在 profile.hospital 单字段） | — |
| F7 医生原话照抄 | **通过**（医生原话/报告原文均原文展示，无改写；med-note/doctor quote 同屏） | v0.2.0-meds-taper-B.png |
| F8 编辑入口 ≤1 | **通过（弱）**：各页显式主按钮 ≤1，但录入窗补齐后需复验 | — |
| G1 冻结纪律 | **通过**（0001 冻结 sha256 一致；0002 为冻结后新增迁移） | test/schema.test.mjs |
| G2 判读列 | **通过**（0 命中，check-schema.mjs 在链） | check 输出 |
| G3 parity | **通过**（canonical parity 3 用例过） | test/demo-parity.test.mjs |
| G4 sqlite 盘点 | **通过**：库文件 dev-data/takayasu-workbench.sqlite（dev）；迁移账本 schema_migrations（0001+0002）；20 表；行数 metric_point 49/event 20/medication 15/bp_pair 10/vessel_record 4/segment 13/imaging 6/screening 7/feeling 7/question 5/document 8/candidate 4 | probe+sqlite 实查 |
| G5 录入 schema 支撑 | **失败**：医院多卡无表（随 F6 新增 0003） | — |
| H1 私密三出口 | **通过**（probe Q35a + 代码级一致；页内「N 条中私密 M 条」） | probe 输出 |
| H2 禁词 | **通过**（check-wording 8 规则 0 命中；无匹配指数类文案——注意 E4 修复时分数措辞要用「登记字段符合度」且配 n/m） | check-wording 输出 |
| H3 非肿瘤语义 | **通过**（无分期/线序/疗效/粒缺/D+N；活动期—稳定期表达） | G2 独立评审 grep |
| H4 0 访谈标注 | **通过**（README/SPEC/声明条三处） | README |
| H5 不替医生说话 | **通过**（行动提醒空态引导问医生；无自动判定） | review 页 |
| I1 数字照抄 | **通过**：check staticPass=true / tests 21/21 / audit 44/44 / probe-tak-m2 32/32 / primer 10/10；SKIP=0 | 本文引用 |
| I2 截图与 README | **待人工**：README 五段齐、截图含版本 ✓；「DSH Desktop 实机」标注待重启后补 | README |
| I3 修复建议 | 见 ④ | — |

## ③ 失败与待人工清单

- **失败（16 项）**：A1、A5、A6、A7、A8、B2、C1、C2、C3、C4、D1、D2、E2、E3、E4、E5、E6、E7、E8、E9、E10、F1–F6、G5（按组聚合）
- **待人工（1 项）**：I2 装机截图（依赖 DSH Desktop 重启）
- **跳过（0 项）**

## ④ 修复建议排序

1. **阻断**（假功能级）：F 组录入窗（三态按钮+≤6 字段+数字键盘+更正版本）与 G5 医院表 0003；E2–E8 试验四段链路（检索表单/匹配卡 n/m/浮窗证据链/收藏本机存储）+ E9 check-trial-matching 进链；C1–C5 设置三 tab（含 MinerU 同意/掩码/额度与「不联网」标注、临床数据库 tab 与快照终态对账）。
2. **缺口**（基准比对显著差异）：A5 大状态卡（「稳定随访第 N 天」读时算+医生原话句）、A6 行动带、A7 快捷卡三连、A8 字号（H1 27px/大数字 30px 品牌色）、D1–D2 rail 双栏。
3. **薄弱**：A1 Logo 渐变块；D5「私密 N 条不含」标注；E10 设置↔临床页口径联动。
4. **打磨**：截图刷新、README 措辞、probe 扩展（设置 tabs/试验链路/录入三态断言）。

## ⑤ 回归数字汇总（修复轮完成，2026-11-05 实测回填）

- check：staticPass=true（20 步——新增 check-trial-matching.mjs，self-test 10/10）。
- tests：21/21。audit：44/44 · 0 失败 · 0 待人工。
- probe-tak-m2：**57/57**（新增 A5/A6/A7/A8/C1/C3/C4/D1/D2/D5/E2/E3b/E4/E4b/E5/E5b/E6/E8/F3/F3b/F4/F4b/F6 共 25 条 Inspector 回归断言）；primer 10/10。
- 版本：0.2.0 → **0.3.1**（改包必升版；新增 0003 hospital 迁移；0.3.1 修匹配卡布局；已重装 DSH Desktop harness profile 实查）。
- 截图：13 张 v0.3.0（新增 settings / trials-match）。
- 修复覆盖：报告 ③ 所列 16 组失败全部关闭（C1–C5、D1–D2、E2–E10、F1–F6、G5、A1/A5/A6/A7/A8、B2）；I2 装机截图仍待人工（DSH Desktop 重启）。
