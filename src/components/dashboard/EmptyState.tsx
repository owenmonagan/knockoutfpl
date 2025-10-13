import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState(props: EmptyStateProps) {
  const { title, description, icon, actionLabel, onAction } = props;

  return (
    <Card role="article">
      <CardContent className="flex flex-col items-center justify-center p-6">
        {icon && icon}
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
        {actionLabel && <Button className="mt-4" onClick={onAction}>{actionLabel}</Button>}
      </CardContent>
    </Card>
  );
}
