import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MatchesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Browse all matches - coming soon...</p>
      </CardContent>
    </Card>
  );
}
