'use strict';
/* =========================================================
   예온이의 구구단 모험 V6
   - 기존 V5 저장 키(yeon_magicland_v1) 그대로 사용 + 자동 변환
   - 광고·결제·외부 전송 없음 (모든 기록은 이 기기 localStorage)
   ========================================================= */
const KEY = 'yeon_magicland_v1';
const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dkey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => dkey(new Date());

const VN = ['대나무 숲', '연못 마을', '구름 섬', '무지개 언덕', '사탕 계곡', '반딧불 동굴', '눈꽃 산', '별빛 성'];
const VA = ['🐰', '🦆', '🦄', '🦊', '🐿️', '🐉', '🐧', '🦁'];
const VAN = ['토끼', '오리', '유니콘', '여우', '다람쥐', '아기 용', '펭귄', '사자'];
const VS = ['🎋', '🪷', '☁️', '🌈', '🍬', '✨', '❄️', '🏰'];
const VC = ['#4FB866', '#3BA8E0', '#7E9CFF', '#FF9F45', '#FF6FAE', '#8B6BFF', '#47B9D6', '#E0A100'];
const VBG = ['#E3F8E3', '#E1F3FF', '#E8EEFF', '#FFF0E0', '#FFE6F2', '#EEE8FF', '#E1F6FB', '#FFF6D6'];
const THEMES = ['forest', 'pond', 'cloud', 'rainbow', 'candy', 'firefly', 'snow', 'castle'];
const MASTER = 15;
const STAGE_AT = [0, 20, 60, 120];
const STAGE_N = ['아기', '꼬마', '어린이', '어른'];

/* 상점: [종류, 이름, 아이콘, 가격, 이벤트] — V5 이름 그대로 유지(구매 기록 호환) */
const SHOP = [
  ['dress', '하얀 뽀글이', '🤍', 0], ['dress', '공주 드레스', '👗', 80], ['dress', '판다 옷', '🐼', 120], ['dress', '마법사 옷', '🧙', 150], ['dress', '산타 옷', '🎅', 0, 'winter'],
  ['hair', '판다 귀 머리띠', '🐻', 50], ['hair', '커다란 리본', '🎀', 40], ['hair', '꽃 화관', '🌸', 60], ['hair', '판다 모자', '👒', 90], ['hair', '반짝 왕관', '👑', 200], ['hair', '산타 모자', '🎄', 0, 'winter'],
  ['back', '별빛 망토', '🦸', 100], ['back', '요정 날개', '🧚', 120],
  ['hand', '대나무 지팡이', '🎋', 40], ['hand', '별 마법봉', '🪄', 60],
  ['garden', '꽃밭', '🌷', 40], ['garden', '대나무 숲', '🎍', 50], ['garden', '별빛 등불', '🏮', 60], ['garden', '분수', '⛲', 90], ['garden', '회전목마', '🎠', 110], ['garden', '무지개', '🌈', 120], ['garden', '판다 집', '🏡', 150]
];
const DECO_POS = { '꽃밭': [[10, 84, 8], [30, 92, 7], [86, 88, 8]], '대나무 숲': [[6, 55, 13], [94, 52, 12]], '별빛 등불': [[22, 44, 8]], '분수': [[14, 70, 12]], '회전목마': [[84, 66, 12]], '판다 집': [[78, 38, 14]], '무지개': [[50, 14, 16]] };

/* ---------------- 상태 / 이전 데이터 변환 ---------------- */
function defaults() {
  return { v: 6, child: '예온이', panda: '뭉치', bamboo: 3, stars: 0, apple: 1, honey: 0, growth: 0, lastFeed: Date.now(), villages: [0, 0, 0, 0, 0, 0, 0, 0], stats: {},
    owned: ['하얀 뽀글이'], equipped: { dress: '하얀 뽀글이' }, daily: {}, days: [], studySecs: {}, best: 0, sound: true, limit: 10, story: false, claimedDays: [], sibling: false, castle: false,
    firstClear: [false, false, false, false, false, false, false, false], att: { last: '', count: 0 }, stickers: [], feeds: 0, pets: 0, golden: 0, mg: { date: '', tickets: 1, best: 0, plays: 0 }, visitor: '', winterGift: '' };
}
const num = (v, d = 0) => (typeof v === 'number' && isFinite(v) && v >= 0) ? Math.floor(v) : d;
function migrate(raw) {
  const s = defaults();
  if (!raw || typeof raw !== 'object') return s;
  for (const k of ['child', 'panda']) if (typeof raw[k] === 'string' && raw[k].trim()) s[k] = raw[k].slice(0, 15);
  for (const k of ['bamboo', 'stars', 'apple', 'honey', 'growth', 'best', 'feeds', 'pets', 'golden']) if (k in raw) s[k] = num(raw[k], s[k]);
  if (typeof raw.lastFeed === 'number') s.lastFeed = raw.lastFeed;
  // 마을 진행: 배열/객체 모두 지원
  let vil = raw.villages;
  if (vil && !Array.isArray(vil) && typeof vil === 'object') vil = [2, 3, 4, 5, 6, 7, 8, 9].map(n => vil[n] ?? vil[n - 2] ?? 0);
  if (Array.isArray(vil)) s.villages = Array.from({ length: 8 }, (_, i) => num(vil[i], 0));
  // 문제 통계: {right,wrong} (V5) / {ok,ng} (이전 판) 모두 지원
  if (raw.stats && typeof raw.stats === 'object') for (const [k, v] of Object.entries(raw.stats)) {
    if (!/^\d+x\d+$/.test(k) || !v) continue;
    s.stats[k] = { right: num(v.right ?? v.ok, 0), wrong: num(v.wrong ?? v.ng, 0) };
  }
  const names = new Set(SHOP.map(x => x[1]));
  if (Array.isArray(raw.owned)) s.owned = [...new Set(['하얀 뽀글이', ...raw.owned.filter(n => names.has(n))])];
  if (raw.equipped && typeof raw.equipped === 'object') for (const t of ['dress', 'hair', 'back', 'hand']) {
    const n = raw.equipped[t]; const it = SHOP.find(x => x[1] === n);
    if (it && it[0] === t && s.owned.includes(n)) s.equipped[t] = n;
  }
  if (!s.equipped.dress) s.equipped.dress = '하얀 뽀글이';
  for (const k of ['daily', 'studySecs']) if (raw[k] && typeof raw[k] === 'object' && !Array.isArray(raw[k])) s[k] = raw[k];
  for (const k of ['days', 'claimedDays', 'stickers']) if (Array.isArray(raw[k])) s[k] = raw[k].filter(x => typeof x === 'string');
  for (const k of ['sound', 'story', 'sibling', 'castle']) if (typeof raw[k] === 'boolean') s[k] = raw[k];
  if ([0, 5, 10, 15, 20].includes(raw.limit)) s.limit = raw.limit;
  // 이미 구출한 마을은 특별 연출을 본 것으로 처리(다시 나오지 않게)
  s.firstClear = Array.isArray(raw.firstClear) ? Array.from({ length: 8 }, (_, i) => !!raw.firstClear[i]) : s.villages.map(v => v >= MASTER);
  if (raw.att && typeof raw.att === 'object') s.att = { last: String(raw.att.last || ''), count: num(raw.att.count, 0) };
  if (raw.mg && typeof raw.mg === 'object') s.mg = { date: String(raw.mg.date || ''), tickets: Math.min(5, num(raw.mg.tickets, 1)), best: num(raw.mg.best, 0), plays: num(raw.mg.plays, 0) };
  if (typeof raw.visitor === 'string') s.visitor = raw.visitor;
  if (typeof raw.winterGift === 'string') s.winterGift = raw.winterGift;
  return s;
}
function legacyImport() { // 이전 '판다 매직랜드' 버전 데이터가 있으면 가져오기
  try {
    const o = JSON.parse(localStorage.getItem('panda_magicland_v1') || 'null'); if (!o) return null;
    const map = { fleece: '하얀 뽀글이', pinkdress: '공주 드레스', pandahood: '판다 옷', starrobe: '마법사 옷', pandaears: '판다 귀 머리띠', ribbon: '커다란 리본', flower: '꽃 화관', crown: '반짝 왕관', wand: '별 마법봉', bamboowand: '대나무 지팡이', wings: '요정 날개', cape: '별빛 망토' };
    return { child: o.name, panda: o.pandaName, bamboo: o.bamboo, stars: o.star, growth: o.xp, best: o.best, apple: o.snacks && o.snacks.apple, honey: o.snacks && o.snacks.honey,
      villages: [2, 3, 4, 5, 6, 7, 8, 9].map(d => o.regions && o.regions[d] ? o.regions[d].c : 0), stats: o.stats, owned: (o.owned || []).map(x => map[x]).filter(Boolean), days: o.days, limit: o.limitMin, sound: o.sound, story: o.intro };
  } catch (e) { return null; }
}
let state;
try { const raw = localStorage.getItem(KEY); state = migrate(raw ? JSON.parse(raw) : legacyImport()); } catch (e) { state = defaults(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } }
save();

/* ---------------- 이벤트/날짜 ---------------- */
function isWinter() { const d = new Date(), m = d.getMonth() + 1, day = d.getDate(); return m === 12 || (m === 1 && day <= 15); }
function isWeekend() { const w = new Date().getDay(); return w === 0 || w === 6; }
function itemAvailable(it) { return !it[4] || (it[4] === 'winter' && isWinter()) || state.owned.includes(it[1]); }
function dailyCount() { return state.daily[today()] || 0; }
function streak() {
  let d = new Date(), c = 0;
  if (!state.days.includes(dkey(d))) d.setDate(d.getDate() - 1);
  while (state.days.includes(dkey(d))) { c++; d.setDate(d.getDate() - 1); }
  return c;
}
function stage() { return state.growth >= 120 ? 3 : state.growth >= 60 ? 2 : state.growth >= 20 ? 1 : 0; }
function hungry() { return Date.now() - state.lastFeed > 6 * 3600e3; }
function unlocked(i) { return i === 0 || state.villages[i - 1] >= MASTER; }

/* ---------------- 학습 시간 ---------------- */
let sessStart = null, sessDay = null;
const spent = () => (state.studySecs[today()] || 0) + (sessStart && sessDay === today() ? Math.floor((Date.now() - sessStart) / 1000) : 0);
const timeUp = () => state.limit !== 0 && spent() >= state.limit * 60;
function trackStart() { if (!sessStart) { sessStart = Date.now(); sessDay = today(); } }
function trackStop() { if (sessStart) { state.studySecs[sessDay] = (state.studySecs[sessDay] || 0) + Math.floor((Date.now() - sessStart) / 1000); sessStart = null; save(); } }

/* ---------------- 효과음 (하나의 AudioContext 재사용) ---------------- */
const SND = {
  ctx: null, out: null, noise: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => { }); return true; }
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
      this.ctx = new C(); this.out = this.ctx.createGain(); this.out.gain.value = .55; this.out.connect(this.ctx.destination);
      const b = this.ctx.createBuffer(1, this.ctx.sampleRate * .6, this.ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noise = b; return true;
    } catch (e) { return false; }
  },
  tone(f, at, dur, type = 'sine', vol = .18, to) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + dur + .03);
  },
  hiss(at, dur, freq = 2500, q = 1.2, vol = .25, to) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + at;
    s.buffer = this.noise; f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur); f.Q.value = q;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.out); s.start(t); s.stop(t + dur + .02);
  },
  notes(list, type = 'triangle', vol = .16, gap = .11, dur = .22) { list.forEach((f, i) => f && this.tone(f, i * gap, dur, type, vol)); },
  play(n, x) {
    if (!state.sound || !this.init()) return;
    try {
      switch (n) {
        case 'tap': this.tone(880, 0, .06, 'sine', .07); break;
        case 'correct': this.notes([784, 988, 1319], 'triangle', .15, .07, .18); this.tone(2637, .2, .25, 'sine', .05); break;
        case 'golden': this.notes([1047, 1319, 1568, 2093, 2637], 'sine', .13, .07, .5); this.hiss(0, .5, 6000, 2, .05); break;
        case 'wrong': this.tone(392, 0, .22, 'sine', .14, 262); this.tone(330, .16, .3, 'sine', .12, 220); break;
        case 'combo': this.tone(600 + Math.min(12, x || 1) * 70, 0, .12, 'square', .06); break;
        case 'coin': this.tone(988, 0, .08, 'square', .07); this.tone(1319, .07, .28, 'square', .07); break;
        case 'buy': this.notes([659, 880, 1319], 'square', .06, .07, .16); this.hiss(.2, .3, 7000, 3, .05); break;
        case 'chest': this.hiss(0, .45, 800, 1, .12, 5000); this.notes([0, 0, 0, 523, 659, 784, 1047, 1319], 'triangle', .14, .07, .3); break;
        case 'eat': [0, .2, .4, .62].forEach((t, i) => { this.hiss(t, .09, 1800 + i * 300, 2.5, .3); this.tone(180 + i * 15, t, .07, 'square', .04); }); this.tone(500, .8, .18, 'sine', .08, 760); break;
        case 'whoosh': this.hiss(0, .5, 400, .8, .12, 3000); break;
        case 'pet': this.tone(620, 0, .12, 'sine', .1, 940); this.tone(940, .12, .14, 'sine', .07, 1240); break;
        case 'grow1': this.tone(196, 0, 1.5, 'sawtooth', .04, 784); this.hiss(0, 1.5, 300, .7, .08, 4000); break;
        case 'grow2': this.notes([523, 659, 784, 1047, 0, 784, 1047], 'triangle', .17, .12, .35); this.notes([262, 330, 392, 523], 'sine', .1, .24, .5); break;
        case 'clear': { const k = [1, 1.122, 1.26, .89, 1.335, .794, 1.189, 1.498][x || 0]; this.notes([523, 659, 784, 659, 784, 1047, 1319, 1568].map(f => f * k), 'triangle', .14, .13, .3); this.notes([262, 0, 392, 0, 523].map(f => f * k), 'sine', .08, .26, .5); break; }
        case 'stamp': this.tone(140, 0, .16, 'sine', .3, 70); this.hiss(0, .12, 900, 1, .15); this.notes([0, 0, 1047, 1319], 'triangle', .1, .08, .2); break;
        case 'count': this.tone(660, 0, .14, 'square', .07); break;
        case 'go': this.tone(990, 0, .35, 'square', .08); this.tone(1320, .05, .3, 'triangle', .06); break;
        case 'timeup': this.tone(1046, 0, .2, 'triangle', .12); this.tone(784, .2, .2, 'triangle', .12); this.tone(523, .4, .45, 'triangle', .12); break;
        case 'catch': this.tone(700, 0, .1, 'sine', .12, 1300); break;
        case 'bee': this.tone(220, 0, .3, 'sawtooth', .05, 180); break;
        case 'sticker': this.notes([1319, 1760, 2093], 'sine', .1, .09, .3); break;
        case 'reward': this.notes([784, 1047, 1319, 1568], 'triangle', .13, .08, .26); break;
      }
    } catch (e) { }
  }
};
['pointerdown', 'touchstart', 'keydown'].forEach(ev => document.addEventListener(ev, () => SND.init(), { passive: true }));

/* ---------------- 공통 UI ---------------- */
let page = 'home', pageTimers = [];
const later = (fn, ms) => { const t = setTimeout(fn, ms); pageTimers.push(t); return t; };
const every = (fn, ms) => { const t = setInterval(fn, ms); pageTimers.push(t); return t; };
function clearPageTimers() { pageTimers.forEach(t => { clearTimeout(t); clearInterval(t); }); pageTimers = []; }
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1900); }
function confetti(n = 40) { const cols = ['#FF7EB3', '#FFD23F', '#3DD598', '#5CC8FF', '#9C7BFF', '#FF9F45']; for (let i = 0; i < n; i++) { const d = document.createElement('div'); d.className = 'cf'; d.style.left = rnd(0, 100) + 'vw'; d.style.background = pick(cols); const t = rnd(1.4, 2.8); d.style.animationDuration = t + 's'; d.style.animationDelay = rnd(0, .3) + 's'; document.body.appendChild(d); setTimeout(() => d.remove(), (t + .5) * 1000); } }
function burstAt(el, emo = '✨', n = 8) { if (!el) return; const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; for (let i = 0; i < n; i++) { const s = document.createElement('div'); s.className = 'burst'; s.textContent = Array.isArray(emo) ? pick(emo) : emo; const a = i / n * Math.PI * 2; s.style.left = cx - 10 + 'px'; s.style.top = cy - 10 + 'px'; s.style.setProperty('--dx', Math.cos(a) * rnd(50, 90) + 'px'); s.style.setProperty('--dy', Math.sin(a) * rnd(50, 90) + 'px'); document.body.appendChild(s); setTimeout(() => s.remove(), 800); } }
function fxAt(el, txt) { if (!el) return; const r = el.getBoundingClientRect(); const f = document.createElement('div'); f.className = 'fx'; f.textContent = txt; f.style.left = (r.left + r.width / 2 - 20) + 'px'; f.style.top = (r.top + r.height * .25) + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 1000); }
function flyTo(fromEl, toEl, emo, cb) {
  if (!fromEl || !toEl) { cb && cb(); return; }
  const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect(), f = document.createElement('div');
  f.className = 'flyFood'; f.textContent = emo; f.style.left = (a.left + a.width / 2 - 20) + 'px'; f.style.top = (a.top + a.height / 2 - 20) + 'px'; document.body.appendChild(f);
  requestAnimationFrame(() => requestAnimationFrame(() => { f.style.left = (b.left + b.width / 2 - 20) + 'px'; f.style.top = (b.top + b.height * .3) + 'px'; f.style.transform = 'scale(.7) rotate(200deg)'; }));
  setTimeout(() => { f.remove(); cb && cb(); }, 720);
}
function updCoins(which) { const b = $('cB'), s = $('cS'); if (b) b.textContent = '🎋 ' + state.bamboo; if (s) s.textContent = '⭐ ' + state.stars; const el = which === 'b' ? b : which === 's' ? s : null; if (el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } }
function topBar(title, back = 'home') { return `<header class="top"><button class="ic" onclick="go('${back}')" aria-label="뒤로">${back === 'home' ? '🏠' : '⬅️'}</button><div class="ttl">${title}</div><span class="coin" id="cB">🎋 ${state.bamboo}</span><span class="coin st" id="cS">⭐ ${state.stars}</span></header>`; }
function showModal(html, cls = '') { closeModal(); const w = document.createElement('div'); w.className = 'modalW'; w.id = 'modalW'; w.innerHTML = `<div class="modal ${cls}">${html}</div>`; document.body.appendChild(w); }
function closeModal() { const m = $('modalW'); if (m) m.remove(); }
function yeon(mood, eq) { return yeonSVG(eq || state.equipped, { mood: mood || 'idle' }); }
function setYeonMood(holder, mood, ms) { const svg = holder && holder.querySelector('svg.yeon'); if (!svg) return; const base = svg.dataset.base || svg.getAttribute('class').split(' ')[1] || 'idle'; svg.dataset.base = base; svg.setAttribute('class', 'yeon ' + mood); clearTimeout(svg._t); if (ms) svg._t = setTimeout(() => svg.setAttribute('class', 'yeon ' + svg.dataset.base), ms); }
function pandaImg(s) { return `assets/panda-${s}.webp`; }

/* ---------------- 스티커(도감) ---------------- */
const STICKERS = [
  ['first', '✏️', '첫 정답', () => Object.values(state.stats).some(v => v.right > 0)],
  ...VA.map((a, i) => ['v' + (i + 2), a, `${i + 2}단 구출`, () => state.villages[i] >= MASTER]),
  ['castle', '🏰', '별빛 성 완성', () => state.castle],
  ['streak3', '🔥', '3일 연속', () => streak() >= 3], ['streak7', '🌈', '7일 연속', () => streak() >= 7],
  ['feed10', '🎋', '먹이 10번', () => state.feeds >= 10], ['feed50', '🍱', '먹이 50번', () => state.feeds >= 50],
  ['stage1', '🐼', '꼬마 판다', () => stage() >= 1], ['stage2', '🎍', '어린이 판다', () => stage() >= 2], ['stage3', '💐', '어른 판다', () => stage() >= 3],
  ['golden', '🌟', '황금 문제', () => state.golden >= 1], ['ch10', '⚡', '챌린지 10개', () => state.best >= 10], ['ch20', '🏆', '챌린지 20개', () => state.best >= 20],
  ['mg', '🧺', '대나무 받기', () => state.mg.plays >= 1], ['mg30', '🥇', '30개 받기', () => state.mg.best >= 30],
  ['att7', '🐾', '출석 7번', () => state.att.count >= 7], ['shop', '🛍️', '첫 쇼핑', () => state.owned.length >= 2],
  ['dress4', '👗', '옷 4벌', () => SHOP.filter(x => x[0] === 'dress' && state.owned.includes(x[1])).length >= 4],
  ['garden5', '🏡', '정원 장식 5개', () => SHOP.filter(x => x[0] === 'garden' && state.owned.includes(x[1])).length >= 5],
  ['pet20', '💗', '쓰담쓰담 20번', () => state.pets >= 20], ['sibling', '👶', '아기 판다 동생', () => state.sibling]
];
function checkStickers() {
  const got = [];
  for (const [id, e, n, f] of STICKERS) { if (!state.stickers.includes(id)) { let ok = false; try { ok = f(); } catch (_) { } if (ok) { state.stickers.push(id); got.push(e + ' ' + n); } } }
  if (got.length) { save(); setTimeout(() => { SND.play('sticker'); toast('새 스티커! ' + got[0]); }, 500); }
}

/* ---------------- 라우팅 ---------------- */
function go(p) { SND.play('tap'); if (p !== 'quiz' && p !== 'challenge') trackStop(); if (page === 'challenge' && p !== 'challenge') stopChallenge(); if (page === 'minigame' && p !== 'minigame') stopMinigame(); page = p; closeModal(); render(); }
function render() {
  clearPageTimers();
  const P = { home, map, village: villagePage, quiz: quizPage, chest: chestPage, result: resultPage, garden, shop: shopPage, challenge: challengePage, minigame: minigamePage, stickers: stickerPage, parent: parentPage, limit: limitPage }[page] || home;
  P(); window.scrollTo(0, 0);
}

/* =================== 홈 =================== */
function home() {
  const done = state.villages.filter(v => v >= MASTER).length, dc = dailyCount();
  const banners = [];
  if (state.att.last !== today()) banners.push(`<button class="banner blink" onclick="openAttendance()"><span class="e">🐾</span><div><b>오늘의 출석 도장 찍기!</b><div class="sub" style="text-align:left">${(state.att.count % 7) + 1}일째 선물이 기다려요</div></div></button>`);
  if (isWeekend()) banners.push(`<div class="banner"><span class="e">🌟</span><div><b>주말 반짝 이벤트</b><div class="sub" style="text-align:left">구구단 정답 별빛이 2배!</div></div></div>`);
  if (isWinter()) banners.push(`<button class="banner" onclick="go('shop')"><span class="e">🎄</span><div><b>겨울 이벤트</b><div class="sub" style="text-align:left">산타 옷·산타 모자를 무료로 받아요</div></div></button>`);
  if (state.mg.tickets > 0) banners.push(`<button class="banner" onclick="openMinigame()"><span class="e">🧺</span><div><b>대나무 받기 놀이권 ${state.mg.tickets}장</b><div class="sub" style="text-align:left">떨어지는 대나무를 판다로 받아요</div></div></button>`);
  $('app').innerHTML = topBar(`✨ ${esc(state.child)}의 구구단 모험`, 'home') + `
  <div class="stage" id="hstage"><div class="ground"></div>
    <div class="bubble" id="hbub">${homeLine()}</div>
    ${isWinter() ? snowHTML(18) : ''}
    ${state.villages.map((v, i) => v >= MASTER ? `<div class="friendE" style="left:${8 + i * 11}%;animation-delay:-${i * .3}s">${VA[i]}</div>` : '').join('')}
    <div class="actor yeonA" id="hyeon" style="left:30%"><div class="fl">${yeon('idle')}</div></div>
    <div class="pandaW s${stage()} ${hungry() ? 'sleep' : 'idle'}" id="hpanda" style="left:68%"><div class="flipper"><img class="pi" src="${pandaImg(stage())}" alt="${esc(state.panda)}"></div>${hungry() ? '<span class="zz">Z</span>' : ''}</div>
    ${state.visitor !== today() ? `<div class="visitor" id="visitor" onclick="getVisitor()">${pick(state.villages.some(v => v >= MASTER) ? VA.filter((_, i) => state.villages[i] >= MASTER) : ['🐰', '🐿️'])}</div>` : ''}
  </div>
  ${banners.length ? `<div class="banners">${banners.slice(0, 2).join('')}</div>` : ''}
  <div class="card"><div class="row"><b class="grow">🎁 오늘의 미션 · 정답 10개</b><b>${Math.min(10, dc)}/10</b></div><div class="bar" style="margin-top:6px"><i style="width:${Math.min(100, dc * 10)}%"></i></div>
    ${dc >= 10 && !state.claimedDays.includes(today()) ? '<button class="btn pink sm" style="margin-top:8px;width:100%" onclick="dailyGift()">🎁 미션 선물 고르기</button>' : ''}
    <div class="sub" style="text-align:left;margin-top:6px">구출한 친구 ${done}/8 · 🔥 연속 ${streak()}일 · ⏰ 오늘 ${Math.floor(spent() / 60)}분${state.limit ? ' / ' + state.limit + '분' : ''}</div></div>
  <nav class="grid2">
    <button class="btn pink" onclick="go('map')"><span class="em">🗺️</span>구구단 모험<small>친구를 구해요</small></button>
    <button class="btn green" onclick="go('garden')"><span class="em">🐼</span>판다 돌보기<small>${hungry() ? '배고파해요!' : STAGE_N[stage()] + ' 판다'}</small></button>
    <button class="btn purple" onclick="go('shop')"><span class="em">🎀</span>꾸미기 상점<small>옷이 바뀌어요</small></button>
    <button class="btn blue" onclick="openChallenge()"><span class="em">⏱️</span>마법 챌린지<small>최고 ${state.best}개</small></button>
    <button class="btn" onclick="openMinigame()"><span class="em">🧺</span>대나무 받기<small>놀이권 ${state.mg.tickets}장</small></button>
    <button class="btn white" onclick="go('stickers')"><span class="em">📒</span>스티커 도감<small>${state.stickers.length}/${STICKERS.length}</small></button>
  </nav>
  <button class="btn white sm" style="align-self:center" onclick="parentGate()">🔐 부모님 화면</button>
  <div class="foot">기록은 이 기기에만 저장돼요 · 광고·결제 없음</div>`;
  initStage('hstage', 'hyeon', 'hpanda');
  if (!state.story) storyIntro();
  checkStickers();
}
function homeLine() {
  if (timeUp()) return `오늘 공부 끝! ${esc(state.panda)}랑 놀자 🐼`;
  if (hungry()) return state.bamboo ? `${esc(state.panda)} 배고파요! 🎋` : '구구단으로 대나무를 모아 줘!';
  return pick([`${esc(state.child)}, 오늘도 마법 공부 하자!`, '대나무 맛있었어! 💚', '다음 마을엔 누가 있을까?', '우리 같이 놀자! 🎵']);
}
function snowHTML(n) { let h = '<div class="snow">'; for (let i = 0; i < n; i++) h += `<i style="left:${rnd(0, 100)}%;font-size:${rnd(8, 16)}px;animation-duration:${rnd(5, 10)}s;animation-delay:-${rnd(0, 10)}s">❄</i>`; return h + '</div>'; }

/* 무대 위 캐릭터가 스스로 걷고, 누르면 반응 */
function initStage(stageId, yeonId, pandaId) {
  const yEl = $(yeonId), pEl = $(pandaId);
  if (yEl) {
    wander(yEl, 14, 52, (moving, left) => { const f = yEl.querySelector('.fl'); if (f) f.classList.toggle('flip', left); setYeonMood(yEl, moving ? 'walk' : 'idle'); });
    yEl.onclick = () => { if (yEl.dataset.busy) return; yEl.dataset.busy = 1; SND.play('pet'); setYeonMood(yEl, pick(['cheer', 'dance']), 1600); setTimeout(() => delete yEl.dataset.busy, 1600); burstAt(yEl, ['💗', '✨', '⭐'], 6); };
  }
  if (pEl && !pEl.classList.contains('sleep')) {
    wander(pEl, 52, 86, (moving, left) => { pEl.querySelector('.flipper').classList.toggle('left', left); pEl.classList.remove('idle', 'walk'); pEl.classList.add(moving ? 'walk' : 'idle'); });
  }
  if (pEl) pEl.onclick = () => petPanda(pEl);
}
function wander(el, min, max, onMove) {
  let x = parseFloat(el.style.left) || 50;
  const step = () => {
    if (!el.isConnected) return;
    if (el.dataset.busy) { later(step, 1500); return; }
    const nx = Math.max(min, Math.min(max, x + (Math.random() < .5 ? -1 : 1) * rnd(8, 26)));
    const dur = Math.abs(nx - x) * .085 + .4;
    el.style.transitionDuration = dur + 's'; onMove(true, nx < x); el.style.left = nx + '%'; x = nx;
    later(() => { onMove(false, null); later(step, rnd(1600, 4200)); }, dur * 1000);
  };
  later(step, rnd(600, 2000));
}
function petPanda(pEl) {
  state.pets++; save(); SND.play('pet'); burstAt(pEl, ['💗', '💕', '💖'], 6);
  if (pEl.classList.contains('sleep')) { const b = $('hbub') || $('gbub'); if (b) b.textContent = '쿨… 배고파서 졸려요 🥺'; return; }
  pEl.dataset.busy = 1; pEl.classList.remove('idle', 'walk'); void pEl.offsetWidth; pEl.classList.add('happy');
  const b = $('hbub') || $('gbub'); if (b) b.textContent = pick(['헤헤 간지러워!', '쓰담쓰담 좋아 💗', `${esc(state.child)} 최고!`]);
  later(() => { pEl.classList.remove('happy'); pEl.classList.add('idle'); delete pEl.dataset.busy; }, 1100);
  checkStickers();
}
function getVisitor() {
  const v = $('visitor'); if (!v || state.visitor === today()) return;
  state.visitor = today(); const g = pick([['stars', 15, '⭐ 별빛 15'], ['bamboo', 2, '🎋 대나무 2'], ['apple', 1, '🍎 사과 1']]); state[g[0]] += g[1]; save();
  SND.play('reward'); burstAt(v, ['🎁', '✨'], 8); v.remove(); toast('깜짝 손님 선물! ' + g[2]); updCoins(g[0] === 'stars' ? 's' : 'b');
}
function storyIntro() {
  showModal(`<div style="width:46%;margin:0 auto">${yeon('cheer')}</div><div class="h2">판다 매직랜드</div>
  <div class="sub" style="font-size:16px">별빛이 사라져 대나무가 시들고, 판다 ${esc(state.panda)}가 배고파해요.<br>마을마다 동물 친구들이 갇혀 있어요!<br><br>${esc(state.child)}는 구구단 주문을 쓰는 꼬마 마법사!<br>주문을 맞혀 대나무를 모으고 친구들을 구해 주세요.</div>
  <button class="btn pink" onclick="state.story=true;save();closeModal();SND.play('reward');confetti(40)">🪄 마법사가 될래요!</button>`);
}

/* =================== 출석 도장 =================== */
const ATT_GIFT = [['bamboo', 3, '🎋 대나무 3'], ['stars', 20, '⭐ 별빛 20'], ['apple', 1, '🍎 사과 1'], ['stars', 30, '⭐ 별빛 30'], ['honey', 1, '🍯 꿀 1'], ['bamboo', 5, '🎋 대나무 5'], ['special', 0, '🎁 특별 선물']];
function openAttendance() {
  const n = state.att.count % 7, done = state.att.last === today();
  const cyc = done ? ((state.att.count - 1) % 7) : n;
  showModal(`<div class="h2">🐾 출석 도장</div><div class="sub">7번 찍으면 특별 선물! (매일 1번)</div>
   <div class="stamps">${ATT_GIFT.map((g, i) => `<div class="stamp ${i < cyc || (done && i === cyc) ? 'got' : ''} ${!done && i === cyc ? 'today' : ''}" id="stp${i}"><div><b>${g[2].split(' ')[0]}</b><div>${i + 1}일</div></div></div>`).join('')}</div>
   ${done ? '<div class="sub">오늘은 이미 찍었어요! 내일 또 만나요 💗</div><button class="btn white" onclick="closeModal()">닫기</button>' : `<button class="btn pink" id="stampBtn" onclick="doStamp()">🐾 도장 쾅! (${ATT_GIFT[cyc][2]})</button>`}`);
}
function doStamp() {
  if (state.att.last === today()) return;
  const i = state.att.count % 7, g = ATT_GIFT[i];
  state.att.count++; state.att.last = today();
  let msg = g[2];
  if (g[0] === 'special') { if (!state.owned.includes('판다 모자')) { state.owned.push('판다 모자'); msg = '👒 판다 모자 (꾸미기 상점에서 써 봐요!)'; } else { state.stars += 50; state.honey++; msg = '⭐ 별빛 50 + 🍯 꿀'; } }
  else state[g[0]] += g[1];
  save(); SND.play('stamp');
  const s = $('stp' + i); if (s) { s.classList.add('got'); s.classList.remove('today'); }
  const b = $('stampBtn'); if (b) { b.outerHTML = `<div class="sub" style="font-size:17px">선물 받았어요! ${msg}</div><button class="btn white" onclick="closeModal();render()">좋아요!</button>`; }
  confetti(30); checkStickers();
}
function dailyGift() {
  if (state.claimedDays.includes(today())) return;
  const av = shuffle(SHOP.filter(x => !state.owned.includes(x[1]) && itemAvailable(x) && x[3] > 0)).slice(0, 3);
  if (!av.length) { state.claimedDays.push(today()); state.stars += 100; save(); toast('미션 선물: 별빛 100!'); render(); return; }
  showModal(`<div class="h2">🎁 오늘의 미션 성공!</div><div class="sub">갖고 싶은 선물을 하나 골라요</div><div class="grid3">${av.map(x => `<button class="pick" onclick="claimGift('${x[1]}',this)"><span class="e">${x[2]}</span>${x[1]}</button>`).join('')}</div>`);
}
function claimGift(n, el) { if (state.claimedDays.includes(today())) return; state.owned.push(n); state.claimedDays.push(today()); save(); el.classList.add('on'); SND.play('buy'); confetti(30); setTimeout(() => { closeModal(); toast(n + ' 받았어요!'); render(); checkStickers(); }, 800); }

/* =================== 모험 지도 / 마을 =================== */
function map() {
  $('app').innerHTML = topBar('🗺️ 구구단 모험 지도') + `<div class="sub">마을마다 정답 ${MASTER}개를 모으면 친구를 구하고 다음 마을이 열려요!</div>
  <div class="vlist">${VN.map((n, i) => { const u = unlocked(i), v = state.villages[i], c = v >= MASTER;
    return `<button class="vcard ${u ? '' : 'lock'}" style="--c:${VC[i]};--bg:${VBG[i]}" onclick="${u ? `openVillage(${i})` : `toast('${i + 1}단 마을을 먼저 구해요!');SND.play('wrong')`}">
     <div class="vi">${u ? VS[i] : '🔒'}</div><div class="grow"><b>${i + 2}단 · ${n}</b><div class="vs">${c ? '구출 완료! 숫자 입력 마법사 모드' : u ? `정답 ${v}/${MASTER}` : `${i + 1}단 마을을 구하면 열려요`}</div>
     ${u && !c ? `<div class="bar g" style="height:9px;margin-top:4px"><i style="width:${v / MASTER * 100}%"></i></div>` : ''}</div><div class="fr">${c ? VA[i] : u ? '❔' : ''}</div></button>`; }).join('')}</div>`;
}
let vi = 0, hideAns = false;
function openVillage(i) { vi = i; hideAns = false; go('village'); }
function villagePage() {
  const n = vi + 2;
  $('app').innerHTML = topBar(`${VS[vi]} ${n}단 · ${VN[vi]}`, 'map') + `
  <div class="qstage"><div class="yw" id="vyeon">${yeon('magic')}</div><div class="qbub"><div class="qtag">📖 마법 주문서</div><div style="font-size:calc(4.4*var(--u))">${state.villages[vi] >= MASTER ? `${VAN[vi]} 친구를 구했어요!<br>이제 숫자를 직접 쓰는 마법사 모드!` : `${VN[vi]}에 ${VAN[vi]} 친구가 갇혀 있어요!<br>정답 ${MASTER - state.villages[vi]}개 더 모으면 구출!`}</div></div></div>
  <button class="btn white sm" style="align-self:center" onclick="hideAns=!hideAns;render()">${hideAns ? '👀 답 모두 보기' : '🙈 답 가리고 외우기'}</button>
  <div class="spells">${Array.from({ length: 9 }, (_, k) => `<button class="spell ${hideAns ? 'hid' : ''}" onclick="this.classList.remove('hid');SND.play('tap')">${n} × ${k + 1} = <span class="a">${n * (k + 1)}</span></button>`).join('')}</div>
  <button class="btn pink" onclick="startRound()">🪄 마법 문제 풀기 <small>정답 5개</small></button>`;
}

/* =================== 문제 풀기 =================== */
let round = null;
function weakFirst(n) { return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(a => { const s = state.stats[n + 'x' + a]; return s && s.wrong > 0 && s.right < s.wrong + 2; }).sort((a, b) => (state.stats[n + 'x' + b].wrong - state.stats[n + 'x' + b].right) - (state.stats[n + 'x' + a].wrong - state.stats[n + 'x' + a].right)).slice(0, 2); }
function startRound() {
  if (timeUp()) { go('limit'); return; }
  const n = vi + 2, weak = weakFirst(n);
  round = { n, correct: 0, eb: 0, es: 0, wrongs: 0, queue: [...weak, ...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(a => !weak.includes(a)))], review: [], cur: null, lock: false, goldenUsed: false, newClear: false, input: '' };
  page = 'quiz'; trackStart(); render(); nextQ();
}
function makeOptions(n, a) { const v = n * a, c = [v]; for (const x of shuffle([v - n, v + n, v - 1, v + 1, v - 10, v + 10, v + 2, v - 2, n * (a + 2)])) { if (x > 0 && !c.includes(x)) c.push(x); if (c.length === 4) break; } return shuffle(c); }
function groupsHTML(n, a) { return `<div class="groups">${Array.from({ length: a }, () => `<span class="gp">${'<i></i>'.repeat(n)}</span>`).join('')}</div>`; }
function quizPage() {
  if (!round) { page = 'map'; render(); return; }
  $('app').innerHTML = `<header class="top"><button class="ic" onclick="leaveQuiz()">⬅️</button><div class="qdots" id="qdots">${'<i></i>'.repeat(5)}</div><span class="coin" id="cB">🎋 ${state.bamboo}</span><span class="coin st" id="cS">⭐ ${state.stars}</span></header>
  <div class="qstage"><div class="yw" id="qyeon">${yeon('idle')}</div><div class="qbub" id="qbub"></div></div><div id="qarea"></div>`;
}
function nextQ() {
  if (!round) return;
  if (round.correct >= 5) { endRound(); return; }
  if (timeUp()) { trackStop(); round = null; go('limit'); return; }
  round.review.forEach(r => r.wait--);
  const due = round.review.findIndex(r => r.wait <= 0);
  const a = due >= 0 ? round.review.splice(due, 1)[0].a : (round.queue.length ? round.queue.shift() : 1 + Math.floor(Math.random() * 9));
  const golden = !round.goldenUsed && round.correct >= 1 && Math.random() < .2;
  if (golden) round.goldenUsed = true;
  round.cur = { a, ans: round.n * a, golden }; round.lock = false; round.input = '';
  const direct = state.villages[vi] >= MASTER, hint = state.villages[vi] < 5;
  [...$('qdots').children].forEach((d, i) => d.classList.toggle('on', i < round.correct));
  const b = $('qbub'); b.classList.toggle('gold', golden);
  b.innerHTML = `<div class="qtag">${golden ? '🌟 황금 대나무 문제! (대나무 +3)' : '✨ 마법 주문을 완성해요'}</div><div class="qtxt ${direct ? 'pd' : ''}">${round.n} × ${a} = ${direct ? '<span class="inbox" id="qin">&nbsp;</span>' : '<span class="qm">?</span>'}</div>${hint ? groupsHTML(round.n, a) + `<div class="sub">${round.n}개씩 ${a}묶음</div>` : ''}`;
  if (golden) SND.play('golden');
  const qa = $('qarea');
  if (direct) qa.innerHTML = `<div class="pad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map(k => `<button class="key ${k === 'ok' ? 'ok' : k === 'del' ? 'del' : ''}" onclick="qKey('${k}')">${k === 'ok' ? '확인' : k === 'del' ? '⌫' : k}</button>`).join('')}</div>`;
  else { const cols = shuffle(['#FF7EB3', '#4FB8F0', '#FFB72B', '#3DD598', '#9C7BFF', '#FF8A5B']); qa.innerHTML = `<div class="opts">${makeOptions(round.n, a).map((v, i) => `<button class="opt" style="--c:${cols[i]}" onclick="answer(${v},this)">${v}</button>`).join('')}</div>`; }
  setYeonMood($('qyeon'), 'idle');
}
function qKey(k) {
  if (!round || round.lock) return;
  if (k === 'del') round.input = round.input.slice(0, -1);
  else if (k === 'ok') { if (round.input) answer(Number(round.input), $('qin')); return; }
  else if (round.input.length < 2) round.input += k;
  SND.play('tap'); const q = $('qin'); if (q) q.innerHTML = round.input || '&nbsp;';
}
function answer(v, el) {
  if (!round || round.lock) return; round.lock = true;
  const { a, ans, golden } = round.cur, key = round.n + 'x' + a;
  if (!state.stats[key]) state.stats[key] = { right: 0, wrong: 0 };
  if (v === ans) {
    const mult = isWeekend() ? 2 : 1, gb = golden ? 3 : 1, gs = 10 * mult;
    round.correct++; round.eb += gb; round.es += gs; state.bamboo += gb; state.stars += gs; state.stats[key].right++;
    state.daily[today()] = (state.daily[today()] || 0) + 1; if (!state.days.includes(today())) state.days.push(today());
    if (golden) state.golden++;
    state.villages[vi]++;
    if (state.villages[vi] === MASTER && !state.firstClear[vi]) round.newClear = true;
    if (state.villages.every(x => x >= MASTER) && !state.castle) { state.castle = true; if (!state.owned.includes('반짝 왕관')) state.owned.push('반짝 왕관'); }
    if (state.daily[today()] === 10) later(() => toast('🎁 오늘의 미션 달성! 홈에서 선물을 골라요'), 300);
    save();
    SND.play(golden ? 'golden' : 'correct'); if (el && el.classList) el.classList.add('ok');
    setYeonMood($('qyeon'), 'cheer', 700); burstAt(el || $('qbub'), golden ? ['🌟', '🎋'] : ['✨', '⭐'], 8);
    flyTo(el || $('qbub'), $('cB'), '🎋', () => updCoins('b')); setTimeout(() => updCoins('s'), 200);
    $('qbub').querySelector('.qtxt').innerHTML = `${round.n} × ${a} = <span class="qm">${ans}</span>`;
    [...$('qdots').children].forEach((d, i) => d.classList.toggle('on', i < round.correct));
    setTimeout(nextQ, 720);   // 문제마다 짧게(0.7초)만 축하
  } else {
    state.stats[key].wrong++; round.wrongs++; save(); SND.play('wrong');
    if (el && el.classList.contains('opt')) { el.classList.add('no'); [...document.querySelectorAll('.opt')].forEach(o => { if (+o.textContent === ans) o.classList.add('hint'); }); }
    setYeonMood($('qyeon'), 'oops', 1400);
    round.review.push({ a, wait: 2 });
    $('qbub').classList.remove('gold');
    $('qbub').innerHTML = `<div class="explain">괜찮아! <b>${round.n}</b>개씩 <b>${a}</b>묶음이면</div>${groupsHTML(round.n, a)}<div class="explain">${round.n} × ${a} = <b>${ans}</b></div><div class="sub">조금 뒤에 다시 나와요</div><button class="btn green sm" style="margin-top:6px" onclick="nextQ()">알겠어! ➜</button>`;
  }
}
function leaveQuiz() { round = null; trackStop(); go('map'); }
function endRound() {
  trackStop();
  if (state.mg.tickets < 5) { state.mg.tickets++; }
  save();
  if (round.newClear) { state.firstClear[vi] = true; save(); clearScene(vi, () => { page = 'chest'; render(); }); }
  else { page = 'chest'; render(); }
}
function chestPage() {
  const gifts = shuffle([['🎋', '대나무 5개', 'bamboo', 5], ['🎍', '대나무 8개', 'bamboo', 8], ['⭐', '별빛 30개', 'stars', 30], ['🍎', '사과 1개', 'apple', 1], ['🍯', '꿀 1개', 'honey', 1]]).slice(0, 3);
  round.gifts = gifts; SND.play('chest');
  $('app').innerHTML = `<div class="h1" style="margin-top:20px">🎁 마법 보물상자!</div><div class="chest" id="chest">🎁</div><div class="sub">정답 5개 성공! 갖고 싶은 선물을 하나 골라요<br><small>(뽑기가 아니에요, 직접 골라요)</small></div>
  <div class="grid3">${gifts.map((g, i) => `<button class="pick" onclick="pickGift(${i},this)"><span class="e">${g[0]}</span>${g[1]}</button>`).join('')}</div>`;
}
function pickGift(i, el) {
  if (round.gift) return; const g = round.gifts[i]; round.gift = g; state[g[2]] += g[3]; save();
  el.classList.add('on'); $('chest').classList.add('open'); $('chest').textContent = '✨'; SND.play('reward'); burstAt(el, ['✨', g[0]], 10);
  setTimeout(() => { page = 'result'; render(); }, 900);
}
function resultPage() {
  const r = round;
  $('app').innerHTML = `<div class="h1" style="margin-top:14px">🎊 마법 성공!</div>
  <div class="dressing" style="height:min(60vw,280px)"><div class="spot"></div><div class="yw" id="ryeon">${yeon('dance')}</div></div>
  <div class="card" style="text-align:center"><div style="font-size:calc(5*var(--u))">🎋 대나무 +${r.eb + (r.gift && r.gift[2] === 'bamboo' ? r.gift[3] : 0)} · ⭐ 별빛 +${r.es + (r.gift && r.gift[2] === 'stars' ? r.gift[3] : 0)}</div>
   ${r.gift ? `<div class="sub">고른 선물: ${r.gift[0]} ${r.gift[1]}</div>` : ''}${isWeekend() ? '<div class="sub">🌟 주말 이벤트로 별빛 2배!</div>' : ''}
   <div class="sub">🧺 대나무 받기 놀이권 +1 (지금 ${state.mg.tickets}장)</div>${r.wrongs === 0 ? '<div class="sub">💯 한 번도 안 틀렸어요!</div>' : ''}</div>
  <button class="btn green" onclick="go('garden')">🐼 ${esc(state.panda)}에게 먹이 주기</button>
  <div class="grid2"><button class="btn pink" onclick="startRound()">🔁 한 번 더</button><button class="btn white" onclick="go('map')">🗺️ 지도</button></div>`;
  confetti(36); checkStickers();
}

/* =================== 마을 첫 클리어 특별 연출 (8종) =================== */
function clearScene(i, done) {
  const th = THEMES[i], w = document.createElement('div'); w.className = `clear th-${th}`; w.id = 'clearFx';
  let L = '', F = `<div class="friend" style="left:62%;bottom:58%">${VA[i]}</div>`;
  if (th === 'forest') { for (let k = 0; k < 9; k++) L += `<div class="bam" style="left:${k * 11 + 2}%;height:${rnd(45, 85)}%;animation-delay:${k * .08}s"></div>`; for (let k = 0; k < 14; k++) L += `<span class="p leaf" style="left:${rnd(0, 100)}%;font-size:${rnd(18, 30)}px;animation-duration:${rnd(3, 6)}s;animation-delay:-${rnd(0, 4)}s">🍃</span>`; }
  if (th === 'pond') { for (let k = 0; k < 4; k++) L += `<div class="ring" style="left:${rnd(25, 75)}%;top:${rnd(55, 75)}%;animation-delay:${k * .55}s"></div>`; for (let k = 0; k < 3; k++) L += `<span class="p duck" style="top:${62 + k * 8}%;font-size:34px;animation-delay:-${k * 1.6}s">🦆</span>`; for (let k = 0; k < 6; k++) L += `<span class="p" style="left:${rnd(5, 95)}%;top:${rnd(70, 92)}%;font-size:30px">🪷</span>`; F = `<div class="friend" style="left:40%;bottom:60%">${VA[i]}</div>`; }
  if (th === 'cloud') { L += `<div class="beam"></div><span class="p cl" style="left:-6%">☁️</span><span class="p cl r" style="right:-6%">☁️</span>`; for (let k = 0; k < 12; k++) L += `<span class="p trail" style="left:${rnd(5, 95)}%;top:${rnd(5, 50)}%;font-size:${rnd(14, 26)}px;animation-delay:-${rnd(0, 1.4)}s">✨</span>`; F = `<div class="friend">${VA[i]}</div>`; }
  if (th === 'rainbow') { L += `<svg class="arc" viewBox="0 0 400 210">${['#FF5E5E', '#FF9F45', '#FFD23F', '#5CD67A', '#4FB8F0', '#8B6BFF'].map((c, k) => `<path d="M${20 + k * 14} 205 A${180 - k * 14} ${180 - k * 14} 0 0 1 ${380 - k * 14} 205" stroke="${c}" stroke-width="13" fill="none" style="animation-delay:${k * .12}s"/>`).join('')}</svg>`; for (let k = 0; k < 16; k++) L += `<span class="p" style="left:${rnd(0, 100)}%;top:${rnd(5, 60)}%;font-size:${rnd(12, 22)}px;animation:twinkle 1.2s ${rnd(0, 1)}s infinite">${pick(['💖', '💛', '💚', '💙', '💜'])}</span>`; F = `<div class="friend" style="left:42%;bottom:60%">${VA[i]}</div>`; }
  if (th === 'candy') { for (let k = 0; k < 22; k++) L += `<span class="p cd" style="left:${rnd(0, 100)}%;font-size:${rnd(22, 36)}px;animation-duration:${rnd(2.2, 4)}s;animation-delay:-${rnd(0, 4)}s">${pick(['🍬', '🍭', '🍫', '🧁', '🍩'])}</span>`; }
  if (th === 'firefly') { for (let k = 0; k < 26; k++) L += `<span class="p ff" style="left:${rnd(0, 100)}%;top:${rnd(0, 80)}%;--dx:${rnd(-60, 60)}px;--dy:${rnd(-60, 60)}px;animation-duration:${rnd(1.5, 3)}s;animation-delay:-${rnd(0, 3)}s"></span>`; for (let k = 0; k < 5; k++) L += `<span class="p spk" style="left:${rnd(20, 80)}%;top:${rnd(15, 45)}%;font-size:40px;animation-delay:${k * .3}s">✨</span>`; F = `<div class="friend" style="left:30%;bottom:62%">${VA[i]}</div>`; }
  if (th === 'snow') { for (let k = 0; k < 28; k++) L += `<span class="p sf" style="left:${rnd(0, 100)}%;font-size:${rnd(14, 30)}px;animation-duration:${rnd(3, 7)}s;animation-delay:-${rnd(0, 6)}s">❄</span>`; L += `<div style="position:absolute;left:0;right:0;bottom:0;height:40%;background:linear-gradient(#fff0,#fff)"></div>`; F = `<div class="friend">${VA[i]}</div>`; }
  if (th === 'castle') { L += `<span class="p castle">🏰</span>`; const cols = ['#FF7EB3', '#FFD23F', '#5CC8FF', '#9CFF8A', '#FFFFFF']; for (let s = 0; s < 4; s++) { const x = rnd(10, 90), y = rnd(8, 35), c = pick(cols); for (let k = 0; k < 14; k++) { const a = k / 14 * 6.28; L += `<span class="p fw" style="left:${x}%;top:${y}%;background:${c};--dx:${Math.cos(a) * 80}px;--dy:${Math.sin(a) * 80}px;animation-delay:${s * .4}s"></span>`; } } for (let k = 0; k < 20; k++) L += `<span class="p" style="left:${rnd(0, 100)}%;top:${rnd(0, 60)}%;font-size:${rnd(8, 16)}px;color:#FFF3A8;animation:twinkle 1.5s ${rnd(0, 1.5)}s infinite">★</span>`; F = `<div class="friend" style="left:62%;bottom:58%">${VA[i]}<span style="position:absolute;left:18%;top:-40%;font-size:.5em">👑</span></div>`; }
  w.innerHTML = `<div class="layer">${L}</div><div class="ttl">🎉 ${i + 2}단 · ${VN[i]} 구출!</div>${F}
   <div class="cast"><div class="yw">${yeon('dance')}</div><div class="pw"><img src="${pandaImg(stage())}" alt=""></div></div>
   <div class="msg"><b>${VAN[i]} 친구를 구했어요!</b><p>${['대나무가 쑥쑥 자라고 토끼가 깡충 뛰어나왔어요!', '연못에 물결이 퍼지고 오리가 돌아왔어요!', '구름이 열리고 유니콘이 날아왔어요!', '무지개가 그려지고 여우가 빙글빙글 춤춰요!', '사탕 비가 내리고 다람쥐가 신났어요!', '반딧불이 반짝이고 아기 용이 나타났어요!', '눈꽃이 춤추고 펭귄이 미끄럼을 타요!', '불꽃놀이가 터지고 사자가 왕관을 썼어요!'][i]}${i < 7 ? `<br>${i + 3}단 · ${VN[i + 1]}이 열렸어요!` : '<br>모든 마을을 구했어요! 진짜 구구단 마법사!'}</p>
   <button class="btn pink" id="clearNext">🌟 보물상자 열러 가기</button></div>`;
  document.body.appendChild(w); SND.play('clear', i); setTimeout(() => confetti(50), 900);
  $('clearNext').onclick = () => { SND.play('tap'); w.remove(); done && done(); };
}

/* =================== 판다 정원 =================== */
let feeding = false;
function garden() {
  const s = stage(), cur = STAGE_AT[s], nx = STAGE_AT[s + 1];
  const deco = SHOP.filter(x => x[0] === 'garden' && state.owned.includes(x[1])).map(x => (DECO_POS[x[1]] || []).map(([l, t, sz]) => `<span class="decoE" style="left:${l}%;top:${t}%;font-size:calc(${sz}*var(--u))">${x[2]}</span>`).join('')).join('');
  $('app').innerHTML = topBar(`🐼 ${esc(state.panda)}의 정원`) + `
  <div class="stage tall" id="gstage"><div class="ground"></div>${deco}${state.castle ? '<span class="decoE" style="left:50%;top:26%;font-size:calc(12*var(--u))">🏰</span>' : ''}${isWinter() ? snowHTML(14) : ''}
   <div class="bubble" id="gbub">${hungry() ? '배고파요… 🥺' : pick(['쓰다듬어 줘!', '오늘 기분 최고!', `${esc(state.child)} 좋아!`])}</div>
   ${state.villages.map((v, i) => v >= MASTER ? `<div class="friendE" style="left:${6 + i * 12}%;animation-delay:-${i * .35}s">${VA[i]}</div>` : '').join('')}
   <div class="actor yeonA" id="gyeon" style="left:22%;width:28%"><div class="fl">${yeon('idle')}</div></div>
   <div class="pandaW s${s} ${hungry() ? 'sleep' : 'idle'}" id="gpanda" style="left:62%"><div class="flipper"><img class="pi" src="${pandaImg(s)}" alt="${esc(state.panda)}"></div>${hungry() ? '<span class="zz">Z</span>' : ''}</div>
   ${state.sibling ? `<div class="pandaW s0 idle" id="gbaby" style="left:84%;height:20%"><div class="flipper"><img class="pi" src="${pandaImg(0)}" alt="아기 판다 동생"></div></div>` : ''}
  </div>
  <div class="card">
   <div class="row"><b class="grow" style="font-size:calc(5*var(--u))">${STAGE_N[s]} 판다 ${esc(state.panda)}</b><span class="sub">성장 ${state.growth}</span></div>
   <div class="stageBadges" style="margin:8px 0">${[0, 1, 2, 3].map(k => `<div class="${k === s ? 'on' : k < s ? 'done' : ''}"><img src="${pandaImg(k)}" alt="">${STAGE_N[k]}</div>`).join('')}</div>
   <div class="bar g"><i id="gbar" style="width:${nx ? (state.growth - cur) / (nx - cur) * 100 : 100}%"></i></div>
   <div class="sub" style="margin-top:4px">${nx ? `${STAGE_N[s + 1]} 판다까지 ${nx - state.growth} 남음` : '최고 단계! 어른 판다가 되었어요 💐'}</div>
  </div>
  <div class="grid3">
   <button class="btn green" id="fb" onclick="feed('bamboo',1,this)"><span class="em">🎋</span>대나무<small>${state.bamboo}개 · +1</small></button>
   <button class="btn pink" id="fa" onclick="feed('apple',3,this)"><span class="em">🍎</span>사과<small>${state.apple}개 · +3</small></button>
   <button class="btn" id="fh" onclick="feed('honey',5,this)"><span class="em">🍯</span>꿀<small>${state.honey}개 · +5</small></button>
  </div>
  <div class="sub">판다를 톡 누르면 쓰다듬을 수 있어요 · 대나무는 구구단으로 모아요</div>`;
  const yEl = $('gyeon'); setYeonMood(yEl, 'idle');
  initStage('gstage', 'gyeon', 'gpanda');
  const bb = $('gbaby'); if (bb) { wander(bb, 70, 92, (m, l) => { bb.querySelector('.flipper').classList.toggle('left', !!l); bb.classList.toggle('walk', m); bb.classList.toggle('idle', !m); }); bb.onclick = () => petPanda(bb); }
}
function feed(type, val, btn) {
  if (feeding) return;
  const emo = { bamboo: '🎋', apple: '🍎', honey: '🍯' }[type], pEl = $('gpanda'), yEl = $('gyeon');
  if (state[type] <= 0) { SND.play('wrong'); setYeonMood(yEl, 'oops', 1200); toast(type === 'bamboo' ? '대나무가 없어요! 구구단으로 모아요 🗺️' : '간식이 없어요! 보물상자에서 골라요 🎁'); return; }
  feeding = true; const before = stage();
  state[type]--; state.growth += val; state.feeds++; state.lastFeed = Date.now(); save();
  pEl.dataset.busy = 1; pEl.classList.remove('sleep', 'walk', 'idle'); const z = pEl.querySelector('.zz'); if (z) z.remove();
  setYeonMood(yEl, 'magic', 900); SND.play('whoosh');
  flyTo(btn, pEl, emo, () => {
    pEl.classList.add('eat'); SND.play('eat'); $('gbub').textContent = pick(['냠냠냠~ 😋', '아삭아삭!', '맛있어요!', '음~ 최고야!']);
    const r = pEl.getBoundingClientRect();
    for (let k = 0; k < 10; k++) { const c = document.createElement('i'); c.className = 'crumb'; c.style.left = (r.left + r.width * .5) + 'px'; c.style.top = (r.top + r.height * .32) + 'px'; c.style.position = 'fixed'; c.style.background = type === 'bamboo' ? '#6BC46A' : type === 'apple' ? '#FF6B6B' : '#F5B83D'; c.style.setProperty('--dx', rnd(-50, 50) + 'px'); c.style.setProperty('--dy', rnd(10, 60) + 'px'); document.body.appendChild(c); setTimeout(() => c.remove(), 900); }
    fxAt(pEl, `+${val} 💚`);
    later(() => {
      pEl.classList.remove('eat'); pEl.classList.add('happy'); SND.play('pet'); setYeonMood(yEl, 'cheer', 900);
      later(() => { feeding = false; delete pEl.dataset.busy; checkStickers(); if (stage() > before) growthCelebration(before, stage()); else render(); }, 900);
    }, 1400);
  });
}
function growthCelebration(from, to) {
  const w = document.createElement('div'); w.className = 'growfx'; w.id = 'growFx';
  w.innerHTML = `<div class="rays"></div><div class="flash"></div><div class="box"><img class="old" src="${pandaImg(from)}" alt=""><img class="new" src="${pandaImg(to)}" alt="">
    <div class="t1">🎉 ${STAGE_N[to]} 판다로 자랐어요!</div><div class="t2">${esc(state.panda)}가 ${['', '쑥 커서 손을 흔들어요', '대나무를 들 만큼 컸어요', '꽃을 든 멋진 어른이 됐어요'][to]}</div>
    <button class="btn pink gbtn" onclick="SND.play('tap');document.getElementById('growFx').remove();render()">야호! 💖</button></div>`;
  document.body.appendChild(w); SND.play('grow1');
  setTimeout(() => { w.classList.add('reveal'); SND.play('grow2'); confetti(80); }, 1600);
}

/* =================== 꾸미기 상점 =================== */
let shopTab = 'dress';
const TABS = [['dress', '👗 옷'], ['hair', '🎀 머리'], ['back', '🧚 등'], ['hand', '🪄 손'], ['garden', '🏡 정원']];
function shopPage() {
  const list = SHOP.filter(x => x[0] === shopTab && itemAvailable(x));
  const lockedEv = SHOP.filter(x => x[0] === shopTab && !itemAvailable(x));
  $('app').innerHTML = `<header class="top"><button class="ic" onclick="go('home')">🏠</button><div class="ttl">🎀 꾸미기 상점</div><span class="coin st" id="cS">⭐ ${state.stars}</span></header>
  <div class="dressing"><div class="spot"></div><div class="yw" id="syeon">${shopTab === 'garden' ? `<img src="${pandaImg(stage())}" style="height:70%;position:absolute;bottom:4%;left:50%;transform:translateX(-50%)" alt="">` : yeon('idle')}</div></div>
  <div class="tabs">${TABS.map(([k, n]) => `<button class="tab ${k === shopTab ? 'on' : ''}" onclick="shopTab='${k}';SND.play('tap');render()">${n}</button>`).join('')}</div>
  <div class="items">${shopTab !== 'garden' && shopTab !== 'dress' ? `<button class="item ${!state.equipped[shopTab] ? 'on' : ''}" onclick="unequip('${shopTab}')"><span class="e">🚫</span>빼기<span class="pr">${!state.equipped[shopTab] ? '지금 상태' : ''}</span></button>` : ''}
   ${list.map(x => { const own = state.owned.includes(x[1]), on = state.equipped[x[0]] === x[1]; const free = x[4] && !own;
     return `<button class="item ${on ? 'on' : ''}" onclick="buy('${x[1]}')"><span class="e">${x[2]}</span>${x[1]}${free ? '<span class="ev">겨울 이벤트</span>' : ''}<span class="pr">${x[0] === 'garden' ? (own ? '정원에 있어요' : '⭐ ' + x[3]) : on ? '입는 중' : own ? '입어 보기' : free ? '무료 받기' : '⭐ ' + x[3]}</span></button>`; }).join('')}
   ${lockedEv.map(x => `<div class="item" style="opacity:.5"><span class="e">${x[2]}</span>${x[1]}<span class="pr">12월 이벤트</span></div>`).join('')}</div>
  <div class="sub">산 옷은 예온이가 바로 입어요 · 한 번 사면 언제든 바꿔 입기</div>`;
}
function buy(name) {
  const x = SHOP.find(z => z[1] === name); if (!x) return;
  if (!state.owned.includes(name)) {
    const price = x[4] ? 0 : x[3];
    if (state.stars < price) { SND.play('wrong'); toast(`별빛이 ${price - state.stars}개 더 필요해요 ⭐`); setYeonMood($('syeon'), 'oops', 1000); return; }
    state.stars -= price; state.owned.push(name); SND.play('buy'); confetti(20); toast(name + (price ? ' 샀어요!' : ' 받았어요!'));
  } else SND.play('coin');
  if (x[0] !== 'garden') state.equipped[x[0]] = name;
  save(); render(); setYeonMood($('syeon'), 'dance', 1400); checkStickers();
}
function unequip(t) { delete state.equipped[t]; save(); SND.play('tap'); render(); }

/* =================== 60초 마법 챌린지 (수정판) ===================
   V5 문제: ①하루 학습시간이 끝나면 안내 없이 '공부 끝' 화면으로 넘어가 실행이 안 되는 것처럼 보임
           ②빠르게 다시 열면 1초 타이머가 겹쳐 시간이 2배속으로 줄어듦
           ③효과음마다 AudioContext를 새로 만들어 몇 번 뒤 소리·입력이 멈춤(특히 아이폰)
   수정: 시작 전 안내, 타이머 1개만(종료 시각 기준), 공용 AudioContext, 확실한 보상 지급 */
let CH = null;
function openChallenge() {
  if (timeUp()) { showModal(`<div style="font-size:60px">🌙</div><div class="h2">오늘 공부 시간이 끝났어요</div><div class="sub">부모님이 정한 하루 ${state.limit}분을 다 썼어요.<br>챌린지는 내일 다시 할 수 있어요!<br>(부모님 화면에서 시간을 바꿀 수 있어요)</div><button class="btn green" onclick="closeModal();go('garden')">🐼 판다랑 놀기</button><button class="btn white" onclick="closeModal()">닫기</button>`); SND.play('wrong'); return; }
  stopChallenge();
  CH = { score: 0, combo: 0, maxCombo: 0, input: '', end: 0, active: false, q: null, iv: null };
  page = 'challenge'; closeModal(); render();
  let n = 3; const cd = document.createElement('div'); cd.className = 'cdown'; cd.id = 'cdown'; document.body.appendChild(cd);
  const tick = () => { if (!CH || page !== 'challenge') { cd.remove(); return; } if (n > 0) { cd.innerHTML = `<span>${n}</span>`; SND.play('count'); n--; setTimeout(tick, 800); } else { cd.innerHTML = '<span>시작!</span>'; SND.play('go'); setTimeout(() => { cd.remove(); startChallengeClock(); }, 500); } };
  tick();
}
function startChallengeClock() {
  if (!CH) return; CH.active = true; CH.end = Date.now() + 60000; trackStart(); newCQ();
  CH.iv = setInterval(() => {
    if (!CH || !CH.active) return;
    const left = Math.max(0, CH.end - Date.now());
    const f = $('tfill'), t = $('tsec'); if (f) f.style.width = (left / 600) + '%'; if (t) t.textContent = Math.ceil(left / 1000);
    const tb = $('tbar'); if (tb) tb.classList.toggle('low', left < 10000);
    if (left <= 0) finishChallenge();
  }, 100);
}
function stopChallenge() { if (CH && CH.iv) clearInterval(CH.iv); if (CH) CH.active = false; const c = $('cdown'); if (c) c.remove(); }
function challengePage() {
  $('app').innerHTML = `<header class="top"><button class="ic" onclick="quitChallenge()">⬅️</button><div class="timer" id="tbar"><i id="tfill" style="width:100%"></i></div><span class="coin"><span id="tsec">60</span>초</span><span class="coin st">✔ <span id="cscore">${CH ? CH.score : 0}</span></span></header>
  <div class="qstage"><div class="yw" id="cyeon">${yeon('magic')}</div><div class="qbub"><div class="qtag">⏱️ 60초 마법 챌린지</div><div class="qtxt ch"><span id="cq">준비!</span> = <span class="inbox" id="cin">&nbsp;</span></div><div class="combo" id="ccombo"></div></div></div>
  <div class="pad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map(k => `<button class="key ${k === 'ok' ? 'ok' : k === 'del' ? 'del' : ''}" onclick="cKey('${k}')">${k === 'ok' ? '확인' : k === 'del' ? '⌫' : k}</button>`).join('')}</div>`;
}
function newCQ() { const open = [0, 1, 2, 3, 4, 5, 6, 7].filter(i => unlocked(i) || state.villages[i] > 0); const n = pick(open.length ? open : [0]) + 2, a = 1 + Math.floor(Math.random() * 9); CH.q = { n, a, ans: n * a }; CH.input = ''; const q = $('cq'); if (q) q.textContent = `${n} × ${a}`; const i = $('cin'); if (i) i.innerHTML = '&nbsp;'; }
function cKey(k) {
  if (!CH || !CH.active) return;
  if (k === 'del') CH.input = CH.input.slice(0, -1);
  else if (k === 'ok') { if (CH.input) cCheck(); return; }
  else if (CH.input.length < 2) CH.input += k;
  SND.play('tap'); $('cin').innerHTML = CH.input || '&nbsp;';
}
function cCheck() {
  const q = CH.q, key = q.n + 'x' + q.a, ok = Number(CH.input) === q.ans;
  if (!state.stats[key]) state.stats[key] = { right: 0, wrong: 0 };
  if (ok) { CH.score++; CH.combo++; CH.maxCombo = Math.max(CH.maxCombo, CH.combo); state.stats[key].right++; state.daily[today()] = (state.daily[today()] || 0) + 1; if (!state.days.includes(today())) state.days.push(today()); SND.play(CH.combo >= 3 ? 'combo' : 'correct', CH.combo); setYeonMood($('cyeon'), 'cheer', 500); $('cscore').textContent = CH.score; $('ccombo').textContent = CH.combo >= 3 ? `🔥 ${CH.combo} 콤보!` : '정답!'; newCQ(); }
  else { state.stats[key].wrong++; CH.combo = 0; SND.play('wrong'); setYeonMood($('cyeon'), 'oops', 700); $('ccombo').textContent = `정답은 ${q.ans}!`; CH.active = false; setTimeout(() => { if (CH && Date.now() < CH.end) { CH.active = true; newCQ(); } }, 700); }
  save();
}
function quitChallenge() { stopChallenge(); trackStop(); CH = null; go('home'); }
function finishChallenge() {
  if (!CH) return; const c = CH; stopChallenge(); trackStop();
  const rec = c.score > state.best, earned = c.score * 5 * (isWeekend() ? 2 : 1) + (rec && c.score > 0 ? 20 : 0);
  state.stars += earned; if (rec) state.best = c.score; save(); SND.play('timeup'); setTimeout(() => SND.play('reward'), 700); confetti(rec ? 80 : 40);
  showModal(`<div style="width:44%;margin:0 auto">${yeon(c.score ? 'cheer' : 'idle')}</div><div class="h2">${rec && c.score ? '🏆 새로운 최고 기록!' : '⏰ 챌린지 끝!'}</div>
   <div style="font-size:calc(5.4*var(--u))">정답 <b style="color:var(--pink)">${c.score}개</b> · 최고 콤보 ${c.maxCombo}</div>
   <div class="sub">별빛 +${earned}${rec && c.score ? ' (신기록 보너스 +20)' : ''}${isWeekend() ? ' · 주말 2배' : ''}<br>최고 기록 ${state.best}개</div>
   <button class="btn blue" onclick="closeModal();openChallenge()">⏱️ 한 번 더</button><button class="btn white" onclick="closeModal();CH=null;go('home')">🏠 홈으로</button>`);
  updCoins('s'); checkStickers();
}

/* =================== 미니게임: 대나무 받기 (30초) =================== */
let MG = null;
function openMinigame() {
  if (state.mg.date !== today()) { state.mg.date = today(); state.mg.tickets = Math.max(state.mg.tickets, 1); save(); }   // 매일 1장 기본 지급
  if (state.mg.tickets <= 0) { SND.play('wrong'); showModal(`<div style="font-size:60px">🧺</div><div class="h2">놀이권이 없어요</div><div class="sub">구구단 문제 5개를 풀 때마다 1장씩 생겨요!</div><button class="btn pink" onclick="closeModal();go('map')">🗺️ 문제 풀러 가기</button><button class="btn white" onclick="closeModal()">닫기</button>`); return; }
  page = 'minigame'; closeModal(); render();
}
function minigamePage() {
  $('app').innerHTML = topBar('🧺 대나무 받기') + `<div class="sub">판다를 손가락으로 움직여 🎋⭐를 받아요! 🐝는 피해요</div>
  <div class="mg" id="mg"><div class="hud"><span>⏱ <b id="mgT">30</b></span><span>🎋 <b id="mgS">0</b></span></div><div class="catcher" id="mgP" style="left:50%"><img src="${pandaImg(stage())}" alt=""></div></div>
  <button class="btn pink" id="mgStart" onclick="startMinigame()">▶ 시작! (놀이권 1장, 남은 ${state.mg.tickets}장)</button>`;
}
function startMinigame() {
  if (MG || state.mg.tickets <= 0) return;
  state.mg.tickets--; save(); $('mgStart').style.display = 'none'; SND.play('go');
  const box = $('mg'), P = $('mgP'); const W = () => box.clientWidth, H = () => box.clientHeight;
  MG = { x: 50, drops: [], score: 0, stars: 0, end: performance.now() + 30000, last: performance.now(), spawn: 0, raf: 0, stun: 0 };
  const move = e => { const r = box.getBoundingClientRect(); const cx = (e.touches ? e.touches[0].clientX : e.clientX); MG.x = Math.max(8, Math.min(92, (cx - r.left) / r.width * 100)); e.preventDefault(); };
  box.onpointerdown = box.onpointermove = move; box.addEventListener('touchmove', move, { passive: false });
  const loop = t => {
    if (!MG || page !== 'minigame') return;
    const dt = Math.min(50, t - MG.last); MG.last = t;
    if (t > MG.stun) P.style.left = MG.x + '%';
    MG.spawn -= dt;
    if (MG.spawn <= 0) { MG.spawn = rnd(380, 700); const r = Math.random(); const type = r < .68 ? 'b' : r < .82 ? 's' : 'bee'; const d = document.createElement('div'); d.className = 'drop'; d.textContent = type === 'b' ? '🎋' : type === 's' ? '⭐' : '🐝'; box.appendChild(d); MG.drops.push({ el: d, x: rnd(8, 92), y: -5, v: rnd(22, 38) + (30000 - (MG.end - t)) / 1500, type }); }
    const px = parseFloat(P.style.left);
    for (const d of MG.drops) {
      d.y += d.v * dt / 1000; d.el.style.left = d.x + '%'; d.el.style.top = d.y + '%';
      if (!d.done && d.y > 74 && d.y < 92 && Math.abs(d.x - px) < 11) {
        d.done = true; d.el.remove();
        if (d.type === 'bee') { SND.play('bee'); MG.stun = t + 600; P.style.transform = 'translateX(-50%) rotate(-15deg)'; setTimeout(() => P.style.transform = 'translateX(-50%)', 500); }
        else { SND.play('catch'); if (d.type === 'b') MG.score++; else { MG.stars++; MG.score++; } $('mgS').textContent = MG.score; burstAt(P, d.type === 'b' ? '🎋' : '⭐', 4); }
      }
      if (d.y > 105 && !d.done) { d.done = true; d.el.remove(); }
    }
    MG.drops = MG.drops.filter(d => !d.done);
    const left = Math.max(0, MG.end - t); $('mgT').textContent = Math.ceil(left / 1000);
    if (left <= 0) return endMinigame();
    MG.raf = requestAnimationFrame(loop);
  };
  MG.raf = requestAnimationFrame(loop);
}
function stopMinigame() { if (MG) { cancelAnimationFrame(MG.raf); MG = null; } }
function endMinigame() {
  const m = MG; stopMinigame(); const bam = Math.min(10, Math.floor(m.score / 3)), st = m.stars * 2;
  state.bamboo += bam; state.stars += st; state.mg.plays++; const rec = m.score > state.mg.best; if (rec) state.mg.best = m.score; save();
  SND.play('timeup'); setTimeout(() => SND.play('reward'), 600); confetti(40);
  showModal(`<div style="width:40%;margin:0 auto"><img src="${pandaImg(stage())}" style="width:100%;animation:pHop .6s 3" alt=""></div><div class="h2">${rec ? '🥇 최고 기록!' : '🧺 놀이 끝!'}</div><div style="font-size:calc(5*var(--u))">받은 개수 ${m.score}개</div>
   <div class="sub">진짜 선물: 🎋 대나무 +${bam}${st ? ` · ⭐ 별빛 +${st}` : ''}<br>(3개 받을 때마다 대나무 1개, 최대 10개)</div>
   ${state.mg.tickets > 0 ? `<button class="btn pink" onclick="closeModal();render()">🔁 한 번 더 (남은 ${state.mg.tickets}장)</button>` : ''}<button class="btn green" onclick="closeModal();go('garden')">🐼 먹이 주러 가기</button><button class="btn white" onclick="closeModal();go('home')">🏠 홈</button>`);
  checkStickers();
}

/* =================== 스티커 도감 =================== */
function stickerPage() {
  $('app').innerHTML = topBar('📒 스티커 도감') + `<div class="sub">모은 스티커 ${state.stickers.length} / ${STICKERS.length}</div>
  <div class="stickers">${STICKERS.map(([id, e, n]) => `<div class="stk ${state.stickers.includes(id) ? '' : 'lock'}"><span class="e">${e}</span>${n}</div>`).join('')}</div>
  <div class="sub">회색 스티커는 아직 모으지 못했어요. 구구단, 판다 돌보기, 출석, 놀이로 모아요!</div>`;
}

/* =================== 학습 시간 끝 =================== */
function limitPage() {
  $('app').innerHTML = topBar('🌙 오늘의 공부 끝') + `<div class="dressing" style="height:min(70vw,320px)"><div class="spot"></div><div class="yw">${yeon('dance')}</div></div>
  <div class="card" style="text-align:center"><div class="h2">오늘의 마법 공부 끝!</div><div class="sub">정말 잘했어요! 내일 또 만나요 💖<br>판다 돌보기, 꾸미기, 스티커 보기는 계속할 수 있어요.</div></div>
  <button class="btn green" onclick="go('garden')">🐼 판다 돌보기</button><button class="btn purple" onclick="go('shop')">🎀 꾸미기</button>`;
}

/* =================== 부모님 화면 =================== */
let gateAns = 0, parentOpen = false, resetArmed = false;
function parentGate() {
  const a = 21 + Math.floor(Math.random() * 50), b = 13 + Math.floor(Math.random() * 30); gateAns = a + b;
  showModal(`<div class="h2">🔐 부모님 확인</div><div class="sub">${a} + ${b} = ?</div><input id="gateIn" type="number" inputmode="numeric" style="font-size:24px;padding:10px;border-radius:14px;border:3px solid #E9CDEB;text-align:center">
  <button class="btn" onclick="if(+$('gateIn').value===gateAns){parentOpen=true;closeModal();go('parent')}else{toast('다시 확인해 주세요');parentGate()}">확인</button><button class="btn white sm" onclick="closeModal()">닫기</button>`);
}
function parentPage() {
  if (!parentOpen) { page = 'home'; render(); return; }
  const st = state.stats, days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return [('일월화수목금토')[d.getDay()], state.days.includes(dkey(d))]; });
  const weak = Object.entries(st).filter(([k, v]) => v.wrong && v.right < v.wrong + 2).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 12);
  $('app').innerHTML = topBar('👨‍👩‍👧 부모님 화면') + `
  <div class="card"><b>📊 오늘</b><div class="sub" style="text-align:left;font-size:15px;line-height:1.8">공부 시간 ${Math.floor(spent() / 60)}분 ${spent() % 60}초 · 정답 ${dailyCount()}개<br>연속 학습 ${streak()}일 · 구출 ${state.villages.filter(v => v >= MASTER).length}/8 · 챌린지 최고 ${state.best}개<br>판다 성장 ${state.growth} (${STAGE_N[stage()]}) · 스티커 ${state.stickers.length}/${STICKERS.length} · 출석 ${state.att.count}회</div></div>
  <div class="card"><b>🗓 최근 7일</b><div class="row" style="justify-content:space-between;margin-top:6px">${days.map(([w, on]) => `<div style="text-align:center;font-size:13px">${on ? '🟢' : '⚪'}<br>${w}</div>`).join('')}</div></div>
  <div class="card"><b>📈 단별 정답률</b>${Array.from({ length: 8 }, (_, i) => { const n = i + 2; let r = 0, w = 0; for (let a = 1; a <= 9; a++) { const s = st[n + 'x' + a]; if (s) { r += s.right; w += s.wrong; } } const pc = r + w ? Math.round(r / (r + w) * 100) : 0; return `<div class="row" style="margin-top:6px;font-size:14px"><span style="width:34px">${n}단</span><div class="bar g grow"><i style="width:${pc}%"></i></div><span style="width:74px;text-align:right" class="sub">${r + w ? pc + '% (' + r + '/' + (r + w) + ')' : '-'}</span></div>`; }).join('')}</div>
  <div class="card"><b>🔁 자주 틀리는 문제</b> <span class="sub">(해당 단을 풀 때 먼저 다시 나와요)</span><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${weak.length ? weak.map(([k, v]) => `<span class="coin" style="font-size:14px">${k.replace('x', '×')} <small>틀림 ${v.wrong}·맞음 ${v.right}</small></span>`).join('') : '<span class="sub">아직 없어요</span>'}</div></div>
  <div class="card"><b>⏰ 하루 학습 시간</b><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${[5, 10, 15, 20, 0].map(m => `<button class="tab ${state.limit === m ? 'on' : ''}" style="flex:0 0 auto" onclick="state.limit=${m};save();render()">${m ? m + '분' : '제한 없음'}</button>`).join('')}</div><div class="sub" style="text-align:left;margin-top:6px">시간이 끝나면 문제 풀기·챌린지만 쉬고, 판다 돌보기·꾸미기는 계속할 수 있어요.</div></div>
  <div class="card"><b>✏️ 이름 · 소리</b><div class="sub" style="text-align:left">아이 이름</div><input id="pn1" maxlength="15" value="${esc(state.child)}" style="width:100%;font-size:18px;padding:8px;border-radius:12px;border:2px solid #E9CDEB">
   <div class="sub" style="text-align:left;margin-top:6px">판다 이름</div><input id="pn2" maxlength="15" value="${esc(state.panda)}" style="width:100%;font-size:18px;padding:8px;border-radius:12px;border:2px solid #E9CDEB">
   <div class="row" style="margin-top:8px"><button class="btn green sm" onclick="state.child=$('pn1').value.trim()||'예온이';state.panda=$('pn2').value.trim()||'뭉치';save();toast('저장했어요')">이름 저장</button><button class="btn white sm" onclick="state.sound=!state.sound;save();render()">${state.sound ? '🔊 효과음 켜짐' : '🔇 효과음 꺼짐'}</button></div></div>
  <div class="card"><b>💾 기록 백업</b><div class="sub" style="text-align:left">휴대폰을 바꾸거나 앱을 지우기 전에 백업 코드를 복사해 두세요. (인터넷으로 보내지 않아요)</div>
   <div class="row" style="margin-top:6px"><button class="btn blue sm" onclick="copyBackup()">📋 백업 코드 복사</button><button class="btn white sm" onclick="restoreUI()">📥 복원하기</button></div><div id="restoreBox"></div></div>
  <button class="btn pink" id="resetBtn" onclick="resetAll()">🗑️ 모든 기록 초기화</button>
  <button class="btn white" onclick="parentOpen=false;go('home')">부모님 화면 닫기</button>`;
}
function copyBackup() { const code = btoa(unescape(encodeURIComponent(JSON.stringify(state)))); try { navigator.clipboard.writeText(code).then(() => toast('백업 코드를 복사했어요'), () => showCode(code)); } catch (e) { showCode(code); } }
function showCode(code) { $('restoreBox').innerHTML = `<textarea style="width:100%;height:90px;margin-top:6px" readonly>${code}</textarea><div class="sub">위 코드를 길게 눌러 복사하세요</div>`; }
function restoreUI() { $('restoreBox').innerHTML = `<textarea id="rcode" style="width:100%;height:90px;margin-top:6px" placeholder="백업 코드를 붙여 넣으세요"></textarea><button class="btn green sm" onclick="doRestore()">복원</button>`; }
function doRestore() { try { const o = JSON.parse(decodeURIComponent(escape(atob($('rcode').value.trim())))); state = migrate(o); save(); toast('복원했어요!'); render(); } catch (e) { toast('코드가 올바르지 않아요'); } }
function resetAll() {
  if (!resetArmed) { resetArmed = true; $('resetBtn').textContent = '⚠️ 정말 지울까요? 한 번 더 누르면 모두 삭제'; setTimeout(() => { resetArmed = false; const b = $('resetBtn'); if (b) b.textContent = '🗑️ 모든 기록 초기화'; }, 4000); return; }
  trackStop(); const keep = { child: state.child, panda: state.panda, limit: state.limit, sound: state.sound }; state = defaults(); Object.assign(state, keep, { story: true }); save(); resetArmed = false; toast('초기화했어요'); render();
}

/* =================== 시작 =================== */
setInterval(() => { if (page === 'quiz' && timeUp() && round && !round.lock) { trackStop(); round = null; go('limit'); } if (streak() >= 3 && !state.sibling) { state.sibling = true; save(); } }, 3000);
document.addEventListener('visibilitychange', () => { if (document.hidden) { trackStop(); save(); } else if (page === 'quiz' || (page === 'challenge' && CH && CH.active)) trackStart(); });
window.addEventListener('pagehide', () => { trackStop(); save(); });
render();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('./sw.js').catch(() => { });
