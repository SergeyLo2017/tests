// Офлайн-режим сайту тестів: після першого відкриття з інтернетом сторінка працює без нього.
const C='tests-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname==='ntfy.sh')return;
  if(u.origin===location.origin){
    // наш сайт: спершу мережа (щоб бачити оновлення), без мережі — із пам'яті
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res})
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html')||caches.match('./'))));
  }else{
    // QR-бібліотека, шрифти: із пам'яті, оновлюємо у фоні
    e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>m);return m||n}));
  }
});
