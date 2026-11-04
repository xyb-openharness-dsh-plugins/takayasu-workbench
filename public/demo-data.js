/* 小弓宝 ArchPal · 大动脉炎工作台原型 —— 演示数据（唯一源）
 * 全部为合成示例，不冒充真实病历；改这里一个值，页面图表/卡片/时间线同步变。
 * 边界样例覆盖：零条 / 单条 / 多条 / 缺字段(null) / 未知日期(仅知月份) / 私密项 / 无原件。
 * 非肿瘤红线：无分期、无线序、无疗效判定；活动度只存医生原文。
 * 用法（file:// 无模块）：window.TAK_DEMO = {...}
 */
(function () {
  'use strict';

  var SEGMENTS = [
    { id: 'brachiocephalic', name: '头臂干', group: '主动脉弓分支' },
    { id: 'lcc', name: '左颈总动脉', group: '主动脉弓分支' },
    { id: 'lsub', name: '左锁骨下动脉', group: '主动脉弓分支' },
    { id: 'rsub', name: '右锁骨下动脉', group: '主动脉弓分支' },
    { id: 'tho-aorta', name: '胸主动脉', group: '胸腹主动脉' },
    { id: 'abd-aorta', name: '腹主动脉', group: '胸腹主动脉' },
    { id: 'lrenal', name: '左肾动脉', group: '主要分支' },
    { id: 'rrenal', name: '右肾动脉', group: '主要分支' },
    { id: 'sma', name: '肠系膜上动脉', group: '主要分支' },
    { id: 'liliac', name: '左髂动脉', group: '主要分支' },
    { id: 'riliac', name: '右髂动脉', group: '主要分支' },
    { id: 'pulm', name: '肺动脉', group: '主要分支' },
    { id: 'cor', name: '冠状动脉', group: '主要分支' }
  ];

  var METRIC_DEFS = [
    { code: 'esr', name: '血沉（ESR）', unit: 'mm/h', cat: '炎症指标', band: 'inflammation', normal: null },
    { code: 'crp', name: 'C 反应蛋白（CRP）', unit: 'mg/L', cat: '炎症指标', band: 'inflammation', normal: null },
    { code: 'wbc', name: '白细胞', unit: '×10⁹/L', cat: '血常规', band: 'cbc', normal: null },
    { code: 'hb', name: '血红蛋白', unit: 'g/L', cat: '血常规', band: 'cbc', normal: null },
    { code: 'plt', name: '血小板', unit: '×10⁹/L', cat: '血常规', band: 'cbc', normal: null },
    { code: 'alt', name: '丙氨酸转氨酶（ALT）', unit: 'U/L', cat: '肝肾功能', band: 'chem', normal: null },
    { code: 'creat', name: '肌酐', unit: 'μmol/L', cat: '肝肾功能', band: 'chem', normal: null }
  ];

  /* —— 档案 A：林晓岚，28 岁，确诊 2 个月，记录少、多处未知 —— */
  var profileA = {
    key: 'A', name: '林晓岚', sex: '女', age: 28,
    meta: '确诊 2 个月 · 随访起步', headline: '2026-09 确诊大动脉炎，激素治疗第 8 周',
    mindset: '第一次听说这个病，想把每次的报告都存好。',
    dxText: '风湿免疫科医生 2026-09-18 门诊原话（摘要）："结合影像与化验，考虑大动脉炎，先规范激素治疗，定期复查血沉、CRP 和四肢血压。"',
    diagnosisDate: '2026-09-18',
    hospital: '市人民医院 风湿免疫科',
    vesselRecords: [
      { id: 1, date: '2026-09-12', modality: 'CTA', source: '市人民医院 影像科', reportNo: 'CTA-2026-0912-338',
        segments: ['lsub', 'abd-aorta'],
        quote: '报告原文摘录："左锁骨下动脉管壁增厚、管腔轻度变窄；腹主动脉近肾动脉水平管壁增厚。"其余血管未见明确异常描述。',
        originalAvailable: false, createdBy: '本人录入'
      }
    ],
    imaging: [
      { id: 1, date: '2026-09-12', type: 'CTA（胸腹主动脉）', place: '市人民医院', summary: '首次基线 CT 血管成像；原件为纸质光盘，未上传。', originalAvailable: false }
    ],
    metrics: [
      { code: 'esr', points: [{ date: '2026-09-10', value: 46, unit: 'mm/h', method: 'Westergren', org: '市人民医院' }, { date: '2026-10-22', value: 31, unit: 'mm/h', method: 'Westergren', org: '市人民医院' }] },
      { code: 'crp', points: [{ date: '2026-09-10', value: 24.6, unit: 'mg/L', method: '免疫比浊', org: '市人民医院' }, { date: '2026-10-22', value: 9.8, unit: 'mg/L', method: '免疫比浊', org: '市人民医院' }] },
      { code: 'wbc', points: [{ date: '2026-09-10', value: 9.2, unit: '×10⁹/L', method: '血细胞分析仪', org: '市人民医院' }] },
      { code: 'hb', points: [{ date: '2026-09-10', value: 108, unit: 'g/L', method: '血细胞分析仪', org: '市人民医院' }] },
      { code: 'creat', points: [{ date: '2026-09-10', value: 64, unit: 'μmol/L', method: '酶法', org: '市人民医院' }] }
    ],
    bpRecords: [
      { id: 1, date: '2026-10-22', place: '医院随访日', armL: { sys: 118, dia: 74 }, armR: { sys: 96, dia: 62 }, ankleL: null, ankleR: null, note: '护士测量；医生提醒两臂差异要继续观察。', missingField: '踝部血压本次未测' }
    ],
    meds: [
      { id: 1, date: '2026-09-18', drug: '泼尼松', doseMg: 40, perDay: true, cat: '糖皮质激素', note: '医生原话：从每天 40mg 开始。', source: '门诊病历' },
      { id: 2, date: '2026-10-09', drug: '泼尼松', doseMg: 32, perDay: true, cat: '糖皮质激素', note: '医生原话：复查后每 2 周左右减一片。', source: '门诊病历' },
      { id: 3, date: '2026-10-30', drug: '泼尼松', doseMg: 28, perDay: true, cat: '糖皮质激素', note: null }
    ],
    events: [
      { date: '2026-06', dateKnown: 'month', type: '症状变化', text: '开始出现左臂没劲、量血压发现两臂差异（仅记得月份）', source: '本人回忆' },
      { date: '2026-09-12', type: '检查', text: 'CTA 检查（胸腹主动脉）', source: '检查单' },
      { date: '2026-09-18', type: '就诊', text: '风湿免疫科确诊，开始激素治疗', source: '门诊病历' },
      { date: '2026-10-09', type: '用药', text: '泼尼松 40mg → 32mg', source: '门诊病历' },
      { date: '2026-10-22', type: '就诊', text: '首次随访：抽血 + 四肢血压', source: '随访记录' }
    ],
    screenings: [
      { id: 1, date: '2026-10-22', item: '眼底检查', plan: '医生说半年查一次', lastResult: '未见明显异常（护士转述）', nextDue: null, originalAvailable: false }
    ],
    mindEntries: [
      { id: 1, date: '2026-09-20', text: '（私密）不敢跟家里说具体病名，怕他们查资料吓自己。', private: true, source: '本人记录' }
    ],
    lifeEntries: [
      { id: 1, date: '2026-10-22', text: '下午容易累，爬三层楼会喘，医生说先观察、不剧烈运动。', source: '本人记录' }
    ],
    pregList: [], pregTrack: [],
    docs: [
      { id: 1, name: '确诊门诊病历（2026-09-18）', date: '2026-09-18', type: '门诊病历', status: '原文', origin: '拍照导入', private: false },
      { id: 2, name: 'CTA 报告（2026-09-12）', date: '2026-09-12', type: '影像报告', status: '草稿待核对', origin: '手工录入', private: false }
    ],
    candidates: [
      { id: 'cand-1', kind: 'metric', code: 'esr', date: '2026-11-03', value: 26, unit: 'mm/h', method: 'Westergren', org: '市人民医院', from: '化验单照片解析', verified: false },
      { id: 'cand-2', kind: 'bp', date: '2026-11-03', armL: { sys: 114, dia: 72 }, armR: { sys: 98, dia: 64 }, from: '血压记录单解析', verified: false }
    ]
  };

  /* —— 档案 B：周雨桐，35 岁，8 年病程，随访记录多 —— */
  var profileB = {
    key: 'B', name: '周雨桐', sex: '女', age: 35,
    meta: '病程 8 年 · 长期随访', headline: '2018 年确诊，激素 + 免疫抑制剂治疗中，2024 年起病情稳定',
    mindset: '药量降下来了，最怕的是又升回去。',
    dxText: '风湿免疫科医生 2018-03-06 住院小结原话（摘要）："大动脉炎（头臂干型），累及左锁骨下动脉、左颈总动脉、腹主动脉，予激素联合免疫抑制剂治疗。"',
    diagnosisDate: '2018-03-06',
    hospital: '省风湿病专科医院',
    vesselRecords: [
      { id: 1, date: '2018-02-28', modality: 'CTA', source: '省风湿病专科医院 影像科', reportNo: 'CTA-2018-0228-105',
        segments: ['brachiocephalic', 'lcc', 'lsub', 'abd-aorta'],
        quote: '报告原文摘录："头臂干、左颈总动脉管壁增厚；左锁骨下动脉近段管腔变窄；腹主动脉中段管壁增厚。"', originalAvailable: true, createdBy: '导入' },
      { id: 2, date: '2021-05-14', modality: 'MRA', source: '省风湿病专科医院 影像科', reportNo: 'MRA-2021-0514-067',
        segments: ['lcc', 'lsub', 'abd-aorta'],
        quote: '报告原文摘录："左锁骨下动脉改变大致同前；腹主动脉管壁增厚较前减轻。其余所见同前。"', originalAvailable: true, createdBy: '导入' },
      { id: 3, date: '2024-11-20', modality: 'MRA', source: '省风湿病专科医院 影像科', reportNo: 'MRA-2024-1120-042',
        segments: ['lcc', 'lsub', 'abd-aorta', 'lrenal'],
        quote: '报告原文摘录："腹主动脉及左肾动脉起始部管壁增厚，与 2021 年比较范围相仿；左锁骨下动脉改变大致同前。"', originalAvailable: false, createdBy: '本人录入' }
    ],
    imaging: [
      { id: 1, date: '2018-02-28', type: 'CTA（主动脉全程）', place: '省风湿病专科医院', summary: '确诊基线；原件已扫描存档。', originalAvailable: true },
      { id: 2, date: '2019-09-03', type: '血管超声（颈部+腹部）', place: '本地三甲', summary: '随访超声，仅留存报告首页照片。', originalAvailable: false },
      { id: 3, date: '2021-05-14', type: 'MRA（主动脉）', place: '省风湿病专科医院', summary: '复查 MRA。', originalAvailable: true },
      { id: 4, date: '2024-11-20', type: 'MRA（主动脉+肾动脉）', place: '省风湿病专科医院', summary: '光盘未数字化。', originalAvailable: false },
      { id: 5, date: '2026-10-26', type: 'MRA（主动脉）', place: '省风湿病专科医院', summary: '年度复查；原件待上传。', originalAvailable: false }
    ],
    metrics: [
      { code: 'esr', points: [
        { date: '2018-02-26', value: 72, unit: 'mm/h', method: 'Westergren', org: '省风湿病专科医院' },
        { date: '2018-06-11', value: 38, unit: 'mm/h', method: 'Westergren', org: '省风湿病专科医院' },
        { date: '2019-03-20', value: 22, unit: 'mm/h', method: 'Westergren', org: '省风湿病专科医院' },
        { date: '2020-04-16', value: 15, unit: 'mm/h', method: 'Westergren', org: '省风湿病专科医院' },
        { date: '2021-05-12', value: 11, unit: 'mm/h', method: 'Westergren', org: '省风湿病专科医院' },
        { date: '2022-09-08', value: 28, unit: 'mm/h', method: 'Westergren', org: '省风湿病专科医院' },
        { date: '2023-02-14', value: 19, unit: 'mm/h', method: '自动分析仪', org: '市人民医院' },
        { date: '2024-11-18', value: 12, unit: 'mm/h', method: 'Westergren', org: '省风湿病专科医院' },
        { date: '2025-08-05', value: 10, unit: 'mm/h', method: 'Westergren', org: '省风湿病专科医院' },
        { date: '2026-08-14', value: 9, unit: 'mm/h', method: 'Westergren', org: '省风湿病专科医院' },
        { date: '2026-10-26', value: 11, unit: 'mm/h', method: 'Westergren', org: '省风湿病专科医院' }
      ] },
      { code: 'crp', points: [
        { date: '2018-02-26', value: 38.2, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院' },
        { date: '2018-06-11', value: 14.5, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院' },
        { date: '2019-03-20', value: 6.3, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院' },
        { date: '2020-04-16', value: 3.1, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院' },
        { date: '2021-05-12', value: 2.4, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院' },
        { date: '2022-09-08', value: 11.7, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院' },
        { date: '2023-02-14', value: 5.2, unit: 'mg/L', method: '乳胶增强', org: '市人民医院' },
        { date: '2024-11-18', value: 2.8, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院' },
        { date: '2025-08-05', value: 1.9, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院' },
        { date: '2026-08-14', value: 1.6, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院' },
        { date: '2026-10-26', value: 2.1, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院' }
      ] },
      { code: 'wbc', points: [
        { date: '2018-02-26', value: 11.3, unit: '×10⁹/L', method: '血细胞分析仪', org: '省风湿病专科医院' },
        { date: '2021-05-12', value: 6.8, unit: '×10⁹/L', method: '血细胞分析仪', org: '省风湿病专科医院' },
        { date: '2025-08-05', value: 6.1, unit: '×10⁹/L', method: '血细胞分析仪', org: '省风湿病专科医院' }
      ] },
      { code: 'hb', points: [
        { date: '2018-02-26', value: 96, unit: 'g/L', method: '血细胞分析仪', org: '省风湿病专科医院' },
        { date: '2019-03-20', value: 112, unit: 'g/L', method: '血细胞分析仪', org: '省风湿病专科医院' },
        { date: '2021-05-12', value: 121, unit: 'g/L', method: '血细胞分析仪', org: '省风湿病专科医院' },
        { date: '2022-09-08', value: 117, unit: 'g/L', method: '血细胞分析仪', org: '省风湿病专科医院' },
        { date: '2024-11-18', value: 126, unit: 'g/L', method: '血细胞分析仪', org: '省风湿病专科医院' },
        { date: '2025-08-05', value: 128, unit: 'g/L', method: '血细胞分析仪', org: '省风湿病专科医院' }
      ] },
      { code: 'plt', points: [
        { date: '2018-02-26', value: 402, unit: '×10⁹/L', method: '血细胞分析仪', org: '省风湿病专科医院' },
        { date: '2021-05-12', value: 288, unit: '×10⁹/L', method: '血细胞分析仪', org: '省风湿病专科医院' },
        { date: '2025-08-05', value: 254, unit: '×10⁹/L', method: '血细胞分析仪', org: '省风湿病专科医院' }
      ] },
      { code: 'alt', points: [
        { date: '2020-04-16', value: 42, unit: 'U/L', method: '酶法', org: '省风湿病专科医院' },
        { date: '2021-05-12', value: 35, unit: 'U/L', method: '酶法', org: '省风湿病专科医院' },
        { date: '2022-09-08', value: 58, unit: 'U/L', method: '酶法', org: '省风湿病专科医院' },
        { date: '2025-08-05', value: 24, unit: 'U/L', method: '酶法', org: '省风湿病专科医院' }
      ] },
      { code: 'creat', points: [
        { date: '2018-02-26', value: 71, unit: 'μmol/L', method: '酶法', org: '省风湿病专科医院' },
        { date: '2021-05-12', value: 68, unit: 'μmol/L', method: '酶法', org: '省风湿病专科医院' },
        { date: '2024-11-18', value: 66, unit: 'μmol/L', method: '酶法', org: '省风湿病专科医院' },
        { date: '2025-08-05', value: 69, unit: 'μmol/L', method: '酶法', org: '省风湿病专科医院' }
      ] }
    ],
    bpRecords: [
      { id: 1, date: '2018-03-15', place: '住院期间', armL: { sys: 142, dia: 90 }, armR: { sys: 104, dia: 68 }, ankleL: null, ankleR: null, note: '医生原话：两臂差这么多，以后每次都要记。', missingField: null },
      { id: 2, date: '2018-08-02', place: '本地三甲', armL: { sys: 136, dia: 86 }, armR: { sys: 102, dia: 66 }, ankleL: { sys: 148, dia: 92 }, ankleR: { sys: 150, dia: 94 }, note: null },
      { id: 3, date: '2019-06-18', place: '家中自测', armL: { sys: 128, dia: 80 }, armR: { sys: 100, dia: 64 }, ankleL: null, ankleR: null, note: '右臂难量准，以左臂为准记录。' },
      { id: 4, date: '2020-05-11', place: '随访日', armL: { sys: 122, dia: 78 }, armR: { sys: 98, dia: 62 }, ankleL: { sys: 138, dia: 86 }, ankleR: { sys: 140, dia: 88 }, note: null },
      { id: 5, date: '2021-06-01', place: '随访日', armL: { sys: 118, dia: 76 }, armR: { sys: 97, dia: 63 }, ankleL: null, ankleR: null, note: null },
      { id: 6, date: '2022-10-12', place: '随访日', armL: { sys: 124, dia: 78 }, armR: { sys: 99, dia: 61 }, ankleL: { sys: 136, dia: 84 }, ankleR: { sys: 138, dia: 86 }, note: '血沉回升那阵子，血压也往上走了。' },
      { id: 7, date: '2024-12-02', place: '随访日', armL: { sys: 116, dia: 74 }, armR: { sys: 96, dia: 62 }, ankleL: { sys: 134, dia: 82 }, ankleR: { sys: 136, dia: 84 }, note: null },
      { id: 8, date: '2025-10-28', place: '家中自测', armL: { sys: 114, dia: 72 }, armR: { sys: 95, dia: 60 }, ankleL: null, ankleR: null, note: null },
      { id: 9, date: '2026-10-26', place: '随访日', armL: { sys: 115, dia: 73 }, armR: { sys: 96, dia: 61 }, ankleL: { sys: 133, dia: 81 }, ankleR: { sys: 135, dia: 83 }, note: null }
    ],
    meds: [
      { id: 1, date: '2018-03-06', drug: '甲泼尼龙（住院）', doseMg: 40, perDay: true, cat: '糖皮质激素', note: '静脉起始后改口服，剂量按住院医嘱。', source: '住院小结' },
      { id: 2, date: '2018-04-10', drug: '泼尼松', doseMg: 40, perDay: true, cat: '糖皮质激素', note: '出院时口服剂量。', source: '出院带药' },
      { id: 3, date: '2018-07-15', drug: '环磷酰胺', doseMg: null, perDay: false, cat: '免疫抑制剂', note: '医生原话：定期输注，具体方案以住院单为准。', source: '住院小结' },
      { id: 4, date: '2019-01-20', drug: '泼尼松', doseMg: 20, perDay: true, cat: '糖皮质激素', note: null, source: '门诊病历' },
      { id: 5, date: '2019-03-25', drug: '吗替麦考酚酯', doseMg: 750, perDay: true, cat: '免疫抑制剂', note: '换药，原话："环磷酰胺累积量够了，换这个长期吃。"', source: '门诊病历' },
      { id: 6, date: '2020-06-08', drug: '泼尼松', doseMg: 15, perDay: true, cat: '糖皮质激素', note: null, source: '门诊病历' },
      { id: 7, date: '2021-06-15', drug: '泼尼松', doseMg: 10, perDay: true, cat: '糖皮质激素', note: '医生原话：10mg 挺久了，先维持。', source: '门诊病历' },
      { id: 8, date: '2022-10-20', drug: '泼尼松', doseMg: 15, perDay: true, cat: '糖皮质激素', note: '血沉回升，加回 15mg。', source: '门诊病历' },
      { id: 9, date: '2023-05-30', drug: '托珠单抗（咨询记录）', doseMg: null, perDay: false, cat: '生物制剂', note: '医生提到"如果再复发可以考虑生物制剂"，未开始，仅记这句话。', source: '门诊病历' },
      { id: 10, date: '2024-01-18', drug: '泼尼松', doseMg: 10, perDay: true, cat: '糖皮质激素', note: null, source: '门诊病历' },
      { id: 11, date: '2025-09-03', drug: '吗替麦考酚酯', doseMg: 500, perDay: true, cat: '免疫抑制剂', note: '医生原话：稳定两年了，试着减到半量。', source: '门诊病历' },
      { id: 12, date: '2026-10-26', drug: '泼尼松', doseMg: 10, perDay: true, cat: '糖皮质激素', note: '维持 10mg，继续观察。', source: '门诊病历' }
    ],
    events: [
      { date: '2017-11', dateKnown: 'month', type: '症状变化', text: '开始爬楼头晕、左臂摸不到脉搏（仅记得月份）', source: '本人回忆' },
      { date: '2018-02-28', type: '检查', text: '确诊 CTA：头臂干型大动脉炎', source: '影像报告' },
      { date: '2018-03-06', type: '就诊', text: '风湿免疫科住院，确诊并起始治疗', source: '住院小结' },
      { date: '2018-07-15', type: '用药', text: '加用环磷酰胺定期输注', source: '住院小结' },
      { date: '2019-03-25', type: '用药', text: '环磷酰胺 → 吗替麦考酚酯', source: '门诊病历' },
      { date: '2020-04-16', type: '检查', text: '心超：主动脉瓣轻度反流（医生口述）', source: '随访记录' },
      { date: '2021-05-14', type: '影像', text: '复查 MRA：腹主动脉管壁增厚较前减轻', source: '影像报告' },
      { date: '2022-09-08', type: '症状变化', text: '血沉、CRP 回升，乏力加重，医生调回激素', source: '门诊病历' },
      { date: '2023-02-14', type: '就诊', text: '换到市人民医院复查（搬家后就近）', source: '门诊病历' },
      { date: '2024-11-20', type: '影像', text: 'MRA：与 2021 比较范围相仿，左肾动脉起始部有描述', source: '影像报告' },
      { date: '2025-03-12', type: '检查', text: '心超随访：主动脉瓣反流程度与上次相仿（医生口述）', source: '随访记录' },
      { date: '2025-08-05', type: '就诊', text: '年度随访：指标稳定，继续减量', source: '门诊病历' },
      { date: '2025-10-28', type: '用药', text: '吗替麦考酚酯 750mg → 500mg（试减）', source: '门诊病历' },
      { date: '2026-08-14', type: '就诊', text: '年度随访：指标稳定', source: '门诊病历' },
      { date: '2026-10-26', type: '影像', text: 'MRA 年度复查（报告待录入）', source: '随访记录' }
    ],
    screenings: [
      { id: 1, date: '2020-04-16', item: '心脏超声（主动脉瓣反流）', plan: '医生说每年一次', lastResult: '主动脉瓣轻度反流（医生口述）', nextDue: null, originalAvailable: false },
      { id: 2, date: '2021-06-01', item: '眼底检查', plan: '医生说每年一次', lastResult: '未见明显异常', nextDue: '2022-06', originalAvailable: false },
      { id: 3, date: '2023-02-14', item: '眼底检查', plan: '医生说每年一次', lastResult: '未见明显异常', nextDue: null, originalAvailable: true },
      { id: 4, date: '2022-10-12', item: '骨密度', plan: '长期激素，医生建议查', lastResult: '骨量减少（报告原文）', nextDue: null, originalAvailable: true },
      { id: 5, date: '2024-11-18', item: '骨密度', plan: '长期激素，医生建议查', lastResult: '与 2022 相仿（报告原文）', nextDue: null, originalAvailable: false },
      { id: 6, date: '2024-11-18', item: '颈动脉超声', plan: '影像复查的补充', lastResult: '左锁骨下动脉流速偏高（报告原文）', nextDue: null, originalAvailable: false }
    ],
    mindEntries: [
      { id: 1, date: '2018-03-20', text: '（私密）确诊那阵子整夜睡不着，总在搜这个病会不会瘫痪。', private: true, source: '本人记录' },
      { id: 2, date: '2022-10-25', text: '（私密）血沉回升那次，最难的是又要跟单位解释请假。', private: true, source: '本人记录' }
    ],
    lifeEntries: [
      { id: 1, date: '2019-06-18', text: '左臂提重物还是不行，买菜拎袋都换右手。', source: '本人记录' },
      { id: 2, date: '2022-10-12', text: '活动那阵子下午基本要躺着，晚上腿酸。', source: '本人记录' },
      { id: 3, date: '2025-10-28', text: '现在能正常上班，累了午休 20 分钟。', source: '本人记录' }
    ],
    pregList: [
      { id: 1, text: '现在这个病情稳定状态，可以备孕吗？（2024-12-02 门诊问过，医生答："指标稳定一年以上再计划，先别停药。"）', verified: true, asked: '2024-12-02' },
      { id: 2, text: '怀孕后吗替麦考酚酯要换吗？（已问，医生答原文记在 meds 说明里）', verified: true, asked: '2024-12-02' },
      { id: 3, text: '孕期血压多久量一次、在哪科量？（待问）', verified: false, asked: null },
      { id: 4, text: '如果孕期血沉升高，怎么判断是怀孕引起的还是病情活动？（待问）', verified: false, asked: null },
      { id: 5, text: '分娩方式需要根据血管情况定吗？（待问）', verified: false, asked: null }
    ],
    pregTrack: [],
    docs: [
      { id: 1, name: '2018 住院小结（确诊）', date: '2018-03-06', type: '住院小结', status: '原文', origin: '扫描导入', private: false },
      { id: 2, name: '2018-02-28 CTA 报告', date: '2018-02-28', type: '影像报告', status: '原文', origin: '扫描导入', private: false },
      { id: 3, name: '2021-05-14 MRA 报告', date: '2021-05-14', type: '影像报告', status: '原文', origin: '扫描导入', private: false },
      { id: 4, name: '2024-11-20 MRA 报告', date: '2024-11-20', type: '影像报告', status: '草稿待核对', origin: '手工录入', private: false },
      { id: 5, name: '2024-12-02 门诊病历（生育咨询）', date: '2024-12-02', type: '门诊病历', status: '原文', origin: '拍照导入', private: true },
      { id: 6, name: '2025-08-05 化验单（9 张）', date: '2025-08-05', type: '化验单', status: '原文', origin: '拍照导入', private: false }
    ],
    candidates: [
      { id: 'cand-1', kind: 'metric', code: 'crp', date: '2026-01-15', value: 2.2, unit: 'mg/L', method: '免疫比浊', org: '省风湿病专科医院', from: '化验单照片解析', verified: false },
      { id: 'cand-2', kind: 'screening', date: '2026-01-15', item: '心脏超声', plan: '医生说每年一次', lastResult: '主动脉瓣轻度反流（报告首页解析）', from: '报告解析', verified: false }
    ]
  };

  window.TAK_DEMO = {
    version: '0.2.0',
    notice: '全部为合成示例，仅演示；未连接真实病历与宿主。',
    segments: SEGMENTS,
    metricDefs: METRIC_DEFS,
    profiles: { A: profileA, B: profileB },
    profileOrder: ['A', 'B']
  };
})();
