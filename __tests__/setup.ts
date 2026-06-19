import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Suppress Next.js-specific console noise in tests
global.console.error = vi.fn();

// Polyfill crypto.randomUUID for jsdom
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => '00000000-0000-0000-0000-000000000000',
      getRandomValues: (arr: Uint8Array) => arr,
    },
  });
}
