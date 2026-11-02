/* PRD 页面脚本：渲染手机框、标注模式、目录高亮、漏斗提示。 */
(function () {
  'use strict';
  var SCA = window.SCA;

  // 标注模式：URL 带 ?annotate=1 时打开。
  var params = new URLSearchParams(location.search);
  var annotate = params.get('annotate') === '1';
  if (annotate) document.body.classList.add('annotate');
  var toggle = document.querySelector('.anno-toggle');
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(annotate));
    toggle.textContent = annotate ? '关闭标注模式' : '标注模式';
    toggle.addEventListener('click', function () {
      var p = new URLSearchParams(location.search);
      if (annotate) p.delete('annotate'); else p.set('annotate', '1');
      var q = p.toString();
      location.href = location.pathname + (q ? '?' + q : '') + location.hash;
    });
  }

  // 渲染手机框。
  var slots = document.querySelectorAll('.ph-slot');
  slots.forEach(function (slot) {
    var state = slot.dataset.state ? JSON.parse(slot.dataset.state) : {};
    slot.innerHTML = SCA.phone(slot.dataset.screen, state, Number(slot.dataset.fit) || 1);
    // 屏幕内的按钮只用于展示，不可点击。
    slot.querySelectorAll('button, input').forEach(function (el) { el.tabIndex = -1; el.setAttribute('aria-hidden', 'true'); });
    var map = slot.dataset.annoMap ? JSON.parse(slot.dataset.annoMap) : null;
    if (map) {
      Object.keys(map).forEach(function (k) {
        var el = slot.querySelector('[data-k="' + k + '"]');
        if (!el) return;
        var v = String(map[k]).split(':');
        el.setAttribute('data-anno', v[0]);
        if (v[1]) el.setAttribute('data-anno-pos', v[1]);
      });
    }
  });

  // 让手机框适应容器宽度。
  function fit() {
    slots.forEach(function (slot) {
      var wrap = slot.querySelector('.phone-wrap');
      if (!wrap) return;
      var max = Number(slot.dataset.fit) || 1;
      var cw = slot.parentElement.clientWidth;
      var s = Math.min(max, cw / 414);
      wrap.style.setProperty('--s', s.toFixed(4));
    });
  }
  fit();
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(fit, 80); });

  // 目录高亮当前章节。
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc nav a'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('on'); });
          var a = byId[e.target.id];
          if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.chapter').forEach(function (c) { io.observe(c); });
  }

  // 漏斗：悬停显示数值。
  var card = document.querySelector('.funnel-card');
  var tip = card && card.querySelector('.ftip');
  if (card && tip) {
    card.querySelectorAll('.frow').forEach(function (row) {
      row.addEventListener('mousemove', function (ev) {
        var d = row.dataset;
        tip.innerHTML = '<b>' + d.name + '</b><br>' + d.v + ' 人（示意）<br>占上一步 ' + d.prev + ' · 占进入 ' + d.tot;
        var r = card.getBoundingClientRect();
        var x = ev.clientX - r.left + 14;
        var y = ev.clientY - r.top + 14;
        if (x + 180 > r.width) x = ev.clientX - r.left - 180;
        tip.style.left = x + 'px';
        tip.style.top = y + 'px';
        tip.classList.add('show');
      });
      row.addEventListener('mouseleave', function () { tip.classList.remove('show'); });
    });
  }
})();
