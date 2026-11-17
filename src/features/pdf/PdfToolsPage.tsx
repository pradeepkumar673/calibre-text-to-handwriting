import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import { FileText } from '@/lib/icons';

// PDF tools section. Empty state only until PDF loading is built.
export default function PdfToolsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">PDF Tools</h1>
        <p className="text-muted-foreground">Load and edit existing handwritten PDFs.</p>
      </header>
      <EmptyState
        icon={FileText}
        title="No PDF loaded"
        description="Load an existing handwritten PDF to edit it in CalligrapheWrite."
        action={
          <Button disabled className="min-h-11">
            Load PDF
          </Button>
        }
        note="PDF loading arrives in a later phase."
      />
    </div>
  );
}
