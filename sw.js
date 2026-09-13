const CACHE_NAME = 'koznak-v35';
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
    if (url.includes('firebaseio.com') || url.includes('.mp4') || url.includes('.m3u8')) return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (res && res.status === 200 && e.request.method === 'GET') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone).catch(() => {}));
                }
                return res;
            }).catch(() => {
                if (e.request.mode === 'navigate') {
                    return caches.match('./').then(r => r || caches.match('index.html'));
                }
            });
        })
    );
});
