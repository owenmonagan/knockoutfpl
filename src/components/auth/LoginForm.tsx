import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function LoginForm() {
  return (
    <form>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" />
      </div>
      <Button type="submit">Log In</Button>
    </form>
  );
}
