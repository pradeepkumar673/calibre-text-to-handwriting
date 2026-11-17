import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

// localStorage key. Must match the key read by the inline script in index.html.
// Stores a UI preference only, never document data.
export const THEME_STORAGE_KEY = 'calligraphewrite-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function readStoredMode(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

function writeStoredMode(mode: ThemeMode): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage is blocked (for example in some private modes). The choice still applies for this session.
  }
}

// Adds or removes the "dark" class on <html> to match the given mode.
export function applyThemeClass(mode: ThemeMode): void {
  const prefersDark = window.matchMedia(DARK_QUERY).matches;
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  mode: readStoredMode(),

  setMode: (mode) => {
    writeStoredMode(mode);
    applyThemeClass(mode);
    set({ mode });
  },
}));

// Apply the stored mode once at startup. The inline script has usually done this already, so this keeps the two in agreement.
applyThemeClass(useThemeStore.getState().mode);

// Follow operating system changes while the mode is System.
window.matchMedia(DARK_QUERY).addEventListener('change', () => {
  if (useThemeStore.getState().mode === 'system') {
    applyThemeClass('system');
  }
});

// Typed hooks. Each selects one value or one action, so components re-render only when that value changes.
export const useThemeMode = () => useThemeStore((state) => state.mode);
export const useSetThemeMode = () => useThemeStore((state) => state.setMode);
