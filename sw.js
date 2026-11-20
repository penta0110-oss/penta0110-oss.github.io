/* 오프라인 캐시: 버전을 바꾸면 새 파일로 자동 교체 */
const CACHE = 'yeon-gugudan-v6.0.0';
const FILES = ['./', './index.html', './manifest.webmanifest', './css/app.css?v=6.0.0', './js/rig.js?v=6.0.0', './js/game.js?v=6.0.0',
  './assets/yeon-head.webp', './assets/hair-tex.webp', './assets/bg-land.webp', './assets/panda-0.webp', './assets/panda-1.webp', './assets/panda-2.webp', './assets/panda-3.webp',
  './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // 페이지(HTML)는 인터넷이 되면 최신 것을 먼저, 안 되면 저장본
  if (req.mode === 'navigate') { e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; }).catch(() => caches.match('./index.html'))); return; }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })));
});
