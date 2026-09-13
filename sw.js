const CACHE_NAME = 'koznak-tv-offline-v1';
const PRECACHE_ASSETS = [
    './',
    'index.html',
    'manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/hls.js@latest'
];

// ئورنىتىشتا ئاساسىي ھۆججەتلەرنى ساقلاش
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch(() => {});
        })
    );
});

// كونا كەشلەرنى پاكىز تازىلاش
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ئەقىللىق تور تەلىپى بىر تەرەپ قىلىش (Network-First & Cache Fallback)
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // مۇلازىمېتىر بازىسى (Firebase) ياكى چوڭ MP4 سىنلىرى ئايرىم سىستېمىدا بىر تەرەپ قىلىنىدۇ
    if (req.url.includes('firebaseio.com') || req.url.includes('.mp4') || req.url.includes('.m3u8')) {
        return;
    }

    event.respondWith(
        fetch(req).then((networkRes) => {
            // ئەگەر تور بار بولسا يېڭىسىنى كۆرسىتىدۇ ھەمدە كېيىن تورسىز ئىشلىتىشكە كەشلىۋالىدۇ
            if (networkRes && networkRes.status === 200 && req.method === 'GET') {
                const resClone = networkRes.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone).catch(() => {}));
            }
            return networkRes;
        }).catch(() => {
            // تور يوق چاغدا كەشتىن قايتۇرىدۇ
            return caches.match(req).then((cachedRes) => {
                if (cachedRes) return cachedRes;

                // بەت ئاتلاشتا تور يوق بولسا ئاساسىي بەتنى چىقىرىش
                if (req.mode === 'navigate') {
                    return caches.match('./').then(r => r || caches.match('index.html'));
                }
            });
        })
    );
});
