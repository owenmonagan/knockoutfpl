import { CompareTeams } from '../components/CompareTeams';

export function ComparePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Compare FPL Teams</h1>
      <CompareTeams />
    </main>
  );
}
