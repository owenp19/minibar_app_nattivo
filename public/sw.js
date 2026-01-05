const CACHE = "minibar-v1";

// Ajusta esta lista según tus archivos reales en /public
const SHELL = [
  "/",
  "/login.html",
  "/salidas-herramienta.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  // No tocar API (sesiones, auth, datos)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  // Cache-first para estáticos
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
