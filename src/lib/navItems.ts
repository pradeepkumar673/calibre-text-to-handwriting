import {
  FileText,
  Home,
  LayoutTemplate,
  Pencil,
  Ruler,
  Settings,
  Sparkles,
  Users,
} from '@/lib/icons';
import type { LucideIcon } from '@/lib/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

// Order here is the order shown in the side navigation and the mobile drawer.
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/generator', label: 'Generator', icon: Sparkles },
  { to: '/editor', label: 'Editor', icon: Pencil },
  { to: '/profiles', label: 'Handwriting Profiles', icon: Users },
  { to: '/paper-designer', label: 'Paper Designer', icon: Ruler },
  { to: '/pdf-tools', label: 'PDF Tools', icon: FileText },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/settings', label: 'Settings', icon: Settings },
];
