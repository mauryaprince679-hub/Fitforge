self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  const shouldBypass = request.method !== 'GET' || url.pathname.startsWith('/api/') || url.origin !== self.location.origin;

  if (shouldBypass) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(fetch(request));
});
