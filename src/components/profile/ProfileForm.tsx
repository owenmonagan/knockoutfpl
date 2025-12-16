import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

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
        {/* Display name editing will go here */}
      </CardContent>
    </Card>
  );
}
