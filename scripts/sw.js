self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('pomodoro-cache-v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles/styles.css',
        '/scripts/app.js',
        '/images/play.svg',
        '/images/pause.svg'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});