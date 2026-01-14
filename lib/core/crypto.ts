import 'react-native-get-random-values';

// Store the native randomUUID if it exists (before we polyfill)
const nativeRandomUUID = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID.bind(crypto) : null;

/**
 * Generate a UUID v4 compatible with React Native
 */
export function generateUUID(): `${string}-${string}-${string}-${string}-${string}` {
  // Use native crypto.randomUUID if it was available before polyfill
  if (nativeRandomUUID) {
    return nativeRandomUUID();
  }
  
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }) as `${string}-${string}-${string}-${string}-${string}`;
}

// Polyfill crypto.randomUUID for all platforms if not available
// Ensure global crypto object exists
if (typeof global !== 'undefined') {
  if (!global.crypto) {
    global.crypto = {} as any;
  }
  // Add randomUUID if it doesn't exist
  if (!global.crypto.randomUUID) {
    global.crypto.randomUUID = generateUUID;
  }
}

// Also polyfill on the crypto global if it exists
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  (crypto as any).randomUUID = generateUUID;
}

// For web environments that might not have randomUUID
if (typeof window !== 'undefined' && window.crypto && !window.crypto.randomUUID) {
  (window.crypto as any).randomUUID = generateUUID;
}

export default generateUUID;