import { create } from 'zustand';
import type { UiStateSlice, UiStore } from '@/types/ui';

// Module-level counter gives each toast a unique id without relying on crypto.randomUUID,
// which is unavailable on non-HTTPS LAN addresses.
let nextToastId = 1;

const initialState: UiStateSlice = {
  sidebarOpen: true,
  mobileNavOpen: false,
  activeRoute: '/',
  toasts: [],
};

export const useUiStore = create<UiStore>()((set) => ({
  ...initialState,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

  setActiveRoute: (route) => set({ activeRoute: route }),

  pushToast: (toast) => {
    const id = nextToastId;
    nextToastId += 1;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}));
