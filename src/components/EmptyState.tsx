import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from '@/lib/icons';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  note?: string;
}

// Shared empty-state panel. Built on shadcn Card so every empty state looks the same.
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  note,
}: EmptyStateProps) {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {(action || note) && (
        <CardContent className="flex flex-col items-center gap-3 text-center">
          {action}
          {note && <p className="text-sm text-muted-foreground">{note}</p>}
        </CardContent>
      )}
    </Card>
  );
}
