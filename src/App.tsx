import { CompareTeams } from './components/CompareTeams'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card'

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>FPL Head-to-Head Showdown</CardTitle>
        <CardDescription>Compare two Fantasy Premier League teams for any gameweek</CardDescription>
      </CardHeader>
      <CardContent>
        <CompareTeams />
      </CardContent>
    </Card>
  )
}

export default App
