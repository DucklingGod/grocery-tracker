const CACHE_NAME = 'grocery-cache-v38';
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
  './barcode-scanner.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './NotoSansThai-Regular.ttf'
];
self.addEventListener('install', e=>{
  console.log('Service Worker: Installing v36...');
  self.skipWaiting(); // Force immediate activation
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', e=>{
  console.log('Service Worker: Activating v36...');
  e.waitUntil(
    caches.keys().then(keys=>{
      console.log('Service Worker: Deleting old caches:', keys.filter(k=>k!==CACHE_NAME));
      return Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
    }).then(()=> self.clients.claim()) // Take control immediately
  );
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(res=> res || fetch(e.request).then(resp=>{
      return resp;
    }).catch(()=> caches.match('./index.html')))
  );
});
