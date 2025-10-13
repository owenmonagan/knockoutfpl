import { Card, CardContent } from '../ui/card';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatCard(props: StatCardProps) {
  const { label } = props;

  return (
    <Card role="article">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
