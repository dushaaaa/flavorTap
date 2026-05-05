const cacheName = 'flavor-tap-cache-v1';
// We have to explicitly list every file the game needs to run
const assets = [
    './',
    './index.html',
    './style.css',
    './script.js'
];

self.addEventListener('install', e => {
    // This forces the service worker to become active immediately 
    // instead of waiting for you to close all tabs.
    self.skipWaiting();
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener('activate', e => {
    // This tells the service worker to start controlling the page 
    // the very first time it loads.
    e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            // Return from cache, or try the network
            return response || fetch(e.request);
        })
    );
});