const CACHE_NAME = "Noor-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",

  // Scripts
  "./assets/script/main.js",
  "./assets/script/quran.js",
  "./assets/script/hadith.js",
  "./assets/script/utils.js",
  "./assets/script/loading.js",
  "./assets/script/state.js",
  "./assets/script/elements.js",
  "./assets/script/article.js",
  "./assets/script/sidebar.js",
  "./assets/script/language.js",
  "./assets/script/quote.js",
  "./assets/script/translations.json",

  // Styles
  "./assets/style/style.css",

  // Images
  "./assets/images/background.webp",

  // Icons
  "./assets/images/icons/aya-num.svg",
  "./assets/images/icons/arrow-up.svg",
  "./assets/images/icons/book.svg",
  "./assets/images/icons/bookmark.svg",
  "./assets/images/icons/close-icon.svg",
  "./assets/images/icons/github.svg",
  "./assets/images/icons/linkedin.svg",
  "./assets/images/icons/logo.svg",
  "./assets/images/icons/arabic-logo.svg",
  "./assets/images/icons/menu.svg",
  "./assets/images/icons/pause-circle.svg",
  "./assets/images/icons/pause-circle-white.svg",
  "./assets/images/icons/play-circle.svg",
  "./assets/images/icons/play-circle-white.svg",
  "./assets/images/icons/search.svg",
  "./assets/images/icons/setting.svg",
  "./assets/images/icons/verseIcon.svg",
  "./assets/images/icons/icon-192x192.png",
  "./assets/images/icons/icon-512x512.png",
];


self.addEventListener("install",async (installEvent) => {
  self.skipWaiting()
    installEvent.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    )
});

self.addEventListener("activate", (activateEvent) => {
  activateEvent.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      )
    }).then(() => self.clients.claim())
  )
});

self.addEventListener("fetch", (fetchEvent) => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(cached => cached || fetch(fetchEvent.request))
  );
});



