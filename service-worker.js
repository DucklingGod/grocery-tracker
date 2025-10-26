const CACHE_NAME = 'grocery-cache-v27';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './config.js',
  './translations.js',
  './app.js',
  './charts.js',
  './firebase-sync.js',
  './ai-assistant.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './NotoSansThai-Regular.ttf'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(res=> res || fetch(e.request).then(resp=>{
      return resp;
    }).catch(()=> caches.match('./index.html')))
  );
});
