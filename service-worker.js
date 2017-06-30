self.addEventListener('install', event => {
    event.waitUntil(
	    caches.open('jokesCacheV6')
	    .then(function(cache) {
	      return cache.addAll([
	        '/',
	        '?hc_reset',
	        '/index.html',
	        '/index.html?hc_reset',
	        '/js/script.js',
	        '/js/vue.min.js',
	        '/css/pure-min.css',
			'/images/confetti.png'
	      ])
	    })
	  );
});

self.addEventListener('activate', event => {
  // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
  event.waitUntil(self.clients.claim());
});

this.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request)
	  .then(function(response){
	      if (response) {
	        console.log("fetch request from cache:", event.request.url)
	        return response;
	      }
	      console.log("fetch request from network:", event.request.url)
	      return fetch(event.request);
	  }));
});