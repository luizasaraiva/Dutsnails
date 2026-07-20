const CACHE='vellure-mp-v1';
const ASSETS=[
  './',
  './index.html',
  './style.css?v=5',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './pwa.js?v=5',
  './supabase-config.js',
  './supabase-client.js',
  './cliente-login.html',
  './cliente-area.html',
  './studio-login.html',
  './studio-painel.html'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(response=>response||caches.match('./index.html'))));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url||'./index.html'));
});
