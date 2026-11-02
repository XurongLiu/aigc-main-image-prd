/* 可点击原型：状态机 + 状态切换器。 */
(function () {
  'use strict';
  var SCA = window.SCA;
  var S = SCA.SCREENS;
  var screenEl = document.getElementById('screen');
  var wrap = document.getElementById('wrap');

  // 切换器：每一项 = 一个界面 + 一组状态。note 写设计决策，方便面试演示。
  var GROUPS = [
    { t: '主路径', c: '#0f6f68', items: [
      { id: 'publish', label: '发布页（入口）', screen: 'publish', patch: { cover: false, notify: false }, note: '入口放在第 1 张照片上。卖家在上传照片时最需要主图，不增加新的导航层级。' },
      { id: 'empty', label: '1 默认 / 空状态', screen: 'empty', note: '用 3 个要点和正误示例引导拍照。写明格式和尺寸要求，减少上传失败。' },
      { id: 'uploading', label: '2 上传中', screen: 'uploading', patch: { offline: false, uploadPct: 63 }, note: '显示 3 个步骤和真实进度。可以取消。上传和质检不消耗次数。' },
      { id: 'style', label: '选风格', screen: 'style', note: '先选风格再生成。1 次 = 4 张同一风格的图，4 张之间才可比较。' },
      { id: 'generating', label: '4 生成中', screen: 'generating', patch: { stage: 1, ready: 0, eta: 12, offline: false, queue: false }, note: '用 3 个阶段代替假的百分比。显示预计时间。可以取消（不扣次数），可以离开（完成后通知）。' },
      { id: 'results', label: '6 结果对比挑选', screen: 'results', patch: { sheet: false }, note: '2×2 网格一屏看完。滑块对比原图，检查商品有没有被改。默认选中第 1 张。' },
      { id: 'preview', label: '放大 + 滑块对比', screen: 'preview', note: '全屏对比原图和 AI 主图。拖动滑块，检查颜色、形状和划痕。' },
      { id: 'edit', label: '轻编辑', screen: 'edit', note: '换纯色背景、调亮度、裁剪 4:3 / 1:1。编辑不消耗次数。' },
      { id: 'done', label: '设为主图（回到发布页）', screen: 'publish', patch: { cover: true, notify: false }, note: 'AI 主图排第 1 张，实拍原图排第 2 张。AI 主图不占 5 张名额，并带「AI 背景」标识。' }
    ] },
    { t: '等待', c: '#2563eb', items: [
      { id: 'queue', label: '服务端排队', screen: 'generating', patch: { queue: true, offline: false, stage: 0 }, note: '显示排队位置和预计时间。排队不扣次数，可以取消。' },
      { id: 'genOffline', label: '生成中断网', screen: 'generating', patch: { offline: true, queue: false, stage: 1 }, note: '生成在服务器继续。网络恢复后显示结果。成功才扣次数。' },
      { id: 'notify', label: '离开后通知', screen: 'publish', patch: { cover: false, notify: true }, note: '用户离开后，生成在后台继续。完成后在发布页顶部通知，点击回到结果页。' }
    ] },
    { t: '失败与异常', c: '#c2410c', items: [
      { id: 'failQuality', label: '3 校验失败 · 过暗', screen: 'uploadFail', patch: { reason: 'quality' }, note: '沿用平台质检。写明原因和 3 个下一步。不扣次数。' },
      { id: 'failFormat', label: '校验失败 · HEIC', screen: 'uploadFail', patch: { reason: 'format' }, note: '写明支持的格式，并告诉用户怎么转换。' },
      { id: 'failSize', label: '校验失败 · 超过 9 MB', screen: 'uploadFail', patch: { reason: 'size' }, note: '写明照片大小和上限，并给出 2 个做法。' },
      { id: 'failRes', label: '校验失败 · 分辨率过低', screen: 'uploadFail', patch: { reason: 'resolution' }, note: '短边 < 512 px 时，生成的主图会模糊。提示用相机直接拍照。' },
      { id: 'failSubject', label: '校验失败 · 无商品', screen: 'uploadFail', patch: { reason: 'noSubject' }, note: '识别不到商品时，提示把商品放在画面中间。' },
      { id: 'failPolicy', label: '校验失败 · 原图违规', screen: 'uploadFail', patch: { reason: 'policy' }, note: '原图违规时不生成，也不能发布。不提供「返回发布页继续用这张」。' },
      { id: 'multi', label: '多个主体', screen: 'multiSubject', note: '识别到 2 件物品时，让用户点选要保留的商品。' },
      { id: 'upOffline', label: '上传中断网', screen: 'uploading', patch: { offline: true, uploadPct: 63 }, note: '上传暂停，网络恢复后自动续传。进度不丢失。' },
      { id: 'genFail', label: '5 生成失败兜底', screen: 'generateFail', note: '明确写出「本次未扣次数」。提供重试、换风格、用原图发布。' },
      { id: 'dislike', label: '都不满意', screen: 'dislike', patch: { reasons: {} }, note: '选原因、换风格、重新生成。选「商品变形」或「文字乱码」时，本次退回 1 次。' },
      { id: 'quota', label: '7 次数用完', screen: 'quotaEmpty', patch: { quota: 0 }, note: '写明恢复时间。提供 3 个不消耗次数的替代方案。' }
    ] }
  ];
  var ITEMS = {};
  GROUPS.forEach(function (g) { g.items.forEach(function (it) { ITEMS[it.id] = it; }); });

  var st, cur, timers = [], toastTimer;

  function reset() {
    st = SCA.defaults();
    st.cover = false; st.notify = false; st.reasons = {};
    clearTimers();
    show('publish');
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function render() {
    screenEl.innerHTML = S[st.screen](st);
    var item = ITEMS[cur];
    document.getElementById('now-name').textContent = item ? item.label : '';
    document.getElementById('now-note').textContent = item ? item.note : '';
    document.getElementById('now-quota').textContent = '今日剩余 ' + st.quota + ' 次';
    document.querySelectorAll('.sw-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.id === cur); });
  }
  // 打开切换器中的某一项。
  function show(id) {
    var it = ITEMS[id];
    clearTimers();
    st.toast = null; st.sheet = false;
    if (it.patch) for (var k in it.patch) st[k] = it.patch[k];
    if (id === 'quota') st.quota = 0;
    else if (st.quota === 0 && id !== 'quota') st.quota = id === 'results' || id === 'preview' || id === 'edit' ? 4 : 5;
    st.screen = it.screen;
    cur = id;
    render();
  }
  // 按界面 id 跳转（来自手机里的点击）。
  function go(screen) {
    clearTimers();
    st.toast = null; st.sheet = false;
    var map = { publish: 'publish', empty: 'empty', uploading: 'uploading', style: 'style', results: 'results', preview: 'preview', edit: 'edit', quotaEmpty: 'quota', generateFail: 'genFail' };
    if (screen === 'publish') { st.notify = false; cur = st.cover ? 'done' : 'publish'; }
    else cur = map[screen] || cur;
    st.screen = screen;
    if (screen === 'uploading') { st.offline = false; return upload(); }
    render();
  }
  function toast(msg) {
    st.toast = msg; render();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { st.toast = null; if (!st.sheet) render(); }, 2200);
  }

  function upload() {
    st.uploadPct = 8; render();
    var steps = [28, 52, 76, 100];
    steps.forEach(function (p, i) { later(function () { st.uploadPct = p; render(); }, 350 * (i + 1)); });
    later(function () { st.screen = 'style'; cur = 'style'; render(); }, 1700);
  }

  function generate() {
    if (st.quota <= 0) { st.screen = 'quotaEmpty'; cur = 'quota'; render(); return; }
    st.screen = 'generating'; cur = 'generating';
    st.queue = false; st.offline = false; st.stage = 0; st.ready = 0; st.eta = 14; st.sel = 0; st.cmp = null;
    render();
    var tick = function (t, patch) { later(function () { for (var k in patch) st[k] = patch[k]; if (st.screen === 'generating') render(); }, t); };
    tick(1200, { stage: 1, eta: 10 });
    tick(2200, { eta: 7 });
    tick(3200, { stage: 2, eta: 4 });
    tick(3800, { ready: 1, eta: 3 });
    tick(4200, { ready: 2, eta: 2 });
    tick(4600, { ready: 3, eta: 1 });
    tick(5000, { ready: 4, eta: 1 });
    later(function () { st.quota = Math.max(0, st.quota - 1); st.screen = 'results'; cur = 'results'; render(); }, 5500);
  }

  function act(a, el) {
    var p = a.split(':');
    switch (p[0]) {
      case 'generate': generate(); break;
      case 'regenerate': {
        var refund = st.reasons && (st.reasons['商品变形'] || st.reasons['文字乱码']);
        if (refund) st.quota = Math.min(5, st.quota + 1);
        st.style = st.nextStyle || SCA.STYLES.filter(function (x) { return x.id !== st.style; })[0].id;
        st.nextStyle = null; st.reasons = {};
        generate();
        break;
      }
      case 'cancel': clearTimers(); st.queue = false; st.screen = 'style'; cur = 'style'; toast('已取消。本次不扣次数。'); break;
      case 'leave':
        clearTimers(); st.cover = false; st.notify = false; st.screen = 'publish'; cur = 'publish'; toast('生成会继续。完成后通知你。');
        later(function () { st.quota = Math.max(0, st.quota - 1); st.sel = 0; st.notify = true; cur = 'notify'; if (st.screen === 'publish') render(); }, 2600);
        break;
      case 'sel': st.sel = Number(p[1]); render(); break;
      case 'style': st.style = p[1]; render(); break;
      case 'dislike': st.sheet = true; st.reasons = {}; st.nextStyle = null; st.screen = 'results'; cur = 'dislike'; render(); break;
      case 'closeSheet': st.sheet = false; cur = 'results'; render(); break;
      case 'reason': st.reasons[p[1]] = !st.reasons[p[1]]; render(); break;
      case 'next': st.nextStyle = p[1]; render(); break;
      case 'feedback': st.quota = Math.min(5, st.quota + 1); toast('已收到反馈。本次退回 1 次。'); break;
      case 'setCover': st.cover = true; st.notify = false; st.screen = 'publish'; cur = 'done'; toast('已设为主图。实拍原图在第 2 张。'); break;
      case 'publishDone': toast('已发布（示意）'); break;
      case 'download': toast('已保存到相册（示意）'); break;
      case 'tab': st.tab = p[1]; render(); break;
      case 'crop': st.crop = p[1] + ':' + p[2]; render(); break;
      case 'bg': st.style = p[1]; st.sel = Number(p[2]); render(); break;
      case 'rules': toast('发布规则（示意）'); break;
      default: break;
    }
  }

  // 手机内的点击。
  screenEl.addEventListener('click', function (e) {
    var el = e.target.closest('[data-go], [data-act]');
    if (!el || !screenEl.contains(el)) return;
    if (el.dataset.act) act(el.dataset.act, el);
    else go(el.dataset.go);
  });
  // 滑块：对比原图、亮度。
  screenEl.addEventListener('input', function (e) {
    var t = e.target;
    if (t.classList.contains('cmp-range')) {
      st.cmp = Number(t.value);
      t.parentElement.style.setProperty('--pos', t.value + '%');
    } else if (t.dataset.actInput === 'bright') {
      st.bright = Number(t.value);
      var svg = screenEl.querySelector('.ph-edit-img svg');
      if (svg) svg.style.filter = 'brightness(' + (1 + st.bright / 100) + ')';
      var note = t.closest('.ph-panel').querySelector('.ph-fine');
      if (note) note.textContent = '亮度 ' + (st.bright > 0 ? '+' : '') + st.bright + '。只调整整张图，不改变商品颜色的对比。';
    }
  });
  screenEl.addEventListener('change', function (e) { if (e.target.dataset.actInput === 'bright') render(); });

  // 切换器。
  var groupsEl = document.getElementById('groups');
  groupsEl.innerHTML = GROUPS.map(function (g) {
    return '<div class="sw-g"><div class="sw-g-t"><i style="background:' + g.c + '"></i>' + g.t + '</div>' +
      g.items.map(function (it) { return '<button type="button" class="sw-btn" data-id="' + it.id + '">' + it.label + '</button>'; }).join('') + '</div>';
  }).join('');
  groupsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.sw-btn');
    if (b) show(b.dataset.id);
  });
  document.getElementById('reset').addEventListener('click', reset);

  // 手机框适应窗口高度和宽度。
  function fit() {
    var h = window.innerHeight - 48;
    var w = wrap.parentElement.clientWidth || 414;
    var s = Math.min(1, h / 868, window.innerWidth < 760 ? (window.innerWidth - 32) / 414 : 1);
    wrap.style.setProperty('--s', Math.max(0.6, s).toFixed(4));
  }
  window.addEventListener('resize', fit);
  fit();

  // 支持 #状态 直接打开某个状态，例如 prototype.html#genFail。
  reset();
  var h = location.hash.slice(1);
  if (h && ITEMS[h]) show(h);
})();
