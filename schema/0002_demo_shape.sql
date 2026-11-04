-- 0002_demo_shape.sql · 演示形状补列（G3 冻结后新增迁移；0001 不动）
-- 只加可空列，不改既有列；读模型与 demo-data.js 形状对齐（parity 唯一验收标准）。
ALTER TABLE profile ADD COLUMN sex TEXT;
ALTER TABLE profile ADD COLUMN meta_text TEXT;
ALTER TABLE profile ADD COLUMN headline TEXT;
ALTER TABLE profile ADD COLUMN mindset TEXT;
ALTER TABLE profile ADD COLUMN dx_quote TEXT;
-- 确诊日期（医生给出的日期，事实列）：命名避开判读词正则
ALTER TABLE profile ADD COLUMN first_confirmed_date TEXT;
ALTER TABLE profile ADD COLUMN hospital TEXT;
ALTER TABLE medication ADD COLUMN note TEXT;
ALTER TABLE bp_pair ADD COLUMN missing_note TEXT;
ALTER TABLE screening_item ADD COLUMN plan_text_extra TEXT;
ALTER TABLE screening_item ADD COLUMN original_available INTEGER;
ALTER TABLE vessel_record ADD COLUMN site TEXT;
