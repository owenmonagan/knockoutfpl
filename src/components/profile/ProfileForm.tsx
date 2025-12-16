import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export interface ProfileFormProps {
  displayName: string;
  email: string;
  onUpdateDisplayName: (name: string) => Promise<void>;
  isLoading: boolean;
}

export function ProfileForm({ displayName, email, onUpdateDisplayName, isLoading }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(displayName);

  const handleEditClick = () => {
    setEditedName(displayName);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedName(displayName);
  };

  return (
    <Card role="article">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm">Save</Button>
                <Button variant="outline" size="sm" onClick={handleCancelClick}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Display Name</Label>
                <p className="text-sm">{displayName}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
