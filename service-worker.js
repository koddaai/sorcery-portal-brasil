// ============================================
// SORCERY PORTAL BRASIL - SERVICE WORKER
// PWA Offline Support
// ============================================

const CACHE_VERSION = 'v1';
const CACHE_NAME = `sorcery-portal-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `sorcery-data-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/favicon.ico',
  '/sorcery-logo.png',

  // JavaScript modules
  '/price-service.js',
  '/tcg-prices.js',
  '/brazilian-stores.js',
  '/recommended-decks.js',
  '/collection-tracker.js',
  '/variant-tracker.js',
  '/keyword-parser.js',
  '/i18n.js',
  '/rulebook-pt.js',
  '/faq-pt.js',
  '/deck-guides-pt.js',
  '/flavor-text.js',
  '/rules-quiz.js',
  '/release-timeline.js',
  '/dust-tracker.js',
  '/promo-tracker.js',
  '/set-progress.js',
  '/threshold-calculator.js',
  '/gamification.js',
  '/card-scanner.js',
  '/artist-gallery.js',
  '/chase-cards-prices.js',
  '/nocodb-service.js',
  '/news-service.js',

  // Element icons
  '/assets/elements/fire.png',
  '/assets/elements/water.png',
  '/assets/elements/earth.png',
  '/assets/elements/air.png',

  // Fonts (Google Fonts are cached separately)

  // External libraries (cached on first use)
];

// Data files that should be cached and updated in background
const DATA_ASSETS = [
  '/cards-database.json',
  '/news-database.json'
];

// URLs to never cache
const NEVER_CACHE = [
  '/api/',
  'chrome-extension://',
  'localhost:',
  'nocodb',
  'firebase',
  'google'
];

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        // Cache static assets, but don't fail if some are missing
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[SW] Failed to cache: ${url}`, err);
            })
          )
        );
      })
      .then(() => {
        // Cache data assets
        return caches.open(DATA_CACHE_NAME).then(cache => {
          return Promise.allSettled(
            DATA_ASSETS.map(url => cache.add(url).catch(() => {}))
          );
        });
      })
      .then(() => {
        console.log('[SW] Installation complete!');
        // Force activation
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH EVENT
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip URLs that should never be cached
  if (NEVER_CACHE.some(pattern => request.url.includes(pattern))) {
    return;
  }

  // Handle different types of requests
  if (DATA_ASSETS.some(asset => url.pathname.endsWith(asset.replace('/', '')))) {
    // Data files: Stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE_NAME));
  } else if (url.origin === location.origin) {
    // Same-origin requests: Cache-first
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else if (url.hostname.includes('cloudfront') || url.hostname.includes('cdn')) {
    // CDN images: Cache-first with long expiry
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else if (url.hostname.includes('fonts.googleapis') || url.hostname.includes('fonts.gstatic')) {
    // Google Fonts: Cache-first
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else if (url.hostname.includes('unpkg') || url.hostname.includes('cdnjs')) {
    // External libraries: Cache-first
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else {
    // Other requests: Network-first
    event.respondWith(networkFirst(request, CACHE_NAME));
  }
});

// ============================================
// CACHING STRATEGIES
// ============================================

// Cache-first: Try cache, fallback to network
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }

    throw error;
  }
}

// Network-first: Try network, fallback to cache
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }

    throw error;
  }
}

// Stale-while-revalidate: Return cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Fetch fresh version in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());

        // Notify clients about update
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'DATA_UPDATED',
              url: request.url
            });
          });
        });
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  // Return cached version immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// ============================================
// MESSAGE HANDLING
// ============================================
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
      break;

    case 'CACHE_URLS':
      if (payload && payload.urls) {
        caches.open(CACHE_NAME).then(cache => {
          cache.addAll(payload.urls);
        });
      }
      break;

    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.source.postMessage({
          type: 'CACHE_SIZE',
          size
        });
      });
      break;
  }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.clone().blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

// ============================================
// BACKGROUND SYNC (for future use)
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-collection') {
    event.waitUntil(syncCollection());
  }
});

async function syncCollection() {
  // Will be implemented when we add cloud sync
  console.log('[SW] Background sync triggered');
}

// ============================================
// PUSH NOTIFICATIONS (for future use)
// ============================================
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

console.log('[SW] Service Worker loaded!');
