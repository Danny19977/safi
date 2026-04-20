(function () {
  "use strict";

  // Only run on the production origin.
  if (window.location.origin !== "https://safiagroup.com") {
    return;
  }

  // Increase this value to force a new one-time cleanup in users' browsers.
  var CLEANUP_VERSION = "2026-03-09-v2";
  var FLAG_KEY = "safi_cache_cleanup_version";

  if (window.localStorage.getItem(FLAG_KEY) === CLEANUP_VERSION) {
    return;
  }

  (async function runCleanupOnce() {
    try {
      if ("caches" in window) {
        var cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map(function (key) {
          return window.caches.delete(key);
        }));
      }

      if ("serviceWorker" in navigator) {
        var registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(function (registration) {
          return registration.unregister();
        }));
      }

      window.sessionStorage.clear();
      window.localStorage.clear();
      window.localStorage.setItem(FLAG_KEY, CLEANUP_VERSION);
    } catch (error) {
      console.error("One-time cache cleanup failed:", error);
    }
  })();
})();
