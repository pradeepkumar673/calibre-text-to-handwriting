import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex max-w-xl flex-col items-start gap-4">
      <h1 className="text-3xl font-bold">404: Page not found</h1>
      <p className="text-muted-foreground">
        The page you asked for does not exist in CalligrapheWrite.
      </p>
      <Button asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
