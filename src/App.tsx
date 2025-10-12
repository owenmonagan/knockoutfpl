import { CompareTeams } from './components/CompareTeams'

function App() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col items-center gap-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">FPL Head-to-Head Showdown</h1>
        <p className="text-lg text-muted-foreground">
          Compare two Fantasy Premier League teams for any gameweek
        </p>
      </div>
      <CompareTeams />
    </div>
  )
}

export default App
