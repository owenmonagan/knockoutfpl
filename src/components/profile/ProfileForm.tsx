import { Card } from '../ui/card';

export interface ProfileFormProps {
  displayName: string;
  email: string;
  onUpdateDisplayName: (name: string) => Promise<void>;
  isLoading: boolean;
}

export function ProfileForm(props: ProfileFormProps) {
  return <Card role="article"></Card>;
}
