/**
 * Shared in-memory Server SSR Database Cache
 * Provides sub-millisecond HTML TTFB for public visitors
 * Can be instantly invalidated via invalidateServerSsrCache() when Admin saves changes
 */

let serverSsrDbCache = null;
let serverSsrDbTimestamp = 0;
const SSR_CACHE_TTL_MS = 60 * 1000; // 60s fallback TTL

export function getServerSsrDbCache() {
  const now = Date.now();
  if (serverSsrDbCache && (now - serverSsrDbTimestamp < SSR_CACHE_TTL_MS)) {
    return serverSsrDbCache;
  }
  return null;
}

export function setServerSsrDbCache(data) {
  serverSsrDbCache = data;
  serverSsrDbTimestamp = Date.now();
}

export function invalidateServerSsrCache() {
  serverSsrDbCache = null;
  serverSsrDbTimestamp = 0;
}
