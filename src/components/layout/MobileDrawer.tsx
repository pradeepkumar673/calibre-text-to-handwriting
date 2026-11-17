import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useMobileNavOpen, useSetMobileNavOpen } from '@/store';
import SideNav from './SideNav';

// Navigation drawer for screens below 768px. Radix Dialog traps focus while open and closes on Escape.
export default function MobileDrawer() {
  const open = useMobileNavOpen();
  const setOpen = useSetMobileNavOpen();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-72 max-w-[85vw] overflow-y-auto p-0">
        <SheetHeader className="border-b p-4 pr-12 text-left">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Choose a section of CalligrapheWrite.</SheetDescription>
        </SheetHeader>
        <SideNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
