import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import { Users } from '@/lib/icons';

// Handwriting profiles section. Empty state only until profile creation is built.
export default function ProfilesPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Handwriting Profiles</h1>
        <p className="text-muted-foreground">
          Choose a preloaded style or build your own from a scanned sample sheet.
        </p>
      </header>
      <EmptyState
        icon={Users}
        title="No handwriting profiles yet"
        description="Use one of the ten preloaded styles, or create a profile from your own handwriting."
        action={
          <Button disabled className="min-h-11">
            Create profile
          </Button>
        }
        note="Profiles arrive in a later phase."
      />
    </div>
  );
}
