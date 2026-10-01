/* ============================================================
   BOARDINGPAY SERVICE WORKER
   OFFLINE CACHE / PWA SUPPORT
============================================================ */

const CACHE_NAME = "boardingpay-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./admin-dashboard.html",
    "./admin-register.html",
    "./announcements.html",
    "./contact.html",
    "./create-account.html",
    "./forgot-password.html",
    "./get-started.html",
    "./history.html",
    "./landlord-dashboard.html",
    "./landlord-register.html",
    "./login.html",
    "./payment-details.html",
    "./payment-success.html",
    "./paymentmethod.html",
    "./profile.html",
    "./settings.html",
    "./tenant-dashboard.html",
    "./tenant-register.html",
    "./script.js",
    "./style.css",
    "./sw.js"
];


/* ============================================================
   INSTALL
============================================================ */

self.addEventListener("install", event => {

    console.log("[BoardingPay SW] Installing...");

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                console.log(
                    "[BoardingPay SW] Caching app files..."
                );

                return cache.addAll(APP_FILES);

            })
            .then(() => {

                console.log(
                    "[BoardingPay SW] Cache complete."
                );

                return self.skipWaiting();

            })

    );

});


/* ============================================================
   ACTIVATE
============================================================ */

self.addEventListener("activate", event => {

    console.log("[BoardingPay SW] Activating...");

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames

                        .filter(cacheName => {

                            return (
                                cacheName.startsWith("boardingpay-") &&
                                cacheName !== CACHE_NAME
                            );

                        })

                        .map(oldCache => {

                            return caches.delete(oldCache);

                        })

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


/* ============================================================
   FETCH
   OFFLINE FIRST
============================================================ */

self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(request)

            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)

                    .then(networkResponse => {

                        if (
                            networkResponse &&
                            networkResponse.ok &&
                            networkResponse.type === "basic"
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                });

                        }

                        return networkResponse;

                    })

                    .catch(() => {

                        if (
                            request.destination === "document"
                        ) {

                            return caches.match(
                                "./index.html"
                            );

                        }

                        return new Response(
                            "",
                            {
                                status: 503,
                                statusText: "Offline"
                            }
                        );

                    });

            })

    );

});


/* ============================================================
   MESSAGE HANDLER
============================================================ */

self.addEventListener("message", event => {

    if (!event.data) {
        return;
    }

    if (event.data.action === "SKIP_WAITING") {

        self.skipWaiting();

    }

    if (event.data.action === "CLEAR_CACHE") {

        event.waitUntil(

            caches.keys()
                .then(cacheNames => {

                    return Promise.all(

                        cacheNames

                            .filter(name =>
                                name.startsWith(
                                    "boardingpay-"
                                )
                            )

                            .map(name =>
                                caches.delete(name)
                            )

                    );

                })

        );

    }

});
