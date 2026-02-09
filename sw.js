// sw.js – minimal service worker for Refleksjon (PWA)

const CACHE_NAME = "refleksjon-v1";

// Kun statiske filer – IKKE Firebase / API-kall
const ASSETS_TO_CACHE = [
  "./",
  "./spiller-refleksjon.html",
  "./spiller-refleksjon.css",
  "./spiller-refleksjon.js",
  "./manifest.json"
];

// Installer: cache app-skallet
self.addEventListener("install", (event) => {
  console.log("🟢 SW installerer");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktiver: rydd gamle cacher
self.addEventListener("activate", (event) => {
  console.log("🔵 SW aktiv");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for statiske filer, network for alt annet
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Ikke rør Firebase / auth / firestore
  if (req.url.includes("firebase") || req.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req);
    })
  );
});
