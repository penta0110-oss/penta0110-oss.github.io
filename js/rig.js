/* 예온이 캐릭터 리그 : 3D 얼굴 이미지 + 관절형 몸(옷 갈아입기 / 걷기·뛰기·먹기·기뻐하기) */
var YEON_HEAD = 'assets/yeon-head.webp';
var _yid = 0;
function yeonSVG(eq, o) {
  eq = eq || {}; o = o || {};
  var p = 'y' + (_yid++);
  var dress = eq.dress || '하얀 뽀글이', hair = eq.hair || '', back = eq.back || '', hand = eq.hand || '';
  var SKIN = 'url(#' + p + 'sk)';
  // ---------- 공통 정의 ----------
  var defs = '<defs>' +
    '<linearGradient id="' + p + 'sk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE3D2"/><stop offset=".6" stop-color="#F7C6AA"/><stop offset="1" stop-color="#E3A385"/></linearGradient>' +
    '<linearGradient id="' + p + 'hr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E3E25"/><stop offset=".55" stop-color="#4A2716"/><stop offset="1" stop-color="#7A4528"/></linearGradient>' +
    '<radialGradient id="' + p + 'sh" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#FFFBF2"/><stop offset=".6" stop-color="#F3E6CF"/><stop offset="1" stop-color="#D9C3A0"/></radialGradient>' +
    '<pattern id="' + p + 'bp" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="3" fill="rgba(150,120,80,.13)"/><circle cx="2.6" cy="2.6" r="1.5" fill="rgba(255,255,255,.9)"/></pattern>' +
    '<linearGradient id="' + p + 'kh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A673"/><stop offset="1" stop-color="#9C7A4B"/></linearGradient>' +
    '<linearGradient id="' + p + 'bt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9733F"/><stop offset="1" stop-color="#7A4321"/></linearGradient>' +
    '<radialGradient id="' + p + 'pk" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#FFE0EE"/><stop offset=".55" stop-color="#FF9CC6"/><stop offset="1" stop-color="#E0629A"/></radialGradient>' +
    '<radialGradient id="' + p + 'pu" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#D9CCFF"/><stop offset=".55" stop-color="#9A7BFF"/><stop offset="1" stop-color="#5B3FD6"/></radialGradient>' +
    '<radialGradient id="' + p + 'bk" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#5D5559"/><stop offset=".6" stop-color="#2B2427"/><stop offset="1" stop-color="#141012"/></radialGradient>' +
    '<radialGradient id="' + p + 'wh" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F1EEEE"/><stop offset="1" stop-color="#D5CECE"/></radialGradient>' +
    '<linearGradient id="' + p + 'gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4AE"/><stop offset=".5" stop-color="#FFD23F"/><stop offset="1" stop-color="#E9A100"/></linearGradient>' +
    '<linearGradient id="' + p + 'wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F1FBFF" stop-opacity=".95"/><stop offset=".5" stop-color="#D8C8FF" stop-opacity=".9"/><stop offset="1" stop-color="#FFC6E6" stop-opacity=".9"/></linearGradient>' +
    '<linearGradient id="' + p + 'bm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A8E79A"/><stop offset="1" stop-color="#4AA857"/></linearGradient>' +
    '<linearGradient id="' + p + 'rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF6B6B"/><stop offset="1" stop-color="#C92C3A"/></linearGradient>' +
    '<filter id="' + p + 'ds" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#4b2a3a" flood-opacity=".22"/></filter>' +
    '<linearGradient id="' + p + 'sd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a2030" stop-opacity=".22"/><stop offset=".3" stop-color="#3a2030" stop-opacity="0"/><stop offset=".72" stop-color="#3a2030" stop-opacity="0"/><stop offset="1" stop-color="#3a2030" stop-opacity=".25"/></linearGradient>' +
    '</defs>';

  // ---------- 옷 정의 ----------
  var C = {   // torso fill, sleeve fill, texture, leg(bottom) type
    '하얀 뽀글이': { t: 'url(#' + p + 'sh)', s: 'url(#' + p + 'sh)', tex: true, leg: 'shorts' },
    '공주 드레스': { t: 'url(#' + p + 'pk)', s: 'url(#' + p + 'pk)', tex: false, leg: 'dress' },
    '판다 옷': { t: 'url(#' + p + 'wh)', s: 'url(#' + p + 'bk)', tex: true, leg: 'panda' },
    '마법사 옷': { t: 'url(#' + p + 'pu)', s: 'url(#' + p + 'pu)', tex: false, leg: 'robe' },
    '산타 옷': { t: 'url(#' + p + 'rd)', s: 'url(#' + p + 'rd)', tex: false, leg: 'santa' }
  }[dress] || { t: 'url(#' + p + 'sh)', s: 'url(#' + p + 'sh)', tex: true, leg: 'shorts' };

  // ---------- 다리 ----------
  function leg(side) {
    var x = side < 0 ? 168 : 206, cls = side < 0 ? 'legL' : 'legR';
    var skinLeg = '<rect x="' + (x - 10) + '" y="302" width="20" height="74" rx="10" fill="' + SKIN + '"/>';
    var sock = '<rect x="' + (x - 11) + '" y="360" width="22" height="22" rx="6" fill="#FBFAF7"/>';
    var shoe = '<path d="M' + (x - 14) + ' 378 Q' + (x - 15) + ' 366 ' + (x - 4) + ' 366 L' + (x + 8) + ' 366 Q' + (x + 14) + ' 368 ' + (x + 14) + ' 378 L' + (x + 22) + ' 386 Q' + (x + 24) + ' 396 ' + (x + 14) + ' 397 L' + (x - 14) + ' 397 Q' + (x - 18) + ' 390 ' + (x - 14) + ' 378Z" fill="url(#' + p + 'bt)"/><rect x="' + (x - 15) + '" y="393" width="40" height="6" rx="3" fill="#4B2A16"/><path d="M' + (x - 6) + ' 372 l10 4 M' + (x - 6) + ' 378 l10 -4" stroke="#FFC94A" stroke-width="2.2" stroke-linecap="round"/>';
    if (C.leg === 'panda') { skinLeg = '<rect x="' + (x - 12) + '" y="300" width="24" height="80" rx="12" fill="url(#' + p + 'bk)"/>'; sock = ''; shoe = '<ellipse cx="' + (x + 3) + '" cy="390" rx="18" ry="10" fill="url(#' + p + 'bk)"/><ellipse cx="' + (x + 5) + '" cy="392" rx="8" ry="5" fill="#F7A9BC"/>'; }
    if (C.leg === 'santa') { sock = '<rect x="' + (x - 11) + '" y="356" width="22" height="26" rx="6" fill="#fff"/>'; shoe = '<path d="M' + (x - 13) + ' 376 L' + (x + 12) + ' 376 L' + (x + 22) + ' 388 Q' + (x + 24) + ' 397 ' + (x + 12) + ' 397 L' + (x - 14) + ' 397Z" fill="#2B2427"/>'; }
    return '<g class="' + cls + '">' + skinLeg + '<rect x="' + (x - 11) + '" y="302" width="22" height="78" rx="10" fill="url(#' + p + 'sd)"/>' + sock + shoe + '</g>';
  }
  // ---------- 팔 ----------
  function arm(side) {
    var x = side < 0 ? 142 : 232, cls = side < 0 ? 'armL' : 'armR';
    var sleeve = '<rect x="' + (x - 13) + '" y="208" width="26" height="70" rx="13" fill="' + C.s + '"/>' + (C.tex ? '<rect x="' + (x - 13) + '" y="208" width="26" height="70" rx="13" fill="url(#' + p + 'bp)"/>' : '') + '<rect x="' + (x - 13) + '" y="208" width="26" height="70" rx="13" fill="url(#' + p + 'sd)"/>';
    var cuff = dress === '하얀 뽀글이' ? '<rect x="' + (x - 12) + '" y="266" width="24" height="12" rx="6" fill="#F6EFE2"/><path d="M' + (x - 8) + ' 268v8M' + (x - 3) + ' 268v8M' + (x + 2) + ' 268v8M' + (x + 7) + ' 268v8" stroke="#E2D6C2" stroke-width="1.2"/>' :
      dress === '산타 옷' ? '<rect x="' + (x - 14) + '" y="264" width="28" height="13" rx="6" fill="#fff"/>' :
      dress === '마법사 옷' ? '<path d="M' + (x - 15) + ' 262 L' + (x + 15) + ' 262 L' + (x + 19) + ' 282 L' + (x - 19) + ' 282Z" fill="#7A5BEA"/><path d="M' + (x - 18) + ' 280 L' + (x + 18) + ' 280" stroke="#FFD84A" stroke-width="3"/>' : '';
    var handG = '<circle cx="' + x + '" cy="286" r="11.5" fill="' + SKIN + '"/>';
    if (dress === '판다 옷') handG = '<circle cx="' + x + '" cy="286" r="12" fill="url(#' + p + 'bk)"/><circle cx="' + x + '" cy="289" r="5" fill="#F7A9BC"/>';
    var item = '';
    if (side > 0 && hand === '별 마법봉') item = '<g class="wand"><line x1="' + x + '" y1="292" x2="' + (x + 6) + '" y2="236" stroke="#9B5B2A" stroke-width="5" stroke-linecap="round"/><path d="M' + (x + 7) + ' 212 l6 13 14 1.5 -10.5 9.5 3 14 -12.5 -7.5 -12.5 7.5 3 -14 -10.5 -9.5 14 -1.5z" fill="url(#' + p + 'gd)" stroke="#E0A000" stroke-width="2" stroke-linejoin="round"/><circle class="spark" cx="' + (x + 22) + '" cy="214" r="3" fill="#fff"/></g>';
    if (side > 0 && hand === '대나무 지팡이') item = '<g class="wand"><rect x="' + (x - 4) + '" y="220" width="9" height="84" rx="4.5" fill="url(#' + p + 'bm)"/><path d="M' + (x - 4) + ' 244h9M' + (x - 4) + ' 268h9M' + (x - 4) + ' 290h9" stroke="#3E8E46" stroke-width="2"/><ellipse cx="' + (x + 14) + '" cy="224" rx="13" ry="4.5" transform="rotate(-30 ' + (x + 14) + ' 224)" fill="#4FAE5B"/><ellipse cx="' + (x - 12) + '" cy="230" rx="11" ry="4" transform="rotate(25 ' + (x - 12) + ' 230)" fill="#6BC46A"/></g>';
    var food = side > 0 ? '<g class="food"><rect x="' + (x - 4) + '" y="250" width="8" height="44" rx="4" fill="url(#' + p + 'bm)"/><ellipse cx="' + (x + 9) + '" cy="254" rx="10" ry="3.5" transform="rotate(-35 ' + (x + 9) + ' 254)" fill="#4FAE5B"/></g>' : '';
    return '<g class="' + cls + '">' + sleeve + cuff + item + handG + food + '</g>';
  }
  // ---------- 몸통 ----------
  var torso = '', under = '';
  if (C.leg === 'shorts') under = '<path d="M154 288 L220 288 L226 330 L194 334 L187 312 L180 334 L148 330Z" fill="url(#' + p + 'kh)"/><rect x="152" y="286" width="70" height="8" rx="3" fill="#8F6A3C"/><rect x="181" y="285" width="12" height="10" rx="2" fill="#E3B341"/><path d="M154 288 L220 288 L226 330 L194 334 L187 312 L180 334 L148 330Z" fill="url(#' + p + 'sd)"/>';
  if (C.leg === 'panda') under = '<path d="M150 284 L224 284 L228 322 L192 326 L187 312 L182 326 L146 322Z" fill="url(#' + p + 'wh)"/>';
  var T = 'M148 210 Q187 198 226 210 Q240 218 236 252 Q234 280 230 296 Q187 306 144 296 Q140 280 138 252 Q134 218 148 210Z';
  if (C.leg === 'dress') T = 'M150 214 Q187 200 224 214 L228 262 Q252 312 244 336 Q187 350 130 336 Q122 312 146 262Z';
  if (C.leg === 'robe') T = 'M148 214 Q187 200 226 214 L236 300 Q246 352 240 372 Q187 382 134 372 Q128 352 138 300Z';
  if (C.leg === 'santa') T = 'M148 214 Q187 200 226 214 L230 262 Q246 300 240 322 Q187 334 134 322 Q128 300 144 262Z';
  torso = '<path d="' + T + '" fill="' + C.t + '"/>' + (C.tex ? '<path d="' + T + '" fill="url(#' + p + 'bp)"/>' : '') + '<path d="' + T + '" fill="url(#' + p + 'sd)"/>';
  if (dress === '하얀 뽀글이') torso += '<path d="M187 206 L187 294" stroke="#D8C7A8" stroke-width="2"/><path d="M180 212 L187 222 L194 212" fill="none" stroke="#E9DCC4" stroke-width="3"/><path d="M203 238 l3.6 7.4 8 1 -5.8 5.6 1.4 8 -7.2 -3.8 -7.2 3.8 1.4 -8 -5.8 -5.6 8 -1z" fill="#FFD23F" stroke="#E2A800" stroke-width="1.5" stroke-linejoin="round"/>';
  if (dress === '공주 드레스') torso += '<path d="M132 330 Q146 340 160 332 Q174 342 187 333 Q200 342 214 332 Q228 340 242 330" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M152 262 Q187 272 222 262" stroke="#FFF2A8" stroke-width="5" fill="none"/><circle cx="187" cy="266" r="7" fill="#FFD84A" stroke="#E8A800" stroke-width="2"/><circle cx="150" cy="218" r="15" fill="url(#' + p + 'pk)"/><circle cx="224" cy="218" r="15" fill="url(#' + p + 'pk)"/>';
  if (dress === '판다 옷') torso += '<ellipse cx="174" cy="250" rx="9" ry="12" transform="rotate(-25 174 250)" fill="#2B2427"/><ellipse cx="200" cy="250" rx="9" ry="12" transform="rotate(25 200 250)" fill="#2B2427"/><circle cx="175" cy="250" r="3" fill="#fff"/><circle cx="199" cy="250" r="3" fill="#fff"/><ellipse cx="187" cy="264" rx="5" ry="3.5" fill="#2B2427"/><path d="M181 270 Q187 275 193 270" stroke="#2B2427" stroke-width="2" fill="none"/>';
  if (dress === '마법사 옷') torso += '<g fill="#FFE36B"><path d="M168 300 l3 6.5 7 .8 -5 4.8 1.3 7 -6.3 -3.4 -6.3 3.4 1.3 -7 -5 -4.8 7 -.8z"/><circle cx="210" cy="330" r="3"/><circle cx="200" cy="248" r="2.5"/><circle cx="160" cy="352" r="2.5"/><circle cx="222" cy="290" r="2"/></g><path d="M136 368 Q187 378 238 368" stroke="#FFD84A" stroke-width="4" fill="none"/><path d="M187 210 L187 372" stroke="#7A5BEA" stroke-width="2"/>';
  if (dress === '산타 옷') torso += '<path d="M134 318 Q187 332 240 318 L242 326 Q187 342 132 326Z" fill="#fff"/><rect x="146" y="276" width="82" height="9" fill="#2B2427"/><rect x="180" y="274" width="14" height="13" rx="2" fill="#FFD23F"/><circle cx="187" cy="236" r="3.5" fill="#fff"/><circle cx="187" cy="254" r="3.5" fill="#fff"/>';
  // 목/칼라
  var neck = '<path d="M176 186 L200 186 L202 210 Q188 216 174 210Z" fill="#E9AE8F"/>';
  var collar = dress === '공주 드레스' ? '<path d="M164 208 Q187 226 210 208 L206 218 Q187 232 168 218Z" fill="#fff"/>' :
    dress === '마법사 옷' ? '<path d="M160 206 Q187 222 214 206 L208 220 Q187 232 166 220Z" fill="#FFD84A"/>' :
    dress === '산타 옷' ? '<path d="M158 206 Q187 224 216 206 L214 218 Q187 234 160 218Z" fill="#fff"/>' :
    '<path d="M160 205 Q187 222 214 205 L212 216 Q187 230 162 216Z" fill="#F7F0E2"/>' + (C.tex ? '<path d="M160 205 Q187 222 214 205 L212 216 Q187 230 162 216Z" fill="url(#' + p + 'bp)"/>' : '');
  // ---------- 등 아이템 ----------
  var backG = '';
  if (back === '요정 날개') backG = '<g class="wings"><g class="wingL"><path d="M156 230 Q96 170 88 214 Q84 246 150 250Z" fill="url(#' + p + 'wg)" stroke="#fff" stroke-width="3"/><path d="M152 254 Q100 262 108 290 Q122 302 156 266Z" fill="url(#' + p + 'wg)" stroke="#fff" stroke-width="3"/></g><g class="wingR"><path d="M218 230 Q278 170 286 214 Q290 246 224 250Z" fill="url(#' + p + 'wg)" stroke="#fff" stroke-width="3"/><path d="M222 254 Q274 262 266 290 Q252 302 218 266Z" fill="url(#' + p + 'wg)" stroke="#fff" stroke-width="3"/></g></g>';
  if (back === '별빛 망토') backG = '<g class="cape"><path d="M150 212 Q187 200 224 212 L254 360 Q187 380 120 360Z" fill="url(#' + p + 'pu)"/><g fill="#FFE36B"><circle cx="134" cy="340" r="3"/><circle cx="244" cy="332" r="3"/><circle cx="142" cy="296" r="2.2"/><circle cx="236" cy="290" r="2.2"/><circle cx="187" cy="366" r="2.5"/></g></g>';
  // ---------- 뒷머리(긴 생머리) ----------
  var backHair = '<defs><filter id="' + p + 'hb"><feGaussianBlur stdDeviation="2.2"/></filter>' +
    '<mask id="' + p + 'hmL"><path d="M76 112 Q58 170 64 226 Q70 262 98 280 Q122 288 144 272 Q150 240 152 206 L152 150 Q132 126 110 116Z" fill="#fff" filter="url(#' + p + 'hb)"/></mask>' +
    '<mask id="' + p + 'hmR"><path d="M222 120 Q250 170 248 226 Q244 258 230 270 Q216 252 214 220 L214 150Z" fill="#fff" filter="url(#' + p + 'hb)"/></mask></defs>' +
    '<g mask="url(#' + p + 'hmL)"><image href="' + (o.hairTex || 'assets/hair-tex.webp') + '" x="56" y="104" width="100" height="186" preserveAspectRatio="none"/><rect x="56" y="104" width="100" height="186" fill="url(#' + p + 'hshade)"/></g>' +
    '<g mask="url(#' + p + 'hmR)"><image href="' + (o.hairTex || 'assets/hair-tex.webp') + '" x="210" y="112" width="44" height="166" preserveAspectRatio="none"/><rect x="210" y="112" width="44" height="166" fill="url(#' + p + 'hshade)"/></g>' +
    '<linearGradient id="' + p + 'hshade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>';
  // ---------- 머리 위 아이템 ----------
  var hat = '';
  if (hair === '판다 귀 머리띠') hat = '<path d="M84 58 Q146 2 222 52" fill="none" stroke="#2B2427" stroke-width="6" stroke-linecap="round"/><circle cx="96" cy="38" r="20" fill="url(#' + p + 'bk)"/><circle cx="204" cy="34" r="20" fill="url(#' + p + 'bk)"/><circle cx="98" cy="40" r="9" fill="#F7A9BC"/><circle cx="202" cy="36" r="9" fill="#F7A9BC"/>';
  if (hair === '커다란 리본') hat = '<g transform="translate(214 40) rotate(20)"><path d="M0 0 L-30 -19 Q-37 0 -30 19Z M0 0 L30 -19 Q37 0 30 19Z" fill="url(#' + p + 'pk)" stroke="#D9558E" stroke-width="2.5" stroke-linejoin="round"/><circle r="8" fill="#E2558C"/></g>';
  if (hair === '꽃 화관') hat = [[92, 62, '#FF9DC0'], [110, 40, '#FFE066'], [134, 28, '#9DE0FF'], [160, 24, '#FF9DC0'], [186, 28, '#FFE066'], [208, 40, '#C3A8FF'], [224, 58, '#FF9DC0']].map(function (f) { return '<g transform="translate(' + f[0] + ' ' + f[1] + ')"><circle cy="-6" r="6" fill="' + f[2] + '"/><circle cx="6" r="6" fill="' + f[2] + '"/><circle cy="6" r="6" fill="' + f[2] + '"/><circle cx="-6" r="6" fill="' + f[2] + '"/><circle r="4" fill="#FFB020"/></g>'; }).join('') + '<path d="M100 52 Q160 14 220 52" stroke="#5DBB63" stroke-width="3" fill="none"/>';
  if (hair === '반짝 왕관') hat = '<g class="crown"><path d="M124 40 L128 2 L146 22 L160 -6 L174 22 L192 2 L196 40Z" fill="url(#' + p + 'gd)" stroke="#D99A00" stroke-width="3" stroke-linejoin="round"/><circle cx="160" cy="28" r="6" fill="#FF6FA5"/><circle cx="140" cy="32" r="4" fill="#5EC8FF"/><circle cx="180" cy="32" r="4" fill="#5EC8FF"/></g>';
  if (hair === '산타 모자') hat = '<path d="M96 54 Q120 -6 196 6 Q232 12 246 44 L236 54 Q214 26 196 24 Q150 18 120 60Z" fill="url(#' + p + 'rd)"/><rect x="88" y="44" width="124" height="20" rx="10" fill="#fff" transform="rotate(-8 150 54)"/><circle cx="244" cy="48" r="11" fill="#fff"/>';
  if (hair === '판다 모자') hat = '<path d="M86 70 Q90 8 158 4 Q226 8 230 70 Q160 52 86 70Z" fill="url(#' + p + 'wh)"/><circle cx="96" cy="26" r="17" fill="url(#' + p + 'bk)"/><circle cx="220" cy="26" r="17" fill="url(#' + p + 'bk)"/><path d="M86 70 Q160 50 230 70" stroke="#F2C94C" stroke-width="7" fill="none" stroke-linecap="round"/>';

  var face = '<image href="' + (o.head || YEON_HEAD) + '" x="50" y="6" width="210" height="206" preserveAspectRatio="xMidYMid meet"/>';
  var mood = o.mood || 'idle';
  return '<svg class="yeon ' + mood + '" viewBox="0 0 300 410" xmlns="http://www.w3.org/2000/svg" aria-label="예온이">' + defs +
    '<ellipse class="shadow" cx="190" cy="400" rx="66" ry="8" fill="rgba(70,40,60,.18)"/>' +
    '<g class="bodyAll" filter="url(#' + p + 'ds)">' +
    backG + backHair +
    leg(-1) + leg(1) + under +
    arm(-1) +
    '<g class="torso">' + torso + '</g>' + neck + collar +
    '<g class="head">' + face + hat + '<g class="emo"><text class="e-heart" x="232" y="64" font-size="26">💗</text><text class="e-sweat" x="236" y="80" font-size="22">💦</text><text class="e-note" x="236" y="60" font-size="24">🎵</text></g></g>' +
    arm(1) +
    '</g></svg>';
}
