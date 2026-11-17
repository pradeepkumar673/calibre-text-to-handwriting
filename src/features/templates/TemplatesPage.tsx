import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import { LayoutTemplate } from '@/lib/icons';

// Templates section. Empty state only until saved layouts are built.
export default function TemplatesPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">Save and reuse page layouts.</p>
      </header>
      <EmptyState
        icon={LayoutTemplate}
        title="No templates saved"
        description="Save a page layout here to reuse it for future pages."
        action={
          <Button disabled className="min-h-11">
            Save as template
          </Button>
        }
        note="Templates arrive in a later phase."
      />
    </div>
  );
}
