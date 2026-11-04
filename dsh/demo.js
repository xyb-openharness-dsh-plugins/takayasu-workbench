/**
 * 演示数据种子（唯一源 = prototypes/v0.2/demo-data.js，本文件由脚本生成，不手抄数值）。
 * 首次开库（空库）写入 A/B 两套合成档案；幂等：非空库跳过。
 */
export function seedDemoData(db, { force = false } = {}) {
  const existing = db.prepare('SELECT COUNT(*) c FROM profile').get().c;
  if (existing > 0 && !force) return { skipped: true, profiles: existing };
  if (force) {
    db.prepare('DELETE FROM vessel_record_segment').run();
    db.prepare('DELETE FROM vessel_record').run();
    db.prepare('DELETE FROM candidate_fact').run();
    db.prepare('DELETE FROM parse_job').run();
    db.prepare('DELETE FROM import_batch').run();
    db.prepare('DELETE FROM bp_pair').run();
    db.prepare('DELETE FROM imaging_exam').run();
    db.prepare('DELETE FROM screening_item').run();
    db.prepare('DELETE FROM question').run();
    db.prepare('DELETE FROM feeling_note').run();
    db.prepare('DELETE FROM doctor_quote').run();
    db.prepare('DELETE FROM event').run();
    db.prepare('DELETE FROM medication').run();
    db.prepare('DELETE FROM metric_point').run();
    db.prepare('DELETE FROM lab_report').run();
    db.prepare('DELETE FROM document').run();
    db.prepare('DELETE FROM profile').run();
    db.prepare('DELETE FROM metric_def').run();
    db.prepare('DELETE FROM hospital').run();
    db.prepare('DELETE FROM vessel_segment_def').run();
  }
  const tx = db;
  var segIns = tx.prepare('INSERT INTO vessel_segment_def (id, name, grp, ord) VALUES (?,?,?,?)');
  var segRows = [["brachiocephalic", "头臂干", "主动脉弓分支", 0], ["lcc", "左颈总动脉", "主动脉弓分支", 1], ["lsub", "左锁骨下动脉", "主动脉弓分支", 2], ["rsub", "右锁骨下动脉", "主动脉弓分支", 3], ["tho-aorta", "胸主动脉", "胸腹主动脉", 4], ["abd-aorta", "腹主动脉", "胸腹主动脉", 5], ["lrenal", "左肾动脉", "主要分支", 6], ["rrenal", "右肾动脉", "主要分支", 7], ["sma", "肠系膜上动脉", "主要分支", 8], ["liliac", "左髂动脉", "主要分支", 9], ["riliac", "右髂动脉", "主要分支", 10], ["pulm", "肺动脉", "主要分支", 11], ["cor", "冠状动脉", "主要分支", 12]];
  for (var r of segRows) segIns.run(...r);
  var mdIns = tx.prepare('INSERT INTO metric_def (code, label, unit, category, ord) VALUES (?,?,?,?,?)');
  var mdRows = [["esr", "血沉（ESR）", "mm/h", "inflammation", 0], ["crp", "C 反应蛋白（CRP）", "mg/L", "inflammation", 1], ["wbc", "白细胞", "×10⁹/L", "cbc", 2], ["hb", "血红蛋白", "g/L", "cbc", 3], ["plt", "血小板", "×10⁹/L", "cbc", 4], ["alt", "丙氨酸转氨酶（ALT）", "U/L", "chem", 5], ["creat", "肌酐", "μmol/L", "chem", 6]];
  for (r of mdRows) mdIns.run(...r);
  // ── 档案 A ──
  tx.prepare('INSERT INTO profile (id, name, sex, age_text, meta_text, headline, mindset, dx_quote, first_confirmed_date, hospital, primary_role, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(...["A", "林晓岚", "女", "28 岁", "确诊 2 个月 · 随访起步", "2026-09 确诊大动脉炎，激素治疗第 8 周", "第一次听说这个病，想把每次的报告都存好。", "风湿免疫科医生 2026-09-18 门诊原话（摘要）：\"结合影像与化验，考虑大动脉炎，先规范激素治疗，定期复查血沉、CRP 和四肢血压。\"", "2026-09-18", "市人民医院 风湿免疫科", "PATIENT", "2026-11-05"]);
  var mpIns = tx.prepare('INSERT INTO metric_point (profile_id, code, measured_at, date_precision, value_num, unit, method, site, source_note) VALUES (?,?,?,?,?,?,?,?,?)');
  var mpRows = [["A", "esr", "2026-09-10", "day", 46, "mm/h", "Westergren", "市人民医院", "化验单"], ["A", "esr", "2026-10-22", "day", 31, "mm/h", "Westergren", "市人民医院", "化验单"], ["A", "crp", "2026-09-10", "day", 24.6, "mg/L", "免疫比浊", "市人民医院", "化验单"], ["A", "crp", "2026-10-22", "day", 9.8, "mg/L", "免疫比浊", "市人民医院", "化验单"], ["A", "wbc", "2026-09-10", "day", 9.2, "×10⁹/L", "血细胞分析仪", "市人民医院", "化验单"], ["A", "hb", "2026-09-10", "day", 108, "g/L", "血细胞分析仪", "市人民医院", "化验单"], ["A", "creat", "2026-09-10", "day", 64, "μmol/L", "酶法", "市人民医院", "化验单"]];
  for (r of mpRows) mpIns.run(...r);
  var evIns = tx.prepare('INSERT INTO event (profile_id, occurred_at, date_precision, event_type, text, source_note) VALUES (?,?,?,?,?,?)');
  var evRows = [["A", "2026-06", "month", "symptom_change", "开始出现左臂没劲、量血压发现两臂差异（仅记得月份）", "本人回忆"], ["A", "2026-09-12", "day", "exam", "CTA 检查（胸腹主动脉）", "检查单"], ["A", "2026-09-18", "day", "visit", "风湿免疫科确诊，开始激素治疗", "门诊病历"], ["A", "2026-10-09", "day", "medication", "泼尼松 40mg → 32mg", "门诊病历"], ["A", "2026-10-22", "day", "visit", "首次随访：抽血 + 四肢血压", "随访记录"]];
  for (r of evRows) evIns.run(...r);
  var medIns = tx.prepare('INSERT INTO medication (profile_id, taken_at, drug_name, category, dose_text, dose_mg, per_day, note, source_note) VALUES (?,?,?,?,?,?,?,?,?)');
  var medRows = [["A", "2026-09-18", "泼尼松", "glucocorticoid", "40mg/日", 40, 1, "医生原话：从每天 40mg 开始。", "门诊病历"], ["A", "2026-10-09", "泼尼松", "glucocorticoid", "32mg/日", 32, 1, "医生原话：复查后每 2 周左右减一片。", "门诊病历"], ["A", "2026-10-30", "泼尼松", "glucocorticoid", "28mg/日", 28, 1, null, null]];
  for (r of medRows) medIns.run(...r);
  var bpIns = tx.prepare('INSERT INTO bp_pair (profile_id, measured_at, place, arm_l_sys, arm_l_dia, arm_r_sys, arm_r_dia, ankle_l_sys, ankle_l_dia, ankle_r_sys, ankle_r_dia, note, missing_note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
  var bpRows = [["A", "2026-10-22", "医院随访日", 118, 74, 96, 62, null, null, null, null, "护士测量；医生提醒两臂差异要继续观察。", "踝部血压本次未测"]];
  for (r of bpRows) bpIns.run(...r);
  var vrIns = tx.prepare('INSERT INTO vessel_record (profile_id, recorded_at, modality, site, report_no, quote_text, source_note, original_available) VALUES (?,?,?,?,?,?,?,?)');
  var vrsIns = tx.prepare('INSERT INTO vessel_record_segment (record_id, segment_id) VALUES (?,?)');
  var vrRows = [["2026-09-12", "cta", "市人民医院 影像科", "CTA-2026-0912-338", "报告原文摘录：\"左锁骨下动脉管壁增厚、管腔轻度变窄；腹主动脉近肾动脉水平管壁增厚。\"其余血管未见明确异常描述。", "本人录入", 0, ["lsub", "abd-aorta"]]];
  for (r of vrRows) {
    var vid = vrIns.run("A", r[0], r[1], r[2], r[3], r[4], r[5], r[6]).lastInsertRowid;
    for (var sg of r[7]) vrsIns.run(vid, sg);
  }
  var imIns = tx.prepare('INSERT INTO imaging_exam (profile_id, done_at, exam_type, place, summary, original_available) VALUES (?,?,?,?,?,?)');
  var imRows = [["A", "2026-09-12", "CTA（胸腹主动脉）", "市人民医院", "首次基线 CT 血管成像；原件为纸质光盘，未上传。", 0]];
  for (r of imRows) imIns.run(...r);
  var scIns = tx.prepare('INSERT INTO screening_item (profile_id, done_at, item_name, plan_text, result_quote, next_due, original_available) VALUES (?,?,?,?,?,?,?)');
  var scRows = [["A", "2026-10-22", "眼底检查", "医生说半年查一次", "未见明显异常（护士转述）", null, 0]];
  for (r of scRows) scIns.run(...r);
  var fnIns = tx.prepare('INSERT INTO feeling_note (profile_id, noted_at, kind, text, source_note, visibility) VALUES (?,?,?,?,?,?)');
  var fnRows = [["A", "2026-09-20", "mind", "（私密）不敢跟家里说具体病名，怕他们查资料吓自己。", "本人记录", "private"], ["A", "2026-10-22", "life", "下午容易累，爬三层楼会喘，医生说先观察、不剧烈运动。", "本人记录", "public"]];
  for (r of fnRows) fnIns.run(...r);
  var qIns = tx.prepare('INSERT INTO question (profile_id, kind, text, verified, asked_on) VALUES (?,?,?,?,?)');
  var qRows = [];
  for (r of qRows) qIns.run(...r);
  var dcIns = tx.prepare('INSERT INTO document (profile_id, title, doc_date, doc_type, status, origin, visibility) VALUES (?,?,?,?,?,?,?)');
  var dcRows = [["A", "确诊门诊病历（2026-09-18）", "2026-09-18", "门诊病历", "original", "photo", "public"], ["A", "CTA 报告（2026-09-12）", "2026-09-12", "影像报告", "draft", "manual", "public"]];
  for (r of dcRows) dcIns.run(...r);
  var hpIns = tx.prepare('INSERT INTO hospital (profile_id, name, dept, contact_kind, contact_text, ord, revision) VALUES (?,?,?,?,?,?,?)');
  var hpRows = [["A", "市人民医院", "风湿免疫科", "quote", "地址与电话见门诊病历首页（2026-09-18）", 0, 1]];
  for (r of hpRows) hpIns.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6] || 1);
  var cfIns = tx.prepare('INSERT INTO candidate_fact (profile_id, fact_kind, payload_json, verified) VALUES (?,?,?,?)');
  cfIns.run("A", "metric", "{\"kind\": \"metric\", \"code\": \"esr\", \"date\": \"2026-11-03\", \"value\": 26, \"unit\": \"mm/h\", \"method\": \"Westergren\", \"org\": \"市人民医院\", \"from\": \"化验单照片解析\"}", 0);
  cfIns.run("A", "bp", "{\"kind\": \"bp\", \"date\": \"2026-11-03\", \"armL\": {\"sys\": 114, \"dia\": 72}, \"armR\": {\"sys\": 98, \"dia\": 64}, \"from\": \"血压记录单解析\"}", 0);
  // ── 档案 B ──
  tx.prepare('INSERT INTO profile (id, name, sex, age_text, meta_text, headline, mindset, dx_quote, first_confirmed_date, hospital, primary_role, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(...["B", "周雨桐", "女", "35 岁", "病程 8 年 · 长期随访", "2018 年确诊，激素 + 免疫抑制剂治疗中，2024 年起病情稳定", "药量降下来了，最怕的是又升回去。", "风湿免疫科医生 2018-03-06 住院小结原话（摘要）：\"大动脉炎（头臂干型），累及左锁骨下动脉、左颈总动脉、腹主动脉，予激素联合免疫抑制剂治疗。\"", "2018-03-06", "省风湿病专科医院", "PATIENT", "2026-11-05"]);
  var mpIns = tx.prepare('INSERT INTO metric_point (profile_id, code, measured_at, date_precision, value_num, unit, method, site, source_note) VALUES (?,?,?,?,?,?,?,?,?)');
  var mpRows = [["B", "esr", "2018-02-26", "day", 72, "mm/h", "Westergren", "省风湿病专科医院", "化验单"], ["B", "esr", "2018-06-11", "day", 38, "mm/h", "Westergren", "省风湿病专科医院", "化验单"], ["B", "esr", "2019-03-20", "day", 22, "mm/h", "Westergren", "省风湿病专科医院", "化验单"], ["B", "esr", "2020-04-16", "day", 15, "mm/h", "Westergren", "省风湿病专科医院", "化验单"], ["B", "esr", "2021-05-12", "day", 11, "mm/h", "Westergren", "省风湿病专科医院", "化验单"], ["B", "esr", "2022-09-08", "day", 28, "mm/h", "Westergren", "省风湿病专科医院", "化验单"], ["B", "esr", "2023-02-14", "day", 19, "mm/h", "自动分析仪", "市人民医院", "化验单"], ["B", "esr", "2024-11-18", "day", 12, "mm/h", "Westergren", "省风湿病专科医院", "化验单"], ["B", "esr", "2025-08-05", "day", 10, "mm/h", "Westergren", "省风湿病专科医院", "化验单"], ["B", "esr", "2026-08-14", "day", 9, "mm/h", "Westergren", "省风湿病专科医院", "化验单"], ["B", "esr", "2026-10-26", "day", 11, "mm/h", "Westergren", "省风湿病专科医院", "化验单"], ["B", "crp", "2018-02-26", "day", 38.2, "mg/L", "免疫比浊", "省风湿病专科医院", "化验单"], ["B", "crp", "2018-06-11", "day", 14.5, "mg/L", "免疫比浊", "省风湿病专科医院", "化验单"], ["B", "crp", "2019-03-20", "day", 6.3, "mg/L", "免疫比浊", "省风湿病专科医院", "化验单"], ["B", "crp", "2020-04-16", "day", 3.1, "mg/L", "免疫比浊", "省风湿病专科医院", "化验单"], ["B", "crp", "2021-05-12", "day", 2.4, "mg/L", "免疫比浊", "省风湿病专科医院", "化验单"], ["B", "crp", "2022-09-08", "day", 11.7, "mg/L", "免疫比浊", "省风湿病专科医院", "化验单"], ["B", "crp", "2023-02-14", "day", 5.2, "mg/L", "乳胶增强", "市人民医院", "化验单"], ["B", "crp", "2024-11-18", "day", 2.8, "mg/L", "免疫比浊", "省风湿病专科医院", "化验单"], ["B", "crp", "2025-08-05", "day", 1.9, "mg/L", "免疫比浊", "省风湿病专科医院", "化验单"], ["B", "crp", "2026-08-14", "day", 1.6, "mg/L", "免疫比浊", "省风湿病专科医院", "化验单"], ["B", "crp", "2026-10-26", "day", 2.1, "mg/L", "免疫比浊", "省风湿病专科医院", "化验单"], ["B", "wbc", "2018-02-26", "day", 11.3, "×10⁹/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "wbc", "2021-05-12", "day", 6.8, "×10⁹/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "wbc", "2025-08-05", "day", 6.1, "×10⁹/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "hb", "2018-02-26", "day", 96, "g/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "hb", "2019-03-20", "day", 112, "g/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "hb", "2021-05-12", "day", 121, "g/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "hb", "2022-09-08", "day", 117, "g/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "hb", "2024-11-18", "day", 126, "g/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "hb", "2025-08-05", "day", 128, "g/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "plt", "2018-02-26", "day", 402, "×10⁹/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "plt", "2021-05-12", "day", 288, "×10⁹/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "plt", "2025-08-05", "day", 254, "×10⁹/L", "血细胞分析仪", "省风湿病专科医院", "化验单"], ["B", "alt", "2020-04-16", "day", 42, "U/L", "酶法", "省风湿病专科医院", "化验单"], ["B", "alt", "2021-05-12", "day", 35, "U/L", "酶法", "省风湿病专科医院", "化验单"], ["B", "alt", "2022-09-08", "day", 58, "U/L", "酶法", "省风湿病专科医院", "化验单"], ["B", "alt", "2025-08-05", "day", 24, "U/L", "酶法", "省风湿病专科医院", "化验单"], ["B", "creat", "2018-02-26", "day", 71, "μmol/L", "酶法", "省风湿病专科医院", "化验单"], ["B", "creat", "2021-05-12", "day", 68, "μmol/L", "酶法", "省风湿病专科医院", "化验单"], ["B", "creat", "2024-11-18", "day", 66, "μmol/L", "酶法", "省风湿病专科医院", "化验单"], ["B", "creat", "2025-08-05", "day", 69, "μmol/L", "酶法", "省风湿病专科医院", "化验单"]];
  for (r of mpRows) mpIns.run(...r);
  var evIns = tx.prepare('INSERT INTO event (profile_id, occurred_at, date_precision, event_type, text, source_note) VALUES (?,?,?,?,?,?)');
  var evRows = [["B", "2017-11", "month", "symptom_change", "开始爬楼头晕、左臂摸不到脉搏（仅记得月份）", "本人回忆"], ["B", "2018-02-28", "day", "exam", "确诊 CTA：头臂干型大动脉炎", "影像报告"], ["B", "2018-03-06", "day", "visit", "风湿免疫科住院，确诊并起始治疗", "住院小结"], ["B", "2018-07-15", "day", "medication", "加用环磷酰胺定期输注", "住院小结"], ["B", "2019-03-25", "day", "medication", "环磷酰胺 → 吗替麦考酚酯", "门诊病历"], ["B", "2020-04-16", "day", "exam", "心超：主动脉瓣轻度反流（医生口述）", "随访记录"], ["B", "2021-05-14", "day", "imaging", "复查 MRA：腹主动脉管壁增厚较前减轻", "影像报告"], ["B", "2022-09-08", "day", "symptom_change", "血沉、CRP 回升，乏力加重，医生调回激素", "门诊病历"], ["B", "2023-02-14", "day", "visit", "换到市人民医院复查（搬家后就近）", "门诊病历"], ["B", "2024-11-20", "day", "imaging", "MRA：与 2021 比较范围相仿，左肾动脉起始部有描述", "影像报告"], ["B", "2025-03-12", "day", "exam", "心超随访：主动脉瓣反流程度与上次相仿（医生口述）", "随访记录"], ["B", "2025-08-05", "day", "visit", "年度随访：指标稳定，继续减量", "门诊病历"], ["B", "2025-10-28", "day", "medication", "吗替麦考酚酯 750mg → 500mg（试减）", "门诊病历"], ["B", "2026-08-14", "day", "visit", "年度随访：指标稳定", "门诊病历"], ["B", "2026-10-26", "day", "imaging", "MRA 年度复查（报告待录入）", "随访记录"]];
  for (r of evRows) evIns.run(...r);
  var medIns = tx.prepare('INSERT INTO medication (profile_id, taken_at, drug_name, category, dose_text, dose_mg, per_day, note, source_note) VALUES (?,?,?,?,?,?,?,?,?)');
  var medRows = [["B", "2018-03-06", "甲泼尼龙（住院）", "glucocorticoid", "40mg/日", 40, 1, "静脉起始后改口服，剂量按住院医嘱。", "住院小结"], ["B", "2018-04-10", "泼尼松", "glucocorticoid", "40mg/日", 40, 1, "出院时口服剂量。", "出院带药"], ["B", "2018-07-15", "环磷酰胺", "csdmard", null, null, 0, "医生原话：定期输注，具体方案以住院单为准。", "住院小结"], ["B", "2019-01-20", "泼尼松", "glucocorticoid", "20mg/日", 20, 1, null, "门诊病历"], ["B", "2019-03-25", "吗替麦考酚酯", "csdmard", "750mg/日", 750, 1, "换药，原话：\"环磷酰胺累积量够了，换这个长期吃。\"", "门诊病历"], ["B", "2020-06-08", "泼尼松", "glucocorticoid", "15mg/日", 15, 1, null, "门诊病历"], ["B", "2021-06-15", "泼尼松", "glucocorticoid", "10mg/日", 10, 1, "医生原话：10mg 挺久了，先维持。", "门诊病历"], ["B", "2022-10-20", "泼尼松", "glucocorticoid", "15mg/日", 15, 1, "血沉回升，加回 15mg。", "门诊病历"], ["B", "2023-05-30", "托珠单抗（咨询记录）", "biologic", null, null, 0, "医生提到\"如果再复发可以考虑生物制剂\"，未开始，仅记这句话。", "门诊病历"], ["B", "2024-01-18", "泼尼松", "glucocorticoid", "10mg/日", 10, 1, null, "门诊病历"], ["B", "2025-09-03", "吗替麦考酚酯", "csdmard", "500mg/日", 500, 1, "医生原话：稳定两年了，试着减到半量。", "门诊病历"], ["B", "2026-10-26", "泼尼松", "glucocorticoid", "10mg/日", 10, 1, "维持 10mg，继续观察。", "门诊病历"]];
  for (r of medRows) medIns.run(...r);
  var bpIns = tx.prepare('INSERT INTO bp_pair (profile_id, measured_at, place, arm_l_sys, arm_l_dia, arm_r_sys, arm_r_dia, ankle_l_sys, ankle_l_dia, ankle_r_sys, ankle_r_dia, note, missing_note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
  var bpRows = [["B", "2018-03-15", "住院期间", 142, 90, 104, 68, null, null, null, null, "医生原话：两臂差这么多，以后每次都要记。", null], ["B", "2018-08-02", "本地三甲", 136, 86, 102, 66, 148, 92, 150, 94, null, null], ["B", "2019-06-18", "家中自测", 128, 80, 100, 64, null, null, null, null, "右臂难量准，以左臂为准记录。", null], ["B", "2020-05-11", "随访日", 122, 78, 98, 62, 138, 86, 140, 88, null, null], ["B", "2021-06-01", "随访日", 118, 76, 97, 63, null, null, null, null, null, null], ["B", "2022-10-12", "随访日", 124, 78, 99, 61, 136, 84, 138, 86, "血沉回升那阵子，血压也往上走了。", null], ["B", "2024-12-02", "随访日", 116, 74, 96, 62, 134, 82, 136, 84, null, null], ["B", "2025-10-28", "家中自测", 114, 72, 95, 60, null, null, null, null, null, null], ["B", "2026-10-26", "随访日", 115, 73, 96, 61, 133, 81, 135, 83, null, null]];
  for (r of bpRows) bpIns.run(...r);
  var vrIns = tx.prepare('INSERT INTO vessel_record (profile_id, recorded_at, modality, site, report_no, quote_text, source_note, original_available) VALUES (?,?,?,?,?,?,?,?)');
  var vrsIns = tx.prepare('INSERT INTO vessel_record_segment (record_id, segment_id) VALUES (?,?)');
  var vrRows = [["2018-02-28", "cta", "省风湿病专科医院 影像科", "CTA-2018-0228-105", "报告原文摘录：\"头臂干、左颈总动脉管壁增厚；左锁骨下动脉近段管腔变窄；腹主动脉中段管壁增厚。\"", "导入", 1, ["brachiocephalic", "lcc", "lsub", "abd-aorta"]], ["2021-05-14", "mra", "省风湿病专科医院 影像科", "MRA-2021-0514-067", "报告原文摘录：\"左锁骨下动脉改变大致同前；腹主动脉管壁增厚较前减轻。其余所见同前。\"", "导入", 1, ["lcc", "lsub", "abd-aorta"]], ["2024-11-20", "mra", "省风湿病专科医院 影像科", "MRA-2024-1120-042", "报告原文摘录：\"腹主动脉及左肾动脉起始部管壁增厚，与 2021 年比较范围相仿；左锁骨下动脉改变大致同前。\"", "本人录入", 0, ["lcc", "lsub", "abd-aorta", "lrenal"]]];
  for (r of vrRows) {
    var vid = vrIns.run("B", r[0], r[1], r[2], r[3], r[4], r[5], r[6]).lastInsertRowid;
    for (var sg of r[7]) vrsIns.run(vid, sg);
  }
  var imIns = tx.prepare('INSERT INTO imaging_exam (profile_id, done_at, exam_type, place, summary, original_available) VALUES (?,?,?,?,?,?)');
  var imRows = [["B", "2018-02-28", "CTA（主动脉全程）", "省风湿病专科医院", "确诊基线；原件已扫描存档。", 1], ["B", "2019-09-03", "血管超声（颈部+腹部）", "本地三甲", "随访超声，仅留存报告首页照片。", 0], ["B", "2021-05-14", "MRA（主动脉）", "省风湿病专科医院", "复查 MRA。", 1], ["B", "2024-11-20", "MRA（主动脉+肾动脉）", "省风湿病专科医院", "光盘未数字化。", 0], ["B", "2026-10-26", "MRA（主动脉）", "省风湿病专科医院", "年度复查；原件待上传。", 0]];
  for (r of imRows) imIns.run(...r);
  var scIns = tx.prepare('INSERT INTO screening_item (profile_id, done_at, item_name, plan_text, result_quote, next_due, original_available) VALUES (?,?,?,?,?,?,?)');
  var scRows = [["B", "2020-04-16", "心脏超声（主动脉瓣反流）", "医生说每年一次", "主动脉瓣轻度反流（医生口述）", null, 0], ["B", "2021-06-01", "眼底检查", "医生说每年一次", "未见明显异常", "2022-06", 0], ["B", "2023-02-14", "眼底检查", "医生说每年一次", "未见明显异常", null, 1], ["B", "2022-10-12", "骨密度", "长期激素，医生建议查", "骨量减少（报告原文）", null, 1], ["B", "2024-11-18", "骨密度", "长期激素，医生建议查", "与 2022 相仿（报告原文）", null, 0], ["B", "2024-11-18", "颈动脉超声", "影像复查的补充", "左锁骨下动脉流速偏高（报告原文）", null, 0]];
  for (r of scRows) scIns.run(...r);
  var fnIns = tx.prepare('INSERT INTO feeling_note (profile_id, noted_at, kind, text, source_note, visibility) VALUES (?,?,?,?,?,?)');
  var fnRows = [["B", "2018-03-20", "mind", "（私密）确诊那阵子整夜睡不着，总在搜这个病会不会瘫痪。", "本人记录", "private"], ["B", "2022-10-25", "mind", "（私密）血沉回升那次，最难的是又要跟单位解释请假。", "本人记录", "private"], ["B", "2019-06-18", "life", "左臂提重物还是不行，买菜拎袋都换右手。", "本人记录", "public"], ["B", "2022-10-12", "life", "活动那阵子下午基本要躺着，晚上腿酸。", "本人记录", "public"], ["B", "2025-10-28", "life", "现在能正常上班，累了午休 20 分钟。", "本人记录", "public"]];
  for (r of fnRows) fnIns.run(...r);
  var qIns = tx.prepare('INSERT INTO question (profile_id, kind, text, verified, asked_on) VALUES (?,?,?,?,?)');
  var qRows = [["B", "pregnancy", "现在这个病情稳定状态，可以备孕吗？（2024-12-02 门诊问过，医生答：\"指标稳定一年以上再计划，先别停药。\"）", 1, "2024-12-02"], ["B", "pregnancy", "怀孕后吗替麦考酚酯要换吗？（已问，医生答原文记在 meds 说明里）", 1, "2024-12-02"], ["B", "pregnancy", "孕期血压多久量一次、在哪科量？（待问）", 0, null], ["B", "pregnancy", "如果孕期血沉升高，怎么判断是怀孕引起的还是病情活动？（待问）", 0, null], ["B", "pregnancy", "分娩方式需要根据血管情况定吗？（待问）", 0, null]];
  for (r of qRows) qIns.run(...r);
  var dcIns = tx.prepare('INSERT INTO document (profile_id, title, doc_date, doc_type, status, origin, visibility) VALUES (?,?,?,?,?,?,?)');
  var dcRows = [["B", "2018 住院小结（确诊）", "2018-03-06", "住院小结", "original", "import", "public"], ["B", "2018-02-28 CTA 报告", "2018-02-28", "影像报告", "original", "import", "public"], ["B", "2021-05-14 MRA 报告", "2021-05-14", "影像报告", "original", "import", "public"], ["B", "2024-11-20 MRA 报告", "2024-11-20", "影像报告", "draft", "manual", "public"], ["B", "2024-12-02 门诊病历（生育咨询）", "2024-12-02", "门诊病历", "original", "photo", "private"], ["B", "2025-08-05 化验单（9 张）", "2025-08-05", "化验单", "original", "photo", "public"]];
  for (r of dcRows) dcIns.run(...r);
  var hpRows = [["B", "省风湿病专科医院", "风湿免疫科", "phone", "020-8888xxxx（随访护士站，2025-08-05 门诊记）", 0, 2], ["B", "市人民医院", "风湿免疫科（就近复查）", "quote", "出处：2023-02-14 门诊病历", 1, 1]];
  for (r of hpRows) hpIns.run(...r);
  var cfIns = tx.prepare('INSERT INTO candidate_fact (profile_id, fact_kind, payload_json, verified) VALUES (?,?,?,?)');
  cfIns.run("B", "metric", "{\"kind\": \"metric\", \"code\": \"crp\", \"date\": \"2026-01-15\", \"value\": 2.2, \"unit\": \"mg/L\", \"method\": \"免疫比浊\", \"org\": \"省风湿病专科医院\", \"from\": \"化验单照片解析\"}", 0);
  cfIns.run("B", "screening", "{\"kind\": \"screening\", \"date\": \"2026-01-15\", \"item\": \"心脏超声\", \"plan\": \"医生说每年一次\", \"lastResult\": \"主动脉瓣轻度反流（报告首页解析）\", \"from\": \"报告解析\"}", 0);
  var n = tx.prepare('SELECT COUNT(*) c FROM profile').get().c;
  return { skipped: false, profiles: n };
}

export function hasDemoData(db) {
  return db.prepare('SELECT COUNT(*) c FROM profile').get().c > 0;
}