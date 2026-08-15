/**
 * GeoCampus - Service Worker for PWA & Offline Support
 * Resilient for GitHub Pages and Custom Domains
 * Developed by Ujwal Didhate
 */

const CACHE_NAME = 'geocampus-cache-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/sound.js',
  './js/geofence.js',
  './js/state.js',
  './js/map.js',
  './js/admin.js',
  './js/app.js'
];

// Install Event - Pre-cache core local assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('GeoCampus SW cache addAll note:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback for maximum freshness
self.addEventListener('fetch', (event) => {
  // Only handle GET requests with http/https schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Handle same-origin assets with Network-First, Cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache same-origin successful responses
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails, serve cached version
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // For navigation requests, fallback to index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('index.html');
          }
          return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
      })
  );
});
