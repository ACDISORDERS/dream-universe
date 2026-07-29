const CACHE = 'dv-cache-v6';

self.addEventListener('install', function (e) { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  // 页面导航：网络优先，离线时回退到缓存的 App 外壳（index.html）
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function (r) {
        if (r && r.ok) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); }
        return r;
      }).catch(function () { return caches.match('index.html'); })
    );
    return;
  }
  // 其它资源：网络优先，失败时回退到已缓存的同一资源（如图标/字体），不再串台
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && r.ok) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); }
      return r;
    }).catch(function () { return caches.match(e.request); })
  );
});
