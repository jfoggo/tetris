var CACHE_NAME = 'tetris-cache';
var urlsToCache = [
	'/tetris/index.html',
	'/tetris/main.css',
	'/tetris/main.js',
	'/tetris/jquery.min.js',
	'/tetris/logo.png'
/*	'/tetris/tetris-gameboy-01.mp3',
	'/tetris/tetris-gameboy-02.mp3',
	'/tetris/tetris-gameboy-03.mp3',
	'/tetris/tetris-gameboy-04.mp3',
	'/tetris/tetris-gameboy-05.mp3',
	'/tetris/line-drop.mp3',
	'/tetris/block-rotate.mp3',
	'/tetris/line-remove.mp3',
	'/tetris/gameover.mp3' */
];

// Install Event
self.addEventListener('install', function(event) {
	console.log("[SW] install event: ",event);
	// Perform install steps
	event.waitUntil(
		caches.open(CACHE_NAME).then(
			function(cache) {
				console.log('[SW] Opened cache: ',cache);
				return cache.addAll(urlsToCache);
			}
		)
	);
});


// Fetch Event
self.addEventListener('fetch', function(event) {
	console.log("[SW] fetch event: ",event);
	event.respondWith(
		caches.match(event.request).then(
			function(response) {
				// Cache hit - return response
				if (response) return response;
				else {
					fetch(event.request).then(
						// Try to cache new requests directly 
						function(response) {
							// Check if we received a valid response
							if(!response || response.status !== 200 || response.type !== 'basic') return response;
							// IMPORTANT: Clone the response. A response is a stream
							// and because we want the browser to consume the response
							// as well as the cache consuming the response, we need
							// to clone it so we have two streams.
							var responseToCache = response.clone();
							caches.open(CACHE_NAME).then(
								function(cache) {
									cache.put(event.request, responseToCache);
								}
							);
							return response;
						}
					);
				}
			}
		)
	);
});

