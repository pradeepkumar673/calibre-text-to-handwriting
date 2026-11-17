import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import { Sparkles } from '@/lib/icons';

// Generator section. Empty state only until text conversion is built.
export default function GeneratorPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Generator</h1>
        <p className="text-muted-foreground">Turn pasted text into handwritten pages.</p>
      </header>
      <EmptyState
        icon={Sparkles}
        title="No text to convert yet"
        description="Paste or type text, choose a handwriting style, and generate pages here."
        action={
          <Button disabled className="min-h-11">
            Paste text
          </Button>
        }
        note="Generation arrives in a later phase."
      />
    </div>
  );
}
