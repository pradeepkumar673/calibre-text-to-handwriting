import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useDismissToast,
  useSetActiveRoute,
  useSetMobileNavOpen,
  useSidebarOpen,
  useToasts,
} from '@/store';
import Header from './Header';
import MobileDrawer from './MobileDrawer';
import SideNav from './SideNav';

// Matches Tailwind's md breakpoint. Below it, the side navigation becomes a drawer.
const DESKTOP_QUERY = '(min-width: 768px)';

// App shell. CSS grid with a header row and a content row. The sidebar and the main area each scroll on their own.
export default function AppShell() {
  const { pathname } = useLocation();
  const sidebarOpen = useSidebarOpen();
  const toasts = useToasts();
  const dismissToast = useDismissToast();
  const setActiveRoute = useSetActiveRoute();
  const setMobileNavOpen = useSetMobileNavOpen();

  // Keep the store in step with the URL (including back and forward), and close the drawer on every route change.
  useEffect(() => {
    setActiveRoute(pathname);
    setMobileNavOpen(false);
  }, [pathname, setActiveRoute, setMobileNavOpen]);

  // Close the drawer if the window grows to desktop width while it is open.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryList | MediaQueryListEvent) => {
      if (event.matches) {
        setMobileNavOpen(false);
      }
    };
    handleChange(query);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [setMobileNavOpen]);

  return (
    <div
      className={cn(
        'grid h-dvh grid-cols-1 grid-rows-[auto_minmax(0,1fr)] bg-background',
        sidebarOpen ? 'md:grid-cols-[15rem_minmax(0,1fr)]' : 'md:grid-cols-[minmax(0,1fr)]',
      )}
    >
      <Header />

      {sidebarOpen && (
        <aside className="hidden min-h-0 overflow-y-auto border-r md:block">
          <SideNav />
        </aside>
      )}

      <main className="min-h-0 min-w-0 overflow-y-auto p-4 sm:p-6">
        <Outlet />
      </main>

      <MobileDrawer />

      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'rounded-md border bg-background p-3 shadow-md',
              toast.variant === 'success' && 'border-green-600',
              toast.variant === 'error' && 'border-destructive',
            )}
          >
            <p className="font-medium">{toast.title}</p>
            {toast.description && (
              <p className="text-sm text-muted-foreground">{toast.description}</p>
            )}
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => dismissToast(toast.id)}
            >
              Dismiss
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
