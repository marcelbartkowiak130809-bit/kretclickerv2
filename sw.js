const CACHE_NAME = "kret-clicker-app-v131";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/main.css",
  "./assets/js/core.js",
  "./assets/js/patches.js",
  "./assets/js/firebase-auth.js",
  "./assets/js/audio.js",
  "./assets/js/tutorial.js",
  "./assets/icons/app-icon.svg",
  "./assets/icons/app-icon-192.png",
  "./assets/icons/app-icon-512.png"
];

self.addEventListener("install", (event)=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(APP_SHELL))
      .catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event)=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key !== CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", (event)=>{
  const request = event.request;
  if(request.method !== "GET") return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;

  if(request.mode === "navigate" || request.destination === "document"){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(request, copy));
          return response;
        })
        .catch(()=>caches.match(request).then(cached=>cached || caches.match("./index.html")))
    );
    return;
  }

  if(request.destination === "script" || request.destination === "style"){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response && response.ok){
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(request, copy));
          }
          return response;
        })
        .catch(()=>caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>{
      const fresh = fetch(request)
        .then(response=>{
          if(response && response.ok){
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(request, copy));
          }
          return response;
        })
        .catch(()=>cached);
      return cached || fresh;
    })
  );
});
