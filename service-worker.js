const CACHE_NAME = 'grocery-cache-v50';
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
  './onboarding.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './NotoSansThai-Regular.ttf'
];

self.addEventListener('install', e => {
  console.log('Service Worker: Installing v39...');
  self.skipWaiting(); // Force immediate activation
  
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('Service Worker: Caching files...');
      
      // Cache files individually to handle failures gracefully
      const cachePromises = ASSETS.map(async asset => {
        try {
          await cache.add(asset);
          console.log('✓ Cached:', asset);
        } catch (err) {
          console.warn('✗ Failed to cache:', asset, err.message);
        }
      });
      
      await Promise.all(cachePromises);
      console.log('Service Worker: Installation complete');
    })
  );
});

self.addEventListener('activate', e => {
  console.log('Service Worker: Activating v39...');
  e.waitUntil(
    caches.keys().then(keys => {
      const oldCaches = keys.filter(k => k !== CACHE_NAME);
      console.log('Service Worker: Deleting old caches:', oldCaches);
      return Promise.all(oldCaches.map(k => caches.delete(k)));
    }).then(() => {
      console.log('Service Worker: Taking control of all pages');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      if (res) {
        return res;
      }
      
      return fetch(e.request).then(resp => {
        // Don't cache non-ok responses
        if (!resp || resp.status !== 200 || resp.type === 'error') {
          return resp;
        }
        
        // Clone the response
        const responseToCache = resp.clone();
        
        // Cache for next time
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, responseToCache);
        });
        
        return resp;
      }).catch(() => {
        // Fallback to index.html for navigation requests
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
