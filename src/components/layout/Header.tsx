import { Button } from '@/components/ui/button';
import { Menu, Moon, X } from '@/lib/icons';
import { useMobileNavOpen, useSetMobileNavOpen, useSidebarOpen, useToggleSidebar } from '@/store';

// Top bar. Shows the menu button for the drawer on mobile and the sidebar toggle on desktop.
export default function Header() {
  const sidebarOpen = useSidebarOpen();
  const toggleSidebar = useToggleSidebar();
  const mobileNavOpen = useMobileNavOpen();
  const setMobileNavOpen = useSetMobileNavOpen();

  return (
    <header className="col-span-full flex items-center gap-2 border-b bg-background px-3 py-2 sm:gap-3 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 md:hidden"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        aria-label="Open navigation menu"
        aria-expanded={mobileNavOpen}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden h-11 w-11 md:inline-flex"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Hide side navigation' : 'Show side navigation'}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </Button>

      <span className="truncate font-semibold">CalligrapheWrite</span>

      <div className="ml-auto">
        {/* Placeholder. Theme switching is added in a later phase. */}
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11"
          aria-label="Theme (not yet available)"
          title="Theme switching: coming later"
        >
          <Moon className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
