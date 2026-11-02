/*
 * 手机界面。index.html（静态展示）和 prototype.html（可点击）共用这一份。
 * 每个界面是一个函数：输入状态 s，输出 HTML 字符串。
 * data-go="界面 id"：原型中点击后跳转。data-act="动作"：原型中的交互。
 * data-anno="编号"：标注模式下显示红框和编号。
 */
(function () {
  'use strict';
  var SCA = (window.SCA = window.SCA || {});
  var art = SCA.art;

  var I = {
    back: '<path d="M15 5l-7 7 7 7"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M5 18l5-5 3 3 2-2 4 4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 004 0"/>',
    wifiOff: '<path d="M3 9a14 14 0 0118 0M6 12.5a9 9 0 0112 0M9 16a4 4 0 016 0"/><path d="M4 4l16 16"/><circle cx="12" cy="19.5" r=".8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
    users: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0111 0"/><circle cx="17" cy="10" r="2.5"/><path d="M15.5 19a4.5 4.5 0 016-4"/>',
    flag: '<path d="M6 21V4h11l-2 4 2 4H6"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + I[name] + '</svg>';
  }
  function k(name) { return ' data-k="' + name + '"'; }

  function status() {
    return '<div class="ph-status"><span>9:41</span><span class="ph-status-r"><i class="sig"></i><i class="wifi"></i><i class="bat"></i></span></div>';
  }
  function bar(title, right, opts) {
    opts = opts || {};
    return '<div class="ph-bar"><button class="ph-icon-btn" data-go="' + (opts.back || 'publish') + '" aria-label="返回">' + icon(opts.close ? 'close' : 'back') + '</button>' +
      '<div class="ph-bar-title">' + title + '</div><div class="ph-bar-r">' + (right || '') + '</div></div>';
  }
  function quota(s) {
    return '<span class="ph-quota"' + k('quota') + '>今日剩余 <b>' + s.quota + '</b> 次</span>';
  }
  function screen(cls, head, body, foot, extra) {
    return '<div class="ph-screen ' + cls + '">' + status() + head + '<div class="ph-body">' + body + '</div>' +
      (foot ? '<div class="ph-foot">' + foot + '</div>' : '') + (extra || '') + '</div>';
  }
  function btn(label, cls, attrs) {
    return '<button class="ph-btn ' + (cls || '') + '" ' + (attrs || '') + '>' + label + '</button>';
  }
  function styleName(id) {
    for (var i = 0; i < SCA.STYLES.length; i++) if (SCA.STYLES[i].id === id) return SCA.STYLES[i].name;
    return '';
  }
  function cand(s, i, extra) {
    return art({ bg: s.style, v: i, crop: extra && extra.crop, bright: extra && extra.bright, label: '候选图 ' + (i + 1) });
  }
  function compare(s, pos, opts) {
    opts = opts || {};
    pos = pos == null ? 50 : pos;
    return '<div class="ph-compare ' + (opts.cls || '') + '" data-compare style="--pos:' + pos + '%"' + (opts.k ? k(opts.k) : '') + '>' +
      '<div class="cmp-layer cmp-after">' + cand(s, s.sel) + '</div>' +
      '<div class="cmp-layer cmp-before">' + art({ bg: 'raw', label: '实拍原图' }) + '</div>' +
      '<span class="cmp-tag l">原图</span><span class="cmp-tag r">AI 主图</span>' +
      '<div class="cmp-handle"><span></span></div>' +
      '<input class="cmp-range" type="range" min="0" max="100" value="' + pos + '" aria-label="对比原图和 AI 主图">' +
      '</div>';
  }
  function toast(msg) { return msg ? '<div class="ph-toast">' + msg + '</div>' : ''; }

  var S = {};

  // 发布页（平台现有页面）。AI 主图的入口在照片区。
  S.publish = function (s) {
    var notify = s.notify
      ? '<button class="ph-notice" data-go="results"' + k('notify') + '>' + icon('bell') + '<span><b>AI 主图已生成（4 张）</b><br>点击查看。生成已完成，消耗 1 次。</span></button>'
      : '';
    var photos = s.cover
      ? '<div class="ph-photo is-cover">' + art({ bg: s.style, v: s.sel, crop: s.crop === '1:1' ? '1:1' : null, bright: s.bright }) +
          '<span class="ph-tag cover">主图</span><span class="ph-tag ai">AI 背景</span></div>' +
        '<div class="ph-photo">' + art({ bg: 'raw' }) + '<span class="ph-tag">实拍原图</span></div>'
      : '<div class="ph-photo is-cover">' + art({ bg: 'raw' }) + '<span class="ph-tag cover">主图</span>' +
          '<button class="ph-ai-entry" data-go="empty"' + k('entry') + '>' + icon('spark') + 'AI 主图</button></div>';
    var count = s.cover ? '1/5 · AI 主图不占名额' : '1/5';
    return screen('scr-publish',
      bar('发布商品', '', { back: 'publish', close: true }),
      notify +
      '<div class="ph-section"><div class="ph-label">照片 <span class="ph-muted">' + count + '</span></div>' +
      '<div class="ph-photos">' + photos + '<div class="ph-photo add">' + icon('plus') + '</div></div>' +
      (s.cover ? '<p class="ph-hint">' + icon('info') + '实拍原图保留在第 2 张。买家可以对比。</p>' : '<p class="ph-hint">JPEG、PNG 或 WebP，单张 ≤ 9 MB。第 1 张是主图。</p>') +
      '</div>' +
      '<div class="ph-section"><div class="ph-label">标题</div><div class="ph-input">头戴式耳机，九成新，右耳罩有细小划痕</div></div>' +
      '<div class="ph-row2"><div class="ph-section"><div class="ph-label">价格</div><div class="ph-input">A$ 45</div></div>' +
      '<div class="ph-section"><div class="ph-label">类目</div><div class="ph-input">通用商品 · 数码</div></div></div>' +
      '<div class="ph-section"><div class="ph-label">描述</div><div class="ph-input tall">用了一年，功能正常。右耳罩外壳有两道细小划痕，见照片。</div></div>',
      btn('发布', 'primary', 'data-act="publishDone"'),
      toast(s.toast));
  };

  // 1 默认 / 空状态：引导拍出好照片。
  S.empty = function (s) {
    function tip(good, txt, d) {
      var obj = good
        ? '<rect x="18" y="12" width="20" height="16" rx="3"/>'
        : d === 1 ? '<rect x="34" y="4" width="18" height="14" rx="3"/>' : '<rect x="6" y="10" width="12" height="10" rx="2"/><rect x="30" y="16" width="16" height="12" rx="2"/>';
      return '<div class="tip"><svg viewBox="0 0 56 40" class="tip-ill ' + (good ? 'good' : 'bad') + '"><rect x="1" y="1" width="54" height="38" rx="5" class="fr"/>' + obj + '</svg>' +
        '<span class="tip-mark">' + icon(good ? 'check' : 'close') + '</span><span class="tip-t">' + txt + '</span></div>';
    }
    return screen('scr-empty',
      bar('AI 主图', quota(s), { back: 'publish' }),
      '<div class="ph-hero"' + k('hero') + '><div class="ph-hero-ill">' + art({ bg: 'white', v: 0 }) + '</div>' +
      '<h3>上传 1 张实拍照片</h3><p>AI 换掉杂乱的背景，一次生成 4 张主图。商品本身不改变。</p></div>' +
      '<div class="ph-card"' + k('tips') + '><div class="ph-card-t">拍出好照片的 3 个要点</div>' +
      '<ol class="ph-steps-tip"><li><b>商品放在画面中间</b>，占画面一半以上。</li><li><b>光线充足</b>，靠近窗边，不要逆光。</li><li><b>一次只拍 1 件</b>商品。</li></ol>' +
      '<div class="tips">' + tip(true, '推荐') + tip(false, '太偏', 1) + tip(false, '多件', 2) + '</div></div>' +
      '<p class="ph-fine">支持 JPEG、PNG、WebP · 单张 ≤ 9 MB · 短边 ≥ 512 px</p>',
      btn(icon('camera') + '拍照', 'primary', 'data-go="uploading"' + k('shoot')) +
      '<div class="ph-btn-row">' + btn(icon('image') + '从相册选择', '', 'data-go="uploading"') + btn('用已上传的照片', '', 'data-go="style"') + '</div>');
  };

  // 2 上传中：显示进度，可以取消。
  S.uploading = function (s) {
    var off = s.offline;
    var pct = s.uploadPct == null ? 63 : s.uploadPct;
    return screen('scr-uploading',
      bar('AI 主图', quota(s), { back: 'empty' }),
      (off ? '<div class="ph-banner warn">' + icon('wifiOff') + '<span><b>网络已断开</b><br>上传已暂停。网络恢复后自动继续。</span></div>' : '') +
      '<div class="ph-thumb">' + art({ bg: 'raw' }) + '<div class="ph-thumb-veil"></div></div>' +
      '<ul class="ph-stages"' + k('upstages') + '>' +
      '<li class="' + (off ? 'paused' : 'active') + '"><span class="st-dot"></span><div><b>上传照片</b><span class="ph-muted">' + (off ? '已暂停 · 2.4 / 3.8 MB' : (3.8 * pct / 100).toFixed(1) + ' / 3.8 MB') + '</span>' +
      '<div class="ph-progress"><i style="width:' + pct + '%"></i></div></div></li>' +
      '<li><span class="st-dot"></span><div><b>平台质检</b><span class="ph-muted">检查模糊、过暗、过曝</span></div></li>' +
      '<li><span class="st-dot"></span><div><b>识别商品</b><span class="ph-muted">找出照片中的商品</span></div></li></ul>' +
      '<p class="ph-fine">上传和质检不消耗次数。</p>',
      btn('取消上传', '', 'data-go="empty"' + k('upcancel')));
  };

  var FAIL = {
    quality: { t: '照片偏暗，无法生成', r: '平台质检结果：画面过暗。生成的主图颜色会失真。', steps: ['移到窗边，或打开室内灯。', '关闭滤镜和美颜。', '重新拍 1 张。'], img: 'dark' },
    format: { t: '不支持 HEIC 格式', r: '只支持 JPEG、PNG、WebP。这张照片是 HEIC 格式。', steps: ['在相机设置中，把格式改为「兼容性最佳」。', '或在相册中把照片导出为 JPEG。'], img: 'file', name: 'IMG_2048.HEIC' },
    size: { t: '照片超过 9 MB', r: '这张照片 12.6 MB。单张照片不能超过 9 MB。', steps: ['在相机设置中，降低照片尺寸。', '或换一张照片。'], img: 'file', name: 'IMG_2051.JPG · 12.6 MB' },
    resolution: { t: '照片太小，主图会模糊', r: '这张照片短边 380 px。短边至少要 512 px。', steps: ['用手机相机直接拍照。', '不要用聊天软件里保存的图片。'], img: 'small' },
    noSubject: { t: '没有识别到商品', r: '画面中没有清楚的商品主体。', steps: ['把商品放在画面中间。', '让商品占画面一半以上。', '重新拍 1 张。'], img: 'raw' },
    policy: { t: '这张照片不能用于发布', r: '照片可能包含违禁物品。这张照片不能生成主图，也不能发布。', steps: ['查看发布规则。', '换一张符合规则的照片。'], img: 'blocked' }
  };
  // 3 上传校验失败：写明原因和下一步。
  S.uploadFail = function (s) {
    var f = FAIL[s.reason || 'quality'];
    var thumb;
    if (f.img === 'file') thumb = '<div class="ph-file">' + icon('file') + '<span>' + f.name + '</span></div>';
    else if (f.img === 'blocked') thumb = '<div class="ph-thumb blocked"><div class="ph-blocked">' + icon('alert') + '照片已隐藏</div></div>';
    else if (f.img === 'small') thumb = '<div class="ph-thumb small">' + art({ bg: 'raw' }) + '</div>';
    else thumb = '<div class="ph-thumb">' + art({ bg: 'raw', dark: f.img === 'dark' }) + '</div>';
    var policy = s.reason === 'policy';
    return screen('scr-fail',
      bar('AI 主图', quota(s), { back: 'empty' }),
      thumb +
      '<div class="ph-result-head"><span class="ph-badge warn">' + icon('alert') + '</span><div><h3' + k('failtitle') + '>' + f.t + '</h3><p>' + f.r + '</p></div></div>' +
      '<div class="ph-card"' + k('failsteps') + '><div class="ph-card-t">怎么做</div><ol class="ph-num">' +
      f.steps.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol></div>' +
      '<div class="ph-chip ok"' + k('nocharge') + '>' + icon('check') + '本次不扣次数</div>',
      (policy
        ? btn('换一张照片', 'primary', 'data-go="empty"') + btn('查看发布规则', 'ghost', 'data-act="rules"')
        : btn(icon('camera') + '重新拍照', 'primary', 'data-go="uploading"') +
          '<div class="ph-btn-row">' + btn('换一张照片', '', 'data-go="empty"') + btn('返回发布页', '', 'data-go="publish"') + '</div>'));
  };

  // 多个主体：让用户点选要保留的商品。
  S.multiSubject = function (s) {
    return screen('scr-multi',
      bar('AI 主图', quota(s), { back: 'empty' }),
      '<div class="ph-thumb multi">' + art({ bg: 'raw' }) +
      '<svg class="ph-mug" viewBox="0 0 400 300"><g transform="translate(286 150)"><rect x="0" y="0" width="58" height="70" rx="8" fill="#E9E2D6"/><path d="M58 18 c22 0 22 34 0 34" stroke="#E9E2D6" stroke-width="9" fill="none"/></g></svg>' +
      '<button class="pick on" style="left:12%;top:24%;width:56%;height:64%" data-act="noop">' + icon('check') + '</button>' +
      '<button class="pick" style="left:70%;top:46%;width:22%;height:32%" data-act="noop"></button></div>' +
      '<div class="ph-result-head"><span class="ph-badge">' + icon('info') + '</span><div><h3>照片里有 2 件物品</h3><p>请点选要保留的商品。另一件会作为背景被换掉。</p></div></div>',
      btn('确认，继续', 'primary', 'data-go="style"') + btn('重新拍照', 'ghost', 'data-go="uploading"'));
  };

  // 选风格。
  S.style = function (s) {
    var cards = SCA.STYLES.map(function (st) {
      var on = st.id === s.style;
      return '<button class="ph-style' + (on ? ' on' : '') + '" data-act="style:' + st.id + '">' +
        '<div class="ph-style-img">' + art({ bg: st.id, v: 0 }) + (on ? '<span class="ph-check">' + icon('check') + '</span>' : '') + '</div>' +
        '<b>' + st.name + '</b><span>' + st.note + '</span></button>';
    }).join('');
    return screen('scr-style',
      bar('AI 主图', quota(s), { back: 'empty' }),
      '<div class="ph-thumb">' + art({ bg: 'raw' }) + '<div class="ph-mask" style="left:15%;top:26%;width:52%;height:62%"></div>' +
      '<span class="ph-tag ok">' + icon('check') + '已识别：头戴式耳机</span></div>' +
      '<div class="ph-label">选择风格</div><div class="ph-styles">' + cards + '</div>' +
      '<p class="ph-fine">一次生成 4 张，消耗 1 次。生成失败或取消，不扣次数。</p>',
      btn(icon('spark') + '生成 4 张', 'primary big', 'data-act="generate"') +
      '<div class="ph-foot-note">今日剩余 ' + s.quota + ' 次 · 每天免费 5 次</div>');
  };

  // 4 生成中：分阶段进度，显示预计时间，可取消，可离开。
  S.generating = function (s) {
    var stage = s.stage == null ? 1 : s.stage;
    var off = s.offline;
    var q = s.queue;
    var names = [
      ['识别商品', '已识别：头戴式耳机'],
      ['生成背景', styleName(s.style) + '风格 · 4 张'],
      ['合成与校验', '检查商品是否变形']
    ];
    var list = names.map(function (nm, i) {
      var st = q ? '' : i < stage ? 'done' : i === stage ? (off ? 'paused' : 'active') : '';
      var sub = i < stage ? nm[1] : i === stage ? (off ? '等待网络恢复' : nm[1]) : nm[1];
      return '<li class="' + st + '"><span class="st-dot">' + (i < stage && !q ? icon('check') : '') + '</span><div><b>' + nm[0] + '</b><span class="ph-muted">' + sub + '</span></div>' +
        (i === stage && !off && !q ? '<span class="st-now">进行中</span>' : '') + '</li>';
    }).join('');
    var eta = s.eta == null ? 12 : s.eta;
    var head = q
      ? '<div class="ph-queue"' + k('stages') + '>' + icon('users') + '<div><b>排队中，前面还有 12 人</b><span>预计 40 秒后开始生成。排队不扣次数。</span></div></div>'
      : '<div class="ph-gen-head"><h3>正在生成 4 张主图</h3><span class="ph-eta"' + k('eta') + '>' + icon('clock') + (off ? '网络恢复后继续' : '预计还需约 ' + eta + ' 秒') + '</span></div>';
    var grid = '';
    for (var i = 0; i < 4; i++) {
      var ready = !q && s.ready && i < s.ready;
      grid += '<div class="ph-cell' + (ready ? ' ready' : ' skel') + '">' + (ready ? cand(s, i) : '') + '</div>';
    }
    return screen('scr-gen',
      bar('AI 主图', quota(s), { back: 'style' }),
      (off ? '<div class="ph-banner warn">' + icon('wifiOff') + '<span><b>网络已断开</b><br>生成会在服务器继续。网络恢复后显示结果。</span></div>' : '') +
      head +
      (q ? '' : '<ul class="ph-stages"' + k('stages') + '>' + list + '</ul>') +
      '<div class="ph-grid small">' + grid + '</div>' +
      '<div class="ph-leave"' + k('leave') + '>' + icon('bell') + '<span>可以离开此页面。生成会继续，完成后通知你。</span></div>',
      btn(icon('bell') + '离开，完成后通知我', '', 'data-act="leave"') +
      btn(q ? '取消排队（不扣次数）' : '取消（不扣次数）', 'ghost', 'data-act="cancel"' + k('cancel')));
  };

  // 5 生成失败兜底：重试 / 换风格 / 明确告知未扣次数。
  S.generateFail = function (s) {
    return screen('scr-genfail',
      bar('AI 主图', quota(s), { back: 'style' }),
      '<div class="ph-thumb dim">' + art({ bg: 'raw' }) + '</div>' +
      '<div class="ph-result-head"><span class="ph-badge warn">' + icon('alert') + '</span><div><h3>这次没有生成成功</h3><p>原因：生成时间超过 60 秒。</p></div></div>' +
      '<div class="ph-chip ok big"' + k('nocharge') + '>' + icon('check') + '<span><b>本次未扣次数</b> · 今日剩余 ' + s.quota + ' 次</span></div>' +
      '<div class="ph-card"><div class="ph-card-t">你可以</div><ul class="ph-opts"' + k('failopts') + '>' +
      '<li><b>重试</b>：用相同的风格再生成一次。</li><li><b>换个风格</b>：生活场景失败时，纯白的成功率更高。</li><li><b>用原图发布</b>：原图已通过质检。</li></ul></div>',
      btn('重试', 'primary', 'data-act="generate"') +
      '<div class="ph-btn-row">' + btn('换个风格', '', 'data-go="style"') + btn('用原图发布', '', 'data-go="publish"') + '</div>');
  };

  // 6 结果对比挑选。
  S.results = function (s) {
    var grid = '';
    for (var i = 0; i < 4; i++) {
      var on = i === s.sel;
      grid += '<button class="ph-cell' + (on ? ' on' : '') + '" data-act="sel:' + i + '"' + (on ? k('selected') : '') + '>' + cand(s, i) +
        '<span class="ph-n">' + (i + 1) + '</span>' + (on ? '<span class="ph-check">' + icon('check') + '</span>' : '') + '</button>';
    }
    return screen('scr-results',
      bar('选择主图', quota(s), { back: 'style' }),
      '<div class="ph-meta"' + k('meta') + '>' + icon('check') + '已生成 4 张 · ' + styleName(s.style) + ' · 消耗 1 次</div>' +
      '<div class="ph-grid"' + k('grid') + '>' + grid + '</div>' +
      '<div class="ph-cmp-label"><b>对比原图</b><button class="ph-link" data-go="preview">放大查看</button></div>' +
      compare(s, s.cmp == null ? 46 : s.cmp, { cls: 'wide', k: 'compare' }) +
      '<div class="ph-links"><button class="ph-link"' + k('dislike') + ' data-act="dislike">都不满意？换个风格</button>' +
      '<button class="ph-link muted"' + k('feedback') + ' data-act="feedback">' + icon('flag') + '结果有问题</button></div>',
      '<div class="ph-btn-row">' + btn('编辑', '', 'data-go="edit"') + btn('设为主图', 'primary', 'data-act="setCover"' + k('primary')) + '</div>',
      s.sheet ? S._sheet(s) : toast(s.toast));
  };

  // 放大查看 + 滑块对比。
  S.preview = function (s) {
    var strip = '';
    for (var i = 0; i < 4; i++) strip += '<button class="ph-strip-i' + (i === s.sel ? ' on' : '') + '" data-act="sel:' + i + '">' + cand(s, i) + '</button>';
    return screen('scr-preview dark',
      bar('第 ' + (s.sel + 1) + ' / 4 张', '', { back: 'results', close: true }),
      compare(s, s.cmp == null ? 50 : s.cmp, { cls: 'full' }) +
      '<p class="ph-cap">拖动滑块，检查商品的颜色、形状和划痕是否和原图一致。</p>' +
      '<div class="ph-strip">' + strip + '</div>',
      '<div class="ph-btn-row">' + btn('编辑', '', 'data-go="edit"') + btn('设为主图', 'primary', 'data-act="setCover"') + '</div>');
  };

  // “都不满意”底部面板：换风格重新生成，并收集原因。
  S._sheet = function (s) {
    var rs = ['背景不合适', '光线不自然', '颜色不对', '商品变形', '文字乱码', '其他'];
    var picked = s.reasons || {};
    var chips = rs.map(function (r) {
      return '<button class="ph-pill' + (picked[r] ? ' on' : '') + '" data-act="reason:' + r + '">' + r + '</button>';
    }).join('');
    var styles = SCA.STYLES.filter(function (x) { return x.id !== s.style; }).map(function (x, i) {
      var on = (s.nextStyle || SCA.STYLES.filter(function (y) { return y.id !== s.style; })[0].id) === x.id;
      return '<button class="ph-pill' + (on ? ' on' : '') + '" data-act="next:' + x.id + '">' + x.name + '</button>';
    }).join('');
    var refund = picked['商品变形'] || picked['文字乱码'];
    return '<div class="ph-scrim" data-act="closeSheet"></div><div class="ph-sheet"' + k('sheet') + '><div class="ph-grab"></div>' +
      '<h3>哪里不满意？</h3><p class="ph-muted">可多选。你的选择会用于改进 AI。</p>' +
      '<div class="ph-pills">' + chips + '</div>' +
      (refund ? '<div class="ph-chip ok">' + icon('check') + '结果异常，本次退回 1 次</div>' : '<p class="ph-fine left">选择「商品变形」或「文字乱码」，本次退回 1 次。</p>') +
      '<div class="ph-label">换个风格</div><div class="ph-pills">' + styles + '</div>' +
      btn(icon('spark') + '重新生成 4 张（消耗 1 次）', 'primary', 'data-act="regenerate"') + '</div>';
  };
  S.dislike = function (s) {
    var t = {};
    for (var k in s) t[k] = s[k];
    t.sheet = true;
    return S.results(t);
  };

  // 轻编辑：换背景、调亮度、裁剪比例。
  S.edit = function (s) {
    var tab = s.tab || 'crop';
    var tabs = [['bg', '背景'], ['light', '亮度'], ['crop', '裁剪']].map(function (t) {
      return '<button class="ph-tab' + (t[0] === tab ? ' on' : '') + '" data-act="tab:' + t[0] + '">' + t[1] + '</button>';
    }).join('');
    var panel;
    if (tab === 'bg') {
      var sw = [['white', 0, '纯白'], ['gray', 0, '浅灰'], ['gray', 1, '暖灰'], ['gray', 2, '冷灰']].map(function (x, i) {
        var on = s.style === x[0] && s.sel === x[1];
        return '<button class="ph-swatch' + (on ? ' on' : '') + '" data-act="bg:' + x[0] + ':' + x[1] + '"><i class="sw-' + x[0] + x[1] + '"></i>' + x[2] + '</button>';
      }).join('');
      panel = '<div class="ph-swatches">' + sw + '</div><p class="ph-fine left">只换纯色背景，不消耗次数。换场景请重新生成。</p>';
    } else if (tab === 'light') {
      panel = '<div class="ph-slider"><span>暗</span><input type="range" min="-20" max="20" value="' + (s.bright || 0) + '" data-act-input="bright" aria-label="亮度"><span>亮</span></div>' +
        '<p class="ph-fine left">亮度 ' + (s.bright > 0 ? '+' : '') + (s.bright || 0) + '。只调整整张图，不改变商品颜色的对比。</p>';
    } else {
      panel = '<div class="ph-pills">' +
        '<button class="ph-pill' + (s.crop !== '1:1' ? ' on' : '') + '" data-act="crop:4:3">4:3 · 列表卡片</button>' +
        '<button class="ph-pill' + (s.crop === '1:1' ? ' on' : '') + '" data-act="crop:1:1">1:1</button></div>' +
        '<p class="ph-fine left">列表卡片是 4:3。选 1:1 时，卡片会裁掉左右两侧。</p>';
    }
    return screen('scr-edit',
      bar('编辑', '<span class="ph-quota">不消耗次数</span>', { back: 'results' }),
      '<div class="ph-edit-img ' + (s.crop === '1:1' ? 'sq' : '') + '"' + k('editimg') + '>' + cand(s, s.sel, { crop: s.crop === '1:1' ? '1:1' : null, bright: s.bright }) + '<span class="ph-tag ai">AI 背景</span></div>' +
      '<div class="ph-tabs"' + k('tabs') + '>' + tabs + '</div><div class="ph-panel">' + panel + '</div>',
      '<div class="ph-btn-row">' + btn(icon('download') + '下载', '', 'data-act="download"') + btn('设为主图', 'primary', 'data-act="setCover"') + '</div>',
      toast(s.toast));
  };

  // 7 次数用完：说明什么时候恢复，并提供替代方案。
  S.quotaEmpty = function (s) {
    return screen('scr-quota',
      bar('AI 主图', '<span class="ph-quota zero">今日剩余 <b>0</b> 次</span>', { back: 'publish' }),
      '<div class="ph-empty-ill">' + icon('clock') + '</div>' +
      '<h3 class="ph-center"' + k('quotatitle') + '>今天的 5 次已用完</h3>' +
      '<p class="ph-center ph-muted">明天 00:00 恢复 5 次。</p>' +
      '<div class="ph-card"' + k('quotaopts') + '><div class="ph-card-t">现在可以</div><ul class="ph-opts">' +
      '<li><b>用原图发布</b>：原图已通过质检，可以直接发布。</li>' +
      '<li><b>用已生成的图</b>：今天生成的 4 张仍可选用。</li>' +
      '<li><b>免费编辑</b>：裁剪、调亮度、换纯色背景不消耗次数。</li></ul></div>' +
      '<p class="ph-fine">失败、取消和已反馈的异常结果，都不扣次数。</p>',
      btn('用原图发布', 'primary', 'data-go="publish"') + btn('查看已生成的 4 张', 'ghost', 'data-go="results"'));
  };

  SCA.SCREENS = S;
  SCA.FAIL_REASONS = FAIL;
  SCA.icon = icon;

  SCA.defaults = function () {
    return { quota: 5, style: 'white', sel: 0, crop: '4:3', bright: 0, stage: 1, eta: 12, ready: 0, cmp: null, reason: 'quality', tab: 'crop' };
  };

  // 生成一个手机框。scale：缩放比例。
  SCA.phone = function (id, s, scale) {
    var st = SCA.defaults();
    for (var k in s) st[k] = s[k];
    var html = S[id](st);
    return '<div class="phone-wrap" style="--s:' + (scale || 1) + '"><div class="phone"><div class="phone-notch"></div>' + html + '</div></div>';
  };
})();
