import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import { Ruler } from '@/lib/icons';

// Paper designer section. Empty state only until paper settings are built.
export default function PaperDesignerPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Paper Designer</h1>
        <p className="text-muted-foreground">Set paper size, ruling, margins and colours.</p>
      </header>
      <EmptyState
        icon={Ruler}
        title="No paper designed yet"
        description="Choose a size such as A4, A5 or Letter, then pick a ruling style."
        action={
          <Button disabled className="min-h-11">
            New paper
          </Button>
        }
        note="The paper designer arrives in a later phase."
      />
    </div>
  );
}
