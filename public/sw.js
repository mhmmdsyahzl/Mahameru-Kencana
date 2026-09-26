// public/sw.js
const CACHE_NAME = 'jejak-rimba-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // PENTING: Jangan pernah intercept request dari localhost / Vite / Firebase API
  if (
    url.origin.includes('localhost') || 
    url.hostname === '127.0.0.1' ||
    url.pathname.includes('@vite') || 
    url.pathname.includes('@react-refresh') ||
    url.pathname.includes('src/') ||
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('identitytoolkit.googleapis.com')
  ) {
    return; // Biarkan browser/Vite yang handle sendiri secara normal
  }

  // Hanya handle method GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});