import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

// Shared stand-in for sections that are not built yet. Each real screen replaces its placeholder in a later phase.
export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Placeholder. The real screen for this section arrives in a later phase.
        </p>
      </CardContent>
    </Card>
  );
}
