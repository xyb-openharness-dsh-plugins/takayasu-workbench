# M7 发布草稿（冻结待授权——不 tag、不 push、不发 release）

- 版本：0.2.0（stable 语义但按夜班规则不标 stable tag）
- tag 名：v0.2.0（草案；打 tag 须晨审追认后执行 `git tag v0.2.0 && git push origin v0.2.0`）
- 产物：release/xyb-community-takayasu-workbench-0.2.0.tgz（40 files）
- sha256：6ceb5af7eb85655c7483f6fe3ada0ee66b5e146a50f8fd80712b9748693dbe14
- Release 说明（直接可用）：见 CHANGELOG.md「0.2.0 — 2026-11-05」段（M0–M5 全链路 + 装机产物层四要素通过；界面加载待 DSH Desktop 重启确认）
- 前置条件（晨审确认后才可执行）：
  1. V2 第 6/7 条（界面加载 + 真机截图）完成，README 补「DSH Desktop 实机」标注
  2. 签认追认：G1–G3、V1、V2
  3. `npm run release:check`（check && test && audit）当时点复跑全绿
