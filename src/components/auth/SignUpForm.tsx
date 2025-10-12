import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function SignUpForm() {
  return (
    <form>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </div>
      <div>
        <Label htmlFor="displayName">Display Name</Label>
        <Input id="displayName" type="text" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" type="password" />
      </div>
      <Button type="submit">Sign Up</Button>
    </form>
  );
}
