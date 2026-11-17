import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Users } from '@/lib/icons';

// Home section: a short introduction and entry points to the two most common tasks.
export default function HomePage() {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to CalligrapheWrite</h1>
        <p className="text-muted-foreground">
          Turn pasted text into realistic handwritten pages, entirely in your browser.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>
            Pick a handwriting style, then generate your first page, or set up your own handwriting
            profile first.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="min-h-11">
            <Link to="/generator">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Open Generator
            </Link>
          </Button>
          <Button variant="outline" asChild className="min-h-11">
            <Link to="/profiles">
              <Users className="mr-2 h-4 w-4" aria-hidden="true" />
              Handwriting Profiles
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
