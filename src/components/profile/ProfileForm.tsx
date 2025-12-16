import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

export interface ProfileFormProps {
  displayName: string;
  email: string;
  onUpdateDisplayName: (name: string) => Promise<void>;
  isLoading: boolean;
}

export function ProfileForm({ displayName, email, onUpdateDisplayName, isLoading }: ProfileFormProps) {
  return (
    <Card role="article">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Display Name</Label>
              <p className="text-sm">{displayName}</p>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
