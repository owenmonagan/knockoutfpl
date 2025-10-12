import { Label } from '../ui/label';
import { Input } from '../ui/input';

export function SignUpForm() {
  return (
    <form>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </div>
    </form>
  );
}
