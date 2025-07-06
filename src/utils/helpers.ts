export const generateUniqueId = () => {
  const globalCrypto = typeof globalThis !== 'undefined' && globalThis.crypto;
  if (globalCrypto && typeof globalCrypto.getRandomValues === 'function') {
    return `id-${Date.now()}-${globalCrypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(2, 11)}`;
  } else {
    // Node.js fallback
    const { randomBytes } = require('crypto');
    return `id-${Date.now()}-${randomBytes(4).toString('hex')}`;
  }
};