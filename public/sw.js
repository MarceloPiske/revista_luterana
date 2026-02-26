const CACHE_NAME = 'acervo-luterano-v1';

// Ficheiros mínimos para o site carregar offline
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/file.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna o ficheiro em cache ou faz a requisição à rede
      return response || fetch(event.request);
    })
  );
});