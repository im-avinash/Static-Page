const staticCacheName='site-static';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
    '/',
    'indexx.html',
    'JS/app.js',
    'images/1.jpeg',
];
// cache size limit function
const limitCacheSize=(name,size) => {
    caches.open(name).then(cache =>{
        cache.keys().then(keys =>{
            if (keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name,size));
            }
        })
    })
}
// install service worker
self.addEventListener('install',evt =>{
    // console.log('service worker has been installed');
    evt.waitUntil(
        caches.open(staticCacheName).then(cache =>{
            console.log('caching shell assets');
            cache.addAll(assets);
        })
    )
});
// activate service worker
self.addEventListener('activate',evt => {
    // console.log('service worker has been activated');
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key!== staticCacheName && key !==dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    )
});
// fetch event 
self.addEventListener('fetch',evt =>{
    // console.log('fetch',evt);
    if (evt.request.url.indexOf('firestore.googleapis.com' === -1)) {
        evt.respondWith(
            caches.match(evt.request).then(cachesResponse =>{
                return cachesResponse || fetch(evt.request).then(fetchRes => {
                    return caches.open(dynamicCacheName).then(caches => {
                        caches.put(evt.request.url, fetchRes.clone()); 
                        limitCacheSize(dynamicCacheName,3)
                        return fetchRes;
                    })
                }); 
            }).catch(() => {
                if (evt.request.url.indexOf('.html') > -1){
                    return caches.match('/pages/fallbackk.html');
                }
            }) 
            
        );
    }
});