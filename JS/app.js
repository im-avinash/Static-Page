if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then((result) => console.log('service worker registered',result))
    .catch((err) => console.log('not registered',err))
}