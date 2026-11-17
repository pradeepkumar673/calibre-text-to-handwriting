import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

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

// Globals are off in the Vitest config, so Testing Library cleanup must be registered by hand.
afterEach(() => {
  cleanup();
});
