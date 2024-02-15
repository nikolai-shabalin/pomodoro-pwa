const cacheName = 'pomodoro-cache-v3';
const filesToCache = [
  './',
  './index.html',
  './styles/styles.css',
  './scripts/app.js',
  './images/play.svg',
  './images/pause.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => cache.addAll(filesToCache))
      /* eslint-disable no-console */
      .catch((error) => console.error('Service Worker: Failed to install', error))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((storedCacheName)=> {
          if (cacheName !== storedCacheName) {
            return caches.delete(storedCacheName);
          }
        }))
      )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request)
        .catch(() => caches.match('./index.html')))
  );
});
