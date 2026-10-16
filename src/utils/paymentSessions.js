// In-memory payment session store for development & mock QR verification
const globalStore = globalThis._paymentSessionsStore || new Map();
if (!globalThis._paymentSessionsStore) {
  globalThis._paymentSessionsStore = globalStore;
}

export const paymentSessions = globalStore;
