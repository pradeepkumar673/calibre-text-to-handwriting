import { NavLink } from 'react-router';
import { NAV_ITEMS } from '@/lib/navItems';
import { cn } from '@/lib/utils';

interface SideNavProps {
  // Called when a link is followed. The mobile drawer uses this to close itself.
  onNavigate?: () => void;
}

// Section links. Used both in the desktop sidebar and inside the mobile drawer.
export default function SideNav({ onNavigate }: SideNavProps) {
  return (
    <nav aria-label="Main" className="p-3">
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                  isActive && 'bg-accent font-medium',
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
