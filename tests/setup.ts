import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { Blob as NodeBlob } from 'node:buffer';

// jsdom does not implement window.matchMedia, but the theme store and app shell call it.
// This stub reports "no match" for every query, which is the light, desktop-width default the tests expect.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom shims Blob with a custom class whose prototype getters are lost under fake-indexeddb's structuredClone.
// Polyfilling window.Blob and globalThis.Blob with Node's spec-compliant Blob allows fake-indexeddb to clone Blobs correctly.
if (typeof NodeBlob !== 'undefined') {
  globalThis.Blob = NodeBlob as unknown as typeof Blob;
  if (typeof window !== 'undefined') {
    window.Blob = NodeBlob as unknown as typeof Blob;
  }
}

// Globals are off in the Vitest config, so Testing Library cleanup must be registered by hand.
afterEach(() => {
  cleanup();
});
