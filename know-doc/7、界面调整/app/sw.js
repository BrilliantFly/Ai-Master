/* Know Planner — Service Worker v1.0 */
var CACHE_NAME = 'know-cache-v1';
var PRECACHE_URLS = [
  'home.html',
  'checkin.html',
  'schedule.html',
  'login.html',
  'shared.js',
  'theme.js',
  'styles.css',
  'manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(res) {
        if (e.request.method === 'GET' && e.request.url.indexOf(location.origin) === 0) {
          return caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, res.clone());
            return res;
          });
        }
        return res;
      }).catch(function() {
        /* 离线时返回缓存的页面 */
        if (e.request.mode === 'navigate') {
          return caches.match('home.html');
        }
        return new Response('离线中', { status: 503 });
      });
    })
  );
});

self.addEventListener('push',function(event){
  var data=event.data?event.data.json():{title:'Know UniApp',body:'你有新的提醒'};
  event.waitUntil(self.registration.showNotification(data.title,{
    body:data.body,
    icon:'/app/icon-192.png',
    badge:'/app/icon-192.png',
    vibrate:[200,100,200]
  }));
});

self.addEventListener('notificationclick',function(event){
  event.notification.close();
  event.waitUntil(clients.openWindow('/app/schedule.html'));
});
