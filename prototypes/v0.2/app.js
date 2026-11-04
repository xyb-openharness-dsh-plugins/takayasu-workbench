/* 小弓宝 ArchPal · 大动脉炎工作台原型 v0.2.0
 * 全部为合成示例；未接入 DSH / AI；候选核对前不入图；私密三出口共用同一过滤。
 * 结构底本：cervical v0.2（外壳/链路）+ breast v0.4（指标卡/眉题/五 Tab）+ aml v0.2（AI 面板/泳道/折叠卡）。
 * 非肿瘤红线：无分期、无线序、无疗效；活动度只存医生原文；阈值一律【待核】。
 */
(function () {
  'use strict';

  var APP_INFO = { name: '小弓宝 ArchPal', version: '0.2.0', build: '2026-11-05', disease: '大动脉炎（Takayasu Arteritis, TAK）' };
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
    trials: '真实登记摘录 + 候选线索；匹配与否要和医生商量，不提供匹配指数。',
    docs: '原件永远保留；解析结果只是候选，接受之前不入库。'
  };
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
    var winMs = win === '3m' ? 90 * 864e5 : (win === '1y' ? 365 * 864e5 : Infinity);
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
      [['all', '全部'], ['1y', '近 1 年'], ['3m', '近 3 月']].map(function (o) {
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

  /* —— 看板 —— */
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
    var lastVisit = (p.events || []).filter(function (e) { return e.type === '就诊'; }).slice(-1)[0];
    var heroActions = '<button class="primary" data-action="primer-open-soft">疾病概要：大动脉炎是什么？</button>' +
      '<button class="ghost" data-action="go" data-view="review" data-sub="review-prep">准备下次复诊</button>';
    var out = head('看板', p.name + ' · ' + p.meta + '（合成示例档案）', heroActions);
    out += '<div class="notice"><b>本页全部为合成示例</b> · 仅演示，未连接真实病历与宿主 · 解读归医生。0 患者访谈、0 临床审核（见 README）。</div>';
    out += '<div class="grid3" style="margin-top:14px">' +
      dashCard('血管节段记录', vesselN + ' 次', 'vessels', 'v-map') +
      dashCard('化验记录', 'ESR ' + esrN + ' 次 / CRP ' + crpN + ' 次', 'labs', 'lab-trend') +
      dashCard('四肢血压', bpN + ' 次', 'vessels', 'v-bp') +
      dashCard('用药记录', medN + ' 条', 'meds', 'med-gluc') +
      dashCard('事件时间线', evN + ' 条', 'chart', 'ch-event') +
      dashCard('资料与候选', docsN + ' 份 · 待核对 ' + candN, 'docs', 'docs-cand') +
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
    if (lastVisit) {
      out += '<div class="notice" style="margin-top:14px">上次就诊：<span class="date">' + esc(lastVisit.date) + '</span> · ' + esc(lastVisit.text) + '。<b>下次该查什么去「复诊与筛查」。</b></div>';
    } else {
      out += '<div class="empty" style="margin-top:14px"><div class="big">还没有就诊记录</div><button class="primary" data-action="go" data-view="review" data-sub="review-rhythm">去复查节奏</button></div>';
    }
    return out;
  };
  function dashCard(label, val, view, sub) {
    return '<button class="card" data-action="go" data-view="' + view + '" data-sub="' + sub + '" style="text-align:left;cursor:pointer;min-height:44px">' +
      '<div class="k">' + esc(label) + '</div><div style="font-size:19px;font-weight:700;margin-top:4px">' + esc(val) + '</div>' +
      '<div class="k" style="margin-top:6px">查看 →</div></button>';
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
    if (!recs.length) {
      out += '<div class="empty"><div class="big">还没有血压记录</div><p>按医生嘱咐的部位量（通常双臂，有时加踝）。</p><button class="primary" data-action="demo-add-bp">记一条血压（演示）</button></div>';
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
    var bp = (p.bpRecords || []).slice(-1)[0];
    var meds = (p.meds || []).slice(-1)[0];
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
        out += '<div class="row">' + aiBtn() + '</div>';
      }
    } else if (sub === 'preg-track') {
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
      out += '<div class="row" style="margin-top:10px">' + aiBtn() + '</div>';
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
        out += '<div class="row" style="margin-top:10px">' + aiBtn() + '<span class="k">点「和 AI 讨论」也不会携带私密条目。</span></div>';
      }
    } else {
      out += '<div class="card"><h3>家庭负担与照护者</h3><p class="k">把「家里人帮了什么、什么最难开口」留在这里；与 aml-workbench 心智负担线同构，内容为本病种原创。</p>' +
        '<div class="empty"><div class="big">暂无条目</div><p>例：谁陪诊、谁记血压、谁管药盒。</p><button class="primary" data-action="noop">记一条（原型未实现录入）</button></div></div>';
    }
    return out;
  };

  /* —— 病情一图秀 —— */
  VIEWS.chart = function () {
    var sub = state.sub || 'ch-trend';
    var out = head('病情一图秀', SUBTITLES.chart);
    out += subnav('chart', sub);
    if (sub === 'ch-trend') {
      out += '<div class="row" style="margin-bottom:10px">' + PROTO.metricDefs.map(function (d) {
        var on = state.sel.indexOf(d.code) >= 0;
        return '<button class="ghost" data-action="sel" data-code="' + esc(d.code) + '" aria-pressed="' + on + '">' + esc(d.name) + '</button>';
      }).join('') + '</div>';
      out += renderChart();
      out += '<div class="notice" style="margin-top:10px"><b>口径</b>：每条线按该指标全期 min/max 归一化，<b>不同指标不可比</b>；方法/机构变化处已断开；「仅回顾，不解读」。</div>';
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

  /* —— 临床研究（35 号四段链路） —— */
  VIEWS.trials = function () {
    var sub = state.sub || 'tr-facts';
    var out = head('临床研究', SUBTITLES.trials);
    out += subnav('trials', sub);
    if (sub === 'tr-facts') {
      var p = P();
      out += '<div class="card"><h3>建档</h3><ul>' +
        '<li>诊断：大动脉炎（TAK）——以医生书面结论为准</li>' +
        '<li>重要病史与用药：见「用药与减量」（' + (p.meds || []).length + ' 条记录）</li>' +
        '<li>最近指标：见「检查与指标」</li>' +
        '</ul><p class="k">这页给检索通道提供事实底座；不自动判断你是否符合任何试验条件。</p></div>';
    } else if (sub === 'tr-search') {
      out += '<div class="notice"><b>双通道检索</b>：本原型内置真实登记摘录（ClinicalTrials.gov 公开页摘录，检索日期 2026-11-05）；真实在线检索在开发版接入。</div>';
      out += trialsTable();
    } else {
      out += '<div class="notice"><b>候选线索</b>：收藏后逐条核对；<b>无匹配指数、无判读列</b>——是否适合要和医生商量。</div>';
      out += '<div class="empty"><div class="big">暂无收藏线索</div><p>在检索结果里点「收藏为线索」。</p><button class="primary" data-action="go" data-view="trials" data-sub="tr-search">去检索</button></div>';
    }
    return out;
  };
  function trialsTable() {
    var rows = [
      { id: 'NCT-示例-1', title: '大血管炎免疫治疗观察性研究（登记摘录）', phase: '观察性', status: '招募中（摘录）', place: '多中心（含中国中心）' },
      { id: 'NCT-示例-2', title: '大动脉炎生物制剂 II 期研究（登记摘录）', phase: 'II 期', status: '已完结（摘录）', place: '美国' }
    ];
    return '<div class="table-wrap"><span class="scroll-hint">左右滑动</span><table><thead><tr><th>登记号</th><th>研究</th><th>阶段</th><th>状态</th><th>地区</th><th>操作</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td>' + esc(r.id) + '</td><td>' + esc(r.title) + '</td><td>' + esc(r.phase) + '</td><td>' + esc(r.status) + '</td><td>' + esc(r.place) + '</td>' +
          '<td><button class="ghost" data-action="fav-trial" data-id="' + esc(r.id) + '">收藏为线索</button></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="k">登记摘录≠推荐；入组条件请以 ClinicalTrials.gov 原页与医生意见为准。</p>';
  }

  /* —— 资料库 —— */
  VIEWS.docs = function () {
    var sub = state.sub || 'docs-lib';
    var p = P();
    var out = head('资料库', SUBTITLES.docs);
    out += subnav('docs', sub);
    if (sub === 'docs-lib') {
      out += docsTable(p.docs);
      out += '<div class="notice" style="margin-top:10px">导入 → 解析（MinerU 桩：开发版接入）→ 候选 → 核对 → 入库；解析失败保留原件，可手工录入。</div>';
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
      '<div class="form">' +
      '<label>资料目录<input value="（演示）未连接宿主" readonly></label>' +
      '<p class="hint">开发版接入后：目录由 DSH Desktop 授权，本原型不读写真实文件。</p>' +
      '<label>文档解析（MinerU）<select disabled><option>未接入（接口契约已备）</option></select></label>' +
      '<label>临床数据库<select disabled><option>在线四通道（开发版接入）</option></select></label>' +
      '<label>AI<select disabled><option>未接通：演示面板不会发送任何内容</option></select></label>' +
      '</div>');
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
    state.aiSession.push({ role: 'me', text: '【草稿 · 未发送】' + prompt + (source ? '（来源：' + source + '）' : '') });
    if (!state.aiOpen) agentToggle(true);
    else renderAgentIntro();
    // agent-draft 协议：接入宿主时由宿主监听；原型内只入草稿，绝不自动发送
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'takayasu:agent-draft', prompt: prompt, send: false }, '*');
      }
    } catch (e) { /* file:// 独立打开时忽略 */ }
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
      case 'agent': agentToggle(); break;
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
      case 'noop':
        toast('原型未实现录入：此按钮演示空态的下一步');
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
