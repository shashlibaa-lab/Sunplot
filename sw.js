/* Sunplot service worker: makes the app installable, opens offline, and keeps
   recently viewed aerial photos so saved places still show a map without signal.
   Property, elevation and address lookups always go to the network. */
const VERSION = 'sunplot-v8';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];
const TILE_CACHE = 'sunplot-tiles', TILE_LIMIT = 800;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== TILE_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const isTile = url => /\/tile\/\d+\/\d+\/\d+/.test(url.pathname);
const isShell = url => url.origin === self.location.origin || url.hostname.endsWith('gstatic.com') || url.hostname === 'fonts.googleapis.com';

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (isTile(url)) { e.respondWith(tile(e.request)); return; }
  if (e.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) { e.respondWith(page(e.request)); return; }
  if (isShell(url)) { e.respondWith(shell(e.request)); return; }
  // everything else (parcels, elevation, geocoding): straight to the network
});

/* The app page itself: always try the network first so updates show on the next open; fall back to the saved copy offline. */
async function page(req) {
  const cache = await caches.open(VERSION);
  try {
    const r = await fetch(req, { cache: 'no-cache' });
    if (r.ok) cache.put('./index.html', r.clone());
    return r;
  } catch {
    return (await cache.match('./index.html')) || (await cache.match(req, { ignoreSearch: true })) || Response.error();
  }
}
async function shell(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
  const net = fetch(req).then(r => { if (r.ok) cache.put(req, r.clone()); return r; }).catch(() => hit);
  return hit || net;
}
async function tile(req) {
  const cache = await caches.open(TILE_CACHE);
  try {
    const r = await fetch(req);
    if (r.ok) { cache.put(req, r.clone()); trim(cache); }
    return r;
  } catch {
    return (await cache.match(req)) || Response.error();
  }
}
let trimming = false;
async function trim(cache) {
  if (trimming) return; trimming = true;
  try { const keys = await cache.keys(); for (let i = 0; i < keys.length - TILE_LIMIT; i++) await cache.delete(keys[i]); }
  finally { trimming = false; }
}
