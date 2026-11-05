# PROGRESS（唯一进度速览，详情见 docs/DEV-PLAN.md）

> 更新：2026-11-05 夜班收尾（无人值守）。模式：全部闸口为「自动签认（待晨审追认）」。

## 当前状态：M0–M6 走完 + **Inspector 整轮返工完成（v0.3.0，57/57 探针全绿）** + M7/M8 冻结草稿 + M9 回流完成；V2 宿主侧加载已实测通过（路由注册+鉴权+真宿主 sqlite 播种）；V3 真机界面人眼确认待用户在 Desktop 内打开

> 2026-11-05 增补：按 FAMILY-INSPECTOR.md 全项审查（docs/INSPECTOR-2026-11-05.md，16 组失败）完成修复轮：设置三 tab、一图秀 rail、临床研究四段链路（匹配卡 n/m+浮窗证据链+收藏）、全站录入窗（三态按钮+多医院 0003）、看板大状态卡/行动带/快捷卡、字号层级、Logo 块。版本 0.2.0→0.3.1（0.3.1 修匹配卡布局+rail 收缩，已重装 DSH Desktop harness profile 实查 0.3.1）。

## 里程碑账

| 阶段 | 状态 | 证据 |
| --- | --- | --- |
| 认领 | 完成 | Issue #59（claimed 标签 + 机器人确认）；私有仓已建；starter init 205 文件；cordis config.root 接线 |
| M0 | 完成 | 文档九件 + docs/DEV-REQUIREMENTS-2026-11-05.md；基线 check staticPass=true（cba01ce） |
| M1 | 完成 | 医学台账 A 级（86 指南原件 PDF 517 页取得并逐节核数）、家族对比重名率实测 50%≤70%、DIFF-MATRIX 六条；G1 自动签认（b1780b0） |
| M2 | 完成 | 原型四件套 12 一级/29 二级页；probe-tak-m2 32/32、primer 10/10、家族 page-view 自检 PASS；独立评审 P0×2 清零留痕；README 截图墙 11 张实渲；G2 自动签认（86644bf） |
| M3 | 完成 | schema 0001（20 表）+0002（demo-shape 补列）冻结 sha256 783d2012…；判读列 0 命中进 check 链；G3 自动签认（45f27a3） |
| M4 | 完成 | fetch-takayasu-trials-2026.mjs 四在线通道实查 104 条（2 通道 FAILED 如实记录）；research/takayasu 四件套一致性 PASS（5c2b0f0） |
| M5 | 完成 | public/ 定点移植（ui-parity check 过）、src→build→lib 528 行、版本 0.2.0 十处同源、demo/readmodels canonical parity、trials API 真快照实测 50 条、MinerU 六部件契约、apiBase 双形态契约；tests 21/21、check 19 步 staticPass=true、audit 44/44；V1 自动签认（dc5ef94） |
| M6 | 完成（产物层） | tgz 40 files、四要素对照 PASS、pnpm 装入 DSH Desktop harness profile、bundle 登记第 60 项；verify-desktop-load：本轮宿主启动早于装机，界面加载待重启；V2 装机产物层自动签认（e87e794）；V3 待人工 |
| M7/M8 | 冻结草稿 | docs/release-draft/（M7 tag/release 草案含 sha256；M8 BACKLOG 状态行改前改后 + PR 说明）（9ea879d） |
| M9 | 完成 | starter LESSONS L57–L60、templates/check-schema.mjs 模板化、starter 1.10.0-rc.12（check-starter pass、tests 67/67） |

## AI 契约轮（2026-11-06 增补，v0.3.4）

- 修复部署版「AI 按钮无效/重复、AI 对话 demo 内容误开发」：部署态本地演示坞与「模拟回复自检」整体移除，AI 由宿主原生面板承载——顶栏「AI 对话」→ takayasu:agent-open；各页「和 AI 讨论」→ takayasu:agent-draft（send:false 只填不发）；独立打开保留演示坞降级（Q16）。
- 新增 scripts/probe-public-hosted.mjs（6 条部署态断言，6/6）；外壳 onMessage 已带 event.source + origin 校验（34 号 Q15）。
- 回归：probe-tak-m2 57/57、primer 10/10、tests 21/21、audit 44/44、check staticPass=true；0.3.4 已重装 profile。

## 真机轮（2026-11-05 上午增补）

- 用户重启 DSH Desktop：宿主工作台清单含本包，dshHomePath 数据目录生成（sqlite 22 表 + 迁移账本 3 条 + 播种完成）。
- 修复 /ttp duplicate prefix 路由冲突（cdde556，另一窗口协同发现修复）：与真 TTP 仓撞车曾致激活失败，0.3.2 起干净。
- 宿主 webserver curl 实测：/takayasu/ 401 鉴权拦截（路由注册成功，按会话授权生效）。
- verify-desktop-load.mjs 判据精化：激活失败按包名归属判定（兄弟仓 esophageal/gastric/gist/colorectal 存量 L53 坑，本包不在列）。

## 阻塞与缺口

- **待人工 1**：完整退出并重开 DSH Desktop → 新建会话 → 真机走查 + 真机截图刷新 README（无人值守不代用户重启 GUI）。
- **待人工 2**：晨审追认全部自动签认 + M7 tag/release + M8 PR 授权。
- 0 患者访谈、0 临床审核（如实标注于 README/SPEC/声明条）。

## 下一步（晨审）

1. 重启 DSH Desktop → 新会话走查 → `node scripts/verify-desktop-load.mjs` 复核 → 真机截图替换 README。
2. 追认签认 → 授权 M7（tag v0.2.0 + release）与 M8（BACKLOG PR）。
3. 患者访谈/医学核对补位（USER-RESEARCH §四访谈计划）。
