# schema 冻结合同 · TAK（大动脉炎）· G3 · 2026-11-05

- 文件：`0001_initial.sql`（20 表：档案级 2 + 指标 3 + 通用 7 + TAK 专属 5 + 导入 3）
- sha256：`783d201265fb63380573389b9c37446aff214a62ff92ad54c36fac72685efa5f`
- 结构变更只允许新增 `000N_*.sql`；本文件哈希变动即冻结破坏，须评审留痕。

## 冻结断言（实测 2026-11-05，node:sqlite DatabaseSync 内存加载）

1. **判读列断言**：全表全列扫描 `/diagnosis|risk_level|activity_score|severity|stenosis_grade|flare_flag|remission_flag|relapse|eligible|verdict|recommend/i` → **0 命中**（20 表全过）。
2. 语法：`DatabaseSync.exec` 全量执行通过（20 表建成，索引 5 条）。
3. K1–K6 落点：
   - K1 `event(occurred_at 显式 null + date_precision)`：状态不入库判定列，仅 event_type 五值枚举（medication/visit/exam/imaging/symptom_change）。
   - K2 `vessel_record(quote_text 原文) + vessel_record_segment(节段多对多)`：无狭窄分级列；新报告=新行不覆盖（in_use/revision 版本链）。
   - K3 `metric_point(method+site)`：可比组维度入库，跨组不合并由读模型负责。
   - K4 `medication(dose_text 医嘱原文 + dose_mg 数值)`：无推荐列；doctor_quote 表逐字存原话。
   - K5 `bp_pair(四部位独立列，显式 null)`：差值读时算不入库。
   - K6 `author_role` 全表贯穿 + `visibility(public/private)`：私密三出口共用读模型过滤；`feeling_note` 默认 private。
4. 通用约定：显式 null（禁空串冒充未知）、in_use、revision（更正=新增版本）、date_precision('day'|'month'|'unknown')、分类不进趋势（metric_def.category 白名单）。

## 派生值处理（读时算，不落库）

- 较上次差值（血压/化验）、近 30 天中位数、近 90 天发作…就诊次数：读模型计算。
- 「活动期—稳定期」区间：由 event 读模型推导并显示医生原文，不落库状态列。
- ITAS/Kerr 等活动度工具：只存医生原文（doctor_quote），永不计算。
