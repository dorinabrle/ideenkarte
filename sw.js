// Ideenkarte: zuerst Netz, sonst Cache (läuft am Stand auch ohne Internet)
var C = 'ideenkarte-v1';
var CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png'];
self.addEventListener('install', function (e) { self.skipWaiting(); e.waitUntil(caches.open(C).then(function (c) { return c.addAll(CORE); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(C).then(function (cache) {
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 3500);
    return fetch(req, { signal: ctrl.signal, cache: 'no-store' }).then(function (res) {
      clearTimeout(t); if (res && res.ok) cache.put(req, res.clone()); return res;
    }).catch(function () {
      clearTimeout(t);
      return cache.match(req, { ignoreSearch: true }).then(function (hit) { return hit || cache.match('./index.html'); }).then(function (hit) { return hit || Response.error(); });
    });
  }));
});
