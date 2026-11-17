import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/EmptyState';
import { Settings } from '@/lib/icons';
import ThemeSelect from './ThemeSelect';

// Settings section. Holds the working Appearance card and an empty-state panel for settings still to come.
export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Preferences for the app and exports.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how CalligrapheWrite looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelect />
        </CardContent>
      </Card>

      <EmptyState
        icon={Settings}
        title="No other settings yet"
        description="Export defaults and storage options will appear here."
        note="More settings arrive in later phases."
      />
    </div>
  );
}
