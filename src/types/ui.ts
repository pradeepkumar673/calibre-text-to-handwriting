export type ToastVariant = 'default' | 'success' | 'error';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

// State held by the UI slice.
export interface UiStateSlice {
  sidebarOpen: boolean;
  activeRoute: string;
  toasts: Toast[];
}

// Actions that change the UI slice.
export interface UiActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveRoute: (route: string) => void;
  pushToast: (toast: Omit<Toast, 'id'>) => number;
  dismissToast: (id: number) => void;
  clearToasts: () => void;
}

export type UiStore = UiStateSlice & UiActions;
