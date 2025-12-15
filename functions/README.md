# Knockout FPL - Firebase Cloud Functions

## Overview

This directory contains Firebase Cloud Functions for Knockout FPL, including:

1. **FPL API Proxy Functions** - Proxy requests to the FPL API to avoid CORS issues
2. **FPL Snapshot Capture** - Automated hourly snapshots of FPL data for the FLOAWO league

---

## FPL Snapshot Capture System

### Purpose

Captures complete FPL API data for the FLOAWO league (ID: 634129) hourly and stores it in Firestore. This provides:

- Historical data for analysis
- Point-in-time snapshots during gameweeks
- Backup of team picks, transfers, and scores

### Schedule

The `captureFloawoSnapshot` function runs hourly from 11:00 to 23:00 GMT (Europe/London timezone):

```
Schedule: 0 11-23 * * *
```

This covers typical Premier League match times (12:30 - 20:00 GMT on weekends).

### Firestore Document Structure

Snapshots are stored with the document ID format: `gw{N}-{ISO-timestamp}`

Example: `gw16-2025-12-15T22-22`

```
fpl_snapshots/{docId}
├── Main document (metadata):
│   ├── capturedAt: Timestamp
│   ├── gameweek: number
│   ├── gameweekStatus: 'not_started' | 'in_progress' | 'finished'
│   ├── leagueId: number
│   ├── leagueStandings: LeagueStandingsResponse
│   ├── eventStatus: EventStatusResponse
│   ├── liveScores: LiveResponse | null
│   ├── dreamTeam: DreamTeamResponse | null
│   ├── setPieceNotes: SetPieceResponse | null
│   └── teamCount: number
│
├── bootstrap/ (subcollection)
│   ├── metadata: { events, teams, element_types }
│   ├── elements_0: { elements: [...], startIndex, endIndex }
│   ├── elements_1: { elements: [...], startIndex, endIndex }
│   └── ... (players split into chunks of 100)
│
├── data/ (subcollection)
│   └── fixtures: { fixtures, fixturesCurrentGW }
│
└── teams/ (subcollection)
    ├── {teamId}: { entry, history, transfers, picks }
    └── ...
```

**Why split across multiple documents?**

Firestore has a 1MB document size limit. A full snapshot with 700+ players and all team data exceeds 3MB. The data is split as follows:

- Main document: ~100KB (metadata + league standings)
- Bootstrap metadata: ~50KB (gameweeks, teams, positions)
- Elements chunks: ~100KB each (100 players per chunk)
- Fixtures: ~50KB
- Each team: ~20-50KB

### Manual Trigger for Testing

Use the `triggerSnapshotCapture` callable function:

```bash
# Using the test script
npx tsx scripts/test-snapshot-capture.ts

# Or via Firebase CLI
firebase functions:shell
> triggerSnapshotCapture({})
```

### Data Captured

For each snapshot:

| Data | Source | Description |
|------|--------|-------------|
| Bootstrap Static | `/bootstrap-static/` | Gameweeks, teams, players, positions |
| Fixtures | `/fixtures/` | All season fixtures |
| Live Scores | `/event/{gw}/live/` | Current GW player points (if started) |
| Event Status | `/event-status/` | Bonus point status |
| Dream Team | `/dream-team/{gw}/` | Top scoring team (if started) |
| Set Piece Notes | `/team/set-piece-notes/` | Set piece taker info |
| League Standings | `/leagues-classic/{id}/standings/` | FLOAWO league table |

For each team in the league:

| Data | Source | Description |
|------|--------|-------------|
| Entry | `/entry/{id}/` | Team info and overall stats |
| History | `/entry/{id}/history/` | Past GW scores and chips used |
| Transfers | `/entry/{id}/transfers/` | All transfers made |
| Picks | `/entry/{id}/event/{gw}/picks/` | Current GW team selection |

---

## Development

### Build

```bash
cd functions
npm run build
```

### Deploy

```bash
firebase deploy --only functions
```

### Test Locally

```bash
# Start emulators
firebase emulators:start --only functions

# In another terminal, run tests
npm test
```

---

## Function List

| Function | Type | Description |
|----------|------|-------------|
| `getFPLBootstrapData` | Callable | Proxy for FPL bootstrap data |
| `getFPLTeamInfo` | Callable | Proxy for team entry data |
| `getFPLGameweekScore` | Callable | Proxy for team GW picks |
| `fplProxy` | HTTP | Generic FPL API proxy |
| `captureFloawoSnapshot` | Scheduled | Hourly FLOAWO data capture |
| `triggerSnapshotCapture` | Callable | Manual snapshot trigger |
