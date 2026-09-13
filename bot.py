const CACHE_NAME = 'koznak-ultra-speed-v1';
const PRECACHE = [
  './',
  'index.html',
  'manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  // سىن ۋە Firebase ساندانى ئايرىم بىر تەرەپ قىلىنىدۇ
  if (url.includes('firebaseio.com') || url.includes('.mp4') || url.includes('.m3u8')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) {
        // كەشتىن دەرھال ئېچىپ بېرىپ، ئارقا تەرەپتىن يېڭىلاپ تۇرىدۇ
        fetch(e.request).then(netRes => {
          if (netRes && netRes.status === 200 && e.request.method === 'GET') {
            caches.open(CACHE_NAME).then(c => c.put(e.request, netRes));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(e.request).then(netRes => {
        if (netRes && netRes.status === 200 && e.request.method === 'GET') {
          const clone = netRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone).catch(() => {}));
        }
        return netRes;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./').then(r => r || caches.match('index.html'));
        }
      });
    })
  );
});
