import { Card, CardContent } from '../ui/card';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatCard(props: StatCardProps) {
  const { label, value } = props;

  return (
    <Card role="article">
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
