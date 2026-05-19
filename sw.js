// Service worker for fp-dash PWA — served at /fp-dash/ on GitHub Pages
const CACHE = 'fp-desk-v2';
const BASE = '/fp-dash/';
const STATIC = [BASE, BASE + 'index.html', BASE + 'manifest.json', BASE + 'icon-192.png', BASE + 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // status.json: always network, fall back to cache
  if (url.pathname.endsWith('/status.json')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Everything else: cache-first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }))
  );
});
