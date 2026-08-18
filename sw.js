// Service worker cilik: nyimpen "app shell" (file inti) supaya app iso dibukak
// pisan liwat cache (luwih cepet + iso offline), lan nyukupi syarat Chrome Android
// supaya prompt "Install app" (dudu mung shortcut bookmark) tenan katon.
const CACHE_NAME = 'catatan-haidl-v10';
const APP_SHELL = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-512-maskable.png',
  'apple-touch-icon-180.png',
  'uthman-taha-naskh.woff2'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return; // POST/dll (mis. Google OAuth/Drive) lumrah, ora didemek
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // Google/cross-origin lumrah, ora didemek

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(networkResp => {
        if (networkResp && networkResp.status === 200) {
          const clone = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return networkResp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
