/**
 * 读模型：把 SQLite 的行还原成 prototypes/v0.2/demo-data.js 同一形状（parity 唯一验收标准）。
 *
 * 规则：有 ord 的按 ord；其它列表按 rowid（裸 SELECT 一律 ORDER BY rowid）；
 * 私密在数据层不过滤——bootstrap 返回全量，私密标记随行返回，三出口过滤由前端统一执行
 * （与原型同一份口径；导出/AI 在原型层已挂接，宿主形态沿用同一函数）。
 * 派生值（较上次差值/近 30 天中位数/活动期—稳定期区间）读取时算，不落库。
 */
const asNum = (v) => (v === null || v === undefined ? null : Number(v));

function catLabel(band) {
  return { inflammation: '炎症指标', cbc: '血常规', chem: '肝肾功能' }[band] || band;
}
function evLabel(t) {
  return { medication: '用药', visit: '就诊', exam: '检查', imaging: '影像', symptom_change: '症状变化' }[t] || t;
}
function medLabel(c) {
  return { glucocorticoid: '糖皮质激素', csdmard: '免疫抑制剂', biologic: '生物制剂', other: '其他' }[c] || c;
}
function modLabel(m) {
  return { ultrasound: '超声', cta: 'CTA', mra: 'MRA', pet: 'PET', dsa: 'DSA', other: '其他' }[m] || m;
}
function originLabel(o) {
  return { photo: '拍照导入', import: '扫描导入', manual: '手工录入' }[o] || o;
}

export function readBootstrap(db, profileId) {
  const metricDefs = db.prepare('SELECT * FROM metric_def ORDER BY ord, rowid').all().map((m) => ({
    code: m.code, name: m.label, unit: m.unit || '', cat: catLabel(m.category), band: m.category, normal: null,
  }));
  const segments = db.prepare('SELECT * FROM vessel_segment_def ORDER BY ord, rowid').all().map((s) => ({
    id: s.id, name: s.name, group: s.grp,
  }));
  const rows = profileId
    ? db.prepare('SELECT * FROM profile WHERE id = ? ORDER BY rowid').all(profileId)
    : db.prepare('SELECT * FROM profile ORDER BY rowid').all();
  const profiles = {};
  for (const pr of rows) profiles[pr.id] = readProfile(db, pr);
  return {
    version: 'db-v1',
    banner: '本机数据 · 不上传 · 未连接 AI 模型 · 业务数据仍为演示内容直到导入真实资料',
    segments,
    metricDefs,
    profiles,
  };
}

export function readProfile(db, pr) {
  const id = pr.id;
  const metrics = [];
  for (const md of db.prepare('SELECT * FROM metric_def ORDER BY ord, rowid').all()) {
    const pts = db.prepare('SELECT * FROM metric_point WHERE profile_id = ? AND code = ? ORDER BY measured_at, rowid').all(id, md.code);
    if (!pts.length) continue;
    metrics.push({
      code: md.code,
      points: pts.map((l) => ({
        date: l.measured_at, value: l.value_num, unit: l.unit || md.unit,
        method: l.method || '未登记方法', org: l.site || '未登记机构',
      })),
    });
  }
  const events = db.prepare('SELECT * FROM event WHERE profile_id = ? ORDER BY rowid').all(id).map((e) => ({
    date: e.occurred_at,
    dateKnown: e.date_precision === 'month' ? 'month' : undefined,
    type: evLabel(e.event_type),
    text: e.text, source: e.source_note || '记录',
  }));
  const meds = db.prepare('SELECT * FROM medication WHERE profile_id = ? ORDER BY rowid').all(id).map((m, i) => ({
    id: i + 1, date: m.taken_at, drug: m.drug_name, doseMg: asNum(m.dose_mg),
    perDay: !!m.per_day, cat: medLabel(m.category), note: m.note ?? null, source: m.source_note ?? null,
  }));
  const bpRecords = db.prepare('SELECT * FROM bp_pair WHERE profile_id = ? ORDER BY rowid').all(id).map((b, i) => ({
    id: i + 1, date: b.measured_at, place: b.place || '场所未填',
    armL: b.arm_l_sys !== null ? { sys: b.arm_l_sys, dia: b.arm_l_dia } : null,
    armR: b.arm_r_sys !== null ? { sys: b.arm_r_sys, dia: b.arm_r_dia } : null,
    ankleL: b.ankle_l_sys !== null ? { sys: b.ankle_l_sys, dia: b.ankle_l_dia } : null,
    ankleR: b.ankle_r_sys !== null ? { sys: b.ankle_r_sys, dia: b.ankle_r_dia } : null,
    note: b.note ?? null, missingField: b.missing_note ?? null,
  }));
  const vesselRecords = db.prepare('SELECT * FROM vessel_record WHERE profile_id = ? ORDER BY rowid').all(id).map((v, i) => {
    const segs = db.prepare('SELECT segment_id FROM vessel_record_segment WHERE record_id = ? ORDER BY rowid').all(v.id).map((s) => s.segment_id);
    return {
      id: i + 1, date: v.recorded_at, modality: modLabel(v.modality), source: v.site || '影像机构未填',
      reportNo: v.report_no, segments: segs, quote: v.quote_text,
      originalAvailable: !!v.original_available, createdBy: v.source_note || '本人录入',
    };
  });
  const imaging = db.prepare('SELECT * FROM imaging_exam WHERE profile_id = ? ORDER BY rowid').all(id).map((im, i) => ({
    id: i + 1, date: im.done_at, type: im.exam_type, place: im.place,
    summary: im.summary, originalAvailable: !!im.original_available,
  }));
  const screenings = db.prepare('SELECT * FROM screening_item WHERE profile_id = ? ORDER BY rowid').all(id).map((s, i) => ({
    id: i + 1, date: s.done_at, item: s.item_name, plan: s.plan_text,
    lastResult: s.result_quote, nextDue: s.next_due, originalAvailable: !!s.original_available,
  }));
  const mindEntries = db.prepare("SELECT * FROM feeling_note WHERE profile_id = ? AND kind = 'mind' ORDER BY rowid").all(id).map((f, i) => ({
    id: i + 1, date: f.noted_at, text: f.text, private: f.visibility === 'private', source: f.source_note || '本人记录',
  }));
  const lifeEntries = db.prepare("SELECT * FROM feeling_note WHERE profile_id = ? AND kind = 'life' ORDER BY rowid").all(id).map((f, i) => ({
    id: i + 1, date: f.noted_at, text: f.text, source: f.source_note || '本人记录',
  }));
  const pregList = db.prepare("SELECT * FROM question WHERE profile_id = ? AND kind = 'pregnancy' ORDER BY rowid").all(id).map((q, i) => ({
    id: i + 1, text: q.text, verified: !!q.verified, asked: q.asked_on,
  }));
  const docs = db.prepare('SELECT * FROM document WHERE profile_id = ? ORDER BY rowid').all(id).map((d, i) => ({
    id: i + 1, name: d.title, date: d.doc_date, type: d.doc_type,
    status: d.status === 'original' ? '原文' : '草稿待核对',
    origin: originLabel(d.origin), private: d.visibility === 'private',
  }));
  const candidates = db.prepare('SELECT * FROM candidate_fact WHERE profile_id = ? ORDER BY rowid').all(id).map((c, i) => {
    const p = JSON.parse(c.payload_json || '{}');
    return { id: 'cand-' + (i + 1), kind: c.fact_kind, ...p, verified: !!c.verified };
  });
  return {
    key: id, name: pr.name, sex: pr.sex || '女',
    age: parseInt((pr.age_text || '0').replace(/[^0-9]/g, ''), 10) || null,
    meta: pr.meta_text || '', headline: pr.headline || '', mindset: pr.mindset || '',
    dxText: pr.dx_quote || '', diagnosisDate: pr.first_confirmed_date || null, hospital: pr.hospital || null,
    vesselRecords, imaging, metrics, bpRecords, meds, events, screenings,
    mindEntries, lifeEntries, pregList, pregTrack: [], docs, candidates,
  };
}
