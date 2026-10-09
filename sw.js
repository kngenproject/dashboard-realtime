const VERSION='6.5.6';
const CACHE='dash-v'+VERSION;
const ASSETS=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>Promise.allSettled(ASSETS.map(a=>c.add(a))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(u.pathname.endsWith('version.txt'))return;

  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request).then(res=>{
        if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));}
        return res;
      }).catch(()=>caches.match('index.html',{ignoreSearch:true}))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request,{ignoreSearch:true}).then(cached=>{
      const net=fetch(e.request).then(res=>{
        if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}
        return res;
      }).catch(()=>cached);
      return cached||net;
    })
  );
});