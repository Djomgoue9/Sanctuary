// ================================
// SANCTUARY — sw.js
// Service Worker pour notifications push
// ================================

const CACHE_NAME = 'sanctuary-v1';

// Installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(clients.claim());
});

// Réception notification push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Sanctuary vous rappelle !',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'ouvrir', title: '✓ Ouvrir' },
      { action: 'fermer', title: '✕ Ignorer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || '🌸 Sanctuary',
      options
    )
  );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'ouvrir' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Notifications programmées (via setTimeout côté client)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PROGRAMMER_NOTIFICATION') {
    const { titre, corps, delai, url } = event.data;
    setTimeout(() => {
      self.registration.showNotification(titre, {
        body: corps,
        icon: '/icon-192.png',
        vibrate: [200, 100, 200],
        data: { url }
      });
    }, delai);
  }
});