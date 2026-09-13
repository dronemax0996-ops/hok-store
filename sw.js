const CACHE_NAME = 'koznak-tv-v100';

// توردىن ئۈزۈلگەندىمۇ تېلېفوندا چاقماقتەك ئېچىلىدىغان ھۆججەتلەر
const ASSETS = [
    './',
    'index.html',
    'manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/hls.js@latest'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch(() => {});
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((k) => {
                    if (k !== CACHE_NAME) return caches.delete(k);
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;

    // تاشقى چوڭ فىلىملەر ۋە Firebase ئۆز ئالدىغا ئېلىنىدۇ
    if (req.url.includes('firebaseio.com') || req.url.includes('.mp4')) {
        return;
    }

    event.respondWith(
        caches.match(req).then((cached) => {
            // تور يوق بولسىلا يانفوننىڭ سىغىمىدىكى كودتىن دەرھال ئاچىدۇ
            if (cached) return cached;

            return fetch(req).then((res) => {
                if (res && res.status === 200 && req.method === 'GET') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(req, clone));
                }
                return res;
            }).catch(() => {
                // ئەگەر پۈتۈنلەي تور بولمىسا ئەپ باشبېتىنى يەرلىك سىغىمدىن ئېچىپ بېرىدۇ
                if (req.mode === 'navigate') {
                    return caches.match('./').then(r => r || caches.match('index.html'));
                }
            });
        })
    );
});
