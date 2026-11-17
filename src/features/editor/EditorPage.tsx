import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import { Pencil } from '@/lib/icons';

// Editor section. Empty state only until the page editor is built.
export default function EditorPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Editor</h1>
        <p className="text-muted-foreground">
          Select, erase, add, replace and annotate generated pages.
        </p>
      </header>
      <EmptyState
        icon={Pencil}
        title="No page open"
        description="Open a generated page to start editing it."
        action={
          <Button disabled className="min-h-11">
            Open a page
          </Button>
        }
        note="The editor arrives in a later phase."
      />
    </div>
  );
}
