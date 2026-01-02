# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { getUser, getEntry, getEntries, getPick, getPicksForEvent, getLeague, getCurrentEvent, getEvent, getSeasonEvents, getTournament } from '@knockoutfpl/dataconnect';


// Operation GetUser:  For variables, look at type GetUserVars in ../index.d.ts
const { data } = await GetUser(dataConnect, getUserVars);

// Operation GetEntry:  For variables, look at type GetEntryVars in ../index.d.ts
const { data } = await GetEntry(dataConnect, getEntryVars);

// Operation GetEntries:  For variables, look at type GetEntriesVars in ../index.d.ts
const { data } = await GetEntries(dataConnect, getEntriesVars);

// Operation GetPick:  For variables, look at type GetPickVars in ../index.d.ts
const { data } = await GetPick(dataConnect, getPickVars);

// Operation GetPicksForEvent:  For variables, look at type GetPicksForEventVars in ../index.d.ts
const { data } = await GetPicksForEvent(dataConnect, getPicksForEventVars);

// Operation GetLeague:  For variables, look at type GetLeagueVars in ../index.d.ts
const { data } = await GetLeague(dataConnect, getLeagueVars);

// Operation GetCurrentEvent:  For variables, look at type GetCurrentEventVars in ../index.d.ts
const { data } = await GetCurrentEvent(dataConnect, getCurrentEventVars);

// Operation GetEvent:  For variables, look at type GetEventVars in ../index.d.ts
const { data } = await GetEvent(dataConnect, getEventVars);

// Operation GetSeasonEvents:  For variables, look at type GetSeasonEventsVars in ../index.d.ts
const { data } = await GetSeasonEvents(dataConnect, getSeasonEventsVars);

// Operation GetTournament:  For variables, look at type GetTournamentVars in ../index.d.ts
const { data } = await GetTournament(dataConnect, getTournamentVars);


```