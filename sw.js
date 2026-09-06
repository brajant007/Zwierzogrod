// Fleet Core — minimalny service worker
// Cel: żeby driver.html otwierał się nawet bez zasięgu (np. w tunelu, na granicy).
// Dane (Firebase) i tak wymagają sieci — to cache'uje tylko powłokę aplikacji.

const CACHE_NAME = 'fleet-core-shell-v1';
const SHELL_FILES = [
  './driver.html',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nie cache'uj wywołań do Firebase / zewnętrznych API — mają zawsze iść na żywo.
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
