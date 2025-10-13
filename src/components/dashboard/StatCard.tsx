import { Card } from '../ui/card';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatCard(props: StatCardProps) {
  return <Card role="article" />;
}
