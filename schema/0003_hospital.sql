-- 0003_hospital.sql · 就医信息多医院（F6 / G5：录入能力先核对 schema）
-- 医院卡片：名称/科室/联系方式（电话或出处引用）；更正=新增版本（in_use/revision）。
CREATE TABLE hospital (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  name TEXT NOT NULL,
  dept TEXT,
  contact_kind TEXT NOT NULL CHECK (contact_kind IN ('phone','quote')),
  contact_text TEXT,
  ord INTEGER NOT NULL DEFAULT 0,
  author_role TEXT CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  in_use INTEGER NOT NULL DEFAULT 1,
  revision INTEGER NOT NULL DEFAULT 1
);
