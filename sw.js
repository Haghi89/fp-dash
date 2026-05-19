// Service worker v3 — NETWORK-FIRST strategy so phone always gets fresh HTML.
// Falls back to cache only when offline.
const CACHE = 'fp-desk-v3';
const BASE = '/fp-dash/';
const STATIC = [BASE + 'icon-192.png', BASE + 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Always hit network for HTML, manifest, sw.js, status.json
  if (url.pathname.endsWith('/') || url.pathname.endsWith('.html') ||
      url.pathname.endsWith('manifest.json') || url.pathname.endsWith('sw.js') ||
      url.pathname.endsWith('status.json')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Icons + other static assets: cache-first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }))
  );
});
