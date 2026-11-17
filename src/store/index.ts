// Single entry point for the UI store. Components use these typed hooks instead of the raw store.
// Each hook selects one value or one action, so a component re-renders only when its value changes.
import { useUiStore } from './uiStore';

export { useUiStore } from './uiStore';

export const useSidebarOpen = () => useUiStore((state) => state.sidebarOpen);
export const useActiveRoute = () => useUiStore((state) => state.activeRoute);
export const useToasts = () => useUiStore((state) => state.toasts);

export const useToggleSidebar = () => useUiStore((state) => state.toggleSidebar);
export const useSetSidebarOpen = () => useUiStore((state) => state.setSidebarOpen);
export const useSetActiveRoute = () => useUiStore((state) => state.setActiveRoute);
export const usePushToast = () => useUiStore((state) => state.pushToast);
export const useDismissToast = () => useUiStore((state) => state.dismissToast);
export const useClearToasts = () => useUiStore((state) => state.clearToasts);
