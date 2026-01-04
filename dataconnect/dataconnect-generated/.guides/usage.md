# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertUser, connectFplEntry, upsertEntry, upsertPick, upsertLeague, upsertLeagueEntriesBatch, deleteStaleLeagueEntries, upsertEvent, createTournament, createTournamentWithImportStatus } from '@knockoutfpl/dataconnect';


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

// Operation UpsertLeagueEntriesBatch:  For variables, look at type UpsertLeagueEntriesBatchVars in ../index.d.ts
const { data } = await UpsertLeagueEntriesBatch(dataConnect, upsertLeagueEntriesBatchVars);

// Operation DeleteStaleLeagueEntries:  For variables, look at type DeleteStaleLeagueEntriesVars in ../index.d.ts
const { data } = await DeleteStaleLeagueEntries(dataConnect, deleteStaleLeagueEntriesVars);

// Operation UpsertEvent:  For variables, look at type UpsertEventVars in ../index.d.ts
const { data } = await UpsertEvent(dataConnect, upsertEventVars);

// Operation CreateTournament:  For variables, look at type CreateTournamentVars in ../index.d.ts
const { data } = await CreateTournament(dataConnect, createTournamentVars);

// Operation CreateTournamentWithImportStatus:  For variables, look at type CreateTournamentWithImportStatusVars in ../index.d.ts
const { data } = await CreateTournamentWithImportStatus(dataConnect, createTournamentWithImportStatusVars);


```