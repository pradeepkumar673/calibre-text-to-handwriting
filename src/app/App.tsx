import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from '@/lib/icons';

// Temporary design-system check page. Replaced by the real app shell in a later prompt.
export default function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center p-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            CalligrapheWrite
          </CardTitle>
          <CardDescription>Design system check</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            If this card has a border and the button below is styled, Tailwind and shadcn/ui are
            working.
          </p>
          <Button>Primary button</Button>
        </CardContent>
      </Card>
    </main>
  );
}
