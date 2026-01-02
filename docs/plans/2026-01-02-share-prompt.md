# Share Prompt After Tournament Creation

## Overview

After a tournament is successfully created, display a modal prompting the user to share the bracket link with their league members. This encourages virality and helps participants find the tournament.

## URL Format

```
https://knockoutfpl.com/league/{fpl_league_id}
```

Example: `https://knockoutfpl.com/league/314159`

## Trigger Condition

Show the share modal **immediately after successful tournament creation**.

In `LeaguePage.tsx`, the `handleCreateTournament` function already:
1. Calls `callCreateTournament()`
2. Fetches the newly created tournament
3. Updates state with `setTournament(newTournament)`

Add a `showShareModal` state that becomes `true` after step 3 completes successfully.

## Component Structure

### New Component: `ShareTournamentDialog.tsx`

```
src/components/tournament/ShareTournamentDialog.tsx
```

Uses existing `Dialog` from `src/components/ui/dialog.tsx`.

**Props:**
```typescript
interface ShareTournamentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: number;
  leagueName: string;
}
```

## Modal Content

```
+------------------------------------------+
|                    X                      |
|                                           |
|        [Trophy icon]                      |
|                                           |
|     Tournament Created!                   |
|                                           |
|  Share this link with your league:        |
|                                           |
|  +------------------------------------+   |
|  | knockoutfpl.com/league/314159  [Copy]| |
|  +------------------------------------+   |
|                                           |
|            [ View Bracket ]               |
+------------------------------------------+
```

**Elements:**
1. Trophy icon (reuse existing `emoji_events` Material Symbol)
2. Title: "Tournament Created!"
3. Subtitle: "Share this link with your league:"
4. URL display with copy button (inline)
5. Primary CTA: "View Bracket" (closes modal, shows bracket)

## Copy Functionality

Use browser `navigator.clipboard.writeText()`:

```typescript
const handleCopy = async () => {
  await navigator.clipboard.writeText(shareUrl);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

Button shows "Copied!" briefly after click.

## State Management

**In `LeaguePage.tsx`:**

```typescript
const [showShareModal, setShowShareModal] = useState(false);

const handleCreateTournament = async (startEvent: number, matchSize: number) => {
  if (!leagueId || !user) return;

  await callCreateTournament(Number(leagueId), startEvent, matchSize);

  const newTournament = await getTournamentByLeague(Number(leagueId));
  if (newTournament) {
    setTournament(newTournament);
    setShowShareModal(true); // <-- Trigger modal
  }
};
```

**Render:**

```tsx
<ShareTournamentDialog
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  leagueId={Number(leagueId)}
  leagueName={leagueInfo?.name ?? 'Your League'}
/>
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/tournament/ShareTournamentDialog.tsx` | New component |
| `src/pages/LeaguePage.tsx` | Add `showShareModal` state, trigger after creation, render dialog |

## Testing

**Unit tests:**
- `ShareTournamentDialog` renders with correct URL
- Copy button calls clipboard API
- "View Bracket" button calls `onClose`

**E2E verification:**
- Create tournament flow shows modal
- Copy button copies correct URL
- Modal dismissible via X or "View Bracket"

## Out of Scope

- Social share buttons (Twitter, WhatsApp, etc.) - can add later
- Native share API (`navigator.share`) - can add later
- Toast notification instead of modal - staying with modal per spec
- Automatic navigation away - user stays on page, modal overlays

## Implementation Time

~30 minutes - straightforward dialog using existing components.
