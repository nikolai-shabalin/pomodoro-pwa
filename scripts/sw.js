self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('pomodoro-cache-v1').then(function(cache) {
      return cache.addAll([
        '../index.html?v=1',
        '../styles/styles.css?v=1',
        '../scripts/app.js?v=1',
        '../images/play.svg?v=1',
        '../images/pause.svg?v=1'
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
