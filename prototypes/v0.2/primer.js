/* 疾病概要整页浮层渲染（36 号 / P1–P9）
 * 整页不是弹窗（可见区 ≥90% 视口）；返回与关闭双入口；history 是栈真源；
 * Esc 只退一层；关闭焦点回触发按钮；每段强制来源行。
 */
(function () {
  'use strict';

  function data() { return window.DISEASE_PRIMER || null; }

  function safeHref(url) {
    if (typeof url !== 'string' || url.indexOf('https://') !== 0) return null;
    return url;
  }

  function sourceLine(s) {
    var parts = [s.org, s.doc];
    var linkPhrase = '';
    if (s.entry) linkPhrase = '官方入口 需自行检索 · 打开 ↗';
    else if (s.original) linkPhrase = '原件 已取得 · 打开 ↗';
    else linkPhrase = '未取得原件，据二次来源';
    var href = safeHref(s.url);
    var link = href
      ? '<a href="' + href + '" target="_blank" rel="noopener">' + linkPhrase + '</a>'
      : '<span class="dp-miss">' + linkPhrase + '</span>';
    var note = s.note ? ' · ' + s.note : '';
    return parts.join(' · ') + '（' + link + note + '）';
  }

  function tableHtml(t) {
    if (!t || !t.head || !t.rows) return '';
    var thead = '<tr>' + t.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>';
    var rows = t.rows.map(function (r) {
      return '<tr>' + r.map(function (c) {
        if (c && typeof c === 'object') {
          var href = safeHref(c.url);
          return '<td>' + c.text + (href ? ' <a href="' + href + '" target="_blank" rel="noopener">打开 ↗</a>' : '') + '</td>';
        }
        return '<td>' + c + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<table class="dp-table"><thead>' + thead + '</thead><tbody>' + rows + '</tbody></table>';
  }

  function sectionHtml(sec) {
    var out = '<section class="dp-section" data-dp-section="' + sec.id + '">';
    out += '<h3>' + sec.title + '</h3>';
    if (sec.intro) out += '<p class="dp-lead">' + sec.intro + '</p>';
    if (sec.points && sec.points.length) {
      out += '<ul class="dp-points">' + sec.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';
    }
    if (sec.groups && sec.groups.length) {
      out += sec.groups.map(function (g) {
        return '<div class="dp-group"><h4>' + g.label + '</h4><ul class="dp-points">' +
          g.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul></div>';
      }).join('');
    }
    if (sec.table) out += tableHtml(sec.table);
    if (sec.sources && sec.sources.length) {
      out += '<p class="dp-src"><b>来源</b>' + sec.sources.map(sourceLine).join(' ｜ ') + '</p>';
    } else {
      out += '<p class="dp-src dp-src-missing"><b>来源</b>未标注 —— 这一段还不能用</p>';
    }
    out += '</section>';
    return out;
  }

  function build() {
    var d = data();
    if (!d) return '<p class="dp-empty">疾病概要数据缺失。</p>';
    var out = '<div class="dp-inner">';
    out += '<p class="dp-lead"><b>' + d.brand + '</b> · ' + d.updated + '</p>';
    out += '<div class="notice">' + d.registration + '</div>';
    d.sections.forEach(function (sec) { out += sectionHtml(sec); });
    out += '</div>';
    return out;
  }

  var el = null, opener = null, prevScroll = 0;

  function mount() {
    if (el) return;
    el = document.createElement('div');
    el.id = 'disease-primer';
    el.className = 'dp-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', '疾病概要');
    el.hidden = true;
    el.innerHTML =
      '<div class="dp-panel">' +
      '<div class="dp-head">' +
      '<button class="ghost dp-back" type="button" data-dp="back">返回</button>' +
      '<div class="crumb">小弓宝 <span>/</span> 疾病概要</div>' +
      '<h2 id="dp-title">大动脉炎是什么</h2>' +
      '<button class="icon-button dp-close" type="button" data-dp="close" aria-label="关闭疾病概要">×</button>' +
      '</div>' +
      '<div class="dp-body">' + build() + '</div>' +
      '</div>';
    document.body.appendChild(el);
    el.querySelector('.dp-back').addEventListener('click', close);
    el.querySelector('.dp-close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !el.hidden) close();
    });
    window.addEventListener('popstate', function () {
      if (!el.hidden) hide();
    });
  }

  function show() {
    mount();
    opener = document.activeElement;
    prevScroll = window.scrollY || 0;
    el.hidden = false;
    document.documentElement.classList.add('dp-lock');
    history.pushState({ dp: 1 }, '', '#disease-primer');
    var t = document.querySelectorAll('[data-primer-open]')[0];
    if (t) t.setAttribute('aria-expanded', 'true');
    el.querySelector('.dp-body').scrollTop = 0;
  }

  function hide() {
    if (!el || el.hidden) return;
    el.hidden = true;
    document.documentElement.classList.remove('dp-lock');
    var t = document.querySelectorAll('[data-primer-open]')[0];
    if (t) { t.setAttribute('aria-expanded', 'false'); try { t.focus(); } catch (e) {} }
    if (opener && opener.focus) { try { opener.focus(); } catch (e) {} }
    if (window.scrollTo) window.scrollTo(0, prevScroll);
  }

  function close() {
    if (!el || el.hidden) return;
    hide();
    if (history.state && history.state.dp) history.back();
  }

  function boot() {
    mount();
    var triggers = document.querySelectorAll('[data-primer-open]');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', function (e) {
        e.preventDefault();
        show();
      });
    }
    if (location.hash === '#disease-primer') show();
  }

  window.DiseasePrimer = {
    isOpen: function () { return !!(el && !el.hidden); },
    open: function () { show(); },
    close: function () { close(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setTimeout(function () { mount(); }, 400);
  setTimeout(function () { mount(); }, 1200);
})();
