import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Home,
  LayoutTemplate,
  Menu,
  Pencil,
  Ruler,
  Settings,
  Sparkles,
  Users,
  X,
} from '@/lib/icons';
import type { LucideIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  useActiveRoute,
  useDismissToast,
  usePushToast,
  useSetActiveRoute,
  useSidebarOpen,
  useToasts,
  useToggleSidebar,
} from '@/store';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/generator', label: 'Generator', icon: Sparkles },
  { to: '/editor', label: 'Editor', icon: Pencil },
  { to: '/profiles', label: 'Handwriting profiles', icon: Users },
  { to: '/paper-designer', label: 'Paper designer', icon: Ruler },
  { to: '/pdf-tools', label: 'PDF tools', icon: FileText },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/settings', label: 'Settings', icon: Settings },
];

// App shell: sidebar, header, toast viewport and the outlet where route pages render.
export default function App() {
  const { pathname } = useLocation();
  const sidebarOpen = useSidebarOpen();
  const toggleSidebar = useToggleSidebar();
  const setActiveRoute = useSetActiveRoute();
  const activeRoute = useActiveRoute();
  const toasts = useToasts();
  const pushToast = usePushToast();
  const dismissToast = useDismissToast();

  // Keep the store's activeRoute in step with the browser location, including back and forward.
  useEffect(() => {
    setActiveRoute(pathname);
  }, [pathname, setActiveRoute]);

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <aside className="w-60 shrink-0 border-r p-4">
          <nav aria-label="Main">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent',
                        isActive && 'bg-accent font-medium',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="font-semibold">CalligrapheWrite</span>
          <span className="text-sm text-muted-foreground">Route: {activeRoute}</span>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pushToast({
                  title: 'Test notification',
                  description: 'The UI store added this toast.',
                  variant: 'success',
                })
              }
            >
              Send test toast
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <div aria-live="polite" className="fixed bottom-4 right-4 flex w-80 flex-col gap-2">
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
