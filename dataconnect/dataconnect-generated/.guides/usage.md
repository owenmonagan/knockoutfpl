# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertUser, connectFplEntry, upsertEntry, upsertPick, upsertLeague, upsertEvent, createTournament, updateTournamentStatus, setTournamentWinner, advanceTournamentRound } from '@knockoutfpl/dataconnect';


// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation ConnectFplEntry:  For variables, look at type ConnectFplEntryVars in ../index.d.ts
const { data } = await ConnectFplEntry(dataConnect, connectFplEntryVars);

// Operation UpsertEntry:  For variables, look at type UpsertEntryVars in ../index.d.ts
const { data } = await UpsertEntry(dataConnect, upsertEntryVars);

// Operation UpsertPick:  For variables, look at type UpsertPickVars in ../index.d.ts
const { data } = await UpsertPick(dataConnect, upsertPickVars);

// Operation UpsertLeague:  For variables, look at type UpsertLeagueVars in ../index.d.ts
const { data } = await UpsertLeague(dataConnect, upsertLeagueVars);

// Operation UpsertEvent:  For variables, look at type UpsertEventVars in ../index.d.ts
const { data } = await UpsertEvent(dataConnect, upsertEventVars);

// Operation CreateTournament:  For variables, look at type CreateTournamentVars in ../index.d.ts
const { data } = await CreateTournament(dataConnect, createTournamentVars);

// Operation UpdateTournamentStatus:  For variables, look at type UpdateTournamentStatusVars in ../index.d.ts
const { data } = await UpdateTournamentStatus(dataConnect, updateTournamentStatusVars);

// Operation SetTournamentWinner:  For variables, look at type SetTournamentWinnerVars in ../index.d.ts
const { data } = await SetTournamentWinner(dataConnect, setTournamentWinnerVars);

// Operation AdvanceTournamentRound:  For variables, look at type AdvanceTournamentRoundVars in ../index.d.ts
const { data } = await AdvanceTournamentRound(dataConnect, advanceTournamentRoundVars);


```