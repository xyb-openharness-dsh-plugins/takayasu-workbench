/* 小弓宝 ArchPal · 大动脉炎工作台（版本走注入占位符）
 * 全部为合成示例；未接入 DSH / AI；候选核对前不入图；私密三出口共用同一过滤。
 * 外壳与组件结构为小 X 宝家族通用元素体系（原型声明条/侧栏/顶栏、定高 3D 指标卡、右侧 AI 面板、事件泳道、原生折叠卡）。
 * 非肿瘤红线：无分期、无线序、无疗效；活动度只存医生原文；阈值一律【待核】。
 */
(function () {
  'use strict';

  var APP_INFO = { name: '小弓宝 ArchPal', version: '__VERSION__', build: '__BUILD_DATE__', disease: '大动脉炎（Takayasu Arteritis, TAK）' };
  var PROTO = window.TAK_DEMO;

  /* ---------- 工具 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(d) { return d ? String(d) : '未知日期'; }
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function deltaWord(diff) { return diff > 0 ? '↑' : (diff < 0 ? '↓' : '→'); }
  function maskToken(tok) {
    var t = String(tok || '');
    if (!t) return '未设置';
    return t.length <= 4 ? '****' : '****' + t.slice(-4);
  }
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'mu-consent') {
      var ti = $('#mu-token');
      var note = $('#mu-consent-note');
      if (ti) ti.disabled = !e.target.checked;
      if (note) note.textContent = e.target.checked ? '已同意；本仓未接入 MinerU——粘贴与保存不联网，仅存本机。' : '未勾选前不会上传，也不会调用 MinerU。';
    }
  });

  /* ---------- 导航注册表（与 docs/INTERACTION-DESIGN.md 逐字一致） ---------- */
  var PAGES = [
    ['dashboard', '看板', 'home'], ['dx', '确诊档案', 'dx'], ['vessels', '受累血管', 'vessel'],
    ['labs', '检查与指标', 'report'], ['meds', '用药与减量', 'pill'], ['review', '复诊与筛查', 'calendar'],
    ['preg', '生育与妊娠', 'flower'], ['life', '功能与生活', 'leaf'], ['mind', '心理与家庭', 'heart'],
    ['chart', '病情一图秀', 'chart'], ['trials', '临床研究', 'flask'], ['docs', '资料库', 'folder']
  ];
  var SUBPAGES = {
    dx: [['dx-doc', '确诊经过与依据'], ['dx-vessel', '报告里的血管'], ['dx-imaging', '影像复查'], ['dx-mdt', '会诊与二次意见']],
    vessels: [['v-map', '受累血管图谱'], ['v-bp', '四肢血压'], ['v-event', '血管事件']],
    labs: [['lab-trend', '炎症指标'], ['lab-cbc', '血常规'], ['lab-import', '待核对候选']],
    meds: [['med-gluc', '糖皮质激素'], ['med-imm', '免疫抑制剂'], ['med-note', '用药说明与医嘱']],
    review: [['review-rhythm', '复查节奏'], ['review-screen', '并发症筛查'], ['review-prep', '就诊准备']],
    preg: [['preg-list', '孕前问题清单'], ['preg-track', '妊娠随访记录']],
    life: [['life-func', '功能与疲劳'], ['life-daily', '日常生活记录']],
    mind: [['mind-feel', '当下感受（默认私密）'], ['mind-burden', '家庭负担与照护者']],
    chart: [['ch-trend', '数值曲线'], ['ch-event', '分类与事件'], ['ch-caliber', '数据口径']],
    trials: [['tr-facts', '建档'], ['tr-search', '检索'], ['tr-match', '候选线索']],
    docs: [['docs-lib', '资料库与导入'], ['docs-cand', '整理草稿与核对'], ['docs-prep', '导出与副本']]
  };
  var SUBTITLES = {
    dashboard: '确诊依据、血管、指标、血压与用药放在一起，让下一次门诊有据可查。',
    dx: '确诊依据永远保留医生原话；报告按日期留版本，新报告不覆盖旧报告。',
    vessels: '血管节段只记医生报告原文；血压成对记，差值只是「较上次」，不做分级。',
    labs: 'ESR/CRP 是与疾病活动相关的化验；不同方法/机构不合并、不连线；解读归医生。',
    meds: '药名、剂量、日期全部照医生记录；减量阶梯只是回顾，不是建议。',
    review: '该查什么、上次什么时候查的，按医生嘱咐整理；空了就去记录。',
    preg: '生育是记录不是承诺：存「问了什么、医生答了什么原文」； pregnancy 记录默认随档案。',
    life: '疲劳与功能只记你自己的描述，不打分、不评级。',
    mind: '害怕、疲惫、对未来的担心都算正常反应；这里的内容默认私密。',
    chart: '把化验、血压、事件放回同一段时间，看见变化发生在哪一步。',
    trials: '真实登记摘录 + 候选线索；收藏后逐条核对，要不要追问由你和医生决定。',
    docs: '原件永远保留；解析结果只是候选，接受之前不入库。'
  };
  var ROUTES = [
    'dashboard',
    'dx/dx-doc', 'dx/dx-vessel', 'dx/dx-imaging', 'dx/dx-mdt',
    'vessels/v-map', 'vessels/v-bp', 'vessels/v-event',
    'labs/lab-trend', 'labs/lab-cbc', 'labs/lab-import',
    'meds/med-gluc', 'meds/med-imm', 'meds/med-note',
    'review/review-rhythm', 'review/review-screen', 'review/review-prep',
    'preg/preg-list', 'preg/preg-track',
    'life/life-func', 'life/life-daily',
    'mind/mind-feel', 'mind/mind-burden',
    'chart/ch-trend', 'chart/ch-event', 'chart/ch-caliber',
    'trials/tr-facts', 'trials/tr-search', 'trials/tr-match',
    'docs/docs-lib', 'docs/docs-cand', 'docs/docs-prep'
  ];

  var AI_HINTS = {
    dashboard: '这是我的大动脉炎随访看板（合成示例数据）。请帮我看看下次复诊前，哪些资料还缺：目前有确诊记录、血管节段记录、化验、四肢血压和用药记录。只列问题，不要给医疗建议。',
    dx: '我的确诊档案页（合成示例）。请帮我把「确诊经过与依据」整理成复诊时可以给医生看的时间线：症状开始（月份）、确诊日期、医生诊断原话摘要。不要判断病情。',
    vessels: '受累血管页（合成示例）。我拿到了新的血管影像报告，请帮我把报告里提到的血管节段按「节段名 + 报告日期」列一张清单，便于和上次对比。只整理原文，不要解读狭窄程度。',
    labs: '检查与指标页（合成示例）。请帮我把血沉和 CRP 按「日期、数值、方法、机构」列成表格，标出哪些不是同一家机构/方法、不能直接比较。不要解读高低。',
    meds: '用药与减量页（合成示例）。请帮我把激素剂量变化按日期列成阶梯表（日期、剂量、医生原话），方便复诊时问「下一步怎么减」。不要给减量建议。',
    review: '复诊与筛查页（合成示例）。请帮我整理「下次复诊想问的问题清单」：基于我的复查节奏、并发症筛查上次日期。问题要短，不包含判断。',
    preg: '生育与妊娠页（合成示例）。请帮我整理「孕前想问风湿科医生的问题清单」：病情稳定状态、现用药物、孕期监测。只列问题，不要给怀孕建议。',
    life: '功能与生活页（合成示例）。请帮我把自己记录的疲劳和活动情况按日期整理成一段复诊时可以念给医生听的描述。不要评级。',
    mind: '心理与家庭页（合成示例，内容默认私密）。请帮我把自己记的感受按时间整理成一段「最近状态」描述，给下次就诊时自己参考。不要安慰模板，不要分析我。',
    chart: '病情一图秀页（合成示例）。请帮我说明这张图里「血沉、CRP、血压」各自的变化时间和事件标注怎么看。提醒我哪些序列不可比。',
    trials: '临床研究页（合成示例）。请帮我把登记摘录里我可能想问医生的问题列出来（例如入组条件去哪看）。不要判断我是否适合任何试验。',
    docs: '资料库页（合成示例）。请帮我检查：哪些报告还没有原件、哪些候选还没核对。列成「待办清单」，不要解读内容。'
  };

  /* ---------- 状态 ---------- */
  var state = {
    profile: 'A',
    view: 'dashboard', sub: null,
    aiOpen: false, aiWidth: 35, aiSession: [],
    flipped: {},
    timeWindow: 'all', showEvents: true, sel: ['esr', 'crp'],
    candidates: {}, checks: {},
    draftPool: {},
    privateCount: { seen: 0 }
  };

  function P() { return PROTO.profiles[state.profile]; }

  /* ---------- 私密过滤（三出口共用） ---------- */
  function isPrivate(rec) { return !!(rec && rec.private); }
  function filterPrivate(list) { return list.filter(function (r) { return !isPrivate(r); }); }
  function privacyLine(list) {
    var m = list.filter(isPrivate).length;
    return list.length + ' 条中私密 ' + m + ' 条（已从导出 / AI / 摘要中排除）';
  }

  /* ---------- SVG：Fritsch–Carlson 单调平滑 ---------- */
  function smoothPath(pts) {
    if (pts.length < 2) return '';
    var n = pts.length, dxs = [], dys = [], ms = [];
    for (var i = 0; i < n - 1; i++) {
      dxs.push(pts[i + 1][0] - pts[i][0]);
      dys.push(pts[i + 1][1] - pts[i][1]);
      ms.push(dys[i] / dxs[i]);
    }
    var c1 = [ms[0]];
    for (var j = 1; j < n - 1; j++) {
      var m0 = ms[j - 1], m1 = ms[j];
      if (m0 * m1 <= 0) { c1.push(0); continue; }
      var dx1 = dxs[j - 1], dx2 = dxs[j], common = dx1 + dx2;
      c1.push(3 * common / ((common + dx2) / m0 + (common + dx1) / m1));
    }
    c1.push(ms[n - 2]);
    var c2 = [], c3 = [];
    for (var k = 0; k < n - 1; k++) {
      var m2 = ms[k];
      if (k === 0) { c2.push(c1[1] !== undefined && c1[1] * m2 > 0 ? c1[1] : 0); }
      else { c2.push((c1[k] + c1[k + 1]) / 2); }
      c3.push((ms[k] * (2 * dxs[k] + dxs[Math.min(k + 1, dxs.length - 1)]) ) ? 0 : 0);
      c3.push(0);
    }
    // 简化 c3：端点为 0，中点用 m 差值（Fritsch–Carlson 简化式已足够平滑且不越过数据点）
    var d = 'M' + pts[0][0].toFixed(2) + ',' + pts[0][1].toFixed(2);
    for (var s = 0; s < n - 1; s++) {
      var x0 = pts[s][0], y0 = pts[s][1], x1 = pts[s + 1][0], y1 = pts[s + 1][1];
      var cx1 = x0 + dxs[s] / 3, cy1 = y0 + (c1[s] || 0) * dxs[s] / 3;
      var cx2 = x1 - dxs[s] / 3;
      var nextSlope = (s + 1 < n - 1) ? ms[s + 1] : ms[s];
      var cy2 = y1 - (c1[s + 1] !== undefined && nextSlope * c1[s + 1] > 0 ? c1[s + 1] : nextSlope) * dxs[s] / 3;
      d += 'C' + cx1.toFixed(2) + ',' + cy1.toFixed(2) + ' ' + cx2.toFixed(2) + ',' + cy2.toFixed(2) + ' ' + x1.toFixed(2) + ',' + y1.toFixed(2);
    }
    return d;
  }

  function toXY(points, w, h, pad) {
    var p = pad || { l: 34, r: 10, t: 10, b: 22 };
    var xs = points.map(function (pt) { return new Date(pt.date + 'T00:00:00').getTime(); });
    var min = Math.min.apply(null, points.map(function (pt) { return pt.value; }));
    var max = Math.max.apply(null, points.map(function (pt) { return pt.value; }));
    var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
    function X(t) { return p.l + (xMax === xMin ? (w - p.l - p.r) / 2 : (t - xMin) / (xMax - xMin) * (w - p.l - p.r)); }
    function Y(v) { return h - p.b - (max === min ? (h - p.t - p.b) / 2 : (v - min) / (max - min) * (h - p.t - p.b)); }
    return points.map(function (pt, i) { return [X(xs[i]), Y(pt.value), pt]; });
  }

  function sparkline(points, w, h) {
    w = w || 170; h = h || 62;
    if (!points || !points.length) return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="暂无数据"></svg>';
    var xy = toXY(points, w, h, { l: 6, r: 6, t: 6, b: 6 });
    var out = '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="最近趋势，仅回顾">';
    if (points.length === 1) {
      out += '<circle cx="' + xy[0][0].toFixed(1) + '" cy="' + xy[0][1].toFixed(1) + '" r="3.5"></circle>';
    } else {
      out += '<path fill="none" d="' + smoothPath(xy.map(function (p) { return [p[0], p[1]]; })) + '"></path>';
    }
    out += '</svg>';
    return out;
  }

  /* ---------- 指标卡（24 号：定高 194px、真 3D、单点不连线） ---------- */
  function metricCard(def, points) {
    var code = def.code;
    var latest = points.length ? points[points.length - 1] : null;
    var prev = points.length > 1 ? points[points.length - 2] : null;
    var deltaTxt = '首次记录';
    var deltaCls = '';
    if (prev && latest) {
      var diff = latest.value - prev.value;
      deltaTxt = '较上次 ' + deltaWord(diff) + ' ' + Math.abs(diff) + ' ' + def.unit;
      deltaCls = diff > 0 ? 'up' : (diff < 0 ? 'down' : '');
    }
    var flipped = !!state.flipped[code];
    var back;
    if (points.length <= 1) {
      back = '<span class="na">' + (points.length === 0 ? '暂无记录' : '只有 1 次记录，暂不连线') + '</span>';
    } else {
      var recent = points.slice(-8);
      var xy = toXY(recent, 170, 62, { l: 6, r: 6, t: 6, b: 6 });
      back = '<span class="spark">' + sparkline(recent) + '</span>' +
        '<span class="range"><span class="date">' + esc(recent[0].date) + '</span><span class="date">' + esc(recent[recent.length - 1].date) + '</span></span>';
    }
    var backInner = '<span class="mface back"><span class="cat"><span class="dot"></span>' + esc(def.cat) +
      '</span><span class="name">' + esc(def.name) + ' · 最近 ' + Math.min(points.length, 8) + ' 次</span>' +
      back +
      '<span class="foot">仅回顾已核对记录 · 点击返回 · 解读归医生</span></span>';
    var front = '<span class="mface front"><span class="cat"><span class="dot"></span>' + esc(def.cat) +
      '</span><span class="name">' + esc(def.name) + '</span>' +
      (latest
        ? '<span class="val">' + esc(latest.value) + '<small>' + esc(def.unit) + '</small></span>' +
          '<span class="delta ' + deltaCls + '">' + esc(deltaTxt) + '</span>' +
          '<span class="rec">共 ' + points.length + ' 次记录</span>' +
          '<span class="meta"><span class="date">' + esc(latest.date) + '</span> · ' + esc(latest.org || '来源未填') + ' · 翻转 ↗</span>'
        : '<span class="na">暂无记录</span><span class="meta">去化验页录入</span>') +
      '</span>';
    return '<button class="mcard" data-action="flip" data-code="' + esc(code) + '" aria-pressed="' + flipped + '" aria-label="' +
      esc(def.name) + '，最近值与趋势，点击翻面">' +
      '<span class="mcard-inner">' + front + backInner + '</span></button>';
  }

  function metricGroups(pointsByCode, cats) {
    var out = '';
    cats.forEach(function (cat) {
      var defs = PROTO.metricDefs.filter(function (d) { return d.cat === cat; });
      var n = defs.length;
      out += '<div class="metric-group"><div class="metric-group-head"><h3>' + esc(cat) + '</h3><span>' + n + ' 项</span></div><div class="metric-grid">';
      defs.forEach(function (d) {
        out += metricCard(d, (pointsByCode[d.code] || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }));
      });
      out += '</div></div>';
    });
    return out;
  }

  function pointsByCode() {
    var map = {};
    PROTO.metricDefs.forEach(function (d) { map[d.code] = []; });
    (P().metrics || []).forEach(function (m) {
      (m.points || []).forEach(function (pt) { (map[m.code] || (map[m.code] = [])).push(pt); });
    });
    return map;
  }

  /* ---------- 可比组标注 ---------- */
  function comparabilityNote(points) {
    var orgs = {}, methods = {};
    points.forEach(function (pt) { orgs[pt.org || '未填'] = 1; methods[pt.method || '未填'] = 1; });
    var o = Object.keys(orgs), m = Object.keys(methods);
    if (o.length > 1 || m.length > 1) {
      return '<div class="notice warn">该指标存在多个' + (m.length > 1 ? '方法' : '') + (m.length > 1 && o.length > 1 ? '与' : '') + (o.length > 1 ? '机构' : '') +
        '来源（' + esc(o.join('、')) + '）——不同方法/机构不合并、不连线，图内已按来源分段。解读归医生。</div>';
    }
    return '';
  }

  /* ---------- 一图秀（C 组） ---------- */
  var CW = 980, CH = 400;
  function chartSeries() {
    var map = pointsByCode();
    return state.sel.map(function (code) {
      var def = PROTO.metricDefs.filter(function (d) { return d.code === code; })[0];
      return { def: def, points: (map[code] || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }) };
    }).filter(function (s) { return s.def; });
  }

  function renderChart() {
    var series = chartSeries();
    var any = series.some(function (s) { return s.points.length > 0; });
    if (!any) {
      return '<div class="chart-card"><div class="chart-empty">没有所选指标的数据——去「检查与指标」录入，或换一个指标。</div></div>';
    }
    var win = state.timeWindow;
    var now = Date.now();
    var winMs = win === '3m' ? 90 * 864e5 : (win === '6m' ? 182 * 864e5 : (win === '12m' ? 365 * 864e5 : Infinity));
    var out = '<div class="chart-card"><svg class="chart" viewBox="0 0 ' + CW + ' ' + CH + '" role="img" aria-label="所选指标趋势图，各序列按自身范围归一化，不可比">';
    var legend = '';
    var colors = ['var(--brand)', 'var(--teal)', 'var(--plum)'];
    var allTimes = [];
    series.forEach(function (s) { s.points.forEach(function (pt) { allTimes.push(new Date(pt.date + 'T00:00:00').getTime()); }); });
    if (!allTimes.length) return '<div class="chart-card"><div class="chart-empty">没有所选指标的数据。</div></div>';
    var xMin = Math.min.apply(null, allTimes), xMax = Math.max.apply(null, allTimes);
    if (win !== 'all') {
      var lo = now - winMs;
      if (lo > xMin) xMin = lo;
      if (xMin > xMax) xMin = xMax;
    }
    function X(t) { return 44 + (xMax === xMin ? (CW - 60) / 2 : (t - xMin) / (xMax - xMin) * (CW - 60)); }
    var pathChanged = [];
    series.forEach(function (s, si) {
      var pts = s.points.filter(function (pt) {
        var t = new Date(pt.date + 'T00:00:00').getTime();
        return t >= xMin && t <= xMax;
      });
      if (!pts.length) return;
      var vals = pts.map(function (p) { return p.value; });
      var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
      var top = 20 + si * 120, bh = 100; // 每序列独立纵向带：量纲差异大不共轴
      function Y(v) { return top + bh - (mx === mn ? bh / 2 : (v - mn) / (mx - mn) * bh); }
      var xy = pts.map(function (pt) {
        var t = new Date(pt.date + 'T00:00:00').getTime();
        return [X(t), Y(pt.value), pt];
      });
      out += '<g class="series" data-code="' + esc(s.def.code) + '">';
      if (xy.length === 1) {
        out += '<circle cx="' + xy[0][0].toFixed(1) + '" cy="' + xy[0][1].toFixed(1) + '" r="4" fill="' + colors[si % 3] + '"></circle>';
        out += '<text x="' + (xy[0][0] + 8).toFixed(1) + '" y="' + (xy[0][1] + 4).toFixed(1) + '" font-size="12">' + esc(pts[0].value) + '</text>';
      } else {
        var d = smoothPath(xy.map(function (p) { return [p[0], p[1]]; }));
        pathChanged.push(d);
        out += '<path fill="none" stroke="' + colors[si % 3] + '" stroke-width="2" d="' + d + '"></path>';
        // 每个数据点一个可点击圆点（MT09：点数据点打开原始来源）
        xy.forEach(function (q) {
          out += '<circle class="pt" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (q === xy[xy.length - 1] ? 4.5 : 3) +
            '" fill="' + colors[si % 3] + '" data-date="' + esc(q[2].date) + '" data-value="' + esc(q[2].value) + '" data-src="' + esc(q[2].org || '来源未填') + '"></circle>';
        });
        var last = xy[xy.length - 1];
        out += '<text x="' + (last[0] - 8).toFixed(1) + '" y="' + (last[1] - 8).toFixed(1) + '" font-size="12" text-anchor="end">' + esc(pts[pts.length - 1].value) + ' ' + esc(s.def.unit) + '</text>';
      }
      out += '<text x="8" y="' + (top + 12) + '" font-size="12" fill="var(--ink-2)">' + esc(s.def.name) + '</text>';
      out += '</g>';
      legend += '<span class="sw-wrap"><span class="sw" style="background:' + colors[si % 3] + '"></span>' + esc(s.def.name) + '（按自身范围归一化，不可比）</span>';
    });
    // 时间刻度
    if (isFinite(xMin) && xMax > xMin) {
      var steps = 4;
      for (var i = 0; i <= steps; i++) {
        var t = xMin + (xMax - xMin) * i / steps;
        var dt = new Date(t);
        out += '<text x="' + X(t).toFixed(1) + '" y="' + (CH - 4) + '" font-size="11" text-anchor="middle" fill="var(--muted)">' + (dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0')) + '</text>';
      }
    }
    out += '</svg>';
    if (state.showEvents) {
      var evs = filterEvents().slice(-6);
      if (evs.length) {
        out += '<div class="event-band">' + evs.map(function (e) {
          return '<span class="ev"><span class="date">' + esc(e.date) + '</span> ' + esc(e.type) + '：' + esc(e.text.slice(0, 24)) + '</span>';
        }).join('') + '</div>';
        out += '<div class="notice" style="margin-top:8px">事件条与数据曲线分层展示（不画在同一条带上）。</div>';
      }
    }
    out += '<div class="legend">' + legend + '</div>';
    out += '<div class="row" style="margin-top:10px"><span class="time-window" role="group" aria-label="时间窗">' +
      [['all', '全部'], ['12m', '近 12 月'], ['6m', '近 6 月'], ['3m', '近 3 月']].map(function (o) {
        return '<button data-action="tw" data-w="' + o[0] + '" aria-pressed="' + (state.timeWindow === o[0]) + '">' + o[1] + '</button>';
      }).join('') + '</span>' +
      '<button class="ghost" data-action="toggle-events" aria-pressed="' + state.showEvents + '">' + (state.showEvents ? '隐藏事件条' : '显示事件条') + '</button>' +
      '<span class="k">切换事件显隐不改曲线。</span></div>';
    out += '</div>';
    state._lastPaths = pathChanged;
    return out;
  }

  function filterEvents() {
    return (P().events || []).filter(function (e) { return true; });
  }

  /* ---------- 视图渲染 ---------- */
  function head(title, sub, actionsHtml) {
    return '<div class="page-head"><span class="eyebrow">ARCHPAL / TAK</span><h1>' + esc(title) + '</h1>' +
      (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') +
      (actionsHtml ? '<div class="actions">' + actionsHtml + '</div>' : '') +
      '<div class="actions"><button class="ghost" data-action="agent-hint" data-page="' + esc(state.view) + '">和 AI 讨论本页</button>' +
      '<span class="k">点击只把预写提示词放进右侧输入框，不会自动发送。</span></div></div>';
  }

  function aiBtn() { return '<button class="ghost" data-action="agent-hint" data-page="' + esc(state.view) + '">和 AI 讨论本页</button>'; }

  var VIEWS = {};

  /* —— 看板（A5 大状态卡 / A6 行动带 / A7 快捷卡三连）—— */
  VIEWS.dashboard = function () {
    var p = P();
    var map = pointsByCode();
    var esrN = (map.esr || []).length, crpN = (map.crp || []).length;
    var vesselN = (p.vesselRecords || []).length;
    var bpN = (p.bpRecords || []).length;
    var medN = (p.meds || []).length;
    var evN = (p.events || []).length;
    var docsN = (p.docs || []).length;
    var candN = (p.candidates || []).filter(function (c) { return !c.verified; }).length;
    var visits = (p.events || []).filter(function (e) { return e.type === '就诊'; });
    var lastVisit = visits.slice(-1)[0];
    var daysSince = null;
    if (lastVisit && /^\d{4}-\d{2}-\d{2}$/.test(lastVisit.date)) {
      daysSince = Math.max(0, Math.round((Date.now() - new Date(lastVisit.date + 'T00:00:00').getTime()) / 864e5));
    }
    var esrPts = (map.esr || []).slice().sort(byDate);
    var esrLast = esrPts.slice(-1)[0], esrPrev = esrPts.slice(-2)[0];
    var esrDelta = esrLast && esrPrev ? (esrLast.value - esrPrev.value) : null;
    var heroActions = '<button class="primary" data-action="primer-open-soft">疾病概要：大动脉炎是什么？</button>' +
      '<button class="ghost" data-action="go" data-view="review" data-sub="review-prep">准备下次复诊</button>';
    var out = head('今天，先把随访资料记清楚。', p.name + ' · ' + p.meta + '（合成示例档案）', heroActions);
    /* A5 大状态卡：大字状态（读时算，不落库）+ 医生原话句 */
    out += '<div class="status-card"><div class="sc-eyebrow">稳定随访 · 距上次就诊 · 待核对候选 ' + candN + ' 项</div>' +
      '<div class="sc-big">' + (daysSince !== null ? '第 ' + daysSince + ' 天' : '首次建档') + '</div>' +
      '<div class="sc-anchor">' + (lastVisit
        ? '锚点 <span class="date">' + esc(lastVisit.date) + '</span>（最近一次就诊）· 由事件时间线算出，不手填、不做状态判定'
        : '还没有就诊记录 · 记一次就诊后这里会显示间隔天数') + '</div>' +
      (lastVisit ? '<div class="sc-visit"><span class="pill brand">就诊</span> <span class="date">' + esc(lastVisit.date) + '</span> · ' + esc(lastVisit.text) + '</div>' : '') +
      (p.dxText ? '<div class="sc-quote">医生原话（摘要照抄）：" ' + esc(p.dxText) + ' "</div>' : '') +
      '<div class="actions"><button class="primary" data-action="go" data-view="review" data-sub="review-rhythm">看复查节奏</button>' +
      '<button class="ghost" data-action="go" data-view="dx" data-sub="dx-doc">确诊档案</button></div>' +
      '</div>';
    /* A6 行动带：暖底 + 左 5px 色条 + 右侧主按钮组 */
    if (esrLast) {
      out += '<div class="action-band"><div class="ab-main"><b>最近血沉 ' + esc(esrLast.value) + ' ' + esc(PROTO.metricDefs[0].unit) + '</b>' +
        (esrDelta !== null ? '，较上次 ' + deltaWord(esrDelta) + ' ' + Math.abs(esrDelta) : '') +
        '（<span class="date">' + esc(esrLast.date) + '</span> · ' + esc(esrLast.org || '来源未填') + '）' +
        '<div class="k">工作台不做判断，是不是要处理请以医生意见为准。</div></div>' +
        '<div class="ab-actions"><button class="primary" data-action="go" data-view="labs" data-sub="lab-trend">看指标趋势</button>' +
        '<button class="ghost" data-action="go" data-view="review" data-sub="review-prep">带去复诊的问题</button></div></div>';
    } else {
      out += '<div class="action-band"><div class="ab-main"><b>还没有化验记录</b><div class="k">记一条血沉/CRP，行动带会显示最近值与「较上次」。</div></div>' +
        '<div class="ab-actions"><button class="primary" data-action="go" data-view="labs" data-sub="lab-import">去记化验</button></div></div>';
    }
    out += '<div class="notice"><b>本页全部为合成示例</b> · 仅演示，未连接真实病历与宿主 · 解读归医生。0 患者访谈、0 临床审核（见 README）。</div>';
    /* A7 快捷卡三连：图标 + 标题 + 一句说明 + ↗ */
    out += '<div class="grid3" style="margin-top:14px">' +
      quickCard('≣', '记一条化验', '拿到化验单，先记血沉和 CRP', 'labs', 'lab-import') +
      quickCard('⌇', '记一次血压', '两臂都量，成对记录自动算「较上次」', 'vessels', 'v-bp') +
      quickCard('▦', '整理复诊问题', '把最近变化整理成给医生的问题清单', 'review', 'review-prep') +
      '</div>';
    out += '<div class="section-title"><h2>最近变化</h2><p>只列已发生事实（医生原话/报告原文），不做判定。</p></div>';
    var evs = (p.events || []).slice(-4).reverse();
    if (!evs.length) {
      out += '<div class="empty"><div class="big">还没有记录</div><p>从「确诊档案」或「检查与指标」开始记第一条。</p><button class="primary" data-action="go" data-view="dx" data-sub="dx-doc">去确诊档案</button></div>';
    } else {
      out += '<div class="swimlane"><div class="lane-head">事件泳道 · 最近 ' + evs.length + ' 条</div><div class="lane-body">' +
        evs.map(tlItem).join('') + '</div></div>';
    }
    out += '<div class="section-title"><h2>最近指标</h2><p>与疾病活动相关的化验（ESR/CRP）——仅回顾，不解读。</p></div>';
    out += '<div class="metric-grid">' +
      metricCard(PROTO.metricDefs[0], (map.esr || []).slice().sort(byDate)) +
      metricCard(PROTO.metricDefs[1], (map.crp || []).slice().sort(byDate)) +
      '</div>';
    if (!lastVisit) {
      out += '<div class="empty" style="margin-top:14px"><div class="big">还没有就诊记录</div><button class="primary" data-action="go" data-view="review" data-sub="review-rhythm">去复查节奏</button></div>';
    }
    return out;
  };
  function quickCard(icon, title, desc, view, sub) {
    return '<button class="quick-card" data-action="go" data-view="' + view + '" data-sub="' + sub + '">' +
      '<span class="qc-icon" aria-hidden="true">' + icon + '</span>' +
      '<span class="qc-main"><b>' + esc(title) + '</b><span class="k">' + esc(desc) + '</span></span>' +
      '<span class="qc-arrow" aria-hidden="true">↗</span></button>';
  }
  function byDate(a, b) { return a.date < b.date ? -1 : 1; }
  function tlItem(e) {
    return '<div class="tl-item"><span class="d">' + esc(fmtDate(e.date)) + '</span>' +
      '<span class="badge"><span class="pill ' + pillCls(e.type) + '">' + esc(e.type) + '</span></span>' +
      '<span class="tx">' + esc(e.text) + (e.source ? ' <span class="k">（' + esc(e.source) + '）</span>' : '') + '</span></div>';
  }
  function pillCls(type) {
    return { '就诊': 'brand', '用药': 'yellow', '检查': 'green', '影像': 'green', '症状变化': 'red' }[type] || '';
  }

  /* —— 确诊档案 —— */
  VIEWS.dx = function () {
    var sub = state.sub || 'dx-doc';
    var p = P();
    var out = head('确诊档案', SUBTITLES.dx);
    out += subnav('dx', sub);
    if (sub === 'dx-doc') {
      out += '<div class="card"><h3>医生诊断原话（摘要）</h3><p>' + esc(p.dxText) + '</p>' +
        '<p class="k">确诊日期：<span class="date">' + esc(fmtDate(p.diagnosisDate)) + '</span> · ' + esc(p.hospital || '医院未填') + '</p>' +
        '<p class="k">仅回顾，不解读；诊断以医生书面结论为准。</p></div>';
      out += '<div class="section-title"><h2>确诊依据材料</h2><p>原件与草稿分开；未取得原件的标注来源。</p></div>' + docsTable(p.docs);
      out += hospitalsSection(p);
    } else if (sub === 'dx-vessel') {
      out += vesselRecordList(p);
    } else if (sub === 'dx-imaging') {
      var img = p.imaging || [];
      if (!img.length) {
        out += '<div class="empty"><div class="big">还没有影像记录</div><p>拿到报告后在这里记一条。</p><button class="primary" data-action="demo-add-imaging">记一条影像（演示）</button></div>';
      } else {
        out += '<div class="table-wrap"><span class="scroll-hint">左右滑动</span><table><thead><tr><th>日期</th><th>检查</th><th>机构</th><th>说明</th><th>原件</th></tr></thead><tbody>' +
          img.map(function (r) {
            return '<tr><td class="date">' + esc(r.date) + '</td><td>' + esc(r.type) + '</td><td>' + esc(r.place || '未填') + '</td><td>' + esc(r.summary || '') + '</td><td>' +
              (r.originalAvailable ? '<span class="pill green">已取得</span>' : '<span class="pill yellow">未取得原件，据二次来源</span>') + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }
    } else if (sub === 'dx-mdt') {
      out += '<div class="empty"><div class="big">暂无会诊记录</div><p>如果去别的医院看了第二次，把医生原话记下来。</p><button class="primary" data-action="noop">记一次会诊（原型未实现录入）</button></div>';
    }
    return out;
  };

  function vesselRecordList(p) {
    var recs = p.vesselRecords || [];
    var out = '';
    if (!recs.length) {
      out += '<div class="empty"><div class="big">还没有血管节段记录</div><p>把影像报告里提到的血管按节段记一条（只记原文）。</p><button class="primary" data-action="go" data-view="vessels" data-sub="v-map">去受累血管图谱</button></div>';
      return out;
    }
    recs.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (r) {
      var segs = r.segments.map(function (id) {
        var s = PROTO.segments.filter(function (x) { return x.id === id; })[0];
        return s ? '<span class="pill brand">' + esc(s.name) + '</span>' : '';
      }).join(' ');
      out += '<details class="phase-fold"><summary><span class="date">' + esc(r.date) + '</span> ' + esc(r.modality) +
        '<span class="pill ' + (r.originalAvailable ? 'green' : 'yellow') + '">' + (r.originalAvailable ? '原件已取得' : '未取得原件') + '</span></summary>' +
        '<div class="fold-body"><p class="k">受累节段（报告提及，非分级）：' + segs + '</p>' +
        '<p>' + esc(r.quote) + '</p>' +
        '<p class="k">报告号 ' + esc(r.reportNo || '未填') + ' · ' + esc(r.source) + ' · ' + esc(r.createdBy || '') + ' · 新增记录不覆盖旧记录。</p></div></details>';
    });
    out += '<div class="notice">同一血管多次记录按日期并排可见（去「受累血管图谱」）；这里不判断「有没有变化」，变化由医生读片。</div>';
    return out;
  }

  /* —— 受累血管 —— */
  VIEWS.vessels = function () {
    var sub = state.sub || 'v-map';
    var p = P();
    var out = head('受累血管', SUBTITLES.vessels);
    out += subnav('vessels', sub);
    if (sub === 'v-map') {
      var bySeg = {};
      (p.vesselRecords || []).forEach(function (r) {
        r.segments.forEach(function (id) { (bySeg[id] || (bySeg[id] = [])).push(r); });
      });
      var groups = {};
      PROTO.segments.forEach(function (s) { (groups[s.group] || (groups[s.group] = [])).push(s); });
      out += '<div class="notice"><b>图谱说明</b>：打点 = 报告原文提到过该节段；不表示程度、不做分级；同一节段多次记录点开看日期版本。</div>';
      Object.keys(groups).forEach(function (g) {
        out += '<div class="metric-group"><div class="metric-group-head"><h3>' + esc(g) + '</h3><span>' + groups[g].length + ' 个节段</span></div><div class="metric-grid">';
        groups[g].forEach(function (s) {
          var hits = bySeg[s.id] || [];
          var front = '<span class="mface front"><span class="cat"><span class="dot"></span>血管节段</span>' +
            '<span class="name">' + esc(s.name) + '</span>' +
            '<span class="val">' + hits.length + '<small>次提及</small></span>' +
            (hits.length
              ? '<span class="delta">最近：<span class="date">' + esc(hits[hits.length - 1].date) + '</span>（' + esc(hits[hits.length - 1].modality) + '）</span>'
              : '<span class="na">报告未提及</span>') +
            '<span class="meta">' + (hits.length ? '点开看历次原文 · ' : '') + '对照影像报告</span></span>';
          var backBody;
          if (!hits.length) {
            backBody = '<span class="na">还没有提及记录——不是「正常」，只是没有记录。</span>';
          } else {
            backBody = '<ul style="margin:4px 0 0;padding-left:16px;font-size:12.5px">' + hits.slice().sort(byDate).map(function (r) {
              return '<li><span class="date">' + esc(r.date) + '</span> ' + esc(r.modality) + '：' + esc(r.quote.slice(0, 40)) + '…</li>';
            }).join('') + '</ul>';
          }
          out += '<button class="mcard" data-action="flip" data-code="seg-' + esc(s.id) + '" aria-pressed="' + (!!state.flipped['seg-' + s.id]) + '" aria-label="' + esc(s.name) + '受累记录，点击翻面">' +
            '<span class="mcard-inner">' + front +
            '<span class="mface back"><span class="cat"><span class="dot"></span>历次提及</span><span class="name">' + esc(s.name) + '</span>' +
            backBody + '<span class="foot">仅报告原文 · 不判定程度 · 点击返回</span></span></span></button>';
        });
        out += '</div></div>';
      });
    } else if (sub === 'v-bp') {
      out += bpSection(p);
    } else if (sub === 'v-event') {
      var evs = (p.events || []).filter(function (e) { return ['就诊', '检查', '影像', '症状变化'].indexOf(e.type) >= 0; });
      if (!evs.length) {
        out += '<div class="empty"><div class="big">暂无血管相关事件</div><button class="primary" data-action="go" data-view="chart" data-sub="ch-event">去时间线看全部事件</button></div>';
      } else {
        out += '<div class="swimlane"><div class="lane-head">血管事件 · ' + evs.length + ' 条（就诊/检查/影像/症状变化）</div><div class="lane-body">' + evs.slice().reverse().map(tlItem).join('') + '</div></div>';
      }
    }
    return out;
  };

  function bpSection(p) {
    var recs = (p.bpRecords || []).slice().sort(byDate).reverse();
    var out = '<div class="notice"><b>口径</b>：两臂血压差异与踝肱数值由医生解读；这里只记数字与「较上次差值」，<b>不做分级、不下结论</b>。同日多组测量按独立条目记，不推断先后。</div>';
    out += '<div class="row" style="margin-bottom:10px"><button class="primary" data-action="form-bp">记一条血压</button><span class="k">踝部血压当日没测就不填，显示「未测」。</span></div>';
    if (!recs.length) {
      out += '<div class="empty"><div class="big">还没有血压记录</div><p>按医生嘱咐的部位量（通常双臂，有时加踝）。</p></div>';
      return out;
    }
    out += '<div class="bp-grid">';
    recs.forEach(function (r, i) {
      var prev = recs[i + 1];
      function diffStr(cur, pv, label) {
        if (!cur || !pv || !pv[label]) return '';
        var d = cur[label].sys - pv[label].sys;
        if (!d) return '';
        return '<div>较上次（' + esc(pv.date) + '）' + esc(label === 'armL' ? '左臂' : label === 'armR' ? '右臂' : '踝') + '收缩压 ' + deltaWord(d) + Math.abs(d) + '</div>';
      }
      var diffs = '';
      if (prev) { diffs = diffStr(r, prev, 'armL') + diffStr(r, prev, 'armR'); }
      out += '<div class="card bp-card"><div class="row"><b class="date">' + esc(r.date) + '</b><span class="pill">' + esc(r.place || '场所未填') + '</span></div>' +
        '<div class="pair">' +
        '<div class="arm"><div class="t">左臂</div><div class="v">' + (r.armL ? r.armL.sys + '/' + r.armL.dia : '未测') + '</div></div>' +
        '<div class="arm"><div class="t">右臂</div><div class="v">' + (r.armR ? r.armR.sys + '/' + r.armR.dia : '未测') + '</div></div>' +
        '<div class="arm"><div class="t">左踝</div><div class="v">' + (r.ankleL ? r.ankleL.sys + '/' + r.ankleL.dia : '未测') + '</div></div>' +
        '<div class="arm"><div class="t">右踝</div><div class="v">' + (r.ankleR ? r.ankleR.sys + '/' + r.ankleR.dia : '未测') + '</div></div>' +
        '</div>' +
        (diffs ? '<div class="diff">' + diffs + '</div>' : (prev ? '<div class="diff k">较上次：部位不全，未计算差值</div>' : '<div class="diff k">首次记录</div>')) +
        (r.note ? '<p class="k">' + esc(r.note) + '</p>' : '') +
        (r.missingField ? '<p class="k">缺：' + esc(r.missingField) + '</p>' : '') +
        '</div>';
    });
    out += '</div>';
    return out;
  }

  /* —— 检查与指标 —— */
  VIEWS.labs = function () {
    var sub = state.sub || 'lab-trend';
    var out = head('检查与指标', SUBTITLES.labs);
    out += subnav('labs', sub);
    var map = pointsByCode();
    if (sub === 'lab-trend') {
      var cats = ['炎症指标'];
      out += comparabilityNote((map.esr || []).concat(map.crp || []));
      out += metricGroups(map, cats);
      out += '<div class="section-title"><h2>肝肾功能</h2><p>用药监测常用项目；阈值与解读归医生。</p></div>';
      out += metricGroups(map, ['肝肾功能']);
    } else if (sub === 'lab-cbc') {
      out += metricGroups(map, ['血常规']);
    } else if (sub === 'lab-import') {
      out += '<div class="row" style="margin-bottom:10px"><button class="primary" data-action="form-lab">手工录入化验</button><span class="k">解析候选照样在下方逐条核对。</span></div>';
      out += candidatesSection();
    }
    return out;
  };

  function candidatesSection() {
    var p = P();
    var cands = p.candidates || [];
    var out = '<div class="notice"><b>候选 ≠ 已入库</b>：解析结果只是候选，逐项核对后才进入趋势；拒收不产生任何变化。</div>';
    if (!cands.length) {
      out += '<div class="empty"><div class="big">没有待核对候选</div><p>从「资料库」导入报告后，候选会出现在这里。</p><button class="primary" data-action="go" data-view="docs" data-sub="docs-lib">去资料库导入</button></div>';
      return out;
    }
    out += '<div class="table-wrap"><table><thead><tr><th>候选</th><th>内容</th><th>来源</th><th>操作</th></tr></thead><tbody>';
    cands.forEach(function (c) {
      if (c.verified) return;
      var desc = c.kind === 'metric'
        ? PROTO.metricDefs.filter(function (d) { return d.code === c.code; })[0].name + ' ' + c.value + ' ' + c.unit + '（' + c.date + ' · ' + c.method + ' · ' + c.org + '）'
        : c.item + '（' + c.date + '）';
      out += '<tr><td><span class="pill yellow">候选</span></td><td>' + esc(desc) + '</td><td>' + esc(c.from) + '</td>' +
        '<td><button class="primary" data-action="verify" data-id="' + esc(c.id) + '">核对入库</button> ' +
        '<button class="ghost" data-action="reject" data-id="' + esc(c.id) + '">拒收</button></td></tr>';
    });
    out += '</tbody></table></div>';
    var verified = cands.filter(function (c) { return c.verified; });
    if (verified.length) {
      out += '<div class="section-title"><h2>已核对</h2><p>核对后进入趋势图，这里留痕。</p></div>';
      out += '<div class="table-wrap"><table><thead><tr><th>内容</th><th>核对时间</th></tr></thead><tbody>' +
        verified.map(function (c) { return '<tr><td>' + esc(c.kind === 'metric' ? c.code + ' ' + c.value + ' ' + c.unit : c.item) + '</td><td>' + esc(c.verifiedAt || '') + '</td></tr>'; }).join('') +
        '</tbody></table></div>';
    }
    return out;
  }

  /* —— 用药与减量 —— */
  VIEWS.meds = function () {
    var sub = state.sub || 'med-gluc';
    var p = P();
    var out = head('用药与减量', SUBTITLES.meds);
    out += subnav('meds', sub);
    var meds = p.meds || [];
    function medRows(cat) {
      var rows = meds.filter(function (m) { return m.cat === cat; }).slice().sort(byDate).reverse();
      if (!rows.length) {
        return '<div class="empty"><div class="big">暂无' + cat + '记录</div><p>医生调整用药时在这里记一条（药名+剂量+日期+原话）。</p><button class="primary" data-action="go" data-view="docs" data-sub="docs-cand">去资料库核对医嘱</button></div>';
      }
      return '<div class="table-wrap"><table><thead><tr><th>日期</th><th>药名</th><th class="n">剂量</th><th>医生原话/说明</th><th>来源</th></tr></thead><tbody>' +
        rows.map(function (m) {
          return '<tr><td class="date">' + esc(m.date) + '</td><td>' + esc(m.drug) + '</td><td class="n">' + (m.doseMg ? esc(m.doseMg) + ' mg' + (m.perDay ? '/日' : '') : '【剂量未记录】') + '</td>' +
            '<td>' + esc(m.note || '—') + '</td><td>' + esc(m.source || '未填') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    if (sub === 'med-gluc') {
      out += '<div class="row" style="margin-bottom:10px"><button class="primary" data-action="form-med">记一次调药</button><span class="k">药名、剂量、医生原话照抄，不做建议。</span></div>';
      out += medRows('糖皮质激素');
      var gluc = meds.filter(function (m) { return m.cat === '糖皮质激素' && m.doseMg; }).slice().sort(byDate);
      if (gluc.length > 1) {
        out += '<div class="section-title"><h2>剂量阶梯（仅回顾）</h2><p>从确诊起按日期排列；不是建议，下一步怎么减要问医生。</p></div><div class="chart-card"><svg class="chart" viewBox="0 0 980 180" role="img" aria-label="糖皮质激素剂量阶梯，仅回顾">';
        var xy = toXY(gluc.map(function (m) { return { date: m.date, value: m.doseMg }; }), 980, 180, { l: 40, r: 16, t: 14, b: 26 });
        out += '<path fill="none" stroke="var(--brand)" stroke-width="2" d="' + smoothPath(xy.map(function (q) { return [q[0], q[1]]; })) + '"></path>';
        xy.forEach(function (q) {
          out += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="4" fill="var(--brand)"></circle>' +
            '<text x="' + (q[0] - 4).toFixed(1) + '" y="' + (q[1] - 10).toFixed(1) + '" font-size="11" text-anchor="end">' + q[2].value + 'mg</text>' +
            '<text x="' + q[0].toFixed(1) + '" y="176" font-size="10" text-anchor="middle" fill="var(--muted)">' + esc(q[2].date.slice(0, 7)) + '</text>';
        });
        out += '</svg><div class="k">「与用药相关的化验」去「检查与指标」看，本图不合并两种信息。</div></div>';
      }
    } else if (sub === 'med-imm') {
      out += medRows('免疫抑制剂');
      out += medRows('生物制剂');
    } else if (sub === 'med-note') {
      var notes = meds.filter(function (m) { return m.note && m.note.indexOf('医生原话') >= 0; });
      if (!notes.length) {
        out += '<div class="empty"><div class="big">暂无医生原话记录</div><p>医生关于用药的原话值得存下来。</p><button class="primary" data-action="noop">记一条（原型未实现录入）</button></div>';
      } else {
        out += '<div class="swimlane"><div class="lane-head">医生原话 · ' + notes.length + ' 条</div><div class="lane-body">' +
          notes.map(function (m) { return '<div class="tl-item"><span class="d">' + esc(m.date) + '</span><span class="badge"><span class="pill brand">医嘱</span></span><span class="tx">' + esc(m.note) + '</span></div>'; }).join('') +
          '</div></div>';
      }
      out += '<div class="notice warn">【待核】任何药物适应证与剂量范围未经 NMPA/临床审核，本页只记录你自己的医嘱，不提供对照。</div>';
    }
    return out;
  };

  /* —— 复诊与筛查 —— */
  VIEWS.review = function () {
    var sub = state.sub || 'review-rhythm';
    var p = P();
    var out = head('复诊与筛查', SUBTITLES.review);
    out += subnav('review', sub);
    if (sub === 'review-rhythm') {
      var vis = (p.events || []).filter(function (e) { return e.type === '就诊'; });
      if (!vis.length) {
        out += '<div class="empty"><div class="big">还没有就诊记录</div><button class="primary" data-action="go" data-view="dx" data-sub="dx-doc">去确诊档案</button></div>';
      } else {
        out += '<div class="swimlane"><div class="lane-head">就诊史 · ' + vis.length + ' 次</div><div class="lane-body">' + vis.slice().reverse().map(tlItem).join('') + '</div></div>';
      }
      out += '<div class="notice">下次复查间隔以医生嘱咐为准；本页不计算、不提醒具体日期。</div>';
    } else if (sub === 'review-screen') {
      var scr = p.screenings || [];
      if (!scr.length) {
        out += '<div class="empty"><div class="big">暂无并发症筛查记录</div><p>医生说「查什么、多久查一次」，在这里记一条。</p><button class="primary" data-action="demo-add-screen">记一条筛查（演示）</button></div>';
      } else {
        out += '<div class="table-wrap"><table><thead><tr><th>日期</th><th>项目</th><th>医生嘱咐的节奏</th><th>上次结果（原文）</th><th>原件</th></tr></thead><tbody>' +
          scr.slice().sort(byDate).reverse().map(function (s) {
            return '<tr><td class="date">' + esc(s.date) + '</td><td>' + esc(s.item) + '</td><td>' + esc(s.plan || '未记录') + '</td><td>' + esc(s.lastResult || '—') + '</td><td>' +
              (s.originalAvailable ? '<span class="pill green">已取得</span>' : '<span class="pill yellow">未取得原件</span>') + '</td></tr>';
          }).join('') + '</tbody></table></div>';
        out += '<div class="notice">筛查结果只存原文摘录；「异常/正常」的判断归医生。</div>';
      }
    } else if (sub === 'review-prep') {
      out += prepSection(p);
    }
    return out;
  };

  function prepSection(p) {
    var map = pointsByCode();
    var esr = (map.esr || []).slice(-1)[0], crp = (map.crp || []).slice(-1)[0];
    var bp = filterPrivate(p.bpRecords || []).slice(-1)[0];
    var meds = filterPrivate(p.meds || []).slice(-1)[0];
    var items = [];
    if (esr) items.push('最近血沉 ' + esr.value + ' ' + esr.unit + '（' + esr.date + '）');
    if (crp) items.push('最近 CRP ' + crp.value + ' ' + crp.unit + '（' + crp.date + '）');
    if (bp && bp.armL) items.push('最近左臂血压 ' + bp.armL.sys + '/' + bp.armL.dia + '（' + bp.date + '）');
    if (bp && bp.armR) items.push('最近右臂血压 ' + bp.armR.sys + '/' + bp.armR.dia + '（' + bp.date + '）');
    if (meds) items.push('当前用药记录：' + meds.drug + (meds.doseMg ? ' ' + meds.doseMg + 'mg' + (meds.perDay ? '/日' : '') : '') + '（' + meds.date + '）');
    var privDocs = (p.docs || []).filter(isPrivate).length;
    var out = '<div class="notice">本清单由已核对记录生成（' + privacyLine(p.docs || []) + '）；<b>仅回顾，不解读</b>。</div>';
    if (!items.length) {
      out += '<div class="empty"><div class="big">还没有可整理的记录</div><p>先录入化验或血压。</p><button class="primary" data-action="go" data-view="labs" data-sub="lab-import">去待核对候选</button></div>';
      return out;
    }
    out += '<div class="card"><h3>可以带去诊室的摘要</h3><ul>' + items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<div class="row"><button class="primary" data-action="copy-prep">复制文本</button>' + aiBtn() + '</div></div>';
    out += '<div class="section-title"><h2>问题清单</h2><p>AI 只提供候选问题，逐条核对后采纳。</p></div>';
    var pool = state.draftPool.questions || defaultQuestions(p);
    out += '<ul>' + pool.map(function (q, i) {
      return '<li>' + esc(q.text) + ' <span class="pill ' + (q.verified ? 'green' : 'yellow') + '">' + (q.verified ? '已核对' : '候选') + '</span>' +
        (q.verified && q.asked ? ' <span class="k">问过：' + esc(q.asked) + '</span>' : '') +
        (q.verified ? '' : ' <button class="ghost" data-action="verify-q" data-i="' + i + '">核对</button> <button class="ghost" data-action="reject-q" data-i="' + i + '">拒收</button>') + '</li>';
    }).join('') + '</ul>';
    return out;
  }
  function defaultQuestions(p) {
    var qs = [
      { text: '最近的化验变化需要调整复查间隔吗？', verified: false },
      { text: '激素下一步怎么减？（结合最近记录）', verified: false },
      { text: '两臂血压差异最近要紧吗？', verified: false },
      { text: '下次影像复查选超声还是 CTA/MRA？', verified: false }
    ];
    if (p.pregList) p.pregList.forEach(function (q) { qs.push({ text: q.text, verified: q.verified, asked: q.asked }); });
    return qs;
  }

  /* —— 生育与妊娠 —— */
  VIEWS.preg = function () {
    var sub = state.sub || 'preg-list';
    var p = P();
    var out = head('生育与妊娠', SUBTITLES.preg);
    out += subnav('preg', sub);
    if (sub === 'preg-list') {
      var list = p.pregList || [];
      if (!list.length) {
        out += '<div class="empty"><div class="big">还没有问题清单</div><p>备孕前想问什么，先记下来再问医生。</p><button class="ghost" data-action="agent-hint" data-page="preg">让 AI 帮我起草问题清单</button></div>';
      } else {
        out += '<div class="notice">问题清单只是<strong>候选/预览</strong>，逐条核对后才是「已核对」；医生回答记原文。拒收零副作用。</div>';
        out += '<ul>' + list.map(function (q, i) {
          return '<li style="margin:8px 0">' + esc(q.text) +
            ' <span class="pill ' + (q.verified ? 'green' : 'yellow') + '">' + (q.verified ? '已问过' : '候选') + '</span>' +
            (q.verified && q.asked ? ' <span class="k">' + esc(q.asked) + '</span>' : '') +
            (q.verified ? '' : ' <button class="ghost" data-action="verify-preg" data-i="' + i + '">核对</button> <button class="ghost" data-action="reject-preg" data-i="' + i + '">拒收</button>') + '</li>';
        }).join('') + '</ul>';
        out += '<div class="row"><button class="primary" data-action="form-pregq">加一条问题</button>' + aiBtn() + '</div>';
      }
    } else if (sub === 'preg-track') {
      out += '<div class="row" style="margin-bottom:10px"><button class="primary" data-action="form-pregtrack">记一条妊娠随访</button><span class="k">产科与风湿科双线，按日期挂。</span></div>';
      var tr = p.pregTrack || [];
      if (!tr.length) {
        out += '<div class="empty"><div class="big">暂无妊娠随访记录</div><p>如果怀孕了，产科与风湿科的随访记录按日期记在这里。</p><button class="primary" data-action="noop">记一条（原型未实现录入）</button></div>';
      } else {
        out += '<div class="swimlane"><div class="lane-head">妊娠随访 · 双科记录</div><div class="lane-body">' + tr.map(tlItem).join('') + '</div></div>';
      }
    }
    return out;
  };

  /* —— 功能与生活 —— */
  VIEWS.life = function () {
    var sub = state.sub || 'life-func';
    var p = P();
    var out = head('功能与生活', SUBTITLES.life);
    out += subnav('life', sub);
    var entries = p.lifeEntries || [];
    if (!entries.length) {
      out += '<div class="empty"><div class="big">还没有记录</div><p>用自己的话记：今天累不累、能做什么。</p><button class="primary" data-action="noop">记一条（原型未实现录入）</button></div>';
    } else if (sub === 'life-func') {
      out += '<div class="notice">只记你自己的描述（原文），不打分、不评级；「近 90 天记录 ' + entries.length + ' 条」。</div>';
      out += '<div class="swimlane"><div class="lane-head">功能与疲劳 · ' + entries.length + ' 条</div><div class="lane-body">' +
        entries.slice().reverse().map(function (e) { return '<div class="tl-item"><span class="d">' + esc(e.date) + '</span><span class="badge"><span class="pill">自述</span></span><span class="tx">' + esc(e.text) + '</span></div>'; }).join('') +
        '</div></div>';
      out += '<div class="row" style="margin-top:10px"><button class="primary" data-action="form-life">记一条日常</button>' + aiBtn() + '</div>';
    } else {
      out += '<div class="empty"><div class="big">日常生活记录待建</div><p>饮食、睡眠、运动等日常条目。</p><button class="primary" data-action="noop">记一条（原型未实现录入）</button></div>';
    }
    return out;
  };

  /* —— 心理与家庭 —— */
  VIEWS.mind = function () {
    var sub = state.sub || 'mind-feel';
    var p = P();
    var out = head('心理与家庭', SUBTITLES.mind);
    out += subnav('mind', sub);
    var entries = p.mindEntries || [];
    var privN = entries.filter(isPrivate).length;
    if (sub === 'mind-feel') {
      if (!entries.length) {
        out += '<div class="empty"><div class="big">还没有记录</div><p>这里的内容默认私密，只属于你。</p><button class="primary" data-action="noop">记一条（原型未实现录入）</button></div>';
      } else {
        out += '<div class="notice warn"><b>默认私密</b>：' + privacyLine(entries) + '。私密条目不会出现在导出、AI 上下文和摘要预览里。</div>';
        out += '<div class="swimlane"><div class="lane-head">当下感受 · ' + entries.length + ' 条</div><div class="lane-body">' +
          entries.slice().reverse().map(function (e) {
            return '<div class="tl-item"><span class="d">' + esc(e.date) + '</span><span class="badge">' + (e.private ? '<span class="pill red">私密</span>' : '<span class="pill">一般</span>') + '</span><span class="tx">' + esc(e.text) + '</span></div>';
          }).join('') + '</div></div>';
        out += '<div class="row" style="margin-top:10px"><button class="primary" data-action="form-mind">记一条感受</button><span class="k">默认私密。</span>' + aiBtn() + '<span class="k">点「和 AI 讨论」也不会携带私密条目。</span></div>';
      }
    } else {
      out += '<div class="card"><h3>家庭负担与照护者</h3><p class="k">把「家里人帮了什么、什么最难开口」留在这里；内容为本病种原创。</p>' +
        '<div class="empty"><div class="big">暂无条目</div><p>例：谁陪诊、谁记血压、谁管药盒。</p><button class="primary" data-action="noop">记一条（原型未实现录入）</button></div></div>';
    }
    return out;
  };

  /* —— 病情一图秀（D1 rail 双栏 / D2 rail 三节 / D5 私密标注）—— */
  VIEWS.chart = function () {
    var sub = state.sub || 'ch-trend';
    var out = head('病情一图秀', SUBTITLES.chart);
    out += subnav('chart', sub);
    if (sub === 'ch-trend') {
      var rail = '<aside class="chart-rail" aria-label="图表选择栏">';
      rail += '<div class="rail-sec"><div class="rail-h">时间范围</div><div class="rail-chips">' +
        [['all', '全部'], ['12m', '近 12 月'], ['6m', '近 6 月'], ['3m', '近 3 月']].map(function (o) {
          return '<button data-action="tw" data-w="' + o[0] + '" aria-pressed="' + (state.timeWindow === o[0]) + '">' + o[1] + '</button>';
        }).join('') + '</div></div>';
      var groups = {};
      PROTO.metricDefs.forEach(function (d) { (groups[d.cat] || (groups[d.cat] = [])).push(d); });
      rail += '<div class="rail-sec"><div class="rail-h">选择指标（最多 4 条）</div>';
      var map = pointsByCode();
      Object.keys(groups).forEach(function (cat) {
        rail += '<div class="rail-cat">' + esc(cat) + '</div>';
        groups[cat].forEach(function (d) {
          var on = state.sel.indexOf(d.code) >= 0;
          var pts = (map[d.code] || []).slice().sort(byDate);
          var last = pts.slice(-1)[0];
          rail += '<label class="rail-item"><input type="checkbox" data-action="sel-check" data-code="' + esc(d.code) + '"' + (on ? ' checked' : '') + '>' +
            '<span class="sw" style="background:' + selColor(d.code) + '"></span>' + esc(d.name) +
            '<span class="rail-last num">' + (last ? last.value + ' ' + d.unit : '—') + '</span></label>';
        });
      });
      rail += '</div>';
      rail += '<div class="rail-sec"><div class="rail-h">显示内容</div><div class="rail-chips">' +
        '<button data-action="toggle-events" aria-pressed="' + state.showEvents + '">事件条</button></div></div>';
      var privMind = (P().mindEntries || []).filter(isPrivate).length;
      rail += '<div class="rail-note k">图内只画已核对记录；私密 ' + privMind + ' 条不含（心理记录不入图）。</div>';
      rail += '</aside>';
      var main = '<div class="chart-main"><div class="row" style="margin-bottom:10px">' + PROTO.metricDefs.map(function (d) {
        var on = state.sel.indexOf(d.code) >= 0;
        return '<button class="ghost" data-action="sel" data-code="' + esc(d.code) + '" aria-pressed="' + on + '">' + esc(d.name) + '</button>';
      }).join('') + '</div>' + renderChart() +
        '<div class="notice" style="margin-top:10px"><b>口径</b>：每条线按该指标全期 min/max 归一化，<b>不同指标不可比</b>；方法/机构变化处已断开；「仅回顾，不解读」。</div></div>';
      out += '<div class="chart-layout">' + rail + main + '</div>';
    } else if (sub === 'ch-event') {
      var evs = filterEvents();
      if (!evs.length) {
        out += '<div class="empty"><div class="big">暂无事件</div><button class="primary" data-action="go" data-view="dx" data-sub="dx-doc">去确诊档案</button></div>';
      } else {
        out += '<div class="swimlane"><div class="lane-head">事件泳道 · ' + evs.length + ' 条</div><div class="lane-body">' + evs.slice().reverse().map(tlItem).join('') + '</div></div>';
      }
    } else {
      out += '<div class="card"><h3>数据口径</h3><ul>' +
        '<li>化验按「方法 + 机构」分可比组；跨方法不合并、不做差、不连线。</li>' +
        '<li>血压按「部位」分列（左臂/右臂/踝），差值只写「较上次」。</li>' +
        '<li>事件与曲线分层展示，不画在同一条带。</li>' +
        '<li>派生判断（活动度/分级）不入库、不上图；只存医生原文。</li>' +
        '<li>演示数据为唯一源：改 demo-data.js 一个值，图、卡、时间线同步变。</li>' +
        '</ul></div>';
    }
    return out;
  };

  function selColor(code) {
    var i = ['esr', 'crp', 'wbc', 'hb', 'plt', 'alt', 'creat'].indexOf(code);
    return ['var(--brand)', 'var(--teal)', 'var(--plum)', 'var(--amber)', 'var(--action)', 'var(--muted)', 'var(--brand-deep)'][i] || 'var(--brand)';
  }

  /* —— 临床研究（35 号四段链路：建档→检索→匹配→呈现/收藏）—— */
  VIEWS.trials = function () {
    var sub = state.sub || 'tr-facts';
    var out = head('临床研究', SUBTITLES.trials);
    out += subnav('trials', sub);
    if (sub === 'tr-facts') {
      var p = P();
      var map = pointsByCode();
      var esr = (map.esr || []).slice(-1)[0];
      var cats = {};
      (p.meds || []).forEach(function (m) { cats[m.cat] = 1; });
      out += '<div class="notice"><b>四段链路 ① 建档</b>：只有<b>已确认入库</b>的字段参与匹配；待核对候选不参与（候选核对去「检查与指标 → 待核对候选」）。</div>';
      out += '<div class="grid2" style="margin-top:10px"><div class="card"><h3>档案字段（已入库）</h3><ul>' +
        '<li>诊断：大动脉炎（TAK）——以医生书面结论为准</li>' +
        '<li>性别 / 年龄：' + esc(p.sex || '女') + ' / ' + esc(p.age) + ' 岁</li>' +
        '<li>治疗经验类别：' + esc(Object.keys(cats).join('、') || '未记录') + '</li>' +
        '<li>最近化验：' + (esr ? 'ESR ' + esc(esr.value) + '（' + esc(esr.date) + '）' : '未记录') + '</li>' +
        '<li>所在城市：<b>未登记</b>——匹配里这项会标「待确认」，不会瞎猜</li>' +
        '</ul><p class="k">这页给检索与匹配提供事实底座；不自动判断你是否符合任何试验条件。</p></div>' +
        '<div class="card"><h3>候选池口径（写在卡头）</h3>' +
        '<p class="k">· 原型内置 <b>2 条示例条目</b>（虚构，不是真实研究，不含可用登记号）；开发版走 research/takayasu 快照 <b>104 条</b>（2026-11-05）。</p>' +
        '<p class="k">· 已载 2 / 快照 104 ——<b>不是全库扫描</b>，检索词命中才进池。</p>' +
        '<p class="k">· 登记状态一律「未核实」；快照会过期，以官方登记页为准。</p></div></div>';
    } else if (sub === 'tr-search') {
      out += '<div class="notice"><b>四段链路 ② 检索</b>：我要找某个药 / 编号 / 方向——按你选的条件排，<b>不掺分数</b>。示例条目为虚构（不含可用登记号）；开发版走真实快照。</div>';
      out += '<div class="card" style="margin-top:10px"><div class="form">' +
        '<label>关键词（药名 / 编号 / 方向）<input id="tr-kw" placeholder="如：托珠单抗、NCT 编号、免疫治疗" inputmode="search"></label>' +
        '<div class="grid3">' +
        '<label>状态<select id="tr-status"><option value="">全部</option><option>招募中</option><option>已完结</option></select></label>' +
        '<label>阶段<select id="tr-phase"><option value="">全部</option><option>观察性</option><option>II 期</option></select></label>' +
        '<label>地区<select id="tr-region"><option value="">全部</option><option value="cn">含中国中心</option><option value="other">其他地区</option></select></label>' +
        '</div><div class="row"><button class="primary" data-action="tr-search-run">检索</button>' +
        '<span class="k">检索不产生匹配分数，只按条件过滤。</span></div></div></div>';
      out += '<div id="tr-search-out" style="margin-top:10px">' + trialSearchRows('', '', '', '') + '</div>';
    } else {
      var p2 = P();
      var pref = state.trialPref || { china: true, recruiting: true };
      var matches = matchTrials(p2);
      out += '<div class="notice"><b>四段链路 ③ 匹配</b>：「我这份档案，哪些登记能对上？」——分层规则 + 逐条证据链；百分数只在展示层算，<b>不入库、不写判读列</b>；这是<b>登记字段符合度，不是入组资格</b>。</div>';
      out += '<div class="row" style="margin:10px 0"><span class="pill">偏好（只影响排序）</span>' +
        '<button class="ghost" data-action="tr-pref" data-k="china" aria-pressed="' + !!pref.china + '">优先含中国中心</button>' +
        '<button class="ghost" data-action="tr-pref" data-k="recruiting" aria-pressed="' + !!pref.recruiting + '">优先招募中</button></div>';
      var saved = state.savedTrials || {};
      var savedKeys = Object.keys(saved);
      out += '<div class="section-title"><h2>候选线索</h2><p>收藏后逐条核对；可拒收零副作用。收藏只存本机 {试验, 日期, 状态}。</p></div>';
      out += '<div>' + matches.list.map(trialMatchCard).join('') + '</div>';
      out += '<div class="section-title"><h2>收藏与跟踪（' + savedKeys.length + '）</h2><p>在跟 / 准备问 / 已归档；快照没有登记状态变化时间线——<b>没有就是没有，不画假进度条</b>。</p></div>';
      if (!savedKeys.length) {
        out += '<div class="empty"><div class="big">还没有收藏</div><p>在匹配卡上点「收藏为线索」。</p></div>';
      } else {
        out += '<div class="table-wrap"><table><thead><tr><th>研究</th><th>收藏日期</th><th>状态</th><th>操作</th></tr></thead><tbody>' +
          savedKeys.map(function (k) {
            var it = saved[k];
            return '<tr><td>' + esc(it.title) + '</td><td class="date">' + esc(it.savedOn) + '</td>' +
              '<td><span class="pill ' + (it.state === 'tracking' ? 'green' : it.state === 'toAsk' ? 'yellow' : '') + '">' + esc(stateLabel(it.state)) + '</span></td>' +
              '<td>' + ['tracking', 'toAsk', 'archived'].map(function (st) {
                return '<button class="ghost" data-action="tr-state" data-k="' + esc(k) + '" data-st="' + st + '"' + (it.state === st ? ' disabled' : '') + '>' + stateLabel(st) + '</button>';
              }).join(' ') + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }
      out += '<div class="row" style="margin-top:10px">' + aiBtn() + '</div>';
    }
    return out;
  };

  function stateLabel(st) { return { tracking: '在跟', toAsk: '准备问', archived: '已归档' }[st] || st; }

  function trialSearchRows(kw, status, phase, region) {
    var rows = TRIAL_POOL().filter(function (r) {
      if (kw && (r.title + ' ' + r.id).toLowerCase().indexOf(kw.toLowerCase()) < 0) return false;
      if (status && r.status.indexOf(status) < 0) return false;
      if (phase && r.phase !== phase) return false;
      if (region === 'cn' && !r.inChina) return false;
      if (region === 'other' && r.inChina) return false;
      return true;
    });
    if (!rows.length) {
      return '<div class="empty"><div class="big">没有命中候选池里的条目</div><p>候选池只有 ' + TRIAL_POOL().length + ' 条示例（虚构）；开发版走 research 快照 104 条。</p></div>';
    }
    return '<div class="table-wrap"><span class="scroll-hint">左右滑动</span><table><thead><tr><th>登记号</th><th>研究</th><th>阶段</th><th>状态</th><th>地区</th><th>申办方</th><th>操作</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td>' + esc(r.id) + '</td><td>' + esc(r.title) + '</td><td>' + esc(r.phase) + '</td><td>' + esc(r.status) + '</td><td>' + esc(r.place) + '</td><td>' + esc(r.sponsor) + '</td>' +
          '<td><button class="ghost" data-action="tr-detail" data-id="' + esc(r.id) + '">看判据</button> <button class="ghost" data-action="tr-save" data-id="' + esc(r.id) + '">收藏</button></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="k">登记摘录≠推荐；入组条件请以官方登记页与医生意见为准（状态未核实）。</p>';
  }

  function TRIAL_POOL() {
    return [
      { id: 'NCT-示例-1', title: '大血管炎免疫治疗观察性研究（登记摘录）', phase: '观察性', status: '招募中（摘录）', place: '多中心（含中国中心）', sponsor: '示例申办方（虚构）', kind: '观察性研究', inChina: true, recruiting: true },
      { id: 'NCT-示例-2', title: '大动脉炎生物制剂 II 期研究（登记摘录）', phase: 'II 期', status: '已完结（摘录）', place: '美国', sponsor: '示例申办方（虚构）', kind: '干预性研究', inChina: false, recruiting: false }
    ];
  }

  /* 匹配引擎（展示层）：判据只来自快照真实存在的字段；药物靶点不进分母；三态证据链 */
  function matchTrials(p) {
    var map = pointsByCode();
    var esr = (map.esr || []).slice(-1)[0];
    var cats = {};
    (p.meds || []).forEach(function (m) { cats[m.cat] = 1; });
    var pool = TRIAL_POOL();
    var pref = state.trialPref || {};
    var list = pool.map(function (r) {
      var evidence = [
        { cat: 'status', hard: true, cond: '登记状态为招募中（才方便咨询入组细节）', record: r.status,
          profile: '无需档案值——只看登记侧', state: r.recruiting ? 'ok' : 'no', srcNote: '登记摘录（状态未核实）' },
        { cat: 'location', hard: false, cond: '研究中心地区可及', record: r.place,
          profile: '所在城市未登记', state: 'unknown', srcNote: '条目无法结构化，需人工核对（登记号 ' + r.id + '）' },
        { cat: 'type', hard: false, cond: '研究类型与你愿意了解的方向一致', record: r.kind,
          profile: '治疗经验：' + (Object.keys(cats).join('、') || '未记录') + '（已入库字段）',
          state: r.kind === '观察性研究' ? 'ok' : 'unknown', srcNote: '干预性研究是否考虑新药，需与医生确认' },
      ];
      var n = evidence.filter(function (e) { return e.state === 'ok'; }).length;
      var k = evidence.filter(function (e) { return e.state === 'unknown'; }).length;
      var m = evidence.length;
      var pct = n / m;
      var band = pct >= 0.6 ? '字段都对得上' : '部分对得上';
      return { r: r, evidence: evidence, n: n, k: k, m: m, pct: pct, band: band };
    });
    list.sort(function (a, b) {
      var sa = (pref.recruiting ? (a.r.recruiting ? 1 : 0) : 0) + (pref.china ? (a.r.inChina ? 1 : 0) : 0);
      var sb = (pref.recruiting ? (b.r.recruiting ? 1 : 0) : 0) + (pref.china ? (b.r.inChina ? 1 : 0) : 0);
      if (sa !== sb) return sb - sa;
      return b.pct - a.pct;
    });
    return { list: list };
  }

  function trialMatchCard(mr) {
    var pct = Math.round(mr.pct * 100);
    return '<button class="card trial-card" data-action="tr-detail" data-id="' + esc(mr.r.id) + '" style="text-align:left;cursor:pointer">' +
      '<span class="tc-score"><b class="tc-pct num">' + pct + '%</b><span class="k">登记字段符合度</span>' +
      '<span class="tc-nm num">' + mr.n + ' / ' + mr.m + ' 项对得上 · ' + mr.k + ' 项待确认</span>' +
      '<span class="pill brand">' + esc(mr.band) + '</span>' +
      '<span class="k">不是入组资格判断</span></span>' +
      '<span class="tc-main"><b>' + esc(mr.r.title) + '</b>' +
      '<span class="k">' + esc(mr.r.id) + ' · ' + esc(mr.r.phase) + ' · ' + esc(mr.r.status) + ' · ' + esc(mr.r.sponsor) + ' · ' + esc(mr.r.place) + '</span></span>' +
      '<span class="tc-tags"><span class="pill ' + (mr.r.recruiting ? 'green' : '') + '">' + (mr.r.recruiting ? '招募中' : '非招募') + '</span>' +
      '<span class="pill ' + (mr.r.inChina ? 'green' : '') + '">' + (mr.r.inChina ? '含中国中心' : '其他地区') + '</span></span>' +
      '</button>';
  }

  /* E5：右侧浮窗（不是居中弹窗）：遮罩 / ✕ / Esc 三个关闭口；焦点回触发卡；不改 hash */
  var trialPanel = null;
  function openTrialDetail(id, trigger) {
    closeTrialPanel();
    var mr = matchTrials(P()).list.filter(function (x) { return x.r.id === id; })[0];
    if (!mr) return;
    trialPanel = document.createElement('div');
    trialPanel.className = 'tp-shade';
    var pct = Math.round(mr.pct * 100);
    var evRows = mr.evidence.map(function (e) {
      var cls = e.state === 'ok' ? 'ok' : e.state === 'no' ? 'no' : 'unknown';
      var mark = e.state === 'ok' ? '✓ 符合' : e.state === 'no' ? '✕ 不符合' : '? 待确认';
      return '<div class="ev-row"><span class="pill ' + cls + '">' + mark + '</span> <b>' + esc(e.cond) + '</b>' +
        (e.hard ? ' <span class="pill red">硬性条件</span>' : '') +
        '<div class="k">记录里是：' + esc(e.record) + '（' + esc(e.srcNote) + '）· 条件要求：' + esc(e.cond) + '</div>' +
        '<div class="k">档案侧：' + esc(e.profile) + '</div></div>';
    }).join('');
    var order = ['no', 'unknown', 'ok'];
    var sorted = mr.evidence.slice().sort(function (a, b) { return order.indexOf(a.state) - order.indexOf(b.state); });
    trialPanel.innerHTML = '<div class="tp-panel" role="dialog" aria-modal="true" aria-label="试验判据详情">' +
      '<div class="tp-head"><b>' + esc(mr.r.title) + '</b><span class="spacer"></span>' +
      '<button class="icon-button" data-tp="close" aria-label="关闭判据详情">×</button></div>' +
      '<div class="tp-body">' +
      '<div class="card"><span class="tc-pct num">' + pct + '%</span> <b>登记字段符合度（' + esc(mr.band) + '）</b>' +
      '<div class="k num">' + mr.n + ' / ' + mr.m + ' 项对得上 · ' + mr.k + ' 项待确认 · 不是入组资格判断 · 状态未核实（快照 2026-11-05，以官方登记页为准）</div></div>' +
      '<div class="section-title"><h3>判据逐条（先不符合与待确认，其余折叠）</h3></div>' +
      sorted.map(function (e) {
        var cls = e.state === 'ok' ? 'ok' : e.state === 'no' ? 'no' : 'unknown';
        var mark = e.state === 'ok' ? '✓ 符合' : e.state === 'no' ? '✕ 不符合' : '? 待确认';
        var row = '<div class="ev-row"><span class="pill ' + cls + '">' + mark + '</span> <b>' + esc(e.cond) + '</b>' +
          (e.hard ? ' <span class="pill red">硬性条件</span>' : '') +
          '<div class="k">记录里是：' + esc(e.record) + '（' + esc(e.srcNote) + '）· 条件要求：' + esc(e.cond) + '</div>' +
          '<div class="k">档案侧：' + esc(e.profile) + '</div></div>';
        return e.state === 'ok' ? '<details class="phase-fold"><summary>' + mark + ' · ' + esc(e.cat) + '</summary><div class="fold-body">' + row + '</div></details>' : row;
      }).join('') +
      '<details class="phase-fold"><summary>✓ 符合的判据（折叠）</summary><div class="fold-body">' +
      mr.evidence.filter(function (e) { return e.state === 'ok'; }).map(function (e) {
        return '<div class="ev-row"><span class="pill ok">✓ 符合</span> <b>' + esc(e.cond) + '</b><div class="k">记录里是：' + esc(e.record) + ' · 档案侧：' + esc(e.profile) + '</div></div>';
      }).join('') + '</div></details>' +
      '<div class="section-title"><h3>档案字段（已确认入库）</h3></div><div class="card k">诊断：大动脉炎（医生书面结论）· 性别/年龄见档案 · 治疗经验类别见「用药与减量」· 所在城市未登记（待确认项的来源）</div>' +
      '<div class="section-title"><h3>登记字段（快照）</h3></div><div class="card k">' + esc(mr.r.id) + ' · ' + esc(mr.r.phase) + ' · ' + esc(mr.r.status) + ' · 申办方 ' + esc(mr.r.sponsor) + ' · 地区 ' + esc(mr.r.place) + '</div>' +
      '<div class="notice warn"><b>入排原文缺失声明</b>：本机快照只存登记的结构化字段，入排标准请到官方登记页核对。</div>' +
      '<div class="row"><a class="ghost" href="https://clinicaltrials.gov" target="_blank" rel="noopener">官方登记页出口 ↗</a>' +
      '<button class="primary" data-action="tr-save" data-id="' + esc(mr.r.id) + '">收藏为线索</button></div>' +
      '</div></div>';
    document.body.appendChild(trialPanel);
    trialPanel.addEventListener('click', function (e) { if (e.target === trialPanel) closeTrialPanel(); });
    trialPanel.querySelector('[data-tp="close"]').addEventListener('click', closeTrialPanel);
    state._trialReturnFocus = trigger || document.activeElement;
  }
  function closeTrialPanel() {
    if (trialPanel) { trialPanel.remove(); trialPanel = null; }
    if (state._trialReturnFocus && state._trialReturnFocus.focus) { try { state._trialReturnFocus.focus(); } catch (e) {} }
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && trialPanel) closeTrialPanel();
  });

  /* —— 资料库 —— */
  VIEWS.docs = function () {
    var sub = state.sub || 'docs-lib';
    var p = P();
    var out = head('资料库', SUBTITLES.docs);
    out += subnav('docs', sub);
    if (sub === 'docs-lib') {
      out += docsTable(p.docs);
      out += '<div class="row" style="margin-top:10px"><button class="primary" data-action="form-doc">登记一份资料</button><span class="k">导入 → 解析（MinerU 桩：开发版接入）→ 候选 → 核对 → 入库。</span></div>';
    } else if (sub === 'docs-cand') {
      out += candidatesSection();
    } else {
      var docs = p.docs || [];
      var privN = docs.filter(isPrivate).length;
      out += '<div class="notice">导出<strong>不含私密条目</strong>（' + privacyLine(docs) + '）；导出是 Markdown 文本，不含原件。</div>';
      out += '<div class="card"><h3>导出范围</h3>' +
        '<label class="row"><input type="checkbox" checked disabled> 指标与血压（已核对）</label>' +
        '<label class="row"><input type="checkbox" checked disabled> 用药记录</label>' +
        '<label class="row"><input type="checkbox" checked disabled> 受累血管记录</label>' +
        '<label class="row"><input type="checkbox" disabled> 私密内容（永远排除）</label>' +
        '<div class="row"><button class="primary" data-action="export">导出 Markdown（预览）</button></div></div>';
    }
    return out;
  };
  function docsTable(docs) {
    if (!docs || !docs.length) {
      return '<div class="empty"><div class="big">资料库为空</div><p>把报告拍照或扫描后导入；导入前也可以手工录入。</p><button class="primary" data-action="noop">导入（原型未实现）</button></div>';
    }
    return '<div class="table-wrap"><table><thead><tr><th>材料名称</th><th class="date">日期</th><th>类型</th><th>整理状态</th><th>操作</th></tr></thead><tbody>' +
      docs.map(function (d) {
        return '<tr><td>' + esc(d.name) + (d.private ? ' <span class="pill red">私密</span>' : '') + '</td><td class="date">' + esc(d.date) + '</td><td>' + esc(d.type) + '</td>' +
          '<td><span class="pill ' + (d.status === '原文' ? 'green' : 'yellow') + '">' + esc(d.status) + '</span> <span class="k">' + esc(d.origin) + '</span></td>' +
          '<td><button class="ghost" data-action="view-doc" data-id="' + d.id + '">原文</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function subnav(page, sub) {
    var subs = SUBPAGES[page] || [];
    if (!subs.length) return '';
    return '<div class="row" style="margin:12px 0" role="tablist" aria-label="二级页签">' + subs.map(function (s) {
      return '<button role="tab" class="ghost" data-action="sub" data-view="' + page + '" data-sub="' + s[0] + '" aria-selected="' + (sub === s[0]) + '" style="' + (sub === s[0] ? 'border-color:var(--brand-deep);color:var(--brand-deep);font-weight:600' : '') + '">' + esc(s[1]) + '</button>';
    }).join('') + '</div>';
  }

  /* ---------- 渲染主流程 ---------- */
  function render() {
    var nav = $('#nav');
    nav.innerHTML = PAGES.map(function (p) {
      return '<button data-action="go" data-view="' + p[0] + '" aria-current="' + (state.view === p[0]) + '">' +
        '<span class="icon" aria-hidden="true">' + pageIcon(p[2]) + '</span>' + esc(p[1]) + '</button>';
    }).join('');
    $('#breadcrumb').textContent = (PAGES.filter(function (p) { return p[0] === state.view; })[0] || [])[1] || '看板';
    var p = P();
    $('#profile-avatar').textContent = p.name.charAt(0);
    $('#profile-name').textContent = p.name + '的资料';
    $('#profile-meta').textContent = p.age + ' 岁 · ' + p.meta;
    var fn = VIEWS[state.view] || VIEWS.dashboard;
    $('#main').innerHTML = fn();
    $('#main').scrollTop = 0;
  }

  function pageIcon(k) {
    return { home: '⌂', dx: '❖', vessel: '⌇', report: '≣', pill: '℞', calendar: '▦', flower: '❀', leaf: '☘', heart: '♥', chart: '∿', flask: '⚗', folder: '▤' }[k] || '•';
  }

  /* ---------- 录入窗（F 组）：≤6 字段 + 数字键盘 + 三态按钮 ---------- */
  function openForm(cfg) {
    var fields = cfg.fields || [];
    var bodyHtml = '<div class="form">' + fields.map(function (f, i) {
      var inp;
      if (f.type === 'select') {
        inp = '<select id="ff-' + i + '"' + (f.disabled ? ' disabled' : '') + '>' + (f.options || []).map(function (o) {
          return '<option' + (o === f.value ? ' selected' : '') + '>' + esc(o) + '</option>';
        }).join('') + '</select>';
      } else if (f.type === 'textarea') {
        inp = '<textarea id="ff-' + i + '" placeholder="' + esc(f.placeholder || '') + '">' + esc(f.value || '') + '</textarea>';
      } else {
        inp = '<input id="ff-' + i + '" type="' + (f.type === 'num' ? 'number' : 'text') + '" inputmode="' + (f.inputmode || (f.type === 'num' ? 'decimal' : 'text')) + '" value="' + esc(f.value || '') + '" placeholder="' + esc(f.placeholder || '') + '">';
      }
      return '<label>' + esc(f.label) + (f.required ? ' <span class="pill red">必填</span>' : '') + inp + '</label>' +
        (f.hint ? '<p class="hint">' + esc(f.hint) + '</p>' : '');
    }).join('') + '</div><p class="hint" id="ff-err" style="color:var(--danger)"></p>';
    dialog(cfg.title, bodyHtml,
      '<button class="ghost" data-action="form-cancel">取消</button>' +
      '<button class="ghost" data-action="form-save" data-mode="close">保存并关闭</button>' +
      '<button class="primary" data-action="form-save" data-mode="continue">保存并继续录入</button>');
    state._form = cfg;
  }
  function formValues() {
    var cfg = state._form;
    var vals = {};
    (cfg.fields || []).forEach(function (f, i) {
      var el = $('#ff-' + i);
      vals[f.key] = el ? el.value.trim() : '';
    });
    return vals;
  }
  function formSave(mode) {
    var cfg = state._form;
    var vals = formValues();
    for (var f of (cfg.fields || [])) {
      if (f.required && !String(vals[f.key] || '')) {
        $('#ff-err').textContent = '必填项「' + f.label + '」还没有填。';
        return;
      }
    }
    cfg.onSave(vals);
    if (mode === 'continue') {
      $('#ff-err').textContent = '';
      (cfg.fields || []).forEach(function (f, i) {
        if (f.keep) return;
        var el = $('#ff-' + i);
        if (el && el.tagName !== 'SELECT') el.value = '';
      });
      toast('已记录（演示，内存内）——可以继续录下一条');
      state._form.keepValues = true;
    } else {
      closeDialog();
      toast('已记录（演示，内存内；刷新后保留在本会话）');
    }
  }

  /* F6：医院多卡（含修改=新增版本 F5 + 查看历史） */
  function hospitalsSection(p) {
    var hs = p.hospitals || [];
    var out = '<div class="section-title"><h2>就医信息（' + hs.length + ' 家）</h2><p>多家医院逐条卡；修改 = 新增一个版本，旧版本可查（不覆盖）。</p></div>';
    if (!hs.length) {
      out += '<div class="empty"><div class="big">还没有医院信息</div><p>把常去的医院记下来，复诊准备页会带上。</p><button class="primary" data-action="hospital-add">添加医院</button></div>';
      return out;
    }
    out += '<div class="bp-grid">' + hs.map(function (h) {
      return '<div class="card"><div class="row"><b>' + esc(h.name) + '</b><span class="pill">版本 v' + esc(h.revision || 1) + '</span></div>' +
        '<p class="k">' + esc(h.dept || '科室未填') + '</p>' +
        '<p class="k">' + (h.contactKind === 'phone' ? '☎ ' : '出处：') + esc(h.contactText || '未填') + '</p>' +
        '<div class="row"><button class="ghost" data-action="hospital-edit" data-id="' + h.id + '">修改（新版本）</button>' +
        '<button class="ghost" data-action="hospital-history" data-id="' + h.id + '">查看历史</button></div></div>';
    }).join('') + '</div>';
    out += '<div class="row" style="margin-top:10px"><button class="primary" data-action="hospital-add">添加医院</button></div>';
    return out;
  }
  function hospitalForm(existing) {
    openForm({
      title: existing ? '修改医院（将生成新版本 v' + ((existing.revision || 1) + 1) + '）' : '添加医院',
      fields: [
        { key: 'name', label: '医院名称', required: true, value: existing ? existing.name : '' },
        { key: 'dept', label: '科室', value: existing ? existing.dept : '' },
        { key: 'kind', label: '联系方式类型', type: 'select', options: ['phone', 'quote'], value: existing ? existing.contactKind : 'phone' },
        { key: 'contact', label: '电话或出处引用', value: existing ? existing.contactText : '', hint: '电话直接填号码；不想存号码就填「出处：某日门诊病历」' }
      ],
      onSave: function (v) {
        var p = P();
        if (existing) {
          var old = JSON.parse(JSON.stringify(existing));
          old.in_use = 0;
          (p._hospitalHistory = p._hospitalHistory || {})[existing.name] = (p._hospitalHistory[existing.name] || []).concat([old]);
          existing.name = v.name; existing.dept = v.dept;
          existing.contactKind = v.kind === 'phone' ? 'phone' : 'quote';
          existing.contactText = v.contact;
          existing.revision = (existing.revision || 1) + 1;
        } else {
          (p.hospitals = p.hospitals || []).push({ id: Date.now(), name: v.name, dept: v.dept, contactKind: v.kind === 'phone' ? 'phone' : 'quote', contactText: v.contact, revision: 1 });
        }
        render();
      }
    });
  }

  /* ---------- 整页视图（32 号） ---------- */
  var pvState = { stack: [], returnFocus: null, scroll: 0 };
  function pvDismiss() {
    // 唯一退栈路径：Esc / 返回键 / 关闭按钮都汇到这里（A4 焦点恢复、A5 滚动恢复）
    if (!pvState.stack.length) return;
    var el = pvState.stack.pop();
    el.remove();
    if (pvState.returnFocus && pvState.returnFocus.focus) { try { pvState.returnFocus.focus(); } catch (e) {} }
    $('#main').scrollTop = pvState.scroll;
  }
  function openPageView(title, bodyHtml) {
    var el = document.createElement('div');
    el.className = 'pv-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<div class="pv-head"><button class="ghost" data-pv="back">返回</button>' +
      '<h2>' + esc(title) + '</h2>' +
      '<button class="icon-button" data-pv="close" aria-label="关闭整页">×</button></div>' +
      '<div class="pv-body"><div class="pv-inner">' + bodyHtml + '</div></div>';
    document.body.appendChild(el);
    pvState.stack.push(el);
    pvState.returnFocus = document.activeElement;
    pvState.scroll = $('#main').scrollTop;
    el.querySelector('[data-pv="back"]').addEventListener('click', function () { history.back(); });
    el.querySelector('[data-pv="close"]').addEventListener('click', function () {
      pvDismiss();
      if (location.hash.indexOf('#page=') === 0) history.back();
    });
    history.pushState({ pv: pvState.stack.length }, '', '#page=' + encodeURIComponent(title));
    el.querySelector('.pv-body').scrollTop = 0;
  }
  window.addEventListener('popstate', function () {
    if (pvState.stack.length && !location.hash.match(/^#page=/)) pvDismiss();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pvState.stack.length) {
      pvDismiss();
      if (location.hash.indexOf('#page=') === 0) history.back();
    }
  });

  /* ---------- 弹窗 ---------- */
  function dialog(title, bodyHtml, footHtml) {
    var d = $('#dialog');
    $('#dialog-title').textContent = title;
    $('#dialog-body').innerHTML = bodyHtml;
    $('#dialog-foot').innerHTML = footHtml || '<button class="ghost" data-action="close">关闭</button>';
    d.showModal();
  }
  function closeDialog() { var d = $('#dialog'); if (d.open) d.close(); }

  function profilesDialog() {
    var order = PROTO.profileOrder;
    dialog('切换演示档案',
      '<div class="notice">两套档案都是合成示例：A 刚确诊记录少，B 多年随访记录多。切换后整页数据、图表、时间线、导出全部跟着换，不串档。</div><div class="grid2" style="margin-top:10px">' +
      order.map(function (k) {
        var p = PROTO.profiles[k];
        var sel = state.profile === k;
        return '<button class="card" data-action="pick-profile" data-k="' + k + '" style="cursor:pointer;text-align:left;' + (sel ? 'border-color:var(--brand-deep);background:var(--brand-soft)' : '') + '">' +
          '<h3>' + esc(p.name) + '（' + k + ' 套）</h3><p class="k">' + esc(p.age) + ' 岁 · ' + esc(p.meta) + '</p><p>' + esc(p.headline) + '</p>' +
          (sel ? '<span class="pill brand">当前</span>' : '<span class="k">点击切换</span>') + '</button>';
      }).join('') + '</div>');
  }

  function settingsDialog() {
    dialog('设置',
      '<div class="tabs" role="tablist" aria-label="设置分区">' +
      '<button role="tab" class="tab" data-action="cfg-tab" data-tab="store" aria-selected="true">工作区</button>' +
      '<button role="tab" class="tab" data-action="cfg-tab" data-tab="parse" aria-selected="false">文档解析（MinerU）</button>' +
      '<button role="tab" class="tab" data-action="cfg-tab" data-tab="clinic" aria-selected="false">临床数据库</button>' +
      '</div><div id="cfg-body"></div>');
    renderCfgTab(state.cfgTab || 'store');
  }
  function renderCfgTab(tab) {
    state.cfgTab = tab;
    $$('#dialog .tabs .tab').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === tab)); });
    var body = $('#cfg-body');
    if (tab === 'store') {
      body.innerHTML =
        '<div class="form">' +
        '<label>业务资料根目录<input value="（演示）未连接宿主" readonly></label>' +
        '<p class="hint">开发版接入后：目录由 DSH Desktop 授权，本原型不读写真实文件。资料目录<b>拒绝主目录 / 桌面 / 下载根 / tmp</b>（dev-server 与宿主同口径）。</p>' +
        '<div class="grid3">' +
        '<div class="card"><div class="k">原件</div><div class="tile-v">12.4 MB</div><div class="k">示意值 · 开发版实算</div></div>' +
        '<div class="card"><div class="k">派生</div><div class="tile-v">1.1 MB</div><div class="k">示意值 · 开发版实算</div></div>' +
        '<div class="card"><div class="k">数据库</div><div class="tile-v">380 KB</div><div class="k">示意值 · 开发版实算</div></div>' +
        '</div>' +
        '<div class="row"><span class="pill">备份与恢复</span><span class="k">上次备份：暂无（开发版接入后每日本地备份）</span>' +
        '<button class="ghost" data-action="noop">立即备份（原型未实现）</button></div>' +
        '</div>';
    } else if (tab === 'parse') {
      body.innerHTML =
        '<div class="notice warn">本仓未接入 MinerU：<b>勾选与保存都不会联网</b>，真实解析在开发版配置 Token 后启用。</div>' +
        '<label class="row" style="margin-top:10px"><input type="checkbox" id="mu-consent"> 我了解：所选文件会上传到 MinerU 云端解析。只传文件本身，不传档案、化验结论、治疗记录；可随时关闭。</label>' +
        '<p class="hint" id="mu-consent-note" style="color:var(--warn)">未勾选前不会上传，也不会调用 MinerU。</p>' +
        '<label>MinerU API Token（掩码只显示末 4 位）<input id="mu-token" placeholder="粘贴 Token（未勾选同意时禁用）" disabled></label>' +
        '<p class="hint">当前值：<code id="mu-mask">未设置</code> · <span class="k">掩码派生自真实值，只显示末 4 位。</span></p>' +
        '<div class="row"><button class="ghost" data-action="mu-apply">保存 Token（本地 .secrets，不联网）</button>' +
        '<button class="ghost" data-action="mu-show">显示/隐藏掩码</button></div>' +
        '<details class="phase-fold" style="margin-top:10px"><summary>如何申请 Token（4 步）</summary><div class="fold-body"><ol>' +
        '<li>打开 <a href="https://mineru.net/apiManage/token" target="_blank" rel="noopener">mineru.net/apiManage/token</a>（申请 / 重置都在这页）。</li>' +
        '<li>注册并登录后，创建一个 API Token。</li>' +
        '<li>复制 Token 回本页粘贴并保存（保存到本机 .secrets，已加入 git 忽略）。</li>' +
        '<li>回到「文档解析」勾选同意后即可解析；不用了可在同一页重置。</li>' +
        '</ol></div></details>' +
        '<div class="card" style="margin-top:10px"><h3>解析说明</h3>' +
        '<p class="k">· 解析模型 pipeline 固定，不提供 VLM 切换——版本可复现、出错可追责。</p>' +
        '<p class="k">· Flash 免费额度上限 10 MB / 20 页；超限自动降级为本地纯文本抽取，解析质量提示会出现在候选页。</p>' +
        '<p class="k">· TXT / MD / CSV 始终先走本地抽取，不上传。</p></div>';
    } else {
      body.innerHTML =
        '<div class="row"><span class="pill green">快照可用</span><b>104 条</b><span class="k">快照日期 2026-11-05 · unified-trial-mcp 采集 · 快照会过期，使用时以官方登记页为准</span></div>' +
        '<p class="hint">临床研究页与本 tab 使用同一份快照（E10 联动口径）；登记状态一律「未核实」。</p>' +
        '<div class="table-wrap"><table><thead><tr><th>通道</th><th>终态</th><th>次数</th><th>含义</th></tr></thead><tbody>' +
        '<tr><td>ictrp</td><td><span class="pill green">SUCCESS ×2</span> <span class="pill red">FAILED ×3</span></td><td>5</td><td>成功 2 次检索共 103 条；3 次失败如实记 FAILED，不算「查过」</td></tr>' +
        '<tr><td>chinadrugtrials</td><td><span class="pill green">SUCCESS ×1</span> <span class="pill">NO_RESULTS ×4</span></td><td>5</td><td>中文标准名命中 1 条</td></tr>' +
        '<tr><td>chictr_online</td><td><span class="pill red">FAILED ×5</span></td><td>5</td><td>服务失败——不能写成「无在研试验」</td></tr>' +
        '<tr><td>chictr_pancreatic_archive</td><td><span class="pill yellow">NEEDS_SETUP ×5</span></td><td>5</td><td>离线语料仅胰腺癌覆盖，TAK 无覆盖，如实声明</td></tr>' +
        '<tr><td>ctv / xyb_chinadrugtrials_archive</td><td><span class="pill">NO_RESULTS ×10</span></td><td>10</td><td>查过、无命中</td></tr>' +
        '</tbody></table></div>' +
        '<div class="row" style="margin-top:10px"><span class="pill">断网空态</span><span class="k">断网时临床页只展示本地快照并标「快照模式」，不假装在线检索成功。</span></div>';
    }
  }

  function aboutDialog() {
    dialog('关于小弓宝',
      '<p><b>' + esc(APP_INFO.name) + '</b> 原型 v' + esc(APP_INFO.version) + '（build ' + esc(APP_INFO.build) + '）</p>' +
      '<p>病种：' + esc(APP_INFO.disease) + '；非肿瘤工作台：无分期、无线序、无疗效语义。</p>' +
      '<p>品牌「小弓宝 / ArchPal」为占位名，待品牌确认。</p>' +
      '<p class="k">本页全部为合成示例；0 患者访谈、0 临床审核；未接入 DSH / AI。</p>');
  }

  function helpDialog() {
    dialog('原型操作说明',
      '<ul>' +
      '<li>左侧切换一级页面；带二级页签的页面在页首横排切换。</li>' +
      '<li>点左上角头像可切换 A/B 两套合成档案（整页联动不串档）。</li>' +
      '<li>指标卡点击翻面（再点返回正面）；卡片定高 194px。</li>' +
      '<li>顶栏「?」打开疾病概要整页（返回与关闭是两个入口，Esc 只退一层）。</li>' +
      '<li>顶栏「AI 对话」开右侧面板；「和 AI 讨论」按钮只填草稿不发送。</li>' +
      '</ul>');
  }

  /* ---------- AI 面板 + agent-draft ---------- */
  function agentToggle(force) {
    state.aiOpen = force !== undefined ? force : !state.aiOpen;
    var dock = $('#agent-dock');
    dock.hidden = !state.aiOpen;
    dock.style.width = state.aiWidth + '%';
    $('#agent-toggle').setAttribute('aria-expanded', String(state.aiOpen));
    $('#agent-state').textContent = state.aiOpen ? '演示面板（未接通）' : '未进入激活';
    if (state.aiOpen) {
      dock.style.width = Math.min(45, Math.max(25, state.aiWidth)) + '%';
      renderAgentIntro();
    }
  }
  function renderAgentIntro() {
    var body = $('#agent-body');
    if (!state.aiSession.length) {
      body.innerHTML = '<div class="agent-msg preview">演示面板：<b>未接通任何模型，不会发送</b>。' +
        '点击业务页的「和 AI 讨论」或顶栏「整理本页要点」，草稿会出现在这里（候选/预览）。</div>';
    } else {
      body.innerHTML = state.aiSession.map(function (m) {
        return '<div class="agent-msg ' + m.role + '">' + esc(m.text) + '</div>';
      }).join('');
    }
    body.scrollTop = body.scrollHeight;
  }
  function agentDraft(prompt, source) {
    /* 部署形态：AI 对话由宿主原生面板承载（34 号契约）——只投递草稿，不渲染本地演示坞 */
    if (window.parent !== window) {
      try { window.parent.postMessage({ type: 'takayasu:agent-draft', prompt: prompt, send: false }, '*'); } catch (e) { /* 无宿主 */ }
      toast('已把问题放进右侧 AI 会话草稿（不自动发送）');
      return;
    }
    state.aiSession.push({ role: 'me', text: '【草稿 · 未发送】' + prompt + (source ? '（来源：' + source + '）' : '') });
    if (!state.aiOpen) agentToggle(true);
    else renderAgentIntro();
    toast('草稿已放入 AI 面板（未发送）');
  }
  function buildPagePrompt() {
    var key = state.view + (state.sub ? '/' + state.sub : '');
    var p = P();
    var privDocs = (p.docs || []).filter(isPrivate).length;
    var privMind = (p.mindEntries || []).filter(isPrivate).length;
    return '【' + key + '】当前档案：' + p.name + '（合成示例）。本页要点：' + pageFacts() +
      '。私密条目已排除（资料 ' + privDocs + ' 条、心理 ' + privMind + ' 条）。请基于以上事实提出需要与医生核实的问题，不要给诊断或治疗建议。';
  }
  function pageFacts() {
    var p = P();
    var map = pointsByCode();
    var esr = (map.esr || []).slice(-1)[0];
    var crp = (map.crp || []).slice(-1)[0];
    return '确诊 ' + fmtDate(p.diagnosisDate) +
      (esr ? '；最近 ESR ' + esr.value + ' ' + esr.unit + '（' + esr.date + '）' : '') +
      (crp ? '；最近 CRP ' + crp.value + ' ' + crp.unit + '（' + crp.date + '）' : '') +
      '；血管节段记录 ' + (p.vesselRecords || []).length + ' 次；血压 ' + (p.bpRecords || []).length + ' 次；用药 ' + (p.meds || []).length + ' 条';
  }

  /* ---------- 导出（私密过滤出口①） ---------- */
  function exportMarkdown() {
    var p = P();
    var map = pointsByCode();
    var lines = ['# ' + p.name + ' · 大动脉炎随访摘要（合成示例）', '', '> 仅回顾，不解读；解读归医生。私密条目已排除。', ''];
    lines.push('## 化验（已核对）');
    PROTO.metricDefs.forEach(function (d) {
      var pts = (map[d.code] || []);
      if (pts.length) lines.push('- ' + d.name + '：共 ' + pts.length + ' 次，最近 ' + pts[pts.length - 1].value + ' ' + d.unit + '（' + pts[pts.length - 1].date + '）');
    });
    lines.push('', '## 血压（成对，较上次差值见界面）');
    filterPrivate(p.bpRecords || []).forEach(function (r) {
      lines.push('- ' + r.date + '：左臂 ' + (r.armL ? r.armL.sys + '/' + r.armL.dia : '未测') + '，右臂 ' + (r.armR ? r.armR.sys + '/' + r.armR.dia : '未测'));
    });
    lines.push('', '## 用药');
    (p.meds || []).forEach(function (m) { lines.push('- ' + m.date + '：' + m.drug + (m.doseMg ? ' ' + m.doseMg + 'mg' + (m.perDay ? '/日' : '') : '') + (m.note ? '（' + m.note + '）' : '')); });
    lines.push('', '## 受累血管（报告原文）');
    (p.vesselRecords || []).forEach(function (r) { lines.push('- ' + r.date + '（' + r.modality + '）：' + r.quote); });
    lines.push('', '## 资料清单（' + privacyLine(p.docs || []) + '）');
    filterPrivate(p.docs || []).forEach(function (d) { lines.push('- ' + d.name + '（' + d.date + '，' + d.status + '）'); });
    return lines.join('\n');
  }

  /* ---------- 演示数据新增（切换不串档：只改当前档案的内存副本） ---------- */
  var edits = {};
  function addDemo(kind) {
    var k = state.profile;
    edits[k] = edits[k] || { bp: 0, imaging: 0, screen: 0 };
    var p = PROTO.profiles[k];
    var today = '2026-11-05';
    if (kind === 'bp') {
      edits[k].bp++;
      p.bpRecords = p.bpRecords || [];
      p.bpRecords.push({ id: 100 + edits[k].bp, date: today, place: '家中自测（演示）', armL: { sys: 112 + edits[k].bp, dia: 70 }, armR: { sys: 94 + edits[k].bp, dia: 60 }, ankleL: null, ankleR: null, note: '演示新增，刷新后保留在本会话。' });
    } else if (kind === 'imaging') {
      edits[k].imaging++;
      p.imaging = p.imaging || [];
      p.imaging.push({ id: 100 + edits[k].imaging, date: today, type: '血管超声（演示）', place: '演示机构', summary: '演示新增条目。', originalAvailable: false });
    } else if (kind === 'screen') {
      edits[k].screen++;
      p.screenings = p.screenings || [];
      p.screenings.push({ id: 100 + edits[k].screen, date: today, item: '心脏超声（演示）', plan: '医生说每年一次（演示）', lastResult: null, nextDue: null, originalAvailable: false });
    }
    render();
    toast('演示条目已加入 ' + k + ' 套档案（内存内，不写文件）');
  }

  /* ---------- 事件 ---------- */
  document.addEventListener('click', function (e) {
    var pt = e.target.closest && e.target.closest('circle.pt');
    if (pt) {
      // MT09：点数据点打开原始来源详情；不翻卡、不改变筛选
      openPageView('数据点详情（原始来源）',
        '<div class="card"><h3>' + esc(pt.getAttribute('data-date')) + '</h3>' +
        '<p>数值：<b>' + esc(pt.getAttribute('data-value')) + '</b></p>' +
        '<p class="k">来源：' + esc(pt.getAttribute('data-src')) + '（可比组内；解读归医生）</p>' +
        '<p class="k">整卡未翻面；关闭后焦点回到数据点。</p></div>');
      return;
    }
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var act = btn.getAttribute('data-action');
    switch (act) {
      case 'go':
        state.view = btn.getAttribute('data-view') || 'dashboard';
        state.sub = btn.getAttribute('data-sub') || null;
        render(); break;
      case 'sub':
        state.view = btn.getAttribute('data-view');
        state.sub = btn.getAttribute('data-sub');
        render(); break;
      case 'profiles': profilesDialog(); break;
      case 'pick-profile':
        state.profile = btn.getAttribute('data-k');
        state.flipped = {}; state.sel = ['esr', 'crp'];
        closeDialog(); render();
        toast('已切换到 ' + state.profile + ' 套档案（合成示例）');
        break;
      case 'settings': settingsDialog(); break;
      case 'about': aboutDialog(); break;
      case 'help': helpDialog(); break;
      case 'open-store':
        toast('资料目录（演示）：开发版由宿主授权真实目录');
        break;
      case 'agent':
        if (window.parent !== window) {
          try { window.parent.postMessage({ type: 'takayasu:agent-open' }, '*'); } catch (e) { /* 无宿主 */ }
          toast('已请求打开右侧原生 AI 会话');
        } else { agentToggle(); }
        break;
      case 'agent-size':
        var size = btn.getAttribute('data-size');
        state.aiWidth = size === 'narrow' ? 25 : (size === 'wide' ? 45 : 35);
        $$('#agent-dock .agent-sizes button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        $('#agent-dock').style.width = state.aiWidth + '%';
        break;
      case 'agent-hint': {
        e.preventDefault();
        var page = btn.getAttribute('data-page') || state.view;
        var hint = AI_HINTS[page] || '请帮我整理本页要点。';
        var draft = hint.replace('{date}', '2026-11-05');
        state.draftPool.ai = draft;
        agentDraft(draft, page);
        break;
      }
      case 'agent-build':
        agentDraft(buildPagePrompt(), state.view);
        break;
      case 'agent-demo':
        state.aiSession.push({ role: 'preview', text: '【模拟回复 · 仅自检】这是演示面板的固定回复：未接通模型，不会真的生成内容。' });
        renderAgentIntro();
        break;
      case 'flip': {
        e.preventDefault();
        var code = btn.getAttribute('data-code');
        state.flipped[code] = !state.flipped[code];
        btn.setAttribute('aria-pressed', String(state.flipped[code]));
        break;
      }
      case 'tw':
        state.timeWindow = btn.getAttribute('data-w');
        render(); break;
      case 'toggle-events':
        state.showEvents = !state.showEvents;
        render(); break;
      case 'sel': {
        var c = btn.getAttribute('data-code');
        var i = state.sel.indexOf(c);
        if (i >= 0) { if (state.sel.length > 1) state.sel.splice(i, 1); }
        else state.sel.push(c);
        render(); break;
      }
      case 'primer-open-soft':
        var trigger = $$('[data-primer-open]')[0];
        if (trigger) trigger.click();
        break;
      case 'verify': {
        var id = btn.getAttribute('data-id');
        var c2 = (P().candidates || []).filter(function (x) { return x.id === id; })[0];
        if (c2) {
          c2.verified = true; c2.verifiedAt = '2026-11-05（演示）';
          if (c2.kind === 'metric') {
            var m = (P().metrics || []).filter(function (x) { return x.code === c2.code; })[0];
            if (m) m.points.push({ date: c2.date, value: c2.value, unit: c2.unit, method: c2.method, org: c2.org });
          }
          render();
          toast('已核对入库（候选 → 事实层）');
        }
        break;
      }
      case 'reject': {
        var id3 = btn.getAttribute('data-id');
        var arr = P().candidates || [];
        var idx = -1;
        arr.forEach(function (x, ii) { if (x.id === id3) idx = ii; });
        // 拒收：不入事实层；候选保留在列表（零副作用验证：状态除标记外不变）
        if (idx >= 0) { arr[idx].rejected = true; render(); toast('已拒收：未入图，数据未变'); }
        break;
      }
      case 'verify-q': {
        var qi = Number(btn.getAttribute('data-i'));
        var pool = state.draftPool.questions || (state.draftPool.questions = defaultQuestions(P()));
        if (pool[qi]) { pool[qi].verified = true; pool[qi].asked = '待问'; render(); }
        break;
      }
      case 'reject-q': {
        var qi2 = Number(btn.getAttribute('data-i'));
        var pool2 = state.draftPool.questions || (state.draftPool.questions = defaultQuestions(P()));
        pool2.splice(qi2, 1); render(); toast('候选已移除（未入库）');
        break;
      }
      case 'verify-preg': {
        var pi = Number(btn.getAttribute('data-i'));
        var pl = P().pregList || [];
        if (pl[pi]) { pl[pi].verified = true; pl[pi].asked = '待问'; render(); }
        break;
      }
      case 'reject-preg': {
        var pi2 = Number(btn.getAttribute('data-i'));
        (P().pregList || []).splice(pi2, 1); render();
        break;
      }
      case 'demo-add-bp': addDemo('bp'); break;
      case 'demo-add-imaging': addDemo('imaging'); break;
      case 'demo-add-screen': addDemo('screen'); break;
      case 'copy-prep':
        var prep = $('#main').innerText || '';
        if (navigator.clipboard) navigator.clipboard.writeText(prep).then(function () { toast('已复制（演示）'); }, function () { toast('复制失败（演示环境）'); });
        else toast('复制失败（演示环境）');
        break;
      case 'export': {
        var md = exportMarkdown();
        openPageView('导出预览（Markdown，已过滤私密）',
          '<pre style="white-space:pre-wrap;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-sm);padding:12px;font-size:12.5px">' + esc(md) + '</pre>' +
          '<div class="row"><button class="primary" data-action="noop">下载（开发版接入）</button></div>');
        break;
      }
      case 'view-doc': {
        var d = (P().docs || []).filter(function (x) { return String(x.id) === btn.getAttribute('data-id'); })[0];
        if (d) {
          openPageView('原文（演示）',
            '<div class="card"><h3>' + esc(d.name) + '</h3><p class="k">' + esc(d.date) + ' · ' + esc(d.type) + ' · ' + esc(d.origin) + '</p>' +
            '<p>原型不展示原件图片；开发版由宿主资料目录提供原件预览。</p>' +
            (d.private ? '<div class="notice warn">该条目标记为私密：不会进入导出 / AI / 摘要。</div>' : '') + '</div>');
        }
        break;
      }
      case 'fav-trial':
        toast('已收藏为候选线索（候选 ≠ 匹配，无指数）');
        break;
      case 'cfg-tab':
        renderCfgTab(btn.getAttribute('data-tab'));
        break;
      case 'mu-apply': {
        var consent = $('#mu-consent') && $('#mu-consent').checked;
        var tok = $('#mu-token') ? $('#mu-token').value.trim() : '';
        if (!consent) { $('#cfg-body .hint#mu-consent-note').textContent = '未勾选同意——不会保存，也不会上传（本仓未接入 MinerU，保存不联网）。'; return; }
        if (!tok) { $('#ff-err') && ($('#ff-err').textContent = '' || toast('Token 为空，未保存')); toast('Token 为空，未保存'); return; }
        state.cfg.muToken = tok;
        var mk = $('#mu-mask'); if (mk) mk.textContent = maskToken(tok);
        toast('已保存到本机 .secrets（不联网；本仓未接入 MinerU）');
        break;
      }
      case 'mu-show': {
        var ti = $('#mu-token');
        if (ti && !ti.disabled) { ti.type = ti.type === 'password' ? 'text' : 'password'; }
        break;
      }
      case 'sel-check': {
        var c5 = btn.getAttribute('data-code');
        var i5 = state.sel.indexOf(c5);
        if (btn.checked) {
          if (state.sel.length >= 4) { btn.checked = false; toast('最多同时画 4 条——先取消一条再选'); }
          else { state.sel.push(c5); }
        } else {
          if (state.sel.length > 1) { state.sel.splice(i5, 1); }
          else { btn.checked = true; toast('至少保留一条曲线'); }
        }
        render();
        break;
      }
      case 'form-lab':
        openForm({ title: '手工录入化验', fields: [
          { key: 'code', label: '指标', type: 'select', options: ['esr', 'crp', 'wbc', 'hb', 'plt', 'alt', 'creat'], value: 'esr' },
          { key: 'date', label: '日期', required: true, value: '2026-11-05' },
          { key: 'value', label: '数值', type: 'num', required: true, placeholder: '如 26 或 2.1' },
          { key: 'method', label: '方法', placeholder: '如 Westergren / 免疫比浊' },
          { key: 'org', label: '机构', placeholder: '如 市人民医院' }
        ], onSave: function (v) {
          var p = P();
          var m = (p.metrics = p.metrics || []).filter(function (x) { return x.code === v.code; })[0];
          var pt = { date: v.date, value: Number(v.value), unit: (PROTO.metricDefs.filter(function (d) { return d.code === v.code; })[0] || {}).unit || '', method: v.method || '未登记方法', org: v.org || '未登记机构' };
          if (m) m.points.push(pt); else p.metrics.push({ code: v.code, points: [pt] });
          render();
        } });
        break;
      case 'form-bp':
        openForm({ title: '记一条血压', fields: [
          { key: 'date', label: '日期', required: true, value: '2026-11-05' },
          { key: 'lSys', label: '左臂收缩压', type: 'num', required: true, inputmode: 'numeric', placeholder: '如 118' },
          { key: 'lDia', label: '左臂舒张压', type: 'num', required: true, inputmode: 'numeric', placeholder: '如 74' },
          { key: 'rSys', label: '右臂收缩压', type: 'num', inputmode: 'numeric' },
          { key: 'rDia', label: '右臂舒张压', type: 'num', inputmode: 'numeric' },
          { key: 'note', label: '备注', placeholder: '如 右臂难量准，以左臂为准' }
        ], onSave: function (v) {
          var p = P();
          (p.bpRecords = p.bpRecords || []).push({ id: Date.now(), date: v.date, place: '家中自测',
            armL: { sys: Number(v.lSys), dia: Number(v.lDia) },
            armR: v.rSys ? { sys: Number(v.rSys), dia: Number(v.rDia || 0) } : null,
            ankleL: null, ankleR: null, note: v.note || null });
          render();
        } });
        break;
      case 'form-med':
        openForm({ title: '记一次调药', fields: [
          { key: 'date', label: '日期', required: true, value: '2026-11-05' },
          { key: 'drug', label: '药名', required: true, type: 'select', options: ['泼尼松', '甲泼尼龙', '吗替麦考酚酯', '环磷酰胺', '其他（写在医生原话里）'] },
          { key: 'dose', label: '剂量 mg', type: 'num', inputmode: 'numeric' },
          { key: 'cat', label: '类别', type: 'select', options: ['糖皮质激素', '免疫抑制剂', '生物制剂'] },
          { key: 'note', label: '医生原话（照抄）', type: 'textarea', placeholder: '逐字抄，不改写' }
        ], onSave: function (v) {
          (P().meds = P().meds || []).push({ id: Date.now(), date: v.date, drug: v.drug, doseMg: v.dose ? Number(v.dose) : null, perDay: true, cat: v.cat, note: v.note || null, source: '本人录入' });
          render();
        } });
        break;
      case 'form-event':
        openForm({ title: '记一次就诊', fields: [
          { key: 'date', label: '日期', required: true, value: '2026-11-05' },
          { key: 'text', label: '事件描述', required: true, type: 'textarea', placeholder: '如 首次随访：抽血 + 四肢血压' },
          { key: 'src', label: '来源', placeholder: '如 随访记录 / 门诊病历' }
        ], onSave: function (v) {
          (P().events = P().events || []).push({ date: v.date, type: '就诊', text: v.text, source: v.src || '本人记录' });
          render();
        } });
        break;
      case 'form-pregq':
        openForm({ title: '加一条孕前问题', fields: [
          { key: 'text', label: '问题', required: true, type: 'textarea', placeholder: '想问风湿科医生的问题（只列问题）' }
        ], onSave: function (v) {
          (P().pregList = P().pregList || []).push({ id: Date.now(), text: v.text, verified: false, asked: null });
          render();
        } });
        break;
      case 'form-pregtrack':
        openForm({ title: '记一条妊娠随访', fields: [
          { key: 'date', label: '日期', required: true, value: '2026-11-05' },
          { key: 'dept', label: '科别', type: 'select', options: ['产科', '风湿免疫科'] },
          { key: 'text', label: '记录（原文）', required: true, type: 'textarea' }
        ], onSave: function (v) {
          (P().pregTrack = P().pregTrack || []).push({ date: v.date, type: v.dept, text: v.text, source: '本人记录' });
          render();
        } });
        break;
      case 'form-mind':
        openForm({ title: '记一条感受（默认私密）', fields: [
          { key: 'date', label: '日期', required: true, value: '2026-11-05' },
          { key: 'text', label: '感受', required: true, type: 'textarea', placeholder: '写给自己，也只属于自己' }
        ], onSave: function (v) {
          (P().mindEntries = P().mindEntries || []).push({ id: Date.now(), date: v.date, text: v.text, private: true, source: '本人记录' });
          render();
        } });
        break;
      case 'form-life':
        openForm({ title: '记一条日常', fields: [
          { key: 'date', label: '日期', required: true, value: '2026-11-05' },
          { key: 'text', label: '内容', required: true, type: 'textarea', placeholder: '用自己的话记' }
        ], onSave: function (v) {
          (P().lifeEntries = P().lifeEntries || []).push({ id: Date.now(), date: v.date, text: v.text, source: '本人记录' });
          render();
        } });
        break;
      case 'form-doc':
        openForm({ title: '登记一份资料', fields: [
          { key: 'name', label: '材料名称', required: true, placeholder: '如 2026-11-05 化验单' },
          { key: 'date', label: '日期', required: true, value: '2026-11-05' },
          { key: 'type', label: '类型', type: 'select', options: ['化验单', '影像报告', '门诊病历', '住院小结', '其他'] },
          { key: 'origin', label: '来源方式', type: 'select', options: ['手工录入', '拍照导入', '扫描导入'] }
        ], onSave: function (v) {
          (P().docs = P().docs || []).push({ id: Date.now(), name: v.name, date: v.date, type: v.type, status: '草稿待核对', origin: v.origin, private: false });
          render();
        } });
        break;
      case 'hospital-add':
        hospitalForm(null);
        break;
      case 'hospital-edit': {
        var hid = Number(btn.getAttribute('data-id'));
        var hh = (P().hospitals || []).filter(function (x) { return x.id === hid; })[0];
        if (hh) hospitalForm(hh);
        break;
      }
      case 'hospital-history': {
        var hid2 = Number(btn.getAttribute('data-id'));
        var cur = (P().hospitals || []).filter(function (x) { return x.id === hid2; })[0];
        var hist = ((P()._hospitalHistory || {})[cur ? cur.name : ''] || []);
        openPageView('医院版本历史（更正=新增版本，不覆盖）',
          '<div class="card"><h3>' + esc(cur ? cur.name : '') + ' · 当前 v' + (cur ? cur.revision : '?') + '</h3>' +
          (hist.length ? hist.map(function (h) { return '<p class="k">v' + h.revision + '：' + esc(h.name) + ' · ' + esc(h.dept || '') + ' · ' + esc(h.contactText || '') + '</p>'; }).join('') : '<p class="k">还没有更正历史——修改一次后这里会出现旧版本。</p>') + '</div>');
        break;
      }
      case 'tr-search-run': {
        var kw = $('#tr-kw') ? $('#tr-kw').value.trim() : '';
        var st2 = $('#tr-status') ? $('#tr-status').value : '';
        var ph = $('#tr-phase') ? $('#tr-phase').value : '';
        var rg = $('#tr-region') ? $('#tr-region').value : '';
        $('#tr-search-out').innerHTML = trialSearchRows(kw, st2, ph, rg);
        break;
      }
      case 'tr-pref': {
        state.trialPref = state.trialPref || { china: true, recruiting: true };
        var k6 = btn.getAttribute('data-k');
        state.trialPref[k6] = !state.trialPref[k6];
        render();
        break;
      }
      case 'tr-detail':
        openTrialDetail(btn.getAttribute('data-id'), btn);
        break;
      case 'tr-save': {
        var tid = btn.getAttribute('data-id');
        state.savedTrials = state.savedTrials || {};
        var rec = TRIAL_POOL().filter(function (r) { return r.id === tid; })[0];
        if (rec && !state.savedTrials[tid]) {
          state.savedTrials[tid] = { title: rec.title, savedOn: '2026-11-05', state: 'tracking' };
          toast('已收藏为线索（本机 {试验, 日期, 状态}；拒收/取消零副作用）');
        }
        render();
        if (trialPanel) openTrialDetail(tid, state._trialReturnFocus);
        break;
      }
      case 'tr-state': {
        var sk = btn.getAttribute('data-k');
        if (state.savedTrials && state.savedTrials[sk] && !btn.disabled) {
          state.savedTrials[sk].state = btn.getAttribute('data-st');
          render();
        }
        break;
      }
      case 'form-cancel':
        closeDialog();
        break;
      case 'form-save':
        formSave(btn.getAttribute('data-mode'));
        break;
      case 'noop':
        toast('原型未实现：此按钮演示空态的下一步（录入类按钮已陆续实现）');
        break;
      case 'close': closeDialog(); break;
    }
  });

  $('#font-toggle').addEventListener('click', function () {
    var on = document.body.classList.toggle('large');
    this.setAttribute('aria-pressed', String(on));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDialog(); }
  });

  /* ---------- 启动 ---------- */
  render();
  window.__TAK_APP__ = {
    state: state,
    render: render,
    smoothPath: smoothPath,
    exportMarkdown: exportMarkdown,
    filterPrivate: filterPrivate,
    privacyLine: privacyLine,
    agentDraft: agentDraft,
    openPageView: openPageView
  };
})();


/* ── 开发版数据源（scripts/migrate-public.mjs 注入点；原型无此块）──
   宿主形态优先 bootstrap（读模型还原 demo 形状，parity 由测试断言）；
   file:// 与拉取失败回退演示数据：不裸 throw、不白屏。 */
;(function () {
  var apiBase = "__API_BASE__"; /* 令牌会被宿主注入成字符串字面量；禁止把令牌挂在 window 对象上（注入后会语法错误，0.2.0 装机教训） */
  if (location.protocol === 'file:') return;
  /* 部署态：AI 对话由宿主原生面板承载（34 号契约）——本地演示坞与「模拟回复自检」整体退场 */
  if (window.parent !== window) {
    var dock = document.getElementById('agent-dock');
    if (dock && dock.parentNode) dock.parentNode.removeChild(dock);
  }
  fetch(apiBase + '/api/bootstrap').then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (b) {
    if (!b || !b.profiles || !b.metricDefs || !b.segments) throw new Error('bootstrap 形状不符');
    window.TAK_DEMO.profiles = b.profiles;
    window.TAK_DEMO.metricDefs = b.metricDefs;
    window.TAK_DEMO.segments = b.segments;
    var app = window.__TAK_APP__;
    app.state.profile = Object.keys(b.profiles)[0];
    app.state.view = 'dashboard';
    app.state.sub = null;
    app.state.flipped = {};
    app.render();
    console.info('[takayasu] 已切换到本机数据库数据（' + Object.keys(b.profiles).length + ' 个档案）');
  }).catch(function (e) {
    console.warn('[takayasu] bootstrap 不可用，继续使用演示数据：', String(e && e.message || e));
  });
})();
