# Tournament Creation Bug Report

**Date:** 2025-12-28
**Status:** In Progress
**Severity:** High - Blocks tournament creation

---

## Problem

Tournament creation fails partway through, resulting in incomplete data:
- Some records created (entries, tournament, rounds)
- Other records fail (participants, matches, match_picks)

---

## Required Data Flow

The correct tournament creation sequence must respect foreign key constraints and ensure all referenced records exist before dependent records are created.

```
1. Fetch FPL Data
   ├── Get entries from FPL API
   └── Get picks for current/recent gameweeks

2. Populate FPL Records Layer
   ├── Upsert entries to database
   └── Upsert picks (including placeholders for unfinished and not started gameweeks) (theres always 38)

3. Create Tournament Structure
   ├── Create tournament record
   └── Create participants (with initial seed, linked to entries)

4. Create Bracket
   ├── Select all participants
   ├── Create and calcualte rounds (one per elimination stage)
   ├── Create matches (based on bracket structure)
   └── Create match_picks for the first round (linking entry, particpant and picks to matches)

5. Update Bracket
   - as gameweeks conclude - select all rounds across all tournaments that have matches not marked as complete but should be.
   - for each match update the entry picks if completed picks missing
   - declare the winner on the match object
   - once both source matches have a winner entry
   - create the match_picks for those entries
   - repeat until conclusion
```

---

## Foreign Key Dependencies

### Schema Relationships

```
Entry (FPL team data)
  ↑
  ├── Participant.entry (required)
  ├── MatchPick.entry (required)
  └── Pick.entry (required)

Pick (gameweek scores)
  ↑
  └── Used for match score lookups

Tournament
  ↑
  ├── Round.tournament
  ├── Participant.tournament
  ├── Match.tournament
  └── MatchPick (via tournamentId)
```

### Creation Order

1. **Entries** - Must exist before participants/match_picks
2. **Picks** - Must exist (even as placeholders) for score lookups
3. **Tournament** - Must exist before rounds/participants/matches
4. **Rounds** - Must exist before matches reference roundNumber
5. **Participants** - Must exist before match assignments
6. **Matches** - Must exist before match_picks
7. **MatchPicks** - Created last, links participants to matches

---

## Current Implementation Gap

### What We Have
- Entry upsert during tournament creation
- Tournament, round, participant, match, match_pick creation

### What We're Missing
- **Pick records are not being created**
- Picks need to exist (even as placeholders) for:
  - FK constraints to be satisfied
  - Score lookups when gameweek completes

---

## Proposed Fix

### Step 1: Add Pick Initialization

When creating a tournament, also create placeholder Pick records:

```typescript
interface PickRecord {
  entryId: number;
  event: number;  // gameweek
  points: number; // 0 for placeholder
  rawJson: string;
  isFinal: boolean; // false until gameweek completes
}

// For each participant, create picks for tournament gameweeks
for (const entry of entries) {
  for (let event = startEvent; event <= startEvent + totalRounds; event++) {
    await upsertPickAdmin({
      entryId: entry.entryId,
      event,
      points: 0,
      rawJson: '{}',
      isFinal: false,
    });
  }
}
```

### Step 2: Update Creation Order

```typescript
async function writeTournamentToDatabase(...) {
  // 1. Create entries (FPL team data)
  for (const entry of records.entries) {
    await upsertEntryAdmin(entry);
  }

  // 2. Create placeholder picks for tournament gameweeks
  for (const entry of records.entries) {
    for (const round of records.rounds) {
      await upsertPickAdmin({
        entryId: entry.entryId,
        event: round.event,
        points: 0,
        rawJson: '{}',
        isFinal: false,
      });
    }
  }

  // 3. Create tournament
  await createTournamentAdmin(records.tournament);

  // 4. Create rounds
  for (const round of records.rounds) {
    await createRoundAdmin(round);
  }

  // 5. Create participants
  for (const participant of records.participants) {
    await createParticipantAdmin(participant);
  }

  // 6. Create matches
  for (const match of records.matchRecords) {
    await createMatchAdmin(match);
  }

  // 7. Create match picks
  for (const pick of records.matchPicks) {
    await createMatchPickAdmin(pick);
  }
}
```

---

## Testing Plan

1. Clear emulator database
2. Restart emulators
3. Create test user
4. Navigate to league page
5. Click "Create Tournament"
6. Verify in database:
   - All entries created
   - All picks created (placeholders)
   - Tournament created
   - All rounds created
   - All participants created
   - All matches created (should be 3 for 4-person bracket)
   - All match_picks created (should be 4 for round 1)

---

## Related Files

- `functions/src/createTournament.ts` - Main tournament creation logic
- `functions/src/dataconnect-mutations.ts` - Database mutation functions
- `dataconnect/schema/schema.gql` - Schema with FK constraints
