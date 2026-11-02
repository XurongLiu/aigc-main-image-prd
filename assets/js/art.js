/*
 * 自绘商品图：同一个商品主体（头戴式耳机），叠在不同背景上。
 * 不使用真实品牌、照片或有版权的素材。
 * 用法：SCA.art({ bg: 'raw' | 'white' | 'gray' | 'scene', v: 0-3, crop: '4:3' | '1:1', bright: -20..20 })
 */
(function () {
  'use strict';
  var SCA = (window.SCA = window.SCA || {});
  var n = 0;

  // 商品主体。右耳罩上有一处划痕：AI 不重绘主体，划痕保留。
  function product(id, opts) {
    opts = opts || {};
    var deform = opts.deform;
    var cup = '#2F343B';
    var pad = '#B9A58A';
    var band = deform
      ? 'M128 178 C120 70, 250 120, 276 160'
      : 'M128 178 C128 88, 272 88, 272 178';
    var right = deform
      ? '<ellipse cx="276" cy="206" rx="40" ry="28" transform="rotate(28 276 206)" fill="' + cup + '"/>' +
        '<ellipse cx="262" cy="210" rx="22" ry="14" transform="rotate(28 262 210)" fill="' + pad + '"/>'
      : '<ellipse cx="272" cy="212" rx="30" ry="40" fill="' + cup + '"/>' +
        '<ellipse cx="262" cy="212" rx="16" ry="32" fill="' + pad + '"/>' +
        '<ellipse cx="282" cy="196" rx="6" ry="12" fill="#fff" opacity=".10"/>' +
        '<path d="M279 222 l9 -5 M282 229 l7 -4" stroke="#9AA1A9" stroke-width="1.6" stroke-linecap="round"/>';
    return (
      '<g>' +
      '<path d="' + band + '" fill="none" stroke="' + cup + '" stroke-width="12" stroke-linecap="round"/>' +
      (deform ? '' : '<path d="M150 108 C172 86, 228 86, 250 108" fill="none" stroke="' + pad + '" stroke-width="13" stroke-linecap="round"/>') +
      '<rect x="122" y="168" width="12" height="28" rx="4" fill="#A7AEB6"/>' +
      (deform ? '' : '<rect x="266" y="168" width="12" height="28" rx="4" fill="#A7AEB6"/>') +
      '<ellipse cx="128" cy="212" rx="30" ry="40" fill="' + cup + '"/>' +
      '<ellipse cx="138" cy="212" rx="16" ry="32" fill="' + pad + '"/>' +
      '<ellipse cx="118" cy="196" rx="6" ry="12" fill="#fff" opacity=".10"/>' +
      right +
      (deform ? '<text x="196" y="150" font-size="15" fill="#5b5b5b" font-family="monospace">Ḩ3ǎḋ₱ħ</text>' : '') +
      '</g>'
    );
  }

  function shadow(id, dx, blur, op) {
    return (
      '<filter id="' + id + 'b" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="' + blur + '"/></filter>' +
      '<ellipse cx="' + (200 + dx) + '" cy="256" rx="112" ry="9" fill="#000" opacity="' + op + '" filter="url(#' + id + 'b)"/>'
    );
  }

  var GRAYS = [
    ['#F1F2F4', '#E3E5E9'],
    ['#EFECE7', '#E0DBD3'],
    ['#E9EDF2', '#D8DEE6'],
    ['#F3F4F6', '#D9DCE1']
  ];

  function background(id, bg, v) {
    if (bg === 'raw') {
      // 实拍原图：花床单、纸箱一角、数据线，光线偏黄偏暗，商品歪斜、不居中。
      var dots = '';
      var pts = [[30, 40], [90, 20], [150, 60], [330, 30], [370, 90], [40, 150], [20, 250], [360, 260], [310, 280], [80, 285], [380, 180], [200, 285]];
      for (var i = 0; i < pts.length; i++) {
        var c = i % 3 === 0 ? '#D98F8F' : i % 3 === 1 ? '#8FB0D9' : '#E2C26E';
        dots += '<circle cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="13" fill="' + c + '" opacity=".75"/>' +
          '<circle cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="5" fill="#fff" opacity=".55"/>';
      }
      return (
        '<rect width="400" height="300" fill="#CDBB9F"/>' + dots +
        '<path d="M0 120 Q100 100 200 125 T400 110" stroke="#B9A385" stroke-width="10" fill="none" opacity=".6"/>' +
        '<polygon points="300,0 400,0 400,120 330,96" fill="#B98C55"/><polygon points="300,0 330,96 322,104 290,4" fill="#9C7443"/>' +
        '<path d="M20 70 C60 110, 40 160, 90 180 S120 240, 70 270" stroke="#F4F4F4" stroke-width="4" fill="none"/>'
      );
    }
    if (bg === 'white') {
      return (
        '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".78" stop-color="#FAFBFC"/><stop offset="1" stop-color="#EEF0F3"/></linearGradient>' +
        '<rect width="400" height="300" fill="url(#' + id + 'g)"/>' +
        (v === 2 ? '<rect y="258" width="400" height="42" fill="#F3F5F7"/>' : '')
      );
    }
    if (bg === 'gray') {
      var g = GRAYS[v % 4];
      return (
        '<radialGradient id="' + id + 'g" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="' + g[0] + '"/><stop offset="1" stop-color="' + g[1] + '"/></radialGradient>' +
        '<rect width="400" height="300" fill="url(#' + id + 'g)"/>'
      );
    }
    // 生活场景：4 个变体。背景里不放与商品相关的配件或道具。
    if (v === 0) {
      return (
        '<rect width="400" height="300" fill="#EFE8DE"/><rect y="236" width="400" height="64" fill="#C89B6D"/>' +
        '<path d="M0 252 H400 M0 270 Q200 262 400 274 M0 288 H400" stroke="#B5875A" stroke-width="2" opacity=".6"/>' +
        '<rect x="300" y="20" width="80" height="120" rx="4" fill="#F7F2EA" opacity=".9"/>'
      );
    }
    if (v === 1) {
      var lines = '';
      for (var y = 8; y < 300; y += 12) lines += '<path d="M0 ' + y + ' H400" stroke="#D6CDBE" stroke-width="1" opacity=".55"/>';
      return '<rect width="400" height="300" fill="#E6DFD3"/>' + lines + '<rect y="240" width="400" height="60" fill="#DDD4C6"/>';
    }
    if (v === 2) {
      return (
        '<rect width="400" height="300" fill="#E9E8E5"/>' +
        '<path d="M0 60 C80 90, 140 40, 220 80 S360 60, 400 100" stroke="#CFCDC8" stroke-width="2" fill="none"/>' +
        '<path d="M0 200 C60 180, 160 230, 260 190 S380 210, 400 180" stroke="#D3D1CC" stroke-width="1.5" fill="none"/>' +
        '<rect y="240" width="400" height="60" fill="#DEDCD8"/>'
      );
    }
    return (
      '<rect width="400" height="300" fill="#E5ECEE"/><rect y="234" width="400" height="66" fill="#D9C6A9"/>' +
      '<filter id="' + id + 'p"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<g filter="url(#' + id + 'p)" opacity=".75"><circle cx="38" cy="120" r="26" fill="#86A97F"/><circle cx="62" cy="96" r="22" fill="#9BBC92"/><circle cx="30" cy="80" r="18" fill="#7A9C73"/><rect x="34" y="150" width="34" height="84" rx="6" fill="#C9B79C"/></g>'
    );
  }

  SCA.art = function (o) {
    o = o || {};
    var id = 'art' + n++;
    var bg = o.bg || 'white';
    var v = o.v || 0;
    var vb = o.crop === '1:1' ? '50 0 300 300' : '0 0 400 300';
    var bright = o.bright || 0;
    var style = bright ? ' style="filter:brightness(' + (1 + bright / 100) + ')"' : '';
    var body;
    if (bg === 'raw') {
      body =
        background(id, 'raw', 0) +
        '<g transform="translate(-34 18) rotate(-7 200 170) scale(.86)">' + product(id) + '</g>' +
        '<rect width="400" height="300" fill="#4A2E0C" opacity="' + (o.dark ? '.62' : '.22') + '"/>';
    } else {
      var dx = bg === 'white' && v === 1 ? 26 : 0;
      var scale = bg === 'white' && v === 3 ? 1.12 : 1;
      var t = scale === 1 ? '' : ' transform="translate(200 170) scale(' + scale + ') translate(-200 -170)"';
      var refl = bg === 'white' && v === 2
        ? '<g transform="translate(0 512) scale(1 -1)" opacity=".08">' + product(id) + '</g>'
        : '';
      body = background(id, bg, v) + shadow(id, dx, bg === 'scene' ? 5 : 6, bg === 'scene' ? '.22' : '.16') + refl +
        '<g' + t + '>' + product(id, { deform: o.deform }) + '</g>';
    }
    return '<svg class="art" viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + (o.label || '商品图') + '"' + style + '><defs></defs>' + body + '</svg>';
  };

  SCA.STYLES = [
    { id: 'white', name: '纯白', note: '干净，适合大多数商品' },
    { id: 'gray', name: '浅灰', note: '突出浅色商品的边缘' },
    { id: 'scene', name: '生活场景', note: '桌面、布面等真实环境' }
  ];
})();
