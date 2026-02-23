const CACHE_NAME = "v1";
const ASSETS = [
  "./",
  /*"./index.html",
  "./manifest.json",
  "./assets/script/main.js",
  "./assets/script/quran.js",
  "./assets/script/hadith.js",
  "./assets/script/fonts.js",
  "./assets/script/utils.js",*/
  "./assets/script/translations.json",
  "./assets/style/style.css",
  "./assets/images/background.webp",
  "./assets/images/icons/aya-num.svg",
  "./assets/images/icons/book.svg",
  "./assets/images/icons/close-icon.svg",
  "./assets/images/icons/icon-192x192.png",
  "./assets/images/icons/icon-512x512.png",
  "./assets/images/icons/logo.svg",
  "./assets/images/icons/menu.svg",
  "./assets/images/icons/pause-circle.svg",
  "./assets/images/icons/play-circle.svg",
  "./assets/images/icons/verseIcon.svg",
  "./assets/images/icons/search.svg",
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


self.addEventListener("push", (pushEvent) => {
  console.log("pushed",pushEvent.data)
  pushEvent.waitUntil(
    self.registration.showNotification("title",{
      body: "something"
    })
  );
});



