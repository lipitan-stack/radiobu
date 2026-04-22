const CACHE_NAME = "alarm-radio-pwa-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Офлайн-оболочка: HTML из cache-first, остальное stale-while-revalidate
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((cached) => cached || fetch(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || net;
    })
  );
});