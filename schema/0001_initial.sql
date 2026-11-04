-- 0001_initial.sql · TAK（大动脉炎）工作台初始迁移（G3 冻结候选 · 2026-11-05）
-- 来源：家族四契约骨架（TAK 原创版）+ 12 一级 29 子页页面树（docs/INTERACTION-DESIGN.md）+ K1–K6 红线（docs/DEV-REQUIREMENTS.md）。
-- 冻结规则：sha256 记入 schema/freeze-contract.md；结构变更只能新增 000N_*.sql。
-- TAK 红线落点：
--   K1 活动期—稳定期病程（event：type 只枚举用药/就诊/检查/影像/症状变化；状态不入库判定列，展示医生原文）
--   K2 受累血管按报告原文（vessel_record 逐报告版本，quote 逐字；无狭窄分级列、无活动度判定列；ITAS/Kerr 只作医生原文占位）
--   K3 化验可比组（metric_point 带 method+site；跨组不合并是读模型职责，不在库内做差）
--   K4 用药原文（medication.dose_text 医嘱原文照抄；dose_mg 只存数值本身，无推荐/减量建议列）
--   K5 血压成对（bp_pair 双臂双踝独立列，缺测显式 null；差值读时算，不入库）
--   K6 双主体（author_role 贯穿）+ 私密三出口（visibility；导出/AI/摘要预览共用同一读模型过滤）

-- ═══ 档案级（2）═══
CREATE TABLE workspace (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data_root TEXT,
  schema_version TEXT NOT NULL,
  dataset_state TEXT
);
CREATE TABLE profile (
  id TEXT PRIMARY KEY,                       -- 'A' | 'B' | 用户自建
  name TEXT NOT NULL,
  birth_year TEXT,
  age_text TEXT,                             -- 展示口径，不入出生日期推断
  doctor_summary TEXT,                       -- 确诊时医生原话摘要（照抄，非判定）
  primary_role TEXT CHECK (primary_role IN ('PATIENT','CAREGIVER')),
  created_at TEXT NOT NULL
);

-- ═══ 指标（3）═══
CREATE TABLE metric_def (
  code TEXT PRIMARY KEY,                     -- esr/crp/wbc/hb/plt/alt/creat
  label TEXT NOT NULL,
  unit TEXT,
  category TEXT NOT NULL,                    -- 'inflammation' | 'cbc' | 'chem'（趋势白名单；分类不进趋势）
  color TEXT,
  is_numeric INTEGER NOT NULL DEFAULT 1,
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE metric_point (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  code TEXT NOT NULL REFERENCES metric_def(code),
  measured_at TEXT,                          -- 显式 null = 日期不详（date_precision='unknown'）
  date_precision TEXT NOT NULL DEFAULT 'day' CHECK (date_precision IN ('day','month','unknown')),
  value_num REAL,
  value_text TEXT,
  unit TEXT,
  method TEXT,                               -- 可比组维度之一
  site TEXT,                                 -- 可比组维度之二
  ref_range_text TEXT,                       -- 原文照抄；阈值待临床审核，不做自动判定
  source_note TEXT,
  document_id INTEGER,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1        -- 更正=新增版本，旧版本 in_use=0 保留
);
CREATE TABLE lab_report (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  document_id INTEGER,
  collected_at TEXT,
  date_precision TEXT NOT NULL DEFAULT 'day' CHECK (date_precision IN ('day','month','unknown')),
  site TEXT,
  note TEXT,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);

-- ═══ 通用（7）═══
CREATE TABLE medication (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  taken_at TEXT,
  date_precision TEXT NOT NULL DEFAULT 'day' CHECK (date_precision IN ('day','month','unknown')),
  drug_name TEXT NOT NULL,                   -- 原文名照抄
  category TEXT NOT NULL CHECK (category IN ('glucocorticoid','csdmard','biologic','other')),
  dose_text TEXT,                            -- 医嘱原文（K4）
  dose_mg REAL,                              -- 仅为展示数值；显式 null = 原文未写
  per_day INTEGER,
  source_note TEXT,
  document_id INTEGER,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE doctor_quote (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  quoted_at TEXT,
  date_precision TEXT NOT NULL DEFAULT 'day' CHECK (date_precision IN ('day','month','unknown')),
  scope TEXT NOT NULL CHECK (scope IN ('diagnosis','treatment','followup','pregnancy','other')),
  quote_text TEXT NOT NULL,                  -- 逐字原话；不解读
  source_note TEXT,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE event (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  occurred_at TEXT,                          -- 显式 null + precision（K1 仅知月份）
  date_precision TEXT NOT NULL DEFAULT 'day' CHECK (date_precision IN ('day','month','unknown')),
  event_type TEXT NOT NULL CHECK (event_type IN ('medication','visit','exam','imaging','symptom_change')),
  text TEXT NOT NULL,                        -- 只写已发生事实
  source_note TEXT,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE feeling_note (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  noted_at TEXT,
  date_precision TEXT NOT NULL DEFAULT 'day' CHECK (date_precision IN ('day','month','unknown')),
  kind TEXT NOT NULL CHECK (kind IN ('mind','life','caregiver')),   -- 心理/生活/照护者自述
  text TEXT NOT NULL,                        -- 自述原文，不打分不评级
  source_note TEXT,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public','private')), -- 默认私密
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE question (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  kind TEXT NOT NULL CHECK (kind IN ('visit','pregnancy','trial')),
  text TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0,       -- 候选核对状态；不是医学判定
  asked_on TEXT,
  answer_quote_id INTEGER REFERENCES doctor_quote(id),
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE document (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  title TEXT NOT NULL,
  doc_date TEXT,
  date_precision TEXT NOT NULL DEFAULT 'day' CHECK (date_precision IN ('day','month','unknown')),
  doc_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('original','draft')),
  origin TEXT NOT NULL CHECK (origin IN ('import','manual','photo')),
  original_available INTEGER,                -- 显式 null = 未确认
  file_path TEXT,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE screening_item (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  done_at TEXT,
  date_precision TEXT NOT NULL DEFAULT 'day' CHECK (date_precision IN ('day','month','unknown')),
  item_name TEXT NOT NULL,
  plan_text TEXT,                            -- 医生嘱咐的节奏原话（K4 口径）
  result_quote TEXT,                         -- 结果原文摘录；不做异常判定
  next_due TEXT,                             -- 医生给的下次时间；非系统推断
  document_id INTEGER,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);

-- ═══ TAK 专属（5）═══
CREATE TABLE vessel_segment_def (
  id TEXT PRIMARY KEY,                       -- brachiocephalic / lcc / lsub / rsub / tho-aorta / abd-aorta / lrenal / rrenal / sma / liliac / riliac / pulm / cor
  name TEXT NOT NULL,                        -- 解剖学名称（事实）
  grp TEXT NOT NULL,                         -- 'arch_branch' | 'thoracoabdominal' | 'major_branch'
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE vessel_record (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  recorded_at TEXT NOT NULL,
  modality TEXT NOT NULL CHECK (modality IN ('ultrasound','cta','mra','pet','dsa','other')),
  report_no TEXT,
  quote_text TEXT NOT NULL,                  -- 报告原文摘录（K2）；无分级列
  source_note TEXT,
  original_available INTEGER,                -- 显式 null = 未确认
  document_id INTEGER,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1        -- 新报告=新行；旧记录不覆盖
);
CREATE TABLE vessel_record_segment (
  record_id INTEGER NOT NULL REFERENCES vessel_record(id),
  segment_id TEXT NOT NULL REFERENCES vessel_segment_def(id),
  PRIMARY KEY (record_id, segment_id)
);
CREATE TABLE bp_pair (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  measured_at TEXT NOT NULL,
  place TEXT,
  arm_l_sys INTEGER, arm_l_dia INTEGER,      -- 成对独立列；缺测显式 null（K5）
  arm_r_sys INTEGER, arm_r_dia INTEGER,
  ankle_l_sys INTEGER, ankle_l_dia INTEGER,
  ankle_r_sys INTEGER, ankle_r_dia INTEGER,
  note TEXT,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE imaging_exam (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  done_at TEXT,
  date_precision TEXT NOT NULL DEFAULT 'day' CHECK (date_precision IN ('day','month','unknown')),
  exam_type TEXT NOT NULL,
  place TEXT,
  summary TEXT,                              -- 原文摘录
  original_available INTEGER,
  document_id INTEGER,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);

-- ═══ 导入（3）═══
CREATE TABLE import_batch (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  started_at TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('mineru','manual','photo')),
  status TEXT NOT NULL CHECK (status IN ('pending','parsing','done','failed')),
  error_note TEXT,
  file_count INTEGER
);
CREATE TABLE candidate_fact (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  batch_id INTEGER REFERENCES import_batch(id),
  fact_kind TEXT NOT NULL CHECK (fact_kind IN ('metric','bp','screening','vessel','medication')),
  payload_json TEXT NOT NULL,                -- 候选内容（核对前不入事实层）
  source_note TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  verified_at TEXT,
  rejected INTEGER NOT NULL DEFAULT 0,       -- 拒收留痕；拒收不影响事实层
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public',
  in_use INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE parse_job (
  id INTEGER PRIMARY KEY,
  batch_id INTEGER NOT NULL REFERENCES import_batch(id),
  engine TEXT,                               -- mineru / manual
  status TEXT NOT NULL CHECK (status IN ('queued','running','done','failed','skipped')),
  error_note TEXT,
  finished_at TEXT
);

-- ═══ 索引 ═══
CREATE INDEX idx_metric_point_profile_code ON metric_point(profile_id, code, measured_at);
CREATE INDEX idx_event_profile_time ON event(profile_id, occurred_at);
CREATE INDEX idx_vessel_record_profile ON vessel_record(profile_id, recorded_at);
CREATE INDEX idx_bp_pair_profile_time ON bp_pair(profile_id, measured_at);
CREATE INDEX idx_document_profile ON document(profile_id, doc_date);
