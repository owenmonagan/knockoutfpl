# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUser*](#getuser)
  - [*GetEntry*](#getentry)
  - [*GetEntries*](#getentries)
  - [*GetPick*](#getpick)
  - [*GetPicksForEvent*](#getpicksforevent)
  - [*GetLeague*](#getleague)
  - [*GetCurrentEvent*](#getcurrentevent)
  - [*GetEvent*](#getevent)
  - [*GetSeasonEvents*](#getseasonevents)
  - [*GetEventsNeedingFinalization*](#geteventsneedingfinalization)
  - [*GetFinalizedEvents*](#getfinalizedevents)
  - [*GetEventFinalization*](#geteventfinalization)
  - [*GetTournament*](#gettournament)
  - [*GetTournamentWithParticipants*](#gettournamentwithparticipants)
  - [*GetUserTournaments*](#getusertournaments)
  - [*GetLeagueTournaments*](#getleaguetournaments)
  - [*GetAllTournaments*](#getalltournaments)
  - [*GetTournamentRounds*](#gettournamentrounds)
  - [*GetRound*](#getround)
  - [*GetActiveRounds*](#getactiverounds)
  - [*GetPendingActiveRounds*](#getpendingactiverounds)
  - [*GetRoundMatches*](#getroundmatches)
  - [*GetMatch*](#getmatch)
  - [*GetMatchPicks*](#getmatchpicks)
  - [*GetAllTournamentMatchPicks*](#getalltournamentmatchpicks)
  - [*GetUserMatches*](#getusermatches)
  - [*GetParticipant*](#getparticipant)
  - [*GetActiveParticipants*](#getactiveparticipants)
  - [*GetUserParticipations*](#getuserparticipations)
  - [*GetRoundsInEvent*](#getroundsinevent)
  - [*GetTournamentParticipantsWithUsers*](#gettournamentparticipantswithusers)
  - [*GetExistingEmailQueue*](#getexistingemailqueue)
  - [*GetEntryMatchPicks*](#getentrymatchpicks)
  - [*GetUserVerdictMatchPicks*](#getuserverdictmatchpicks)
  - [*GetMatchParticipants*](#getmatchparticipants)
  - [*GetPickScores*](#getpickscores)
  - [*GetRoundMatchesWithPriority*](#getroundmatcheswithpriority)
- [**Mutations**](#mutations)
  - [*UpsertUser*](#upsertuser)
  - [*ConnectFplEntry*](#connectfplentry)
  - [*UpsertEntry*](#upsertentry)
  - [*UpsertPick*](#upsertpick)
  - [*UpsertLeague*](#upsertleague)
  - [*UpsertEvent*](#upsertevent)
  - [*CreateTournament*](#createtournament)
  - [*CreateTournamentWithImportStatus*](#createtournamentwithimportstatus)
  - [*UpdateTournamentImportProgress*](#updatetournamentimportprogress)
  - [*FinalizeTournamentImport*](#finalizetournamentimport)
  - [*UpdateTournamentStatus*](#updatetournamentstatus)
  - [*SetTournamentWinner*](#settournamentwinner)
  - [*AdvanceTournamentRound*](#advancetournamentround)
  - [*CreateRound*](#createround)
  - [*UpdateRound*](#updateround)
  - [*UpdateRoundUpdatedAt*](#updateroundupdatedat)
  - [*UpdateMatchUpdatedAt*](#updatematchupdatedat)
  - [*CreateParticipant*](#createparticipant)
  - [*UpdateParticipant*](#updateparticipant)
  - [*CreateMatch*](#creatematch)
  - [*UpdateMatch*](#updatematch)
  - [*CreateMatchPick*](#creatematchpick)
  - [*DeleteTournament*](#deletetournament)
  - [*DeleteMatchPicksByTournament*](#deletematchpicksbytournament)
  - [*DeleteMatchesByTournament*](#deletematchesbytournament)
  - [*DeleteRoundsByTournament*](#deleteroundsbytournament)
  - [*DeleteParticipantsByTournament*](#deleteparticipantsbytournament)
  - [*DeleteTournamentById*](#deletetournamentbyid)
  - [*CreateEmailQueueEntry*](#createemailqueueentry)
  - [*CreateParticipantLeagues*](#createparticipantleagues)
  - [*UpsertParticipantLeague*](#upsertparticipantleague)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@knockoutfpl/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@knockoutfpl/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@knockoutfpl/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUser
You can execute the `GetUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUser(vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUser(dc: DataConnect, vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRef:
```typescript
const name = getUserRef.operationName;
console.log(name);
```

### Variables
The `GetUser` query requires an argument of type `GetUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserVariables {
  uid: string;
}
```
### Return Type
Recall that executing the `GetUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserData {
  users: ({
    uid: string;
    email: string;
    entryId2025?: number | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & User_Key)[];
}
```
### Using `GetUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUser, GetUserVariables } from '@knockoutfpl/dataconnect';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  uid: ..., 
};

// Call the `getUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUser(getUserVars);
// Variables can be defined inline as well.
const { data } = await getUser({ uid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUser(dataConnect, getUserVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getUser(getUserVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRef, GetUserVariables } from '@knockoutfpl/dataconnect';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  uid: ..., 
};

// Call the `getUserRef()` function to get a reference to the query.
const ref = getUserRef(getUserVars);
// Variables can be defined inline as well.
const ref = getUserRef({ uid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRef(dataConnect, getUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetEntry
You can execute the `GetEntry` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getEntry(vars: GetEntryVariables): QueryPromise<GetEntryData, GetEntryVariables>;

interface GetEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEntryVariables): QueryRef<GetEntryData, GetEntryVariables>;
}
export const getEntryRef: GetEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEntry(dc: DataConnect, vars: GetEntryVariables): QueryPromise<GetEntryData, GetEntryVariables>;

interface GetEntryRef {
  ...
  (dc: DataConnect, vars: GetEntryVariables): QueryRef<GetEntryData, GetEntryVariables>;
}
export const getEntryRef: GetEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEntryRef:
```typescript
const name = getEntryRef.operationName;
console.log(name);
```

### Variables
The `GetEntry` query requires an argument of type `GetEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetEntryVariables {
  entryId: number;
}
```
### Return Type
Recall that executing the `GetEntry` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetEntryData {
  entries: ({
    entryId: number;
    season: string;
    name: string;
    playerFirstName?: string | null;
    playerLastName?: string | null;
    summaryOverallPoints?: number | null;
    summaryOverallRank?: number | null;
    summaryEventPoints?: number | null;
    summaryEventRank?: number | null;
    rawJson: string;
    cachedAt: TimestampString;
  } & Entry_Key)[];
}
```
### Using `GetEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEntry, GetEntryVariables } from '@knockoutfpl/dataconnect';

// The `GetEntry` query requires an argument of type `GetEntryVariables`:
const getEntryVars: GetEntryVariables = {
  entryId: ..., 
};

// Call the `getEntry()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEntry(getEntryVars);
// Variables can be defined inline as well.
const { data } = await getEntry({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEntry(dataConnect, getEntryVars);

console.log(data.entries);

// Or, you can use the `Promise` API.
getEntry(getEntryVars).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

### Using `GetEntry`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEntryRef, GetEntryVariables } from '@knockoutfpl/dataconnect';

// The `GetEntry` query requires an argument of type `GetEntryVariables`:
const getEntryVars: GetEntryVariables = {
  entryId: ..., 
};

// Call the `getEntryRef()` function to get a reference to the query.
const ref = getEntryRef(getEntryVars);
// Variables can be defined inline as well.
const ref = getEntryRef({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEntryRef(dataConnect, getEntryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.entries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

## GetEntries
You can execute the `GetEntries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getEntries(vars: GetEntriesVariables): QueryPromise<GetEntriesData, GetEntriesVariables>;

interface GetEntriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEntriesVariables): QueryRef<GetEntriesData, GetEntriesVariables>;
}
export const getEntriesRef: GetEntriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEntries(dc: DataConnect, vars: GetEntriesVariables): QueryPromise<GetEntriesData, GetEntriesVariables>;

interface GetEntriesRef {
  ...
  (dc: DataConnect, vars: GetEntriesVariables): QueryRef<GetEntriesData, GetEntriesVariables>;
}
export const getEntriesRef: GetEntriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEntriesRef:
```typescript
const name = getEntriesRef.operationName;
console.log(name);
```

### Variables
The `GetEntries` query requires an argument of type `GetEntriesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetEntriesVariables {
  entryIds: number[];
}
```
### Return Type
Recall that executing the `GetEntries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEntriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetEntriesData {
  entries: ({
    entryId: number;
    season: string;
    name: string;
    playerFirstName?: string | null;
    playerLastName?: string | null;
    summaryOverallPoints?: number | null;
    summaryOverallRank?: number | null;
    cachedAt: TimestampString;
  } & Entry_Key)[];
}
```
### Using `GetEntries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEntries, GetEntriesVariables } from '@knockoutfpl/dataconnect';

// The `GetEntries` query requires an argument of type `GetEntriesVariables`:
const getEntriesVars: GetEntriesVariables = {
  entryIds: ..., 
};

// Call the `getEntries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEntries(getEntriesVars);
// Variables can be defined inline as well.
const { data } = await getEntries({ entryIds: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEntries(dataConnect, getEntriesVars);

console.log(data.entries);

// Or, you can use the `Promise` API.
getEntries(getEntriesVars).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

### Using `GetEntries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEntriesRef, GetEntriesVariables } from '@knockoutfpl/dataconnect';

// The `GetEntries` query requires an argument of type `GetEntriesVariables`:
const getEntriesVars: GetEntriesVariables = {
  entryIds: ..., 
};

// Call the `getEntriesRef()` function to get a reference to the query.
const ref = getEntriesRef(getEntriesVars);
// Variables can be defined inline as well.
const ref = getEntriesRef({ entryIds: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEntriesRef(dataConnect, getEntriesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.entries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

## GetPick
You can execute the `GetPick` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPick(vars: GetPickVariables): QueryPromise<GetPickData, GetPickVariables>;

interface GetPickRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPickVariables): QueryRef<GetPickData, GetPickVariables>;
}
export const getPickRef: GetPickRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPick(dc: DataConnect, vars: GetPickVariables): QueryPromise<GetPickData, GetPickVariables>;

interface GetPickRef {
  ...
  (dc: DataConnect, vars: GetPickVariables): QueryRef<GetPickData, GetPickVariables>;
}
export const getPickRef: GetPickRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPickRef:
```typescript
const name = getPickRef.operationName;
console.log(name);
```

### Variables
The `GetPick` query requires an argument of type `GetPickVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPickVariables {
  entryId: number;
  event: number;
}
```
### Return Type
Recall that executing the `GetPick` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPickData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPickData {
  picks: ({
    entryId: number;
    event: number;
    points: number;
    totalPoints?: number | null;
    rank?: number | null;
    overallRank?: number | null;
    activeChip?: string | null;
    isFinal: boolean;
    rawJson: string;
    cachedAt: TimestampString;
  } & Pick_Key)[];
}
```
### Using `GetPick`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPick, GetPickVariables } from '@knockoutfpl/dataconnect';

// The `GetPick` query requires an argument of type `GetPickVariables`:
const getPickVars: GetPickVariables = {
  entryId: ..., 
  event: ..., 
};

// Call the `getPick()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPick(getPickVars);
// Variables can be defined inline as well.
const { data } = await getPick({ entryId: ..., event: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPick(dataConnect, getPickVars);

console.log(data.picks);

// Or, you can use the `Promise` API.
getPick(getPickVars).then((response) => {
  const data = response.data;
  console.log(data.picks);
});
```

### Using `GetPick`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPickRef, GetPickVariables } from '@knockoutfpl/dataconnect';

// The `GetPick` query requires an argument of type `GetPickVariables`:
const getPickVars: GetPickVariables = {
  entryId: ..., 
  event: ..., 
};

// Call the `getPickRef()` function to get a reference to the query.
const ref = getPickRef(getPickVars);
// Variables can be defined inline as well.
const ref = getPickRef({ entryId: ..., event: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPickRef(dataConnect, getPickVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.picks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.picks);
});
```

## GetPicksForEvent
You can execute the `GetPicksForEvent` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPicksForEvent(vars: GetPicksForEventVariables): QueryPromise<GetPicksForEventData, GetPicksForEventVariables>;

interface GetPicksForEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPicksForEventVariables): QueryRef<GetPicksForEventData, GetPicksForEventVariables>;
}
export const getPicksForEventRef: GetPicksForEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPicksForEvent(dc: DataConnect, vars: GetPicksForEventVariables): QueryPromise<GetPicksForEventData, GetPicksForEventVariables>;

interface GetPicksForEventRef {
  ...
  (dc: DataConnect, vars: GetPicksForEventVariables): QueryRef<GetPicksForEventData, GetPicksForEventVariables>;
}
export const getPicksForEventRef: GetPicksForEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPicksForEventRef:
```typescript
const name = getPicksForEventRef.operationName;
console.log(name);
```

### Variables
The `GetPicksForEvent` query requires an argument of type `GetPicksForEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPicksForEventVariables {
  event: number;
  entryIds: number[];
}
```
### Return Type
Recall that executing the `GetPicksForEvent` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPicksForEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPicksForEventData {
  picks: ({
    entryId: number;
    event: number;
    points: number;
    totalPoints?: number | null;
    rank?: number | null;
    isFinal: boolean;
  } & Pick_Key)[];
}
```
### Using `GetPicksForEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPicksForEvent, GetPicksForEventVariables } from '@knockoutfpl/dataconnect';

// The `GetPicksForEvent` query requires an argument of type `GetPicksForEventVariables`:
const getPicksForEventVars: GetPicksForEventVariables = {
  event: ..., 
  entryIds: ..., 
};

// Call the `getPicksForEvent()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPicksForEvent(getPicksForEventVars);
// Variables can be defined inline as well.
const { data } = await getPicksForEvent({ event: ..., entryIds: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPicksForEvent(dataConnect, getPicksForEventVars);

console.log(data.picks);

// Or, you can use the `Promise` API.
getPicksForEvent(getPicksForEventVars).then((response) => {
  const data = response.data;
  console.log(data.picks);
});
```

### Using `GetPicksForEvent`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPicksForEventRef, GetPicksForEventVariables } from '@knockoutfpl/dataconnect';

// The `GetPicksForEvent` query requires an argument of type `GetPicksForEventVariables`:
const getPicksForEventVars: GetPicksForEventVariables = {
  event: ..., 
  entryIds: ..., 
};

// Call the `getPicksForEventRef()` function to get a reference to the query.
const ref = getPicksForEventRef(getPicksForEventVars);
// Variables can be defined inline as well.
const ref = getPicksForEventRef({ event: ..., entryIds: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPicksForEventRef(dataConnect, getPicksForEventVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.picks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.picks);
});
```

## GetLeague
You can execute the `GetLeague` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLeague(vars: GetLeagueVariables): QueryPromise<GetLeagueData, GetLeagueVariables>;

interface GetLeagueRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeagueVariables): QueryRef<GetLeagueData, GetLeagueVariables>;
}
export const getLeagueRef: GetLeagueRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLeague(dc: DataConnect, vars: GetLeagueVariables): QueryPromise<GetLeagueData, GetLeagueVariables>;

interface GetLeagueRef {
  ...
  (dc: DataConnect, vars: GetLeagueVariables): QueryRef<GetLeagueData, GetLeagueVariables>;
}
export const getLeagueRef: GetLeagueRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLeagueRef:
```typescript
const name = getLeagueRef.operationName;
console.log(name);
```

### Variables
The `GetLeague` query requires an argument of type `GetLeagueVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLeagueVariables {
  leagueId: number;
  season: string;
}
```
### Return Type
Recall that executing the `GetLeague` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLeagueData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLeagueData {
  leagues: ({
    leagueId: number;
    season: string;
    name: string;
    created?: TimestampString | null;
    adminEntry?: number | null;
    rawJson: string;
    cachedAt: TimestampString;
  } & League_Key)[];
}
```
### Using `GetLeague`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLeague, GetLeagueVariables } from '@knockoutfpl/dataconnect';

// The `GetLeague` query requires an argument of type `GetLeagueVariables`:
const getLeagueVars: GetLeagueVariables = {
  leagueId: ..., 
  season: ..., 
};

// Call the `getLeague()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLeague(getLeagueVars);
// Variables can be defined inline as well.
const { data } = await getLeague({ leagueId: ..., season: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLeague(dataConnect, getLeagueVars);

console.log(data.leagues);

// Or, you can use the `Promise` API.
getLeague(getLeagueVars).then((response) => {
  const data = response.data;
  console.log(data.leagues);
});
```

### Using `GetLeague`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLeagueRef, GetLeagueVariables } from '@knockoutfpl/dataconnect';

// The `GetLeague` query requires an argument of type `GetLeagueVariables`:
const getLeagueVars: GetLeagueVariables = {
  leagueId: ..., 
  season: ..., 
};

// Call the `getLeagueRef()` function to get a reference to the query.
const ref = getLeagueRef(getLeagueVars);
// Variables can be defined inline as well.
const ref = getLeagueRef({ leagueId: ..., season: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLeagueRef(dataConnect, getLeagueVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.leagues);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.leagues);
});
```

## GetCurrentEvent
You can execute the `GetCurrentEvent` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCurrentEvent(vars: GetCurrentEventVariables): QueryPromise<GetCurrentEventData, GetCurrentEventVariables>;

interface GetCurrentEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCurrentEventVariables): QueryRef<GetCurrentEventData, GetCurrentEventVariables>;
}
export const getCurrentEventRef: GetCurrentEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentEvent(dc: DataConnect, vars: GetCurrentEventVariables): QueryPromise<GetCurrentEventData, GetCurrentEventVariables>;

interface GetCurrentEventRef {
  ...
  (dc: DataConnect, vars: GetCurrentEventVariables): QueryRef<GetCurrentEventData, GetCurrentEventVariables>;
}
export const getCurrentEventRef: GetCurrentEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentEventRef:
```typescript
const name = getCurrentEventRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentEvent` query requires an argument of type `GetCurrentEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCurrentEventVariables {
  season: string;
}
```
### Return Type
Recall that executing the `GetCurrentEvent` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCurrentEventData {
  events: ({
    event: number;
    season: string;
    name: string;
    deadlineTime: TimestampString;
    finished: boolean;
    isCurrent: boolean;
    isNext: boolean;
  } & Event_Key)[];
}
```
### Using `GetCurrentEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentEvent, GetCurrentEventVariables } from '@knockoutfpl/dataconnect';

// The `GetCurrentEvent` query requires an argument of type `GetCurrentEventVariables`:
const getCurrentEventVars: GetCurrentEventVariables = {
  season: ..., 
};

// Call the `getCurrentEvent()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentEvent(getCurrentEventVars);
// Variables can be defined inline as well.
const { data } = await getCurrentEvent({ season: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentEvent(dataConnect, getCurrentEventVars);

console.log(data.events);

// Or, you can use the `Promise` API.
getCurrentEvent(getCurrentEventVars).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `GetCurrentEvent`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentEventRef, GetCurrentEventVariables } from '@knockoutfpl/dataconnect';

// The `GetCurrentEvent` query requires an argument of type `GetCurrentEventVariables`:
const getCurrentEventVars: GetCurrentEventVariables = {
  season: ..., 
};

// Call the `getCurrentEventRef()` function to get a reference to the query.
const ref = getCurrentEventRef(getCurrentEventVars);
// Variables can be defined inline as well.
const ref = getCurrentEventRef({ season: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentEventRef(dataConnect, getCurrentEventVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## GetEvent
You can execute the `GetEvent` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getEvent(vars: GetEventVariables): QueryPromise<GetEventData, GetEventVariables>;

interface GetEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEventVariables): QueryRef<GetEventData, GetEventVariables>;
}
export const getEventRef: GetEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEvent(dc: DataConnect, vars: GetEventVariables): QueryPromise<GetEventData, GetEventVariables>;

interface GetEventRef {
  ...
  (dc: DataConnect, vars: GetEventVariables): QueryRef<GetEventData, GetEventVariables>;
}
export const getEventRef: GetEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEventRef:
```typescript
const name = getEventRef.operationName;
console.log(name);
```

### Variables
The `GetEvent` query requires an argument of type `GetEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetEventVariables {
  event: number;
  season: string;
}
```
### Return Type
Recall that executing the `GetEvent` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetEventData {
  events: ({
    event: number;
    season: string;
    name: string;
    deadlineTime: TimestampString;
    finished: boolean;
    isCurrent: boolean;
    isNext: boolean;
    rawJson: string;
    cachedAt: TimestampString;
  } & Event_Key)[];
}
```
### Using `GetEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEvent, GetEventVariables } from '@knockoutfpl/dataconnect';

// The `GetEvent` query requires an argument of type `GetEventVariables`:
const getEventVars: GetEventVariables = {
  event: ..., 
  season: ..., 
};

// Call the `getEvent()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEvent(getEventVars);
// Variables can be defined inline as well.
const { data } = await getEvent({ event: ..., season: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEvent(dataConnect, getEventVars);

console.log(data.events);

// Or, you can use the `Promise` API.
getEvent(getEventVars).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `GetEvent`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEventRef, GetEventVariables } from '@knockoutfpl/dataconnect';

// The `GetEvent` query requires an argument of type `GetEventVariables`:
const getEventVars: GetEventVariables = {
  event: ..., 
  season: ..., 
};

// Call the `getEventRef()` function to get a reference to the query.
const ref = getEventRef(getEventVars);
// Variables can be defined inline as well.
const ref = getEventRef({ event: ..., season: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEventRef(dataConnect, getEventVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## GetSeasonEvents
You can execute the `GetSeasonEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getSeasonEvents(vars: GetSeasonEventsVariables): QueryPromise<GetSeasonEventsData, GetSeasonEventsVariables>;

interface GetSeasonEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSeasonEventsVariables): QueryRef<GetSeasonEventsData, GetSeasonEventsVariables>;
}
export const getSeasonEventsRef: GetSeasonEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSeasonEvents(dc: DataConnect, vars: GetSeasonEventsVariables): QueryPromise<GetSeasonEventsData, GetSeasonEventsVariables>;

interface GetSeasonEventsRef {
  ...
  (dc: DataConnect, vars: GetSeasonEventsVariables): QueryRef<GetSeasonEventsData, GetSeasonEventsVariables>;
}
export const getSeasonEventsRef: GetSeasonEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSeasonEventsRef:
```typescript
const name = getSeasonEventsRef.operationName;
console.log(name);
```

### Variables
The `GetSeasonEvents` query requires an argument of type `GetSeasonEventsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSeasonEventsVariables {
  season: string;
}
```
### Return Type
Recall that executing the `GetSeasonEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSeasonEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSeasonEventsData {
  events: ({
    event: number;
    season: string;
    name: string;
    deadlineTime: TimestampString;
    finished: boolean;
    isCurrent: boolean;
    isNext: boolean;
  } & Event_Key)[];
}
```
### Using `GetSeasonEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSeasonEvents, GetSeasonEventsVariables } from '@knockoutfpl/dataconnect';

// The `GetSeasonEvents` query requires an argument of type `GetSeasonEventsVariables`:
const getSeasonEventsVars: GetSeasonEventsVariables = {
  season: ..., 
};

// Call the `getSeasonEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSeasonEvents(getSeasonEventsVars);
// Variables can be defined inline as well.
const { data } = await getSeasonEvents({ season: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSeasonEvents(dataConnect, getSeasonEventsVars);

console.log(data.events);

// Or, you can use the `Promise` API.
getSeasonEvents(getSeasonEventsVars).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `GetSeasonEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSeasonEventsRef, GetSeasonEventsVariables } from '@knockoutfpl/dataconnect';

// The `GetSeasonEvents` query requires an argument of type `GetSeasonEventsVariables`:
const getSeasonEventsVars: GetSeasonEventsVariables = {
  season: ..., 
};

// Call the `getSeasonEventsRef()` function to get a reference to the query.
const ref = getSeasonEventsRef(getSeasonEventsVars);
// Variables can be defined inline as well.
const ref = getSeasonEventsRef({ season: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSeasonEventsRef(dataConnect, getSeasonEventsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## GetEventsNeedingFinalization
You can execute the `GetEventsNeedingFinalization` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getEventsNeedingFinalization(vars: GetEventsNeedingFinalizationVariables): QueryPromise<GetEventsNeedingFinalizationData, GetEventsNeedingFinalizationVariables>;

interface GetEventsNeedingFinalizationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEventsNeedingFinalizationVariables): QueryRef<GetEventsNeedingFinalizationData, GetEventsNeedingFinalizationVariables>;
}
export const getEventsNeedingFinalizationRef: GetEventsNeedingFinalizationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEventsNeedingFinalization(dc: DataConnect, vars: GetEventsNeedingFinalizationVariables): QueryPromise<GetEventsNeedingFinalizationData, GetEventsNeedingFinalizationVariables>;

interface GetEventsNeedingFinalizationRef {
  ...
  (dc: DataConnect, vars: GetEventsNeedingFinalizationVariables): QueryRef<GetEventsNeedingFinalizationData, GetEventsNeedingFinalizationVariables>;
}
export const getEventsNeedingFinalizationRef: GetEventsNeedingFinalizationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEventsNeedingFinalizationRef:
```typescript
const name = getEventsNeedingFinalizationRef.operationName;
console.log(name);
```

### Variables
The `GetEventsNeedingFinalization` query requires an argument of type `GetEventsNeedingFinalizationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetEventsNeedingFinalizationVariables {
  season: string;
}
```
### Return Type
Recall that executing the `GetEventsNeedingFinalization` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEventsNeedingFinalizationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetEventsNeedingFinalizationData {
  events: ({
    event: number;
    season: string;
    name: string;
    finished: boolean;
    finalizedAt?: TimestampString | null;
    deadlineTime: TimestampString;
    rawJson: string;
    isCurrent: boolean;
    isNext: boolean;
  } & Event_Key)[];
}
```
### Using `GetEventsNeedingFinalization`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEventsNeedingFinalization, GetEventsNeedingFinalizationVariables } from '@knockoutfpl/dataconnect';

// The `GetEventsNeedingFinalization` query requires an argument of type `GetEventsNeedingFinalizationVariables`:
const getEventsNeedingFinalizationVars: GetEventsNeedingFinalizationVariables = {
  season: ..., 
};

// Call the `getEventsNeedingFinalization()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEventsNeedingFinalization(getEventsNeedingFinalizationVars);
// Variables can be defined inline as well.
const { data } = await getEventsNeedingFinalization({ season: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEventsNeedingFinalization(dataConnect, getEventsNeedingFinalizationVars);

console.log(data.events);

// Or, you can use the `Promise` API.
getEventsNeedingFinalization(getEventsNeedingFinalizationVars).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `GetEventsNeedingFinalization`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEventsNeedingFinalizationRef, GetEventsNeedingFinalizationVariables } from '@knockoutfpl/dataconnect';

// The `GetEventsNeedingFinalization` query requires an argument of type `GetEventsNeedingFinalizationVariables`:
const getEventsNeedingFinalizationVars: GetEventsNeedingFinalizationVariables = {
  season: ..., 
};

// Call the `getEventsNeedingFinalizationRef()` function to get a reference to the query.
const ref = getEventsNeedingFinalizationRef(getEventsNeedingFinalizationVars);
// Variables can be defined inline as well.
const ref = getEventsNeedingFinalizationRef({ season: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEventsNeedingFinalizationRef(dataConnect, getEventsNeedingFinalizationVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## GetFinalizedEvents
You can execute the `GetFinalizedEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getFinalizedEvents(vars: GetFinalizedEventsVariables): QueryPromise<GetFinalizedEventsData, GetFinalizedEventsVariables>;

interface GetFinalizedEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFinalizedEventsVariables): QueryRef<GetFinalizedEventsData, GetFinalizedEventsVariables>;
}
export const getFinalizedEventsRef: GetFinalizedEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFinalizedEvents(dc: DataConnect, vars: GetFinalizedEventsVariables): QueryPromise<GetFinalizedEventsData, GetFinalizedEventsVariables>;

interface GetFinalizedEventsRef {
  ...
  (dc: DataConnect, vars: GetFinalizedEventsVariables): QueryRef<GetFinalizedEventsData, GetFinalizedEventsVariables>;
}
export const getFinalizedEventsRef: GetFinalizedEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFinalizedEventsRef:
```typescript
const name = getFinalizedEventsRef.operationName;
console.log(name);
```

### Variables
The `GetFinalizedEvents` query requires an argument of type `GetFinalizedEventsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFinalizedEventsVariables {
  season: string;
}
```
### Return Type
Recall that executing the `GetFinalizedEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFinalizedEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetFinalizedEventsData {
  events: ({
    event: number;
    season: string;
    name: string;
    finished: boolean;
    finalizedAt?: TimestampString | null;
  } & Event_Key)[];
}
```
### Using `GetFinalizedEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFinalizedEvents, GetFinalizedEventsVariables } from '@knockoutfpl/dataconnect';

// The `GetFinalizedEvents` query requires an argument of type `GetFinalizedEventsVariables`:
const getFinalizedEventsVars: GetFinalizedEventsVariables = {
  season: ..., 
};

// Call the `getFinalizedEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFinalizedEvents(getFinalizedEventsVars);
// Variables can be defined inline as well.
const { data } = await getFinalizedEvents({ season: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFinalizedEvents(dataConnect, getFinalizedEventsVars);

console.log(data.events);

// Or, you can use the `Promise` API.
getFinalizedEvents(getFinalizedEventsVars).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `GetFinalizedEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFinalizedEventsRef, GetFinalizedEventsVariables } from '@knockoutfpl/dataconnect';

// The `GetFinalizedEvents` query requires an argument of type `GetFinalizedEventsVariables`:
const getFinalizedEventsVars: GetFinalizedEventsVariables = {
  season: ..., 
};

// Call the `getFinalizedEventsRef()` function to get a reference to the query.
const ref = getFinalizedEventsRef(getFinalizedEventsVars);
// Variables can be defined inline as well.
const ref = getFinalizedEventsRef({ season: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFinalizedEventsRef(dataConnect, getFinalizedEventsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## GetEventFinalization
You can execute the `GetEventFinalization` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getEventFinalization(vars: GetEventFinalizationVariables): QueryPromise<GetEventFinalizationData, GetEventFinalizationVariables>;

interface GetEventFinalizationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEventFinalizationVariables): QueryRef<GetEventFinalizationData, GetEventFinalizationVariables>;
}
export const getEventFinalizationRef: GetEventFinalizationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEventFinalization(dc: DataConnect, vars: GetEventFinalizationVariables): QueryPromise<GetEventFinalizationData, GetEventFinalizationVariables>;

interface GetEventFinalizationRef {
  ...
  (dc: DataConnect, vars: GetEventFinalizationVariables): QueryRef<GetEventFinalizationData, GetEventFinalizationVariables>;
}
export const getEventFinalizationRef: GetEventFinalizationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEventFinalizationRef:
```typescript
const name = getEventFinalizationRef.operationName;
console.log(name);
```

### Variables
The `GetEventFinalization` query requires an argument of type `GetEventFinalizationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetEventFinalizationVariables {
  event: number;
  season: string;
}
```
### Return Type
Recall that executing the `GetEventFinalization` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEventFinalizationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetEventFinalizationData {
  events: ({
    event: number;
    season: string;
    finished: boolean;
    finalizedAt?: TimestampString | null;
  } & Event_Key)[];
}
```
### Using `GetEventFinalization`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEventFinalization, GetEventFinalizationVariables } from '@knockoutfpl/dataconnect';

// The `GetEventFinalization` query requires an argument of type `GetEventFinalizationVariables`:
const getEventFinalizationVars: GetEventFinalizationVariables = {
  event: ..., 
  season: ..., 
};

// Call the `getEventFinalization()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEventFinalization(getEventFinalizationVars);
// Variables can be defined inline as well.
const { data } = await getEventFinalization({ event: ..., season: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEventFinalization(dataConnect, getEventFinalizationVars);

console.log(data.events);

// Or, you can use the `Promise` API.
getEventFinalization(getEventFinalizationVars).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `GetEventFinalization`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEventFinalizationRef, GetEventFinalizationVariables } from '@knockoutfpl/dataconnect';

// The `GetEventFinalization` query requires an argument of type `GetEventFinalizationVariables`:
const getEventFinalizationVars: GetEventFinalizationVariables = {
  event: ..., 
  season: ..., 
};

// Call the `getEventFinalizationRef()` function to get a reference to the query.
const ref = getEventFinalizationRef(getEventFinalizationVars);
// Variables can be defined inline as well.
const ref = getEventFinalizationRef({ event: ..., season: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEventFinalizationRef(dataConnect, getEventFinalizationVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## GetTournament
You can execute the `GetTournament` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getTournament(vars: GetTournamentVariables): QueryPromise<GetTournamentData, GetTournamentVariables>;

interface GetTournamentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTournamentVariables): QueryRef<GetTournamentData, GetTournamentVariables>;
}
export const getTournamentRef: GetTournamentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTournament(dc: DataConnect, vars: GetTournamentVariables): QueryPromise<GetTournamentData, GetTournamentVariables>;

interface GetTournamentRef {
  ...
  (dc: DataConnect, vars: GetTournamentVariables): QueryRef<GetTournamentData, GetTournamentVariables>;
}
export const getTournamentRef: GetTournamentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTournamentRef:
```typescript
const name = getTournamentRef.operationName;
console.log(name);
```

### Variables
The `GetTournament` query requires an argument of type `GetTournamentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTournamentVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetTournament` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTournamentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTournamentData {
  tournament?: {
    id: UUIDString;
    fplLeagueId: number;
    fplLeagueName: string;
    creatorUid: string;
    participantCount: number;
    totalRounds: number;
    currentRound: number;
    startEvent: number;
    seedingMethod: string;
    matchSize: number;
    status: string;
    winnerEntryId?: number | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    creator: {
      uid: string;
      email: string;
    } & User_Key;
  } & Tournament_Key;
}
```
### Using `GetTournament`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTournament, GetTournamentVariables } from '@knockoutfpl/dataconnect';

// The `GetTournament` query requires an argument of type `GetTournamentVariables`:
const getTournamentVars: GetTournamentVariables = {
  id: ..., 
};

// Call the `getTournament()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTournament(getTournamentVars);
// Variables can be defined inline as well.
const { data } = await getTournament({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTournament(dataConnect, getTournamentVars);

console.log(data.tournament);

// Or, you can use the `Promise` API.
getTournament(getTournamentVars).then((response) => {
  const data = response.data;
  console.log(data.tournament);
});
```

### Using `GetTournament`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTournamentRef, GetTournamentVariables } from '@knockoutfpl/dataconnect';

// The `GetTournament` query requires an argument of type `GetTournamentVariables`:
const getTournamentVars: GetTournamentVariables = {
  id: ..., 
};

// Call the `getTournamentRef()` function to get a reference to the query.
const ref = getTournamentRef(getTournamentVars);
// Variables can be defined inline as well.
const ref = getTournamentRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTournamentRef(dataConnect, getTournamentVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tournament);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament);
});
```

## GetTournamentWithParticipants
You can execute the `GetTournamentWithParticipants` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getTournamentWithParticipants(vars: GetTournamentWithParticipantsVariables): QueryPromise<GetTournamentWithParticipantsData, GetTournamentWithParticipantsVariables>;

interface GetTournamentWithParticipantsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTournamentWithParticipantsVariables): QueryRef<GetTournamentWithParticipantsData, GetTournamentWithParticipantsVariables>;
}
export const getTournamentWithParticipantsRef: GetTournamentWithParticipantsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTournamentWithParticipants(dc: DataConnect, vars: GetTournamentWithParticipantsVariables): QueryPromise<GetTournamentWithParticipantsData, GetTournamentWithParticipantsVariables>;

interface GetTournamentWithParticipantsRef {
  ...
  (dc: DataConnect, vars: GetTournamentWithParticipantsVariables): QueryRef<GetTournamentWithParticipantsData, GetTournamentWithParticipantsVariables>;
}
export const getTournamentWithParticipantsRef: GetTournamentWithParticipantsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTournamentWithParticipantsRef:
```typescript
const name = getTournamentWithParticipantsRef.operationName;
console.log(name);
```

### Variables
The `GetTournamentWithParticipants` query requires an argument of type `GetTournamentWithParticipantsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTournamentWithParticipantsVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetTournamentWithParticipants` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTournamentWithParticipantsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTournamentWithParticipantsData {
  tournament?: {
    id: UUIDString;
    fplLeagueId: number;
    fplLeagueName: string;
    participantCount: number;
    totalRounds: number;
    currentRound: number;
    startEvent: number;
    seedingMethod: string;
    matchSize: number;
    status: string;
    winnerEntryId?: number | null;
  } & Tournament_Key;
    participants: ({
      tournamentId: UUIDString;
      entryId: number;
      teamName: string;
      managerName: string;
      seed: number;
      leagueRank?: number | null;
      leaguePoints?: number | null;
      status: string;
      eliminationRound?: number | null;
      uid?: string | null;
    } & Participant_Key)[];
}
```
### Using `GetTournamentWithParticipants`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTournamentWithParticipants, GetTournamentWithParticipantsVariables } from '@knockoutfpl/dataconnect';

// The `GetTournamentWithParticipants` query requires an argument of type `GetTournamentWithParticipantsVariables`:
const getTournamentWithParticipantsVars: GetTournamentWithParticipantsVariables = {
  id: ..., 
};

// Call the `getTournamentWithParticipants()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTournamentWithParticipants(getTournamentWithParticipantsVars);
// Variables can be defined inline as well.
const { data } = await getTournamentWithParticipants({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTournamentWithParticipants(dataConnect, getTournamentWithParticipantsVars);

console.log(data.tournament);
console.log(data.participants);

// Or, you can use the `Promise` API.
getTournamentWithParticipants(getTournamentWithParticipantsVars).then((response) => {
  const data = response.data;
  console.log(data.tournament);
  console.log(data.participants);
});
```

### Using `GetTournamentWithParticipants`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTournamentWithParticipantsRef, GetTournamentWithParticipantsVariables } from '@knockoutfpl/dataconnect';

// The `GetTournamentWithParticipants` query requires an argument of type `GetTournamentWithParticipantsVariables`:
const getTournamentWithParticipantsVars: GetTournamentWithParticipantsVariables = {
  id: ..., 
};

// Call the `getTournamentWithParticipantsRef()` function to get a reference to the query.
const ref = getTournamentWithParticipantsRef(getTournamentWithParticipantsVars);
// Variables can be defined inline as well.
const ref = getTournamentWithParticipantsRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTournamentWithParticipantsRef(dataConnect, getTournamentWithParticipantsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tournament);
console.log(data.participants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament);
  console.log(data.participants);
});
```

## GetUserTournaments
You can execute the `GetUserTournaments` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserTournaments(vars: GetUserTournamentsVariables): QueryPromise<GetUserTournamentsData, GetUserTournamentsVariables>;

interface GetUserTournamentsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserTournamentsVariables): QueryRef<GetUserTournamentsData, GetUserTournamentsVariables>;
}
export const getUserTournamentsRef: GetUserTournamentsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserTournaments(dc: DataConnect, vars: GetUserTournamentsVariables): QueryPromise<GetUserTournamentsData, GetUserTournamentsVariables>;

interface GetUserTournamentsRef {
  ...
  (dc: DataConnect, vars: GetUserTournamentsVariables): QueryRef<GetUserTournamentsData, GetUserTournamentsVariables>;
}
export const getUserTournamentsRef: GetUserTournamentsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserTournamentsRef:
```typescript
const name = getUserTournamentsRef.operationName;
console.log(name);
```

### Variables
The `GetUserTournaments` query requires an argument of type `GetUserTournamentsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserTournamentsVariables {
  creatorUid: string;
}
```
### Return Type
Recall that executing the `GetUserTournaments` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserTournamentsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserTournamentsData {
  tournaments: ({
    id: UUIDString;
    fplLeagueId: number;
    fplLeagueName: string;
    participantCount: number;
    totalRounds: number;
    currentRound: number;
    startEvent: number;
    seedingMethod: string;
    matchSize: number;
    status: string;
    createdAt: TimestampString;
  } & Tournament_Key)[];
}
```
### Using `GetUserTournaments`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserTournaments, GetUserTournamentsVariables } from '@knockoutfpl/dataconnect';

// The `GetUserTournaments` query requires an argument of type `GetUserTournamentsVariables`:
const getUserTournamentsVars: GetUserTournamentsVariables = {
  creatorUid: ..., 
};

// Call the `getUserTournaments()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserTournaments(getUserTournamentsVars);
// Variables can be defined inline as well.
const { data } = await getUserTournaments({ creatorUid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserTournaments(dataConnect, getUserTournamentsVars);

console.log(data.tournaments);

// Or, you can use the `Promise` API.
getUserTournaments(getUserTournamentsVars).then((response) => {
  const data = response.data;
  console.log(data.tournaments);
});
```

### Using `GetUserTournaments`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserTournamentsRef, GetUserTournamentsVariables } from '@knockoutfpl/dataconnect';

// The `GetUserTournaments` query requires an argument of type `GetUserTournamentsVariables`:
const getUserTournamentsVars: GetUserTournamentsVariables = {
  creatorUid: ..., 
};

// Call the `getUserTournamentsRef()` function to get a reference to the query.
const ref = getUserTournamentsRef(getUserTournamentsVars);
// Variables can be defined inline as well.
const ref = getUserTournamentsRef({ creatorUid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserTournamentsRef(dataConnect, getUserTournamentsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tournaments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tournaments);
});
```

## GetLeagueTournaments
You can execute the `GetLeagueTournaments` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLeagueTournaments(vars: GetLeagueTournamentsVariables): QueryPromise<GetLeagueTournamentsData, GetLeagueTournamentsVariables>;

interface GetLeagueTournamentsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeagueTournamentsVariables): QueryRef<GetLeagueTournamentsData, GetLeagueTournamentsVariables>;
}
export const getLeagueTournamentsRef: GetLeagueTournamentsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLeagueTournaments(dc: DataConnect, vars: GetLeagueTournamentsVariables): QueryPromise<GetLeagueTournamentsData, GetLeagueTournamentsVariables>;

interface GetLeagueTournamentsRef {
  ...
  (dc: DataConnect, vars: GetLeagueTournamentsVariables): QueryRef<GetLeagueTournamentsData, GetLeagueTournamentsVariables>;
}
export const getLeagueTournamentsRef: GetLeagueTournamentsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLeagueTournamentsRef:
```typescript
const name = getLeagueTournamentsRef.operationName;
console.log(name);
```

### Variables
The `GetLeagueTournaments` query requires an argument of type `GetLeagueTournamentsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLeagueTournamentsVariables {
  fplLeagueId: number;
}
```
### Return Type
Recall that executing the `GetLeagueTournaments` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLeagueTournamentsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLeagueTournamentsData {
  tournaments: ({
    id: UUIDString;
    fplLeagueName: string;
    participantCount: number;
    totalRounds: number;
    currentRound: number;
    startEvent: number;
    seedingMethod: string;
    matchSize: number;
    status: string;
    createdAt: TimestampString;
    creatorUid: string;
  } & Tournament_Key)[];
}
```
### Using `GetLeagueTournaments`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLeagueTournaments, GetLeagueTournamentsVariables } from '@knockoutfpl/dataconnect';

// The `GetLeagueTournaments` query requires an argument of type `GetLeagueTournamentsVariables`:
const getLeagueTournamentsVars: GetLeagueTournamentsVariables = {
  fplLeagueId: ..., 
};

// Call the `getLeagueTournaments()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLeagueTournaments(getLeagueTournamentsVars);
// Variables can be defined inline as well.
const { data } = await getLeagueTournaments({ fplLeagueId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLeagueTournaments(dataConnect, getLeagueTournamentsVars);

console.log(data.tournaments);

// Or, you can use the `Promise` API.
getLeagueTournaments(getLeagueTournamentsVars).then((response) => {
  const data = response.data;
  console.log(data.tournaments);
});
```

### Using `GetLeagueTournaments`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLeagueTournamentsRef, GetLeagueTournamentsVariables } from '@knockoutfpl/dataconnect';

// The `GetLeagueTournaments` query requires an argument of type `GetLeagueTournamentsVariables`:
const getLeagueTournamentsVars: GetLeagueTournamentsVariables = {
  fplLeagueId: ..., 
};

// Call the `getLeagueTournamentsRef()` function to get a reference to the query.
const ref = getLeagueTournamentsRef(getLeagueTournamentsVars);
// Variables can be defined inline as well.
const ref = getLeagueTournamentsRef({ fplLeagueId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLeagueTournamentsRef(dataConnect, getLeagueTournamentsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tournaments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tournaments);
});
```

## GetAllTournaments
You can execute the `GetAllTournaments` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAllTournaments(): QueryPromise<GetAllTournamentsData, undefined>;

interface GetAllTournamentsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllTournamentsData, undefined>;
}
export const getAllTournamentsRef: GetAllTournamentsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAllTournaments(dc: DataConnect): QueryPromise<GetAllTournamentsData, undefined>;

interface GetAllTournamentsRef {
  ...
  (dc: DataConnect): QueryRef<GetAllTournamentsData, undefined>;
}
export const getAllTournamentsRef: GetAllTournamentsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAllTournamentsRef:
```typescript
const name = getAllTournamentsRef.operationName;
console.log(name);
```

### Variables
The `GetAllTournaments` query has no variables.
### Return Type
Recall that executing the `GetAllTournaments` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAllTournamentsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAllTournamentsData {
  tournaments: ({
    id: UUIDString;
    fplLeagueId: number;
    fplLeagueName: string;
    participantCount: number;
    status: string;
    createdAt: TimestampString;
  } & Tournament_Key)[];
}
```
### Using `GetAllTournaments`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAllTournaments } from '@knockoutfpl/dataconnect';


// Call the `getAllTournaments()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAllTournaments();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAllTournaments(dataConnect);

console.log(data.tournaments);

// Or, you can use the `Promise` API.
getAllTournaments().then((response) => {
  const data = response.data;
  console.log(data.tournaments);
});
```

### Using `GetAllTournaments`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAllTournamentsRef } from '@knockoutfpl/dataconnect';


// Call the `getAllTournamentsRef()` function to get a reference to the query.
const ref = getAllTournamentsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAllTournamentsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tournaments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tournaments);
});
```

## GetTournamentRounds
You can execute the `GetTournamentRounds` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getTournamentRounds(vars: GetTournamentRoundsVariables): QueryPromise<GetTournamentRoundsData, GetTournamentRoundsVariables>;

interface GetTournamentRoundsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTournamentRoundsVariables): QueryRef<GetTournamentRoundsData, GetTournamentRoundsVariables>;
}
export const getTournamentRoundsRef: GetTournamentRoundsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTournamentRounds(dc: DataConnect, vars: GetTournamentRoundsVariables): QueryPromise<GetTournamentRoundsData, GetTournamentRoundsVariables>;

interface GetTournamentRoundsRef {
  ...
  (dc: DataConnect, vars: GetTournamentRoundsVariables): QueryRef<GetTournamentRoundsData, GetTournamentRoundsVariables>;
}
export const getTournamentRoundsRef: GetTournamentRoundsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTournamentRoundsRef:
```typescript
const name = getTournamentRoundsRef.operationName;
console.log(name);
```

### Variables
The `GetTournamentRounds` query requires an argument of type `GetTournamentRoundsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTournamentRoundsVariables {
  tournamentId: UUIDString;
}
```
### Return Type
Recall that executing the `GetTournamentRounds` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTournamentRoundsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTournamentRoundsData {
  rounds: ({
    tournamentId: UUIDString;
    roundNumber: number;
    event: number;
    status: string;
    startedAt?: TimestampString | null;
    completedAt?: TimestampString | null;
  } & Round_Key)[];
}
```
### Using `GetTournamentRounds`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTournamentRounds, GetTournamentRoundsVariables } from '@knockoutfpl/dataconnect';

// The `GetTournamentRounds` query requires an argument of type `GetTournamentRoundsVariables`:
const getTournamentRoundsVars: GetTournamentRoundsVariables = {
  tournamentId: ..., 
};

// Call the `getTournamentRounds()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTournamentRounds(getTournamentRoundsVars);
// Variables can be defined inline as well.
const { data } = await getTournamentRounds({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTournamentRounds(dataConnect, getTournamentRoundsVars);

console.log(data.rounds);

// Or, you can use the `Promise` API.
getTournamentRounds(getTournamentRoundsVars).then((response) => {
  const data = response.data;
  console.log(data.rounds);
});
```

### Using `GetTournamentRounds`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTournamentRoundsRef, GetTournamentRoundsVariables } from '@knockoutfpl/dataconnect';

// The `GetTournamentRounds` query requires an argument of type `GetTournamentRoundsVariables`:
const getTournamentRoundsVars: GetTournamentRoundsVariables = {
  tournamentId: ..., 
};

// Call the `getTournamentRoundsRef()` function to get a reference to the query.
const ref = getTournamentRoundsRef(getTournamentRoundsVars);
// Variables can be defined inline as well.
const ref = getTournamentRoundsRef({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTournamentRoundsRef(dataConnect, getTournamentRoundsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.rounds);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.rounds);
});
```

## GetRound
You can execute the `GetRound` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRound(vars: GetRoundVariables): QueryPromise<GetRoundData, GetRoundVariables>;

interface GetRoundRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRoundVariables): QueryRef<GetRoundData, GetRoundVariables>;
}
export const getRoundRef: GetRoundRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRound(dc: DataConnect, vars: GetRoundVariables): QueryPromise<GetRoundData, GetRoundVariables>;

interface GetRoundRef {
  ...
  (dc: DataConnect, vars: GetRoundVariables): QueryRef<GetRoundData, GetRoundVariables>;
}
export const getRoundRef: GetRoundRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRoundRef:
```typescript
const name = getRoundRef.operationName;
console.log(name);
```

### Variables
The `GetRound` query requires an argument of type `GetRoundVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRoundVariables {
  tournamentId: UUIDString;
  roundNumber: number;
}
```
### Return Type
Recall that executing the `GetRound` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRoundData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetRoundData {
  rounds: ({
    tournamentId: UUIDString;
    roundNumber: number;
    event: number;
    status: string;
    startedAt?: TimestampString | null;
    completedAt?: TimestampString | null;
  } & Round_Key)[];
}
```
### Using `GetRound`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRound, GetRoundVariables } from '@knockoutfpl/dataconnect';

// The `GetRound` query requires an argument of type `GetRoundVariables`:
const getRoundVars: GetRoundVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
};

// Call the `getRound()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRound(getRoundVars);
// Variables can be defined inline as well.
const { data } = await getRound({ tournamentId: ..., roundNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRound(dataConnect, getRoundVars);

console.log(data.rounds);

// Or, you can use the `Promise` API.
getRound(getRoundVars).then((response) => {
  const data = response.data;
  console.log(data.rounds);
});
```

### Using `GetRound`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRoundRef, GetRoundVariables } from '@knockoutfpl/dataconnect';

// The `GetRound` query requires an argument of type `GetRoundVariables`:
const getRoundVars: GetRoundVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
};

// Call the `getRoundRef()` function to get a reference to the query.
const ref = getRoundRef(getRoundVars);
// Variables can be defined inline as well.
const ref = getRoundRef({ tournamentId: ..., roundNumber: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRoundRef(dataConnect, getRoundVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.rounds);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.rounds);
});
```

## GetActiveRounds
You can execute the `GetActiveRounds` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getActiveRounds(vars: GetActiveRoundsVariables): QueryPromise<GetActiveRoundsData, GetActiveRoundsVariables>;

interface GetActiveRoundsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetActiveRoundsVariables): QueryRef<GetActiveRoundsData, GetActiveRoundsVariables>;
}
export const getActiveRoundsRef: GetActiveRoundsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getActiveRounds(dc: DataConnect, vars: GetActiveRoundsVariables): QueryPromise<GetActiveRoundsData, GetActiveRoundsVariables>;

interface GetActiveRoundsRef {
  ...
  (dc: DataConnect, vars: GetActiveRoundsVariables): QueryRef<GetActiveRoundsData, GetActiveRoundsVariables>;
}
export const getActiveRoundsRef: GetActiveRoundsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getActiveRoundsRef:
```typescript
const name = getActiveRoundsRef.operationName;
console.log(name);
```

### Variables
The `GetActiveRounds` query requires an argument of type `GetActiveRoundsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetActiveRoundsVariables {
  event: number;
}
```
### Return Type
Recall that executing the `GetActiveRounds` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetActiveRoundsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetActiveRoundsData {
  rounds: ({
    tournamentId: UUIDString;
    roundNumber: number;
    event: number;
    status: string;
    tournament: {
      id: UUIDString;
      fplLeagueName: string;
      currentRound: number;
    } & Tournament_Key;
  } & Round_Key)[];
}
```
### Using `GetActiveRounds`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getActiveRounds, GetActiveRoundsVariables } from '@knockoutfpl/dataconnect';

// The `GetActiveRounds` query requires an argument of type `GetActiveRoundsVariables`:
const getActiveRoundsVars: GetActiveRoundsVariables = {
  event: ..., 
};

// Call the `getActiveRounds()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getActiveRounds(getActiveRoundsVars);
// Variables can be defined inline as well.
const { data } = await getActiveRounds({ event: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getActiveRounds(dataConnect, getActiveRoundsVars);

console.log(data.rounds);

// Or, you can use the `Promise` API.
getActiveRounds(getActiveRoundsVars).then((response) => {
  const data = response.data;
  console.log(data.rounds);
});
```

### Using `GetActiveRounds`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getActiveRoundsRef, GetActiveRoundsVariables } from '@knockoutfpl/dataconnect';

// The `GetActiveRounds` query requires an argument of type `GetActiveRoundsVariables`:
const getActiveRoundsVars: GetActiveRoundsVariables = {
  event: ..., 
};

// Call the `getActiveRoundsRef()` function to get a reference to the query.
const ref = getActiveRoundsRef(getActiveRoundsVars);
// Variables can be defined inline as well.
const ref = getActiveRoundsRef({ event: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getActiveRoundsRef(dataConnect, getActiveRoundsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.rounds);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.rounds);
});
```

## GetPendingActiveRounds
You can execute the `GetPendingActiveRounds` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPendingActiveRounds(vars: GetPendingActiveRoundsVariables): QueryPromise<GetPendingActiveRoundsData, GetPendingActiveRoundsVariables>;

interface GetPendingActiveRoundsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPendingActiveRoundsVariables): QueryRef<GetPendingActiveRoundsData, GetPendingActiveRoundsVariables>;
}
export const getPendingActiveRoundsRef: GetPendingActiveRoundsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPendingActiveRounds(dc: DataConnect, vars: GetPendingActiveRoundsVariables): QueryPromise<GetPendingActiveRoundsData, GetPendingActiveRoundsVariables>;

interface GetPendingActiveRoundsRef {
  ...
  (dc: DataConnect, vars: GetPendingActiveRoundsVariables): QueryRef<GetPendingActiveRoundsData, GetPendingActiveRoundsVariables>;
}
export const getPendingActiveRoundsRef: GetPendingActiveRoundsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPendingActiveRoundsRef:
```typescript
const name = getPendingActiveRoundsRef.operationName;
console.log(name);
```

### Variables
The `GetPendingActiveRounds` query requires an argument of type `GetPendingActiveRoundsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPendingActiveRoundsVariables {
  maxEvent: number;
}
```
### Return Type
Recall that executing the `GetPendingActiveRounds` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPendingActiveRoundsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPendingActiveRoundsData {
  rounds: ({
    tournamentId: UUIDString;
    roundNumber: number;
    event: number;
    status: string;
    updatedAt?: TimestampString | null;
    tournament: {
      id: UUIDString;
      fplLeagueId: number;
      fplLeagueName: string;
      totalRounds: number;
      status: string;
    } & Tournament_Key;
  } & Round_Key)[];
}
```
### Using `GetPendingActiveRounds`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPendingActiveRounds, GetPendingActiveRoundsVariables } from '@knockoutfpl/dataconnect';

// The `GetPendingActiveRounds` query requires an argument of type `GetPendingActiveRoundsVariables`:
const getPendingActiveRoundsVars: GetPendingActiveRoundsVariables = {
  maxEvent: ..., 
};

// Call the `getPendingActiveRounds()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPendingActiveRounds(getPendingActiveRoundsVars);
// Variables can be defined inline as well.
const { data } = await getPendingActiveRounds({ maxEvent: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPendingActiveRounds(dataConnect, getPendingActiveRoundsVars);

console.log(data.rounds);

// Or, you can use the `Promise` API.
getPendingActiveRounds(getPendingActiveRoundsVars).then((response) => {
  const data = response.data;
  console.log(data.rounds);
});
```

### Using `GetPendingActiveRounds`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPendingActiveRoundsRef, GetPendingActiveRoundsVariables } from '@knockoutfpl/dataconnect';

// The `GetPendingActiveRounds` query requires an argument of type `GetPendingActiveRoundsVariables`:
const getPendingActiveRoundsVars: GetPendingActiveRoundsVariables = {
  maxEvent: ..., 
};

// Call the `getPendingActiveRoundsRef()` function to get a reference to the query.
const ref = getPendingActiveRoundsRef(getPendingActiveRoundsVars);
// Variables can be defined inline as well.
const ref = getPendingActiveRoundsRef({ maxEvent: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPendingActiveRoundsRef(dataConnect, getPendingActiveRoundsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.rounds);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.rounds);
});
```

## GetRoundMatches
You can execute the `GetRoundMatches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRoundMatches(vars: GetRoundMatchesVariables): QueryPromise<GetRoundMatchesData, GetRoundMatchesVariables>;

interface GetRoundMatchesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRoundMatchesVariables): QueryRef<GetRoundMatchesData, GetRoundMatchesVariables>;
}
export const getRoundMatchesRef: GetRoundMatchesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRoundMatches(dc: DataConnect, vars: GetRoundMatchesVariables): QueryPromise<GetRoundMatchesData, GetRoundMatchesVariables>;

interface GetRoundMatchesRef {
  ...
  (dc: DataConnect, vars: GetRoundMatchesVariables): QueryRef<GetRoundMatchesData, GetRoundMatchesVariables>;
}
export const getRoundMatchesRef: GetRoundMatchesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRoundMatchesRef:
```typescript
const name = getRoundMatchesRef.operationName;
console.log(name);
```

### Variables
The `GetRoundMatches` query requires an argument of type `GetRoundMatchesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRoundMatchesVariables {
  tournamentId: UUIDString;
  roundNumber: number;
}
```
### Return Type
Recall that executing the `GetRoundMatches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRoundMatchesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetRoundMatchesData {
  matches: ({
    tournamentId: UUIDString;
    matchId: number;
    roundNumber: number;
    positionInRound: number;
    status: string;
    winnerEntryId?: number | null;
    isBye: boolean;
    completedAt?: TimestampString | null;
    qualifiesToMatchId?: number | null;
  } & Match_Key)[];
}
```
### Using `GetRoundMatches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRoundMatches, GetRoundMatchesVariables } from '@knockoutfpl/dataconnect';

// The `GetRoundMatches` query requires an argument of type `GetRoundMatchesVariables`:
const getRoundMatchesVars: GetRoundMatchesVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
};

// Call the `getRoundMatches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRoundMatches(getRoundMatchesVars);
// Variables can be defined inline as well.
const { data } = await getRoundMatches({ tournamentId: ..., roundNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRoundMatches(dataConnect, getRoundMatchesVars);

console.log(data.matches);

// Or, you can use the `Promise` API.
getRoundMatches(getRoundMatchesVars).then((response) => {
  const data = response.data;
  console.log(data.matches);
});
```

### Using `GetRoundMatches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRoundMatchesRef, GetRoundMatchesVariables } from '@knockoutfpl/dataconnect';

// The `GetRoundMatches` query requires an argument of type `GetRoundMatchesVariables`:
const getRoundMatchesVars: GetRoundMatchesVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
};

// Call the `getRoundMatchesRef()` function to get a reference to the query.
const ref = getRoundMatchesRef(getRoundMatchesVars);
// Variables can be defined inline as well.
const ref = getRoundMatchesRef({ tournamentId: ..., roundNumber: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRoundMatchesRef(dataConnect, getRoundMatchesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.matches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.matches);
});
```

## GetMatch
You can execute the `GetMatch` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMatch(vars: GetMatchVariables): QueryPromise<GetMatchData, GetMatchVariables>;

interface GetMatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMatchVariables): QueryRef<GetMatchData, GetMatchVariables>;
}
export const getMatchRef: GetMatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMatch(dc: DataConnect, vars: GetMatchVariables): QueryPromise<GetMatchData, GetMatchVariables>;

interface GetMatchRef {
  ...
  (dc: DataConnect, vars: GetMatchVariables): QueryRef<GetMatchData, GetMatchVariables>;
}
export const getMatchRef: GetMatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMatchRef:
```typescript
const name = getMatchRef.operationName;
console.log(name);
```

### Variables
The `GetMatch` query requires an argument of type `GetMatchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMatchVariables {
  tournamentId: UUIDString;
  matchId: number;
}
```
### Return Type
Recall that executing the `GetMatch` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMatchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMatchData {
  matches: ({
    tournamentId: UUIDString;
    matchId: number;
    roundNumber: number;
    positionInRound: number;
    status: string;
    winnerEntryId?: number | null;
    isBye: boolean;
    completedAt?: TimestampString | null;
    qualifiesToMatchId?: number | null;
    tournament: {
      fplLeagueName: string;
      currentRound: number;
    };
  } & Match_Key)[];
}
```
### Using `GetMatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMatch, GetMatchVariables } from '@knockoutfpl/dataconnect';

// The `GetMatch` query requires an argument of type `GetMatchVariables`:
const getMatchVars: GetMatchVariables = {
  tournamentId: ..., 
  matchId: ..., 
};

// Call the `getMatch()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMatch(getMatchVars);
// Variables can be defined inline as well.
const { data } = await getMatch({ tournamentId: ..., matchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMatch(dataConnect, getMatchVars);

console.log(data.matches);

// Or, you can use the `Promise` API.
getMatch(getMatchVars).then((response) => {
  const data = response.data;
  console.log(data.matches);
});
```

### Using `GetMatch`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMatchRef, GetMatchVariables } from '@knockoutfpl/dataconnect';

// The `GetMatch` query requires an argument of type `GetMatchVariables`:
const getMatchVars: GetMatchVariables = {
  tournamentId: ..., 
  matchId: ..., 
};

// Call the `getMatchRef()` function to get a reference to the query.
const ref = getMatchRef(getMatchVars);
// Variables can be defined inline as well.
const ref = getMatchRef({ tournamentId: ..., matchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMatchRef(dataConnect, getMatchVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.matches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.matches);
});
```

## GetMatchPicks
You can execute the `GetMatchPicks` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMatchPicks(vars: GetMatchPicksVariables): QueryPromise<GetMatchPicksData, GetMatchPicksVariables>;

interface GetMatchPicksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMatchPicksVariables): QueryRef<GetMatchPicksData, GetMatchPicksVariables>;
}
export const getMatchPicksRef: GetMatchPicksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMatchPicks(dc: DataConnect, vars: GetMatchPicksVariables): QueryPromise<GetMatchPicksData, GetMatchPicksVariables>;

interface GetMatchPicksRef {
  ...
  (dc: DataConnect, vars: GetMatchPicksVariables): QueryRef<GetMatchPicksData, GetMatchPicksVariables>;
}
export const getMatchPicksRef: GetMatchPicksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMatchPicksRef:
```typescript
const name = getMatchPicksRef.operationName;
console.log(name);
```

### Variables
The `GetMatchPicks` query requires an argument of type `GetMatchPicksVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMatchPicksVariables {
  tournamentId: UUIDString;
  matchId: number;
}
```
### Return Type
Recall that executing the `GetMatchPicks` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMatchPicksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMatchPicksData {
  matchPicks: ({
    tournamentId: UUIDString;
    matchId: number;
    entryId: number;
    slot: number;
    entry: {
      entryId: number;
      name: string;
      playerFirstName?: string | null;
      playerLastName?: string | null;
    } & Entry_Key;
  } & MatchPick_Key)[];
}
```
### Using `GetMatchPicks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMatchPicks, GetMatchPicksVariables } from '@knockoutfpl/dataconnect';

// The `GetMatchPicks` query requires an argument of type `GetMatchPicksVariables`:
const getMatchPicksVars: GetMatchPicksVariables = {
  tournamentId: ..., 
  matchId: ..., 
};

// Call the `getMatchPicks()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMatchPicks(getMatchPicksVars);
// Variables can be defined inline as well.
const { data } = await getMatchPicks({ tournamentId: ..., matchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMatchPicks(dataConnect, getMatchPicksVars);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
getMatchPicks(getMatchPicksVars).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

### Using `GetMatchPicks`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMatchPicksRef, GetMatchPicksVariables } from '@knockoutfpl/dataconnect';

// The `GetMatchPicks` query requires an argument of type `GetMatchPicksVariables`:
const getMatchPicksVars: GetMatchPicksVariables = {
  tournamentId: ..., 
  matchId: ..., 
};

// Call the `getMatchPicksRef()` function to get a reference to the query.
const ref = getMatchPicksRef(getMatchPicksVars);
// Variables can be defined inline as well.
const ref = getMatchPicksRef({ tournamentId: ..., matchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMatchPicksRef(dataConnect, getMatchPicksVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

## GetAllTournamentMatchPicks
You can execute the `GetAllTournamentMatchPicks` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAllTournamentMatchPicks(vars: GetAllTournamentMatchPicksVariables): QueryPromise<GetAllTournamentMatchPicksData, GetAllTournamentMatchPicksVariables>;

interface GetAllTournamentMatchPicksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAllTournamentMatchPicksVariables): QueryRef<GetAllTournamentMatchPicksData, GetAllTournamentMatchPicksVariables>;
}
export const getAllTournamentMatchPicksRef: GetAllTournamentMatchPicksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAllTournamentMatchPicks(dc: DataConnect, vars: GetAllTournamentMatchPicksVariables): QueryPromise<GetAllTournamentMatchPicksData, GetAllTournamentMatchPicksVariables>;

interface GetAllTournamentMatchPicksRef {
  ...
  (dc: DataConnect, vars: GetAllTournamentMatchPicksVariables): QueryRef<GetAllTournamentMatchPicksData, GetAllTournamentMatchPicksVariables>;
}
export const getAllTournamentMatchPicksRef: GetAllTournamentMatchPicksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAllTournamentMatchPicksRef:
```typescript
const name = getAllTournamentMatchPicksRef.operationName;
console.log(name);
```

### Variables
The `GetAllTournamentMatchPicks` query requires an argument of type `GetAllTournamentMatchPicksVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAllTournamentMatchPicksVariables {
  tournamentId: UUIDString;
}
```
### Return Type
Recall that executing the `GetAllTournamentMatchPicks` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAllTournamentMatchPicksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAllTournamentMatchPicksData {
  matchPicks: ({
    matchId: number;
    entryId: number;
    slot: number;
    entry: {
      entryId: number;
      name: string;
      playerFirstName?: string | null;
      playerLastName?: string | null;
    } & Entry_Key;
  })[];
}
```
### Using `GetAllTournamentMatchPicks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAllTournamentMatchPicks, GetAllTournamentMatchPicksVariables } from '@knockoutfpl/dataconnect';

// The `GetAllTournamentMatchPicks` query requires an argument of type `GetAllTournamentMatchPicksVariables`:
const getAllTournamentMatchPicksVars: GetAllTournamentMatchPicksVariables = {
  tournamentId: ..., 
};

// Call the `getAllTournamentMatchPicks()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAllTournamentMatchPicks(getAllTournamentMatchPicksVars);
// Variables can be defined inline as well.
const { data } = await getAllTournamentMatchPicks({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAllTournamentMatchPicks(dataConnect, getAllTournamentMatchPicksVars);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
getAllTournamentMatchPicks(getAllTournamentMatchPicksVars).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

### Using `GetAllTournamentMatchPicks`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAllTournamentMatchPicksRef, GetAllTournamentMatchPicksVariables } from '@knockoutfpl/dataconnect';

// The `GetAllTournamentMatchPicks` query requires an argument of type `GetAllTournamentMatchPicksVariables`:
const getAllTournamentMatchPicksVars: GetAllTournamentMatchPicksVariables = {
  tournamentId: ..., 
};

// Call the `getAllTournamentMatchPicksRef()` function to get a reference to the query.
const ref = getAllTournamentMatchPicksRef(getAllTournamentMatchPicksVars);
// Variables can be defined inline as well.
const ref = getAllTournamentMatchPicksRef({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAllTournamentMatchPicksRef(dataConnect, getAllTournamentMatchPicksVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

## GetUserMatches
You can execute the `GetUserMatches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserMatches(vars: GetUserMatchesVariables): QueryPromise<GetUserMatchesData, GetUserMatchesVariables>;

interface GetUserMatchesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserMatchesVariables): QueryRef<GetUserMatchesData, GetUserMatchesVariables>;
}
export const getUserMatchesRef: GetUserMatchesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserMatches(dc: DataConnect, vars: GetUserMatchesVariables): QueryPromise<GetUserMatchesData, GetUserMatchesVariables>;

interface GetUserMatchesRef {
  ...
  (dc: DataConnect, vars: GetUserMatchesVariables): QueryRef<GetUserMatchesData, GetUserMatchesVariables>;
}
export const getUserMatchesRef: GetUserMatchesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserMatchesRef:
```typescript
const name = getUserMatchesRef.operationName;
console.log(name);
```

### Variables
The `GetUserMatches` query requires an argument of type `GetUserMatchesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserMatchesVariables {
  entryId: number;
}
```
### Return Type
Recall that executing the `GetUserMatches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserMatchesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserMatchesData {
  matchPicks: ({
    tournamentId: UUIDString;
    matchId: number;
    entryId: number;
    slot: number;
  } & MatchPick_Key)[];
}
```
### Using `GetUserMatches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserMatches, GetUserMatchesVariables } from '@knockoutfpl/dataconnect';

// The `GetUserMatches` query requires an argument of type `GetUserMatchesVariables`:
const getUserMatchesVars: GetUserMatchesVariables = {
  entryId: ..., 
};

// Call the `getUserMatches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserMatches(getUserMatchesVars);
// Variables can be defined inline as well.
const { data } = await getUserMatches({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserMatches(dataConnect, getUserMatchesVars);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
getUserMatches(getUserMatchesVars).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

### Using `GetUserMatches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserMatchesRef, GetUserMatchesVariables } from '@knockoutfpl/dataconnect';

// The `GetUserMatches` query requires an argument of type `GetUserMatchesVariables`:
const getUserMatchesVars: GetUserMatchesVariables = {
  entryId: ..., 
};

// Call the `getUserMatchesRef()` function to get a reference to the query.
const ref = getUserMatchesRef(getUserMatchesVars);
// Variables can be defined inline as well.
const ref = getUserMatchesRef({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserMatchesRef(dataConnect, getUserMatchesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

## GetParticipant
You can execute the `GetParticipant` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getParticipant(vars: GetParticipantVariables): QueryPromise<GetParticipantData, GetParticipantVariables>;

interface GetParticipantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetParticipantVariables): QueryRef<GetParticipantData, GetParticipantVariables>;
}
export const getParticipantRef: GetParticipantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getParticipant(dc: DataConnect, vars: GetParticipantVariables): QueryPromise<GetParticipantData, GetParticipantVariables>;

interface GetParticipantRef {
  ...
  (dc: DataConnect, vars: GetParticipantVariables): QueryRef<GetParticipantData, GetParticipantVariables>;
}
export const getParticipantRef: GetParticipantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getParticipantRef:
```typescript
const name = getParticipantRef.operationName;
console.log(name);
```

### Variables
The `GetParticipant` query requires an argument of type `GetParticipantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetParticipantVariables {
  tournamentId: UUIDString;
  entryId: number;
}
```
### Return Type
Recall that executing the `GetParticipant` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetParticipantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetParticipantData {
  participants: ({
    tournamentId: UUIDString;
    entryId: number;
    teamName: string;
    managerName: string;
    seed: number;
    leagueRank?: number | null;
    leaguePoints?: number | null;
    status: string;
    eliminationRound?: number | null;
    uid?: string | null;
    rawJson: string;
  } & Participant_Key)[];
}
```
### Using `GetParticipant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getParticipant, GetParticipantVariables } from '@knockoutfpl/dataconnect';

// The `GetParticipant` query requires an argument of type `GetParticipantVariables`:
const getParticipantVars: GetParticipantVariables = {
  tournamentId: ..., 
  entryId: ..., 
};

// Call the `getParticipant()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getParticipant(getParticipantVars);
// Variables can be defined inline as well.
const { data } = await getParticipant({ tournamentId: ..., entryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getParticipant(dataConnect, getParticipantVars);

console.log(data.participants);

// Or, you can use the `Promise` API.
getParticipant(getParticipantVars).then((response) => {
  const data = response.data;
  console.log(data.participants);
});
```

### Using `GetParticipant`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getParticipantRef, GetParticipantVariables } from '@knockoutfpl/dataconnect';

// The `GetParticipant` query requires an argument of type `GetParticipantVariables`:
const getParticipantVars: GetParticipantVariables = {
  tournamentId: ..., 
  entryId: ..., 
};

// Call the `getParticipantRef()` function to get a reference to the query.
const ref = getParticipantRef(getParticipantVars);
// Variables can be defined inline as well.
const ref = getParticipantRef({ tournamentId: ..., entryId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getParticipantRef(dataConnect, getParticipantVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.participants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.participants);
});
```

## GetActiveParticipants
You can execute the `GetActiveParticipants` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getActiveParticipants(vars: GetActiveParticipantsVariables): QueryPromise<GetActiveParticipantsData, GetActiveParticipantsVariables>;

interface GetActiveParticipantsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetActiveParticipantsVariables): QueryRef<GetActiveParticipantsData, GetActiveParticipantsVariables>;
}
export const getActiveParticipantsRef: GetActiveParticipantsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getActiveParticipants(dc: DataConnect, vars: GetActiveParticipantsVariables): QueryPromise<GetActiveParticipantsData, GetActiveParticipantsVariables>;

interface GetActiveParticipantsRef {
  ...
  (dc: DataConnect, vars: GetActiveParticipantsVariables): QueryRef<GetActiveParticipantsData, GetActiveParticipantsVariables>;
}
export const getActiveParticipantsRef: GetActiveParticipantsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getActiveParticipantsRef:
```typescript
const name = getActiveParticipantsRef.operationName;
console.log(name);
```

### Variables
The `GetActiveParticipants` query requires an argument of type `GetActiveParticipantsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetActiveParticipantsVariables {
  tournamentId: UUIDString;
}
```
### Return Type
Recall that executing the `GetActiveParticipants` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetActiveParticipantsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetActiveParticipantsData {
  participants: ({
    tournamentId: UUIDString;
    entryId: number;
    teamName: string;
    managerName: string;
    seed: number;
    leagueRank?: number | null;
    status: string;
  } & Participant_Key)[];
}
```
### Using `GetActiveParticipants`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getActiveParticipants, GetActiveParticipantsVariables } from '@knockoutfpl/dataconnect';

// The `GetActiveParticipants` query requires an argument of type `GetActiveParticipantsVariables`:
const getActiveParticipantsVars: GetActiveParticipantsVariables = {
  tournamentId: ..., 
};

// Call the `getActiveParticipants()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getActiveParticipants(getActiveParticipantsVars);
// Variables can be defined inline as well.
const { data } = await getActiveParticipants({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getActiveParticipants(dataConnect, getActiveParticipantsVars);

console.log(data.participants);

// Or, you can use the `Promise` API.
getActiveParticipants(getActiveParticipantsVars).then((response) => {
  const data = response.data;
  console.log(data.participants);
});
```

### Using `GetActiveParticipants`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getActiveParticipantsRef, GetActiveParticipantsVariables } from '@knockoutfpl/dataconnect';

// The `GetActiveParticipants` query requires an argument of type `GetActiveParticipantsVariables`:
const getActiveParticipantsVars: GetActiveParticipantsVariables = {
  tournamentId: ..., 
};

// Call the `getActiveParticipantsRef()` function to get a reference to the query.
const ref = getActiveParticipantsRef(getActiveParticipantsVars);
// Variables can be defined inline as well.
const ref = getActiveParticipantsRef({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getActiveParticipantsRef(dataConnect, getActiveParticipantsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.participants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.participants);
});
```

## GetUserParticipations
You can execute the `GetUserParticipations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserParticipations(vars: GetUserParticipationsVariables): QueryPromise<GetUserParticipationsData, GetUserParticipationsVariables>;

interface GetUserParticipationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserParticipationsVariables): QueryRef<GetUserParticipationsData, GetUserParticipationsVariables>;
}
export const getUserParticipationsRef: GetUserParticipationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserParticipations(dc: DataConnect, vars: GetUserParticipationsVariables): QueryPromise<GetUserParticipationsData, GetUserParticipationsVariables>;

interface GetUserParticipationsRef {
  ...
  (dc: DataConnect, vars: GetUserParticipationsVariables): QueryRef<GetUserParticipationsData, GetUserParticipationsVariables>;
}
export const getUserParticipationsRef: GetUserParticipationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserParticipationsRef:
```typescript
const name = getUserParticipationsRef.operationName;
console.log(name);
```

### Variables
The `GetUserParticipations` query requires an argument of type `GetUserParticipationsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserParticipationsVariables {
  uid: string;
}
```
### Return Type
Recall that executing the `GetUserParticipations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserParticipationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserParticipationsData {
  participants: ({
    tournamentId: UUIDString;
    entryId: number;
    teamName: string;
    seed: number;
    status: string;
    eliminationRound?: number | null;
    tournament: {
      id: UUIDString;
      fplLeagueName: string;
      status: string;
      currentRound: number;
    } & Tournament_Key;
  } & Participant_Key)[];
}
```
### Using `GetUserParticipations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserParticipations, GetUserParticipationsVariables } from '@knockoutfpl/dataconnect';

// The `GetUserParticipations` query requires an argument of type `GetUserParticipationsVariables`:
const getUserParticipationsVars: GetUserParticipationsVariables = {
  uid: ..., 
};

// Call the `getUserParticipations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserParticipations(getUserParticipationsVars);
// Variables can be defined inline as well.
const { data } = await getUserParticipations({ uid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserParticipations(dataConnect, getUserParticipationsVars);

console.log(data.participants);

// Or, you can use the `Promise` API.
getUserParticipations(getUserParticipationsVars).then((response) => {
  const data = response.data;
  console.log(data.participants);
});
```

### Using `GetUserParticipations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserParticipationsRef, GetUserParticipationsVariables } from '@knockoutfpl/dataconnect';

// The `GetUserParticipations` query requires an argument of type `GetUserParticipationsVariables`:
const getUserParticipationsVars: GetUserParticipationsVariables = {
  uid: ..., 
};

// Call the `getUserParticipationsRef()` function to get a reference to the query.
const ref = getUserParticipationsRef(getUserParticipationsVars);
// Variables can be defined inline as well.
const ref = getUserParticipationsRef({ uid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserParticipationsRef(dataConnect, getUserParticipationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.participants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.participants);
});
```

## GetRoundsInEvent
You can execute the `GetRoundsInEvent` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRoundsInEvent(vars: GetRoundsInEventVariables): QueryPromise<GetRoundsInEventData, GetRoundsInEventVariables>;

interface GetRoundsInEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRoundsInEventVariables): QueryRef<GetRoundsInEventData, GetRoundsInEventVariables>;
}
export const getRoundsInEventRef: GetRoundsInEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRoundsInEvent(dc: DataConnect, vars: GetRoundsInEventVariables): QueryPromise<GetRoundsInEventData, GetRoundsInEventVariables>;

interface GetRoundsInEventRef {
  ...
  (dc: DataConnect, vars: GetRoundsInEventVariables): QueryRef<GetRoundsInEventData, GetRoundsInEventVariables>;
}
export const getRoundsInEventRef: GetRoundsInEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRoundsInEventRef:
```typescript
const name = getRoundsInEventRef.operationName;
console.log(name);
```

### Variables
The `GetRoundsInEvent` query requires an argument of type `GetRoundsInEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRoundsInEventVariables {
  event: number;
}
```
### Return Type
Recall that executing the `GetRoundsInEvent` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRoundsInEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetRoundsInEventData {
  rounds: ({
    tournamentId: UUIDString;
    roundNumber: number;
    event: number;
  } & Round_Key)[];
}
```
### Using `GetRoundsInEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRoundsInEvent, GetRoundsInEventVariables } from '@knockoutfpl/dataconnect';

// The `GetRoundsInEvent` query requires an argument of type `GetRoundsInEventVariables`:
const getRoundsInEventVars: GetRoundsInEventVariables = {
  event: ..., 
};

// Call the `getRoundsInEvent()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRoundsInEvent(getRoundsInEventVars);
// Variables can be defined inline as well.
const { data } = await getRoundsInEvent({ event: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRoundsInEvent(dataConnect, getRoundsInEventVars);

console.log(data.rounds);

// Or, you can use the `Promise` API.
getRoundsInEvent(getRoundsInEventVars).then((response) => {
  const data = response.data;
  console.log(data.rounds);
});
```

### Using `GetRoundsInEvent`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRoundsInEventRef, GetRoundsInEventVariables } from '@knockoutfpl/dataconnect';

// The `GetRoundsInEvent` query requires an argument of type `GetRoundsInEventVariables`:
const getRoundsInEventVars: GetRoundsInEventVariables = {
  event: ..., 
};

// Call the `getRoundsInEventRef()` function to get a reference to the query.
const ref = getRoundsInEventRef(getRoundsInEventVars);
// Variables can be defined inline as well.
const ref = getRoundsInEventRef({ event: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRoundsInEventRef(dataConnect, getRoundsInEventVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.rounds);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.rounds);
});
```

## GetTournamentParticipantsWithUsers
You can execute the `GetTournamentParticipantsWithUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getTournamentParticipantsWithUsers(vars: GetTournamentParticipantsWithUsersVariables): QueryPromise<GetTournamentParticipantsWithUsersData, GetTournamentParticipantsWithUsersVariables>;

interface GetTournamentParticipantsWithUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTournamentParticipantsWithUsersVariables): QueryRef<GetTournamentParticipantsWithUsersData, GetTournamentParticipantsWithUsersVariables>;
}
export const getTournamentParticipantsWithUsersRef: GetTournamentParticipantsWithUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTournamentParticipantsWithUsers(dc: DataConnect, vars: GetTournamentParticipantsWithUsersVariables): QueryPromise<GetTournamentParticipantsWithUsersData, GetTournamentParticipantsWithUsersVariables>;

interface GetTournamentParticipantsWithUsersRef {
  ...
  (dc: DataConnect, vars: GetTournamentParticipantsWithUsersVariables): QueryRef<GetTournamentParticipantsWithUsersData, GetTournamentParticipantsWithUsersVariables>;
}
export const getTournamentParticipantsWithUsersRef: GetTournamentParticipantsWithUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTournamentParticipantsWithUsersRef:
```typescript
const name = getTournamentParticipantsWithUsersRef.operationName;
console.log(name);
```

### Variables
The `GetTournamentParticipantsWithUsers` query requires an argument of type `GetTournamentParticipantsWithUsersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTournamentParticipantsWithUsersVariables {
  tournamentId: UUIDString;
}
```
### Return Type
Recall that executing the `GetTournamentParticipantsWithUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTournamentParticipantsWithUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTournamentParticipantsWithUsersData {
  participants: ({
    tournamentId: UUIDString;
    uid?: string | null;
    entryId: number;
    teamName: string;
    user?: {
      uid: string;
      email: string;
    } & User_Key;
  } & Participant_Key)[];
}
```
### Using `GetTournamentParticipantsWithUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTournamentParticipantsWithUsers, GetTournamentParticipantsWithUsersVariables } from '@knockoutfpl/dataconnect';

// The `GetTournamentParticipantsWithUsers` query requires an argument of type `GetTournamentParticipantsWithUsersVariables`:
const getTournamentParticipantsWithUsersVars: GetTournamentParticipantsWithUsersVariables = {
  tournamentId: ..., 
};

// Call the `getTournamentParticipantsWithUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTournamentParticipantsWithUsers(getTournamentParticipantsWithUsersVars);
// Variables can be defined inline as well.
const { data } = await getTournamentParticipantsWithUsers({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTournamentParticipantsWithUsers(dataConnect, getTournamentParticipantsWithUsersVars);

console.log(data.participants);

// Or, you can use the `Promise` API.
getTournamentParticipantsWithUsers(getTournamentParticipantsWithUsersVars).then((response) => {
  const data = response.data;
  console.log(data.participants);
});
```

### Using `GetTournamentParticipantsWithUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTournamentParticipantsWithUsersRef, GetTournamentParticipantsWithUsersVariables } from '@knockoutfpl/dataconnect';

// The `GetTournamentParticipantsWithUsers` query requires an argument of type `GetTournamentParticipantsWithUsersVariables`:
const getTournamentParticipantsWithUsersVars: GetTournamentParticipantsWithUsersVariables = {
  tournamentId: ..., 
};

// Call the `getTournamentParticipantsWithUsersRef()` function to get a reference to the query.
const ref = getTournamentParticipantsWithUsersRef(getTournamentParticipantsWithUsersVars);
// Variables can be defined inline as well.
const ref = getTournamentParticipantsWithUsersRef({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTournamentParticipantsWithUsersRef(dataConnect, getTournamentParticipantsWithUsersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.participants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.participants);
});
```

## GetExistingEmailQueue
You can execute the `GetExistingEmailQueue` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getExistingEmailQueue(vars: GetExistingEmailQueueVariables): QueryPromise<GetExistingEmailQueueData, GetExistingEmailQueueVariables>;

interface GetExistingEmailQueueRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExistingEmailQueueVariables): QueryRef<GetExistingEmailQueueData, GetExistingEmailQueueVariables>;
}
export const getExistingEmailQueueRef: GetExistingEmailQueueRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getExistingEmailQueue(dc: DataConnect, vars: GetExistingEmailQueueVariables): QueryPromise<GetExistingEmailQueueData, GetExistingEmailQueueVariables>;

interface GetExistingEmailQueueRef {
  ...
  (dc: DataConnect, vars: GetExistingEmailQueueVariables): QueryRef<GetExistingEmailQueueData, GetExistingEmailQueueVariables>;
}
export const getExistingEmailQueueRef: GetExistingEmailQueueRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getExistingEmailQueueRef:
```typescript
const name = getExistingEmailQueueRef.operationName;
console.log(name);
```

### Variables
The `GetExistingEmailQueue` query requires an argument of type `GetExistingEmailQueueVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetExistingEmailQueueVariables {
  userUid: string;
  type: string;
  event: number;
}
```
### Return Type
Recall that executing the `GetExistingEmailQueue` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetExistingEmailQueueData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetExistingEmailQueueData {
  emailQueues: ({
    id: UUIDString;
    status: string;
  } & EmailQueue_Key)[];
}
```
### Using `GetExistingEmailQueue`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getExistingEmailQueue, GetExistingEmailQueueVariables } from '@knockoutfpl/dataconnect';

// The `GetExistingEmailQueue` query requires an argument of type `GetExistingEmailQueueVariables`:
const getExistingEmailQueueVars: GetExistingEmailQueueVariables = {
  userUid: ..., 
  type: ..., 
  event: ..., 
};

// Call the `getExistingEmailQueue()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getExistingEmailQueue(getExistingEmailQueueVars);
// Variables can be defined inline as well.
const { data } = await getExistingEmailQueue({ userUid: ..., type: ..., event: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getExistingEmailQueue(dataConnect, getExistingEmailQueueVars);

console.log(data.emailQueues);

// Or, you can use the `Promise` API.
getExistingEmailQueue(getExistingEmailQueueVars).then((response) => {
  const data = response.data;
  console.log(data.emailQueues);
});
```

### Using `GetExistingEmailQueue`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getExistingEmailQueueRef, GetExistingEmailQueueVariables } from '@knockoutfpl/dataconnect';

// The `GetExistingEmailQueue` query requires an argument of type `GetExistingEmailQueueVariables`:
const getExistingEmailQueueVars: GetExistingEmailQueueVariables = {
  userUid: ..., 
  type: ..., 
  event: ..., 
};

// Call the `getExistingEmailQueueRef()` function to get a reference to the query.
const ref = getExistingEmailQueueRef(getExistingEmailQueueVars);
// Variables can be defined inline as well.
const ref = getExistingEmailQueueRef({ userUid: ..., type: ..., event: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getExistingEmailQueueRef(dataConnect, getExistingEmailQueueVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.emailQueues);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.emailQueues);
});
```

## GetEntryMatchPicks
You can execute the `GetEntryMatchPicks` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getEntryMatchPicks(vars: GetEntryMatchPicksVariables): QueryPromise<GetEntryMatchPicksData, GetEntryMatchPicksVariables>;

interface GetEntryMatchPicksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEntryMatchPicksVariables): QueryRef<GetEntryMatchPicksData, GetEntryMatchPicksVariables>;
}
export const getEntryMatchPicksRef: GetEntryMatchPicksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEntryMatchPicks(dc: DataConnect, vars: GetEntryMatchPicksVariables): QueryPromise<GetEntryMatchPicksData, GetEntryMatchPicksVariables>;

interface GetEntryMatchPicksRef {
  ...
  (dc: DataConnect, vars: GetEntryMatchPicksVariables): QueryRef<GetEntryMatchPicksData, GetEntryMatchPicksVariables>;
}
export const getEntryMatchPicksRef: GetEntryMatchPicksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEntryMatchPicksRef:
```typescript
const name = getEntryMatchPicksRef.operationName;
console.log(name);
```

### Variables
The `GetEntryMatchPicks` query requires an argument of type `GetEntryMatchPicksVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetEntryMatchPicksVariables {
  entryId: number;
}
```
### Return Type
Recall that executing the `GetEntryMatchPicks` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEntryMatchPicksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetEntryMatchPicksData {
  matchPicks: ({
    tournamentId: UUIDString;
    matchId: number;
    entryId: number;
    slot: number;
    match: {
      matchId: number;
      roundNumber: number;
      status: string;
      winnerEntryId?: number | null;
      updatedAt: TimestampString;
      isBye: boolean;
    };
  } & MatchPick_Key)[];
}
```
### Using `GetEntryMatchPicks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEntryMatchPicks, GetEntryMatchPicksVariables } from '@knockoutfpl/dataconnect';

// The `GetEntryMatchPicks` query requires an argument of type `GetEntryMatchPicksVariables`:
const getEntryMatchPicksVars: GetEntryMatchPicksVariables = {
  entryId: ..., 
};

// Call the `getEntryMatchPicks()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEntryMatchPicks(getEntryMatchPicksVars);
// Variables can be defined inline as well.
const { data } = await getEntryMatchPicks({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEntryMatchPicks(dataConnect, getEntryMatchPicksVars);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
getEntryMatchPicks(getEntryMatchPicksVars).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

### Using `GetEntryMatchPicks`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEntryMatchPicksRef, GetEntryMatchPicksVariables } from '@knockoutfpl/dataconnect';

// The `GetEntryMatchPicks` query requires an argument of type `GetEntryMatchPicksVariables`:
const getEntryMatchPicksVars: GetEntryMatchPicksVariables = {
  entryId: ..., 
};

// Call the `getEntryMatchPicksRef()` function to get a reference to the query.
const ref = getEntryMatchPicksRef(getEntryMatchPicksVars);
// Variables can be defined inline as well.
const ref = getEntryMatchPicksRef({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEntryMatchPicksRef(dataConnect, getEntryMatchPicksVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

## GetUserVerdictMatchPicks
You can execute the `GetUserVerdictMatchPicks` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserVerdictMatchPicks(vars: GetUserVerdictMatchPicksVariables): QueryPromise<GetUserVerdictMatchPicksData, GetUserVerdictMatchPicksVariables>;

interface GetUserVerdictMatchPicksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVerdictMatchPicksVariables): QueryRef<GetUserVerdictMatchPicksData, GetUserVerdictMatchPicksVariables>;
}
export const getUserVerdictMatchPicksRef: GetUserVerdictMatchPicksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserVerdictMatchPicks(dc: DataConnect, vars: GetUserVerdictMatchPicksVariables): QueryPromise<GetUserVerdictMatchPicksData, GetUserVerdictMatchPicksVariables>;

interface GetUserVerdictMatchPicksRef {
  ...
  (dc: DataConnect, vars: GetUserVerdictMatchPicksVariables): QueryRef<GetUserVerdictMatchPicksData, GetUserVerdictMatchPicksVariables>;
}
export const getUserVerdictMatchPicksRef: GetUserVerdictMatchPicksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserVerdictMatchPicksRef:
```typescript
const name = getUserVerdictMatchPicksRef.operationName;
console.log(name);
```

### Variables
The `GetUserVerdictMatchPicks` query requires an argument of type `GetUserVerdictMatchPicksVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserVerdictMatchPicksVariables {
  entryId: number;
}
```
### Return Type
Recall that executing the `GetUserVerdictMatchPicks` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserVerdictMatchPicksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserVerdictMatchPicksData {
  matchPicks: ({
    tournamentId: UUIDString;
    matchId: number;
    entryId: number;
    slot: number;
    match: {
      matchId: number;
      roundNumber: number;
      status: string;
      winnerEntryId?: number | null;
      isBye: boolean;
      positionInRound: number;
      tournament: {
        id: UUIDString;
        fplLeagueName: string;
        totalRounds: number;
      } & Tournament_Key;
    };
      participant: {
        entryId: number;
        teamName: string;
        seed: number;
      };
  } & MatchPick_Key)[];
}
```
### Using `GetUserVerdictMatchPicks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserVerdictMatchPicks, GetUserVerdictMatchPicksVariables } from '@knockoutfpl/dataconnect';

// The `GetUserVerdictMatchPicks` query requires an argument of type `GetUserVerdictMatchPicksVariables`:
const getUserVerdictMatchPicksVars: GetUserVerdictMatchPicksVariables = {
  entryId: ..., 
};

// Call the `getUserVerdictMatchPicks()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserVerdictMatchPicks(getUserVerdictMatchPicksVars);
// Variables can be defined inline as well.
const { data } = await getUserVerdictMatchPicks({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserVerdictMatchPicks(dataConnect, getUserVerdictMatchPicksVars);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
getUserVerdictMatchPicks(getUserVerdictMatchPicksVars).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

### Using `GetUserVerdictMatchPicks`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserVerdictMatchPicksRef, GetUserVerdictMatchPicksVariables } from '@knockoutfpl/dataconnect';

// The `GetUserVerdictMatchPicks` query requires an argument of type `GetUserVerdictMatchPicksVariables`:
const getUserVerdictMatchPicksVars: GetUserVerdictMatchPicksVariables = {
  entryId: ..., 
};

// Call the `getUserVerdictMatchPicksRef()` function to get a reference to the query.
const ref = getUserVerdictMatchPicksRef(getUserVerdictMatchPicksVars);
// Variables can be defined inline as well.
const ref = getUserVerdictMatchPicksRef({ entryId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserVerdictMatchPicksRef(dataConnect, getUserVerdictMatchPicksVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

## GetMatchParticipants
You can execute the `GetMatchParticipants` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMatchParticipants(vars: GetMatchParticipantsVariables): QueryPromise<GetMatchParticipantsData, GetMatchParticipantsVariables>;

interface GetMatchParticipantsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMatchParticipantsVariables): QueryRef<GetMatchParticipantsData, GetMatchParticipantsVariables>;
}
export const getMatchParticipantsRef: GetMatchParticipantsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMatchParticipants(dc: DataConnect, vars: GetMatchParticipantsVariables): QueryPromise<GetMatchParticipantsData, GetMatchParticipantsVariables>;

interface GetMatchParticipantsRef {
  ...
  (dc: DataConnect, vars: GetMatchParticipantsVariables): QueryRef<GetMatchParticipantsData, GetMatchParticipantsVariables>;
}
export const getMatchParticipantsRef: GetMatchParticipantsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMatchParticipantsRef:
```typescript
const name = getMatchParticipantsRef.operationName;
console.log(name);
```

### Variables
The `GetMatchParticipants` query requires an argument of type `GetMatchParticipantsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMatchParticipantsVariables {
  tournamentId: UUIDString;
  matchId: number;
}
```
### Return Type
Recall that executing the `GetMatchParticipants` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMatchParticipantsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMatchParticipantsData {
  matchPicks: ({
    entryId: number;
    slot: number;
    participant: {
      entryId: number;
      teamName: string;
      seed: number;
    };
  })[];
}
```
### Using `GetMatchParticipants`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMatchParticipants, GetMatchParticipantsVariables } from '@knockoutfpl/dataconnect';

// The `GetMatchParticipants` query requires an argument of type `GetMatchParticipantsVariables`:
const getMatchParticipantsVars: GetMatchParticipantsVariables = {
  tournamentId: ..., 
  matchId: ..., 
};

// Call the `getMatchParticipants()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMatchParticipants(getMatchParticipantsVars);
// Variables can be defined inline as well.
const { data } = await getMatchParticipants({ tournamentId: ..., matchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMatchParticipants(dataConnect, getMatchParticipantsVars);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
getMatchParticipants(getMatchParticipantsVars).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

### Using `GetMatchParticipants`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMatchParticipantsRef, GetMatchParticipantsVariables } from '@knockoutfpl/dataconnect';

// The `GetMatchParticipants` query requires an argument of type `GetMatchParticipantsVariables`:
const getMatchParticipantsVars: GetMatchParticipantsVariables = {
  tournamentId: ..., 
  matchId: ..., 
};

// Call the `getMatchParticipantsRef()` function to get a reference to the query.
const ref = getMatchParticipantsRef(getMatchParticipantsVars);
// Variables can be defined inline as well.
const ref = getMatchParticipantsRef({ tournamentId: ..., matchId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMatchParticipantsRef(dataConnect, getMatchParticipantsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.matchPicks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.matchPicks);
});
```

## GetPickScores
You can execute the `GetPickScores` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPickScores(vars: GetPickScoresVariables): QueryPromise<GetPickScoresData, GetPickScoresVariables>;

interface GetPickScoresRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPickScoresVariables): QueryRef<GetPickScoresData, GetPickScoresVariables>;
}
export const getPickScoresRef: GetPickScoresRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPickScores(dc: DataConnect, vars: GetPickScoresVariables): QueryPromise<GetPickScoresData, GetPickScoresVariables>;

interface GetPickScoresRef {
  ...
  (dc: DataConnect, vars: GetPickScoresVariables): QueryRef<GetPickScoresData, GetPickScoresVariables>;
}
export const getPickScoresRef: GetPickScoresRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPickScoresRef:
```typescript
const name = getPickScoresRef.operationName;
console.log(name);
```

### Variables
The `GetPickScores` query requires an argument of type `GetPickScoresVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPickScoresVariables {
  entryIds: number[];
  event: number;
}
```
### Return Type
Recall that executing the `GetPickScores` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPickScoresData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPickScoresData {
  picks: ({
    entryId: number;
    event: number;
    points: number;
  } & Pick_Key)[];
}
```
### Using `GetPickScores`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPickScores, GetPickScoresVariables } from '@knockoutfpl/dataconnect';

// The `GetPickScores` query requires an argument of type `GetPickScoresVariables`:
const getPickScoresVars: GetPickScoresVariables = {
  entryIds: ..., 
  event: ..., 
};

// Call the `getPickScores()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPickScores(getPickScoresVars);
// Variables can be defined inline as well.
const { data } = await getPickScores({ entryIds: ..., event: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPickScores(dataConnect, getPickScoresVars);

console.log(data.picks);

// Or, you can use the `Promise` API.
getPickScores(getPickScoresVars).then((response) => {
  const data = response.data;
  console.log(data.picks);
});
```

### Using `GetPickScores`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPickScoresRef, GetPickScoresVariables } from '@knockoutfpl/dataconnect';

// The `GetPickScores` query requires an argument of type `GetPickScoresVariables`:
const getPickScoresVars: GetPickScoresVariables = {
  entryIds: ..., 
  event: ..., 
};

// Call the `getPickScoresRef()` function to get a reference to the query.
const ref = getPickScoresRef(getPickScoresVars);
// Variables can be defined inline as well.
const ref = getPickScoresRef({ entryIds: ..., event: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPickScoresRef(dataConnect, getPickScoresVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.picks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.picks);
});
```

## GetRoundMatchesWithPriority
You can execute the `GetRoundMatchesWithPriority` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRoundMatchesWithPriority(vars: GetRoundMatchesWithPriorityVariables): QueryPromise<GetRoundMatchesWithPriorityData, GetRoundMatchesWithPriorityVariables>;

interface GetRoundMatchesWithPriorityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRoundMatchesWithPriorityVariables): QueryRef<GetRoundMatchesWithPriorityData, GetRoundMatchesWithPriorityVariables>;
}
export const getRoundMatchesWithPriorityRef: GetRoundMatchesWithPriorityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRoundMatchesWithPriority(dc: DataConnect, vars: GetRoundMatchesWithPriorityVariables): QueryPromise<GetRoundMatchesWithPriorityData, GetRoundMatchesWithPriorityVariables>;

interface GetRoundMatchesWithPriorityRef {
  ...
  (dc: DataConnect, vars: GetRoundMatchesWithPriorityVariables): QueryRef<GetRoundMatchesWithPriorityData, GetRoundMatchesWithPriorityVariables>;
}
export const getRoundMatchesWithPriorityRef: GetRoundMatchesWithPriorityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRoundMatchesWithPriorityRef:
```typescript
const name = getRoundMatchesWithPriorityRef.operationName;
console.log(name);
```

### Variables
The `GetRoundMatchesWithPriority` query requires an argument of type `GetRoundMatchesWithPriorityVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRoundMatchesWithPriorityVariables {
  tournamentId: UUIDString;
  roundNumber: number;
}
```
### Return Type
Recall that executing the `GetRoundMatchesWithPriority` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRoundMatchesWithPriorityData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetRoundMatchesWithPriorityData {
  matches: ({
    matchId: number;
    roundNumber: number;
    positionInRound: number;
    status: string;
    winnerEntryId?: number | null;
    qualifiesToMatchId?: number | null;
    matchPicks_on_match: ({
      entryId: number;
      slot: number;
      participant: {
        seed: number;
        uid?: string | null;
      };
    })[];
  })[];
}
```
### Using `GetRoundMatchesWithPriority`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRoundMatchesWithPriority, GetRoundMatchesWithPriorityVariables } from '@knockoutfpl/dataconnect';

// The `GetRoundMatchesWithPriority` query requires an argument of type `GetRoundMatchesWithPriorityVariables`:
const getRoundMatchesWithPriorityVars: GetRoundMatchesWithPriorityVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
};

// Call the `getRoundMatchesWithPriority()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRoundMatchesWithPriority(getRoundMatchesWithPriorityVars);
// Variables can be defined inline as well.
const { data } = await getRoundMatchesWithPriority({ tournamentId: ..., roundNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRoundMatchesWithPriority(dataConnect, getRoundMatchesWithPriorityVars);

console.log(data.matches);

// Or, you can use the `Promise` API.
getRoundMatchesWithPriority(getRoundMatchesWithPriorityVars).then((response) => {
  const data = response.data;
  console.log(data.matches);
});
```

### Using `GetRoundMatchesWithPriority`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRoundMatchesWithPriorityRef, GetRoundMatchesWithPriorityVariables } from '@knockoutfpl/dataconnect';

// The `GetRoundMatchesWithPriority` query requires an argument of type `GetRoundMatchesWithPriorityVariables`:
const getRoundMatchesWithPriorityVars: GetRoundMatchesWithPriorityVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
};

// Call the `getRoundMatchesWithPriorityRef()` function to get a reference to the query.
const ref = getRoundMatchesWithPriorityRef(getRoundMatchesWithPriorityVars);
// Variables can be defined inline as well.
const ref = getRoundMatchesWithPriorityRef({ tournamentId: ..., roundNumber: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRoundMatchesWithPriorityRef(dataConnect, getRoundMatchesWithPriorityVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.matches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.matches);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## UpsertUser
You can execute the `UpsertUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface UpsertUserRef {
  ...
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
}
export const upsertUserRef: UpsertUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserRef:
```typescript
const name = upsertUserRef.operationName;
console.log(name);
```

### Variables
The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertUserVariables {
  uid: string;
  email: string;
}
```
### Return Type
Recall that executing the `UpsertUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserData {
  user_upsert: User_Key;
}
```
### Using `UpsertUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUser, UpsertUserVariables } from '@knockoutfpl/dataconnect';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  uid: ..., 
  email: ..., 
};

// Call the `upsertUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUser(upsertUserVars);
// Variables can be defined inline as well.
const { data } = await upsertUser({ uid: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUser(dataConnect, upsertUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertUser(upsertUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserRef, UpsertUserVariables } from '@knockoutfpl/dataconnect';

// The `UpsertUser` mutation requires an argument of type `UpsertUserVariables`:
const upsertUserVars: UpsertUserVariables = {
  uid: ..., 
  email: ..., 
};

// Call the `upsertUserRef()` function to get a reference to the mutation.
const ref = upsertUserRef(upsertUserVars);
// Variables can be defined inline as well.
const ref = upsertUserRef({ uid: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserRef(dataConnect, upsertUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## ConnectFplEntry
You can execute the `ConnectFplEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
connectFplEntry(vars: ConnectFplEntryVariables): MutationPromise<ConnectFplEntryData, ConnectFplEntryVariables>;

interface ConnectFplEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ConnectFplEntryVariables): MutationRef<ConnectFplEntryData, ConnectFplEntryVariables>;
}
export const connectFplEntryRef: ConnectFplEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
connectFplEntry(dc: DataConnect, vars: ConnectFplEntryVariables): MutationPromise<ConnectFplEntryData, ConnectFplEntryVariables>;

interface ConnectFplEntryRef {
  ...
  (dc: DataConnect, vars: ConnectFplEntryVariables): MutationRef<ConnectFplEntryData, ConnectFplEntryVariables>;
}
export const connectFplEntryRef: ConnectFplEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the connectFplEntryRef:
```typescript
const name = connectFplEntryRef.operationName;
console.log(name);
```

### Variables
The `ConnectFplEntry` mutation requires an argument of type `ConnectFplEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ConnectFplEntryVariables {
  uid: string;
  email: string;
  entryId: number;
}
```
### Return Type
Recall that executing the `ConnectFplEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ConnectFplEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ConnectFplEntryData {
  user_upsert: User_Key;
}
```
### Using `ConnectFplEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, connectFplEntry, ConnectFplEntryVariables } from '@knockoutfpl/dataconnect';

// The `ConnectFplEntry` mutation requires an argument of type `ConnectFplEntryVariables`:
const connectFplEntryVars: ConnectFplEntryVariables = {
  uid: ..., 
  email: ..., 
  entryId: ..., 
};

// Call the `connectFplEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await connectFplEntry(connectFplEntryVars);
// Variables can be defined inline as well.
const { data } = await connectFplEntry({ uid: ..., email: ..., entryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await connectFplEntry(dataConnect, connectFplEntryVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
connectFplEntry(connectFplEntryVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `ConnectFplEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, connectFplEntryRef, ConnectFplEntryVariables } from '@knockoutfpl/dataconnect';

// The `ConnectFplEntry` mutation requires an argument of type `ConnectFplEntryVariables`:
const connectFplEntryVars: ConnectFplEntryVariables = {
  uid: ..., 
  email: ..., 
  entryId: ..., 
};

// Call the `connectFplEntryRef()` function to get a reference to the mutation.
const ref = connectFplEntryRef(connectFplEntryVars);
// Variables can be defined inline as well.
const ref = connectFplEntryRef({ uid: ..., email: ..., entryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = connectFplEntryRef(dataConnect, connectFplEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## UpsertEntry
You can execute the `UpsertEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertEntry(vars: UpsertEntryVariables): MutationPromise<UpsertEntryData, UpsertEntryVariables>;

interface UpsertEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertEntryVariables): MutationRef<UpsertEntryData, UpsertEntryVariables>;
}
export const upsertEntryRef: UpsertEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertEntry(dc: DataConnect, vars: UpsertEntryVariables): MutationPromise<UpsertEntryData, UpsertEntryVariables>;

interface UpsertEntryRef {
  ...
  (dc: DataConnect, vars: UpsertEntryVariables): MutationRef<UpsertEntryData, UpsertEntryVariables>;
}
export const upsertEntryRef: UpsertEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertEntryRef:
```typescript
const name = upsertEntryRef.operationName;
console.log(name);
```

### Variables
The `UpsertEntry` mutation requires an argument of type `UpsertEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertEntryVariables {
  entryId: number;
  season: string;
  name: string;
  playerFirstName?: string | null;
  playerLastName?: string | null;
  summaryOverallPoints?: number | null;
  summaryOverallRank?: number | null;
  summaryEventPoints?: number | null;
  summaryEventRank?: number | null;
  rawJson: string;
}
```
### Return Type
Recall that executing the `UpsertEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertEntryData {
  entry_upsert: Entry_Key;
}
```
### Using `UpsertEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertEntry, UpsertEntryVariables } from '@knockoutfpl/dataconnect';

// The `UpsertEntry` mutation requires an argument of type `UpsertEntryVariables`:
const upsertEntryVars: UpsertEntryVariables = {
  entryId: ..., 
  season: ..., 
  name: ..., 
  playerFirstName: ..., // optional
  playerLastName: ..., // optional
  summaryOverallPoints: ..., // optional
  summaryOverallRank: ..., // optional
  summaryEventPoints: ..., // optional
  summaryEventRank: ..., // optional
  rawJson: ..., 
};

// Call the `upsertEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertEntry(upsertEntryVars);
// Variables can be defined inline as well.
const { data } = await upsertEntry({ entryId: ..., season: ..., name: ..., playerFirstName: ..., playerLastName: ..., summaryOverallPoints: ..., summaryOverallRank: ..., summaryEventPoints: ..., summaryEventRank: ..., rawJson: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertEntry(dataConnect, upsertEntryVars);

console.log(data.entry_upsert);

// Or, you can use the `Promise` API.
upsertEntry(upsertEntryVars).then((response) => {
  const data = response.data;
  console.log(data.entry_upsert);
});
```

### Using `UpsertEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertEntryRef, UpsertEntryVariables } from '@knockoutfpl/dataconnect';

// The `UpsertEntry` mutation requires an argument of type `UpsertEntryVariables`:
const upsertEntryVars: UpsertEntryVariables = {
  entryId: ..., 
  season: ..., 
  name: ..., 
  playerFirstName: ..., // optional
  playerLastName: ..., // optional
  summaryOverallPoints: ..., // optional
  summaryOverallRank: ..., // optional
  summaryEventPoints: ..., // optional
  summaryEventRank: ..., // optional
  rawJson: ..., 
};

// Call the `upsertEntryRef()` function to get a reference to the mutation.
const ref = upsertEntryRef(upsertEntryVars);
// Variables can be defined inline as well.
const ref = upsertEntryRef({ entryId: ..., season: ..., name: ..., playerFirstName: ..., playerLastName: ..., summaryOverallPoints: ..., summaryOverallRank: ..., summaryEventPoints: ..., summaryEventRank: ..., rawJson: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertEntryRef(dataConnect, upsertEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.entry_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.entry_upsert);
});
```

## UpsertPick
You can execute the `UpsertPick` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertPick(vars: UpsertPickVariables): MutationPromise<UpsertPickData, UpsertPickVariables>;

interface UpsertPickRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertPickVariables): MutationRef<UpsertPickData, UpsertPickVariables>;
}
export const upsertPickRef: UpsertPickRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertPick(dc: DataConnect, vars: UpsertPickVariables): MutationPromise<UpsertPickData, UpsertPickVariables>;

interface UpsertPickRef {
  ...
  (dc: DataConnect, vars: UpsertPickVariables): MutationRef<UpsertPickData, UpsertPickVariables>;
}
export const upsertPickRef: UpsertPickRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertPickRef:
```typescript
const name = upsertPickRef.operationName;
console.log(name);
```

### Variables
The `UpsertPick` mutation requires an argument of type `UpsertPickVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertPickVariables {
  entryId: number;
  event: number;
  points: number;
  totalPoints?: number | null;
  rank?: number | null;
  overallRank?: number | null;
  eventTransfersCost?: number | null;
  activeChip?: string | null;
  rawJson: string;
  isFinal: boolean;
}
```
### Return Type
Recall that executing the `UpsertPick` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertPickData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertPickData {
  pick_upsert: Pick_Key;
}
```
### Using `UpsertPick`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertPick, UpsertPickVariables } from '@knockoutfpl/dataconnect';

// The `UpsertPick` mutation requires an argument of type `UpsertPickVariables`:
const upsertPickVars: UpsertPickVariables = {
  entryId: ..., 
  event: ..., 
  points: ..., 
  totalPoints: ..., // optional
  rank: ..., // optional
  overallRank: ..., // optional
  eventTransfersCost: ..., // optional
  activeChip: ..., // optional
  rawJson: ..., 
  isFinal: ..., 
};

// Call the `upsertPick()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertPick(upsertPickVars);
// Variables can be defined inline as well.
const { data } = await upsertPick({ entryId: ..., event: ..., points: ..., totalPoints: ..., rank: ..., overallRank: ..., eventTransfersCost: ..., activeChip: ..., rawJson: ..., isFinal: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertPick(dataConnect, upsertPickVars);

console.log(data.pick_upsert);

// Or, you can use the `Promise` API.
upsertPick(upsertPickVars).then((response) => {
  const data = response.data;
  console.log(data.pick_upsert);
});
```

### Using `UpsertPick`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertPickRef, UpsertPickVariables } from '@knockoutfpl/dataconnect';

// The `UpsertPick` mutation requires an argument of type `UpsertPickVariables`:
const upsertPickVars: UpsertPickVariables = {
  entryId: ..., 
  event: ..., 
  points: ..., 
  totalPoints: ..., // optional
  rank: ..., // optional
  overallRank: ..., // optional
  eventTransfersCost: ..., // optional
  activeChip: ..., // optional
  rawJson: ..., 
  isFinal: ..., 
};

// Call the `upsertPickRef()` function to get a reference to the mutation.
const ref = upsertPickRef(upsertPickVars);
// Variables can be defined inline as well.
const ref = upsertPickRef({ entryId: ..., event: ..., points: ..., totalPoints: ..., rank: ..., overallRank: ..., eventTransfersCost: ..., activeChip: ..., rawJson: ..., isFinal: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertPickRef(dataConnect, upsertPickVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.pick_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.pick_upsert);
});
```

## UpsertLeague
You can execute the `UpsertLeague` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertLeague(vars: UpsertLeagueVariables): MutationPromise<UpsertLeagueData, UpsertLeagueVariables>;

interface UpsertLeagueRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertLeagueVariables): MutationRef<UpsertLeagueData, UpsertLeagueVariables>;
}
export const upsertLeagueRef: UpsertLeagueRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertLeague(dc: DataConnect, vars: UpsertLeagueVariables): MutationPromise<UpsertLeagueData, UpsertLeagueVariables>;

interface UpsertLeagueRef {
  ...
  (dc: DataConnect, vars: UpsertLeagueVariables): MutationRef<UpsertLeagueData, UpsertLeagueVariables>;
}
export const upsertLeagueRef: UpsertLeagueRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertLeagueRef:
```typescript
const name = upsertLeagueRef.operationName;
console.log(name);
```

### Variables
The `UpsertLeague` mutation requires an argument of type `UpsertLeagueVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertLeagueVariables {
  leagueId: number;
  season: string;
  name: string;
  created?: TimestampString | null;
  adminEntry?: number | null;
  rawJson: string;
}
```
### Return Type
Recall that executing the `UpsertLeague` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertLeagueData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertLeagueData {
  league_upsert: League_Key;
}
```
### Using `UpsertLeague`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertLeague, UpsertLeagueVariables } from '@knockoutfpl/dataconnect';

// The `UpsertLeague` mutation requires an argument of type `UpsertLeagueVariables`:
const upsertLeagueVars: UpsertLeagueVariables = {
  leagueId: ..., 
  season: ..., 
  name: ..., 
  created: ..., // optional
  adminEntry: ..., // optional
  rawJson: ..., 
};

// Call the `upsertLeague()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertLeague(upsertLeagueVars);
// Variables can be defined inline as well.
const { data } = await upsertLeague({ leagueId: ..., season: ..., name: ..., created: ..., adminEntry: ..., rawJson: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertLeague(dataConnect, upsertLeagueVars);

console.log(data.league_upsert);

// Or, you can use the `Promise` API.
upsertLeague(upsertLeagueVars).then((response) => {
  const data = response.data;
  console.log(data.league_upsert);
});
```

### Using `UpsertLeague`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertLeagueRef, UpsertLeagueVariables } from '@knockoutfpl/dataconnect';

// The `UpsertLeague` mutation requires an argument of type `UpsertLeagueVariables`:
const upsertLeagueVars: UpsertLeagueVariables = {
  leagueId: ..., 
  season: ..., 
  name: ..., 
  created: ..., // optional
  adminEntry: ..., // optional
  rawJson: ..., 
};

// Call the `upsertLeagueRef()` function to get a reference to the mutation.
const ref = upsertLeagueRef(upsertLeagueVars);
// Variables can be defined inline as well.
const ref = upsertLeagueRef({ leagueId: ..., season: ..., name: ..., created: ..., adminEntry: ..., rawJson: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertLeagueRef(dataConnect, upsertLeagueVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.league_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.league_upsert);
});
```

## UpsertEvent
You can execute the `UpsertEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertEvent(vars: UpsertEventVariables): MutationPromise<UpsertEventData, UpsertEventVariables>;

interface UpsertEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertEventVariables): MutationRef<UpsertEventData, UpsertEventVariables>;
}
export const upsertEventRef: UpsertEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertEvent(dc: DataConnect, vars: UpsertEventVariables): MutationPromise<UpsertEventData, UpsertEventVariables>;

interface UpsertEventRef {
  ...
  (dc: DataConnect, vars: UpsertEventVariables): MutationRef<UpsertEventData, UpsertEventVariables>;
}
export const upsertEventRef: UpsertEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertEventRef:
```typescript
const name = upsertEventRef.operationName;
console.log(name);
```

### Variables
The `UpsertEvent` mutation requires an argument of type `UpsertEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertEventVariables {
  event: number;
  season: string;
  name: string;
  deadlineTime: TimestampString;
  finished: boolean;
  finalizedAt?: TimestampString | null;
  isCurrent: boolean;
  isNext: boolean;
  rawJson: string;
}
```
### Return Type
Recall that executing the `UpsertEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertEventData {
  event_upsert: Event_Key;
}
```
### Using `UpsertEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertEvent, UpsertEventVariables } from '@knockoutfpl/dataconnect';

// The `UpsertEvent` mutation requires an argument of type `UpsertEventVariables`:
const upsertEventVars: UpsertEventVariables = {
  event: ..., 
  season: ..., 
  name: ..., 
  deadlineTime: ..., 
  finished: ..., 
  finalizedAt: ..., // optional
  isCurrent: ..., 
  isNext: ..., 
  rawJson: ..., 
};

// Call the `upsertEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertEvent(upsertEventVars);
// Variables can be defined inline as well.
const { data } = await upsertEvent({ event: ..., season: ..., name: ..., deadlineTime: ..., finished: ..., finalizedAt: ..., isCurrent: ..., isNext: ..., rawJson: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertEvent(dataConnect, upsertEventVars);

console.log(data.event_upsert);

// Or, you can use the `Promise` API.
upsertEvent(upsertEventVars).then((response) => {
  const data = response.data;
  console.log(data.event_upsert);
});
```

### Using `UpsertEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertEventRef, UpsertEventVariables } from '@knockoutfpl/dataconnect';

// The `UpsertEvent` mutation requires an argument of type `UpsertEventVariables`:
const upsertEventVars: UpsertEventVariables = {
  event: ..., 
  season: ..., 
  name: ..., 
  deadlineTime: ..., 
  finished: ..., 
  finalizedAt: ..., // optional
  isCurrent: ..., 
  isNext: ..., 
  rawJson: ..., 
};

// Call the `upsertEventRef()` function to get a reference to the mutation.
const ref = upsertEventRef(upsertEventVars);
// Variables can be defined inline as well.
const ref = upsertEventRef({ event: ..., season: ..., name: ..., deadlineTime: ..., finished: ..., finalizedAt: ..., isCurrent: ..., isNext: ..., rawJson: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertEventRef(dataConnect, upsertEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.event_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.event_upsert);
});
```

## CreateTournament
You can execute the `CreateTournament` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTournament(vars: CreateTournamentVariables): MutationPromise<CreateTournamentData, CreateTournamentVariables>;

interface CreateTournamentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTournamentVariables): MutationRef<CreateTournamentData, CreateTournamentVariables>;
}
export const createTournamentRef: CreateTournamentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTournament(dc: DataConnect, vars: CreateTournamentVariables): MutationPromise<CreateTournamentData, CreateTournamentVariables>;

interface CreateTournamentRef {
  ...
  (dc: DataConnect, vars: CreateTournamentVariables): MutationRef<CreateTournamentData, CreateTournamentVariables>;
}
export const createTournamentRef: CreateTournamentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTournamentRef:
```typescript
const name = createTournamentRef.operationName;
console.log(name);
```

### Variables
The `CreateTournament` mutation requires an argument of type `CreateTournamentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTournamentVariables {
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
  matchSize: number;
}
```
### Return Type
Recall that executing the `CreateTournament` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTournamentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTournamentData {
  tournament_insert: Tournament_Key;
}
```
### Using `CreateTournament`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTournament, CreateTournamentVariables } from '@knockoutfpl/dataconnect';

// The `CreateTournament` mutation requires an argument of type `CreateTournamentVariables`:
const createTournamentVars: CreateTournamentVariables = {
  fplLeagueId: ..., 
  fplLeagueName: ..., 
  creatorUid: ..., 
  participantCount: ..., 
  totalRounds: ..., 
  startEvent: ..., 
  seedingMethod: ..., 
  matchSize: ..., 
};

// Call the `createTournament()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTournament(createTournamentVars);
// Variables can be defined inline as well.
const { data } = await createTournament({ fplLeagueId: ..., fplLeagueName: ..., creatorUid: ..., participantCount: ..., totalRounds: ..., startEvent: ..., seedingMethod: ..., matchSize: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTournament(dataConnect, createTournamentVars);

console.log(data.tournament_insert);

// Or, you can use the `Promise` API.
createTournament(createTournamentVars).then((response) => {
  const data = response.data;
  console.log(data.tournament_insert);
});
```

### Using `CreateTournament`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTournamentRef, CreateTournamentVariables } from '@knockoutfpl/dataconnect';

// The `CreateTournament` mutation requires an argument of type `CreateTournamentVariables`:
const createTournamentVars: CreateTournamentVariables = {
  fplLeagueId: ..., 
  fplLeagueName: ..., 
  creatorUid: ..., 
  participantCount: ..., 
  totalRounds: ..., 
  startEvent: ..., 
  seedingMethod: ..., 
  matchSize: ..., 
};

// Call the `createTournamentRef()` function to get a reference to the mutation.
const ref = createTournamentRef(createTournamentVars);
// Variables can be defined inline as well.
const ref = createTournamentRef({ fplLeagueId: ..., fplLeagueName: ..., creatorUid: ..., participantCount: ..., totalRounds: ..., startEvent: ..., seedingMethod: ..., matchSize: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTournamentRef(dataConnect, createTournamentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tournament_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament_insert);
});
```

## CreateTournamentWithImportStatus
You can execute the `CreateTournamentWithImportStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTournamentWithImportStatus(vars: CreateTournamentWithImportStatusVariables): MutationPromise<CreateTournamentWithImportStatusData, CreateTournamentWithImportStatusVariables>;

interface CreateTournamentWithImportStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTournamentWithImportStatusVariables): MutationRef<CreateTournamentWithImportStatusData, CreateTournamentWithImportStatusVariables>;
}
export const createTournamentWithImportStatusRef: CreateTournamentWithImportStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTournamentWithImportStatus(dc: DataConnect, vars: CreateTournamentWithImportStatusVariables): MutationPromise<CreateTournamentWithImportStatusData, CreateTournamentWithImportStatusVariables>;

interface CreateTournamentWithImportStatusRef {
  ...
  (dc: DataConnect, vars: CreateTournamentWithImportStatusVariables): MutationRef<CreateTournamentWithImportStatusData, CreateTournamentWithImportStatusVariables>;
}
export const createTournamentWithImportStatusRef: CreateTournamentWithImportStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTournamentWithImportStatusRef:
```typescript
const name = createTournamentWithImportStatusRef.operationName;
console.log(name);
```

### Variables
The `CreateTournamentWithImportStatus` mutation requires an argument of type `CreateTournamentWithImportStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTournamentWithImportStatusVariables {
  id: UUIDString;
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
  matchSize: number;
  isTest: boolean;
  size: string;
  importStatus: string;
  totalCount: number;
}
```
### Return Type
Recall that executing the `CreateTournamentWithImportStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTournamentWithImportStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTournamentWithImportStatusData {
  tournament_insert: Tournament_Key;
}
```
### Using `CreateTournamentWithImportStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTournamentWithImportStatus, CreateTournamentWithImportStatusVariables } from '@knockoutfpl/dataconnect';

// The `CreateTournamentWithImportStatus` mutation requires an argument of type `CreateTournamentWithImportStatusVariables`:
const createTournamentWithImportStatusVars: CreateTournamentWithImportStatusVariables = {
  id: ..., 
  fplLeagueId: ..., 
  fplLeagueName: ..., 
  creatorUid: ..., 
  participantCount: ..., 
  totalRounds: ..., 
  startEvent: ..., 
  seedingMethod: ..., 
  matchSize: ..., 
  isTest: ..., 
  size: ..., 
  importStatus: ..., 
  totalCount: ..., 
};

// Call the `createTournamentWithImportStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTournamentWithImportStatus(createTournamentWithImportStatusVars);
// Variables can be defined inline as well.
const { data } = await createTournamentWithImportStatus({ id: ..., fplLeagueId: ..., fplLeagueName: ..., creatorUid: ..., participantCount: ..., totalRounds: ..., startEvent: ..., seedingMethod: ..., matchSize: ..., isTest: ..., size: ..., importStatus: ..., totalCount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTournamentWithImportStatus(dataConnect, createTournamentWithImportStatusVars);

console.log(data.tournament_insert);

// Or, you can use the `Promise` API.
createTournamentWithImportStatus(createTournamentWithImportStatusVars).then((response) => {
  const data = response.data;
  console.log(data.tournament_insert);
});
```

### Using `CreateTournamentWithImportStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTournamentWithImportStatusRef, CreateTournamentWithImportStatusVariables } from '@knockoutfpl/dataconnect';

// The `CreateTournamentWithImportStatus` mutation requires an argument of type `CreateTournamentWithImportStatusVariables`:
const createTournamentWithImportStatusVars: CreateTournamentWithImportStatusVariables = {
  id: ..., 
  fplLeagueId: ..., 
  fplLeagueName: ..., 
  creatorUid: ..., 
  participantCount: ..., 
  totalRounds: ..., 
  startEvent: ..., 
  seedingMethod: ..., 
  matchSize: ..., 
  isTest: ..., 
  size: ..., 
  importStatus: ..., 
  totalCount: ..., 
};

// Call the `createTournamentWithImportStatusRef()` function to get a reference to the mutation.
const ref = createTournamentWithImportStatusRef(createTournamentWithImportStatusVars);
// Variables can be defined inline as well.
const ref = createTournamentWithImportStatusRef({ id: ..., fplLeagueId: ..., fplLeagueName: ..., creatorUid: ..., participantCount: ..., totalRounds: ..., startEvent: ..., seedingMethod: ..., matchSize: ..., isTest: ..., size: ..., importStatus: ..., totalCount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTournamentWithImportStatusRef(dataConnect, createTournamentWithImportStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tournament_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament_insert);
});
```

## UpdateTournamentImportProgress
You can execute the `UpdateTournamentImportProgress` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTournamentImportProgress(vars: UpdateTournamentImportProgressVariables): MutationPromise<UpdateTournamentImportProgressData, UpdateTournamentImportProgressVariables>;

interface UpdateTournamentImportProgressRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTournamentImportProgressVariables): MutationRef<UpdateTournamentImportProgressData, UpdateTournamentImportProgressVariables>;
}
export const updateTournamentImportProgressRef: UpdateTournamentImportProgressRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTournamentImportProgress(dc: DataConnect, vars: UpdateTournamentImportProgressVariables): MutationPromise<UpdateTournamentImportProgressData, UpdateTournamentImportProgressVariables>;

interface UpdateTournamentImportProgressRef {
  ...
  (dc: DataConnect, vars: UpdateTournamentImportProgressVariables): MutationRef<UpdateTournamentImportProgressData, UpdateTournamentImportProgressVariables>;
}
export const updateTournamentImportProgressRef: UpdateTournamentImportProgressRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTournamentImportProgressRef:
```typescript
const name = updateTournamentImportProgressRef.operationName;
console.log(name);
```

### Variables
The `UpdateTournamentImportProgress` mutation requires an argument of type `UpdateTournamentImportProgressVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTournamentImportProgressVariables {
  id: UUIDString;
  importStatus: string;
  importProgress: number;
  importedCount: number;
  importError?: string | null;
}
```
### Return Type
Recall that executing the `UpdateTournamentImportProgress` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTournamentImportProgressData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTournamentImportProgressData {
  tournament_update?: Tournament_Key | null;
}
```
### Using `UpdateTournamentImportProgress`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTournamentImportProgress, UpdateTournamentImportProgressVariables } from '@knockoutfpl/dataconnect';

// The `UpdateTournamentImportProgress` mutation requires an argument of type `UpdateTournamentImportProgressVariables`:
const updateTournamentImportProgressVars: UpdateTournamentImportProgressVariables = {
  id: ..., 
  importStatus: ..., 
  importProgress: ..., 
  importedCount: ..., 
  importError: ..., // optional
};

// Call the `updateTournamentImportProgress()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTournamentImportProgress(updateTournamentImportProgressVars);
// Variables can be defined inline as well.
const { data } = await updateTournamentImportProgress({ id: ..., importStatus: ..., importProgress: ..., importedCount: ..., importError: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTournamentImportProgress(dataConnect, updateTournamentImportProgressVars);

console.log(data.tournament_update);

// Or, you can use the `Promise` API.
updateTournamentImportProgress(updateTournamentImportProgressVars).then((response) => {
  const data = response.data;
  console.log(data.tournament_update);
});
```

### Using `UpdateTournamentImportProgress`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTournamentImportProgressRef, UpdateTournamentImportProgressVariables } from '@knockoutfpl/dataconnect';

// The `UpdateTournamentImportProgress` mutation requires an argument of type `UpdateTournamentImportProgressVariables`:
const updateTournamentImportProgressVars: UpdateTournamentImportProgressVariables = {
  id: ..., 
  importStatus: ..., 
  importProgress: ..., 
  importedCount: ..., 
  importError: ..., // optional
};

// Call the `updateTournamentImportProgressRef()` function to get a reference to the mutation.
const ref = updateTournamentImportProgressRef(updateTournamentImportProgressVars);
// Variables can be defined inline as well.
const ref = updateTournamentImportProgressRef({ id: ..., importStatus: ..., importProgress: ..., importedCount: ..., importError: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTournamentImportProgressRef(dataConnect, updateTournamentImportProgressVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tournament_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament_update);
});
```

## FinalizeTournamentImport
You can execute the `FinalizeTournamentImport` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
finalizeTournamentImport(vars: FinalizeTournamentImportVariables): MutationPromise<FinalizeTournamentImportData, FinalizeTournamentImportVariables>;

interface FinalizeTournamentImportRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: FinalizeTournamentImportVariables): MutationRef<FinalizeTournamentImportData, FinalizeTournamentImportVariables>;
}
export const finalizeTournamentImportRef: FinalizeTournamentImportRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
finalizeTournamentImport(dc: DataConnect, vars: FinalizeTournamentImportVariables): MutationPromise<FinalizeTournamentImportData, FinalizeTournamentImportVariables>;

interface FinalizeTournamentImportRef {
  ...
  (dc: DataConnect, vars: FinalizeTournamentImportVariables): MutationRef<FinalizeTournamentImportData, FinalizeTournamentImportVariables>;
}
export const finalizeTournamentImportRef: FinalizeTournamentImportRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the finalizeTournamentImportRef:
```typescript
const name = finalizeTournamentImportRef.operationName;
console.log(name);
```

### Variables
The `FinalizeTournamentImport` mutation requires an argument of type `FinalizeTournamentImportVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface FinalizeTournamentImportVariables {
  id: UUIDString;
  participantCount: number;
}
```
### Return Type
Recall that executing the `FinalizeTournamentImport` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `FinalizeTournamentImportData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface FinalizeTournamentImportData {
  tournament_update?: Tournament_Key | null;
}
```
### Using `FinalizeTournamentImport`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, finalizeTournamentImport, FinalizeTournamentImportVariables } from '@knockoutfpl/dataconnect';

// The `FinalizeTournamentImport` mutation requires an argument of type `FinalizeTournamentImportVariables`:
const finalizeTournamentImportVars: FinalizeTournamentImportVariables = {
  id: ..., 
  participantCount: ..., 
};

// Call the `finalizeTournamentImport()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await finalizeTournamentImport(finalizeTournamentImportVars);
// Variables can be defined inline as well.
const { data } = await finalizeTournamentImport({ id: ..., participantCount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await finalizeTournamentImport(dataConnect, finalizeTournamentImportVars);

console.log(data.tournament_update);

// Or, you can use the `Promise` API.
finalizeTournamentImport(finalizeTournamentImportVars).then((response) => {
  const data = response.data;
  console.log(data.tournament_update);
});
```

### Using `FinalizeTournamentImport`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, finalizeTournamentImportRef, FinalizeTournamentImportVariables } from '@knockoutfpl/dataconnect';

// The `FinalizeTournamentImport` mutation requires an argument of type `FinalizeTournamentImportVariables`:
const finalizeTournamentImportVars: FinalizeTournamentImportVariables = {
  id: ..., 
  participantCount: ..., 
};

// Call the `finalizeTournamentImportRef()` function to get a reference to the mutation.
const ref = finalizeTournamentImportRef(finalizeTournamentImportVars);
// Variables can be defined inline as well.
const ref = finalizeTournamentImportRef({ id: ..., participantCount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = finalizeTournamentImportRef(dataConnect, finalizeTournamentImportVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tournament_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament_update);
});
```

## UpdateTournamentStatus
You can execute the `UpdateTournamentStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTournamentStatus(vars: UpdateTournamentStatusVariables): MutationPromise<UpdateTournamentStatusData, UpdateTournamentStatusVariables>;

interface UpdateTournamentStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTournamentStatusVariables): MutationRef<UpdateTournamentStatusData, UpdateTournamentStatusVariables>;
}
export const updateTournamentStatusRef: UpdateTournamentStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTournamentStatus(dc: DataConnect, vars: UpdateTournamentStatusVariables): MutationPromise<UpdateTournamentStatusData, UpdateTournamentStatusVariables>;

interface UpdateTournamentStatusRef {
  ...
  (dc: DataConnect, vars: UpdateTournamentStatusVariables): MutationRef<UpdateTournamentStatusData, UpdateTournamentStatusVariables>;
}
export const updateTournamentStatusRef: UpdateTournamentStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTournamentStatusRef:
```typescript
const name = updateTournamentStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateTournamentStatus` mutation requires an argument of type `UpdateTournamentStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTournamentStatusVariables {
  id: UUIDString;
  status: string;
  winnerEntryId?: number | null;
  updatedAt: TimestampString;
}
```
### Return Type
Recall that executing the `UpdateTournamentStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTournamentStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTournamentStatusData {
  tournament_update?: Tournament_Key | null;
}
```
### Using `UpdateTournamentStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTournamentStatus, UpdateTournamentStatusVariables } from '@knockoutfpl/dataconnect';

// The `UpdateTournamentStatus` mutation requires an argument of type `UpdateTournamentStatusVariables`:
const updateTournamentStatusVars: UpdateTournamentStatusVariables = {
  id: ..., 
  status: ..., 
  winnerEntryId: ..., // optional
  updatedAt: ..., 
};

// Call the `updateTournamentStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTournamentStatus(updateTournamentStatusVars);
// Variables can be defined inline as well.
const { data } = await updateTournamentStatus({ id: ..., status: ..., winnerEntryId: ..., updatedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTournamentStatus(dataConnect, updateTournamentStatusVars);

console.log(data.tournament_update);

// Or, you can use the `Promise` API.
updateTournamentStatus(updateTournamentStatusVars).then((response) => {
  const data = response.data;
  console.log(data.tournament_update);
});
```

### Using `UpdateTournamentStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTournamentStatusRef, UpdateTournamentStatusVariables } from '@knockoutfpl/dataconnect';

// The `UpdateTournamentStatus` mutation requires an argument of type `UpdateTournamentStatusVariables`:
const updateTournamentStatusVars: UpdateTournamentStatusVariables = {
  id: ..., 
  status: ..., 
  winnerEntryId: ..., // optional
  updatedAt: ..., 
};

// Call the `updateTournamentStatusRef()` function to get a reference to the mutation.
const ref = updateTournamentStatusRef(updateTournamentStatusVars);
// Variables can be defined inline as well.
const ref = updateTournamentStatusRef({ id: ..., status: ..., winnerEntryId: ..., updatedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTournamentStatusRef(dataConnect, updateTournamentStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tournament_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament_update);
});
```

## SetTournamentWinner
You can execute the `SetTournamentWinner` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
setTournamentWinner(vars: SetTournamentWinnerVariables): MutationPromise<SetTournamentWinnerData, SetTournamentWinnerVariables>;

interface SetTournamentWinnerRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetTournamentWinnerVariables): MutationRef<SetTournamentWinnerData, SetTournamentWinnerVariables>;
}
export const setTournamentWinnerRef: SetTournamentWinnerRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setTournamentWinner(dc: DataConnect, vars: SetTournamentWinnerVariables): MutationPromise<SetTournamentWinnerData, SetTournamentWinnerVariables>;

interface SetTournamentWinnerRef {
  ...
  (dc: DataConnect, vars: SetTournamentWinnerVariables): MutationRef<SetTournamentWinnerData, SetTournamentWinnerVariables>;
}
export const setTournamentWinnerRef: SetTournamentWinnerRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setTournamentWinnerRef:
```typescript
const name = setTournamentWinnerRef.operationName;
console.log(name);
```

### Variables
The `SetTournamentWinner` mutation requires an argument of type `SetTournamentWinnerVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetTournamentWinnerVariables {
  id: UUIDString;
  winnerEntryId: number;
}
```
### Return Type
Recall that executing the `SetTournamentWinner` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetTournamentWinnerData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetTournamentWinnerData {
  tournament_update?: Tournament_Key | null;
}
```
### Using `SetTournamentWinner`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setTournamentWinner, SetTournamentWinnerVariables } from '@knockoutfpl/dataconnect';

// The `SetTournamentWinner` mutation requires an argument of type `SetTournamentWinnerVariables`:
const setTournamentWinnerVars: SetTournamentWinnerVariables = {
  id: ..., 
  winnerEntryId: ..., 
};

// Call the `setTournamentWinner()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setTournamentWinner(setTournamentWinnerVars);
// Variables can be defined inline as well.
const { data } = await setTournamentWinner({ id: ..., winnerEntryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setTournamentWinner(dataConnect, setTournamentWinnerVars);

console.log(data.tournament_update);

// Or, you can use the `Promise` API.
setTournamentWinner(setTournamentWinnerVars).then((response) => {
  const data = response.data;
  console.log(data.tournament_update);
});
```

### Using `SetTournamentWinner`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setTournamentWinnerRef, SetTournamentWinnerVariables } from '@knockoutfpl/dataconnect';

// The `SetTournamentWinner` mutation requires an argument of type `SetTournamentWinnerVariables`:
const setTournamentWinnerVars: SetTournamentWinnerVariables = {
  id: ..., 
  winnerEntryId: ..., 
};

// Call the `setTournamentWinnerRef()` function to get a reference to the mutation.
const ref = setTournamentWinnerRef(setTournamentWinnerVars);
// Variables can be defined inline as well.
const ref = setTournamentWinnerRef({ id: ..., winnerEntryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setTournamentWinnerRef(dataConnect, setTournamentWinnerVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tournament_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament_update);
});
```

## AdvanceTournamentRound
You can execute the `AdvanceTournamentRound` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
advanceTournamentRound(vars: AdvanceTournamentRoundVariables): MutationPromise<AdvanceTournamentRoundData, AdvanceTournamentRoundVariables>;

interface AdvanceTournamentRoundRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AdvanceTournamentRoundVariables): MutationRef<AdvanceTournamentRoundData, AdvanceTournamentRoundVariables>;
}
export const advanceTournamentRoundRef: AdvanceTournamentRoundRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
advanceTournamentRound(dc: DataConnect, vars: AdvanceTournamentRoundVariables): MutationPromise<AdvanceTournamentRoundData, AdvanceTournamentRoundVariables>;

interface AdvanceTournamentRoundRef {
  ...
  (dc: DataConnect, vars: AdvanceTournamentRoundVariables): MutationRef<AdvanceTournamentRoundData, AdvanceTournamentRoundVariables>;
}
export const advanceTournamentRoundRef: AdvanceTournamentRoundRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the advanceTournamentRoundRef:
```typescript
const name = advanceTournamentRoundRef.operationName;
console.log(name);
```

### Variables
The `AdvanceTournamentRound` mutation requires an argument of type `AdvanceTournamentRoundVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AdvanceTournamentRoundVariables {
  id: UUIDString;
  nextRound: number;
}
```
### Return Type
Recall that executing the `AdvanceTournamentRound` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AdvanceTournamentRoundData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AdvanceTournamentRoundData {
  tournament_update?: Tournament_Key | null;
}
```
### Using `AdvanceTournamentRound`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, advanceTournamentRound, AdvanceTournamentRoundVariables } from '@knockoutfpl/dataconnect';

// The `AdvanceTournamentRound` mutation requires an argument of type `AdvanceTournamentRoundVariables`:
const advanceTournamentRoundVars: AdvanceTournamentRoundVariables = {
  id: ..., 
  nextRound: ..., 
};

// Call the `advanceTournamentRound()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await advanceTournamentRound(advanceTournamentRoundVars);
// Variables can be defined inline as well.
const { data } = await advanceTournamentRound({ id: ..., nextRound: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await advanceTournamentRound(dataConnect, advanceTournamentRoundVars);

console.log(data.tournament_update);

// Or, you can use the `Promise` API.
advanceTournamentRound(advanceTournamentRoundVars).then((response) => {
  const data = response.data;
  console.log(data.tournament_update);
});
```

### Using `AdvanceTournamentRound`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, advanceTournamentRoundRef, AdvanceTournamentRoundVariables } from '@knockoutfpl/dataconnect';

// The `AdvanceTournamentRound` mutation requires an argument of type `AdvanceTournamentRoundVariables`:
const advanceTournamentRoundVars: AdvanceTournamentRoundVariables = {
  id: ..., 
  nextRound: ..., 
};

// Call the `advanceTournamentRoundRef()` function to get a reference to the mutation.
const ref = advanceTournamentRoundRef(advanceTournamentRoundVars);
// Variables can be defined inline as well.
const ref = advanceTournamentRoundRef({ id: ..., nextRound: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = advanceTournamentRoundRef(dataConnect, advanceTournamentRoundVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tournament_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament_update);
});
```

## CreateRound
You can execute the `CreateRound` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createRound(vars: CreateRoundVariables): MutationPromise<CreateRoundData, CreateRoundVariables>;

interface CreateRoundRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRoundVariables): MutationRef<CreateRoundData, CreateRoundVariables>;
}
export const createRoundRef: CreateRoundRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createRound(dc: DataConnect, vars: CreateRoundVariables): MutationPromise<CreateRoundData, CreateRoundVariables>;

interface CreateRoundRef {
  ...
  (dc: DataConnect, vars: CreateRoundVariables): MutationRef<CreateRoundData, CreateRoundVariables>;
}
export const createRoundRef: CreateRoundRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createRoundRef:
```typescript
const name = createRoundRef.operationName;
console.log(name);
```

### Variables
The `CreateRound` mutation requires an argument of type `CreateRoundVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateRoundVariables {
  tournamentId: UUIDString;
  roundNumber: number;
  event: number;
  status: string;
}
```
### Return Type
Recall that executing the `CreateRound` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateRoundData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateRoundData {
  round_insert: Round_Key;
}
```
### Using `CreateRound`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createRound, CreateRoundVariables } from '@knockoutfpl/dataconnect';

// The `CreateRound` mutation requires an argument of type `CreateRoundVariables`:
const createRoundVars: CreateRoundVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
  event: ..., 
  status: ..., 
};

// Call the `createRound()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createRound(createRoundVars);
// Variables can be defined inline as well.
const { data } = await createRound({ tournamentId: ..., roundNumber: ..., event: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createRound(dataConnect, createRoundVars);

console.log(data.round_insert);

// Or, you can use the `Promise` API.
createRound(createRoundVars).then((response) => {
  const data = response.data;
  console.log(data.round_insert);
});
```

### Using `CreateRound`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createRoundRef, CreateRoundVariables } from '@knockoutfpl/dataconnect';

// The `CreateRound` mutation requires an argument of type `CreateRoundVariables`:
const createRoundVars: CreateRoundVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
  event: ..., 
  status: ..., 
};

// Call the `createRoundRef()` function to get a reference to the mutation.
const ref = createRoundRef(createRoundVars);
// Variables can be defined inline as well.
const ref = createRoundRef({ tournamentId: ..., roundNumber: ..., event: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createRoundRef(dataConnect, createRoundVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.round_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.round_insert);
});
```

## UpdateRound
You can execute the `UpdateRound` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateRound(vars: UpdateRoundVariables): MutationPromise<UpdateRoundData, UpdateRoundVariables>;

interface UpdateRoundRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRoundVariables): MutationRef<UpdateRoundData, UpdateRoundVariables>;
}
export const updateRoundRef: UpdateRoundRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateRound(dc: DataConnect, vars: UpdateRoundVariables): MutationPromise<UpdateRoundData, UpdateRoundVariables>;

interface UpdateRoundRef {
  ...
  (dc: DataConnect, vars: UpdateRoundVariables): MutationRef<UpdateRoundData, UpdateRoundVariables>;
}
export const updateRoundRef: UpdateRoundRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateRoundRef:
```typescript
const name = updateRoundRef.operationName;
console.log(name);
```

### Variables
The `UpdateRound` mutation requires an argument of type `UpdateRoundVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateRoundVariables {
  tournamentId: UUIDString;
  roundNumber: number;
  event: number;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateRound` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateRoundData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateRoundData {
  round_upsert: Round_Key;
}
```
### Using `UpdateRound`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateRound, UpdateRoundVariables } from '@knockoutfpl/dataconnect';

// The `UpdateRound` mutation requires an argument of type `UpdateRoundVariables`:
const updateRoundVars: UpdateRoundVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
  event: ..., 
  status: ..., 
};

// Call the `updateRound()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateRound(updateRoundVars);
// Variables can be defined inline as well.
const { data } = await updateRound({ tournamentId: ..., roundNumber: ..., event: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateRound(dataConnect, updateRoundVars);

console.log(data.round_upsert);

// Or, you can use the `Promise` API.
updateRound(updateRoundVars).then((response) => {
  const data = response.data;
  console.log(data.round_upsert);
});
```

### Using `UpdateRound`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateRoundRef, UpdateRoundVariables } from '@knockoutfpl/dataconnect';

// The `UpdateRound` mutation requires an argument of type `UpdateRoundVariables`:
const updateRoundVars: UpdateRoundVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
  event: ..., 
  status: ..., 
};

// Call the `updateRoundRef()` function to get a reference to the mutation.
const ref = updateRoundRef(updateRoundVars);
// Variables can be defined inline as well.
const ref = updateRoundRef({ tournamentId: ..., roundNumber: ..., event: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateRoundRef(dataConnect, updateRoundVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.round_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.round_upsert);
});
```

## UpdateRoundUpdatedAt
You can execute the `UpdateRoundUpdatedAt` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateRoundUpdatedAt(vars: UpdateRoundUpdatedAtVariables): MutationPromise<UpdateRoundUpdatedAtData, UpdateRoundUpdatedAtVariables>;

interface UpdateRoundUpdatedAtRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRoundUpdatedAtVariables): MutationRef<UpdateRoundUpdatedAtData, UpdateRoundUpdatedAtVariables>;
}
export const updateRoundUpdatedAtRef: UpdateRoundUpdatedAtRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateRoundUpdatedAt(dc: DataConnect, vars: UpdateRoundUpdatedAtVariables): MutationPromise<UpdateRoundUpdatedAtData, UpdateRoundUpdatedAtVariables>;

interface UpdateRoundUpdatedAtRef {
  ...
  (dc: DataConnect, vars: UpdateRoundUpdatedAtVariables): MutationRef<UpdateRoundUpdatedAtData, UpdateRoundUpdatedAtVariables>;
}
export const updateRoundUpdatedAtRef: UpdateRoundUpdatedAtRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateRoundUpdatedAtRef:
```typescript
const name = updateRoundUpdatedAtRef.operationName;
console.log(name);
```

### Variables
The `UpdateRoundUpdatedAt` mutation requires an argument of type `UpdateRoundUpdatedAtVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateRoundUpdatedAtVariables {
  tournamentId: UUIDString;
  roundNumber: number;
  updatedAt: TimestampString;
}
```
### Return Type
Recall that executing the `UpdateRoundUpdatedAt` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateRoundUpdatedAtData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateRoundUpdatedAtData {
  round_update?: Round_Key | null;
}
```
### Using `UpdateRoundUpdatedAt`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateRoundUpdatedAt, UpdateRoundUpdatedAtVariables } from '@knockoutfpl/dataconnect';

// The `UpdateRoundUpdatedAt` mutation requires an argument of type `UpdateRoundUpdatedAtVariables`:
const updateRoundUpdatedAtVars: UpdateRoundUpdatedAtVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
  updatedAt: ..., 
};

// Call the `updateRoundUpdatedAt()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateRoundUpdatedAt(updateRoundUpdatedAtVars);
// Variables can be defined inline as well.
const { data } = await updateRoundUpdatedAt({ tournamentId: ..., roundNumber: ..., updatedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateRoundUpdatedAt(dataConnect, updateRoundUpdatedAtVars);

console.log(data.round_update);

// Or, you can use the `Promise` API.
updateRoundUpdatedAt(updateRoundUpdatedAtVars).then((response) => {
  const data = response.data;
  console.log(data.round_update);
});
```

### Using `UpdateRoundUpdatedAt`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateRoundUpdatedAtRef, UpdateRoundUpdatedAtVariables } from '@knockoutfpl/dataconnect';

// The `UpdateRoundUpdatedAt` mutation requires an argument of type `UpdateRoundUpdatedAtVariables`:
const updateRoundUpdatedAtVars: UpdateRoundUpdatedAtVariables = {
  tournamentId: ..., 
  roundNumber: ..., 
  updatedAt: ..., 
};

// Call the `updateRoundUpdatedAtRef()` function to get a reference to the mutation.
const ref = updateRoundUpdatedAtRef(updateRoundUpdatedAtVars);
// Variables can be defined inline as well.
const ref = updateRoundUpdatedAtRef({ tournamentId: ..., roundNumber: ..., updatedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateRoundUpdatedAtRef(dataConnect, updateRoundUpdatedAtVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.round_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.round_update);
});
```

## UpdateMatchUpdatedAt
You can execute the `UpdateMatchUpdatedAt` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateMatchUpdatedAt(vars: UpdateMatchUpdatedAtVariables): MutationPromise<UpdateMatchUpdatedAtData, UpdateMatchUpdatedAtVariables>;

interface UpdateMatchUpdatedAtRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMatchUpdatedAtVariables): MutationRef<UpdateMatchUpdatedAtData, UpdateMatchUpdatedAtVariables>;
}
export const updateMatchUpdatedAtRef: UpdateMatchUpdatedAtRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMatchUpdatedAt(dc: DataConnect, vars: UpdateMatchUpdatedAtVariables): MutationPromise<UpdateMatchUpdatedAtData, UpdateMatchUpdatedAtVariables>;

interface UpdateMatchUpdatedAtRef {
  ...
  (dc: DataConnect, vars: UpdateMatchUpdatedAtVariables): MutationRef<UpdateMatchUpdatedAtData, UpdateMatchUpdatedAtVariables>;
}
export const updateMatchUpdatedAtRef: UpdateMatchUpdatedAtRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMatchUpdatedAtRef:
```typescript
const name = updateMatchUpdatedAtRef.operationName;
console.log(name);
```

### Variables
The `UpdateMatchUpdatedAt` mutation requires an argument of type `UpdateMatchUpdatedAtVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateMatchUpdatedAtVariables {
  tournamentId: UUIDString;
  matchId: number;
  updatedAt: TimestampString;
}
```
### Return Type
Recall that executing the `UpdateMatchUpdatedAt` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMatchUpdatedAtData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMatchUpdatedAtData {
  match_update?: Match_Key | null;
}
```
### Using `UpdateMatchUpdatedAt`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMatchUpdatedAt, UpdateMatchUpdatedAtVariables } from '@knockoutfpl/dataconnect';

// The `UpdateMatchUpdatedAt` mutation requires an argument of type `UpdateMatchUpdatedAtVariables`:
const updateMatchUpdatedAtVars: UpdateMatchUpdatedAtVariables = {
  tournamentId: ..., 
  matchId: ..., 
  updatedAt: ..., 
};

// Call the `updateMatchUpdatedAt()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMatchUpdatedAt(updateMatchUpdatedAtVars);
// Variables can be defined inline as well.
const { data } = await updateMatchUpdatedAt({ tournamentId: ..., matchId: ..., updatedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMatchUpdatedAt(dataConnect, updateMatchUpdatedAtVars);

console.log(data.match_update);

// Or, you can use the `Promise` API.
updateMatchUpdatedAt(updateMatchUpdatedAtVars).then((response) => {
  const data = response.data;
  console.log(data.match_update);
});
```

### Using `UpdateMatchUpdatedAt`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMatchUpdatedAtRef, UpdateMatchUpdatedAtVariables } from '@knockoutfpl/dataconnect';

// The `UpdateMatchUpdatedAt` mutation requires an argument of type `UpdateMatchUpdatedAtVariables`:
const updateMatchUpdatedAtVars: UpdateMatchUpdatedAtVariables = {
  tournamentId: ..., 
  matchId: ..., 
  updatedAt: ..., 
};

// Call the `updateMatchUpdatedAtRef()` function to get a reference to the mutation.
const ref = updateMatchUpdatedAtRef(updateMatchUpdatedAtVars);
// Variables can be defined inline as well.
const ref = updateMatchUpdatedAtRef({ tournamentId: ..., matchId: ..., updatedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMatchUpdatedAtRef(dataConnect, updateMatchUpdatedAtVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.match_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.match_update);
});
```

## CreateParticipant
You can execute the `CreateParticipant` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createParticipant(vars: CreateParticipantVariables): MutationPromise<CreateParticipantData, CreateParticipantVariables>;

interface CreateParticipantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateParticipantVariables): MutationRef<CreateParticipantData, CreateParticipantVariables>;
}
export const createParticipantRef: CreateParticipantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createParticipant(dc: DataConnect, vars: CreateParticipantVariables): MutationPromise<CreateParticipantData, CreateParticipantVariables>;

interface CreateParticipantRef {
  ...
  (dc: DataConnect, vars: CreateParticipantVariables): MutationRef<CreateParticipantData, CreateParticipantVariables>;
}
export const createParticipantRef: CreateParticipantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createParticipantRef:
```typescript
const name = createParticipantRef.operationName;
console.log(name);
```

### Variables
The `CreateParticipant` mutation requires an argument of type `CreateParticipantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateParticipantVariables {
  tournamentId: UUIDString;
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  leagueRank?: number | null;
  leaguePoints?: number | null;
  rawJson: string;
}
```
### Return Type
Recall that executing the `CreateParticipant` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateParticipantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateParticipantData {
  participant_insert: Participant_Key;
}
```
### Using `CreateParticipant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createParticipant, CreateParticipantVariables } from '@knockoutfpl/dataconnect';

// The `CreateParticipant` mutation requires an argument of type `CreateParticipantVariables`:
const createParticipantVars: CreateParticipantVariables = {
  tournamentId: ..., 
  entryId: ..., 
  teamName: ..., 
  managerName: ..., 
  seed: ..., 
  leagueRank: ..., // optional
  leaguePoints: ..., // optional
  rawJson: ..., 
};

// Call the `createParticipant()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createParticipant(createParticipantVars);
// Variables can be defined inline as well.
const { data } = await createParticipant({ tournamentId: ..., entryId: ..., teamName: ..., managerName: ..., seed: ..., leagueRank: ..., leaguePoints: ..., rawJson: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createParticipant(dataConnect, createParticipantVars);

console.log(data.participant_insert);

// Or, you can use the `Promise` API.
createParticipant(createParticipantVars).then((response) => {
  const data = response.data;
  console.log(data.participant_insert);
});
```

### Using `CreateParticipant`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createParticipantRef, CreateParticipantVariables } from '@knockoutfpl/dataconnect';

// The `CreateParticipant` mutation requires an argument of type `CreateParticipantVariables`:
const createParticipantVars: CreateParticipantVariables = {
  tournamentId: ..., 
  entryId: ..., 
  teamName: ..., 
  managerName: ..., 
  seed: ..., 
  leagueRank: ..., // optional
  leaguePoints: ..., // optional
  rawJson: ..., 
};

// Call the `createParticipantRef()` function to get a reference to the mutation.
const ref = createParticipantRef(createParticipantVars);
// Variables can be defined inline as well.
const ref = createParticipantRef({ tournamentId: ..., entryId: ..., teamName: ..., managerName: ..., seed: ..., leagueRank: ..., leaguePoints: ..., rawJson: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createParticipantRef(dataConnect, createParticipantVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.participant_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.participant_insert);
});
```

## UpdateParticipant
You can execute the `UpdateParticipant` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateParticipant(vars: UpdateParticipantVariables): MutationPromise<UpdateParticipantData, UpdateParticipantVariables>;

interface UpdateParticipantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateParticipantVariables): MutationRef<UpdateParticipantData, UpdateParticipantVariables>;
}
export const updateParticipantRef: UpdateParticipantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateParticipant(dc: DataConnect, vars: UpdateParticipantVariables): MutationPromise<UpdateParticipantData, UpdateParticipantVariables>;

interface UpdateParticipantRef {
  ...
  (dc: DataConnect, vars: UpdateParticipantVariables): MutationRef<UpdateParticipantData, UpdateParticipantVariables>;
}
export const updateParticipantRef: UpdateParticipantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateParticipantRef:
```typescript
const name = updateParticipantRef.operationName;
console.log(name);
```

### Variables
The `UpdateParticipant` mutation requires an argument of type `UpdateParticipantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateParticipantVariables {
  tournamentId: UUIDString;
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  leagueRank?: number | null;
  leaguePoints?: number | null;
  rawJson: string;
  status: string;
  eliminationRound?: number | null;
  uid?: string | null;
}
```
### Return Type
Recall that executing the `UpdateParticipant` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateParticipantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateParticipantData {
  participant_upsert: Participant_Key;
}
```
### Using `UpdateParticipant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateParticipant, UpdateParticipantVariables } from '@knockoutfpl/dataconnect';

// The `UpdateParticipant` mutation requires an argument of type `UpdateParticipantVariables`:
const updateParticipantVars: UpdateParticipantVariables = {
  tournamentId: ..., 
  entryId: ..., 
  teamName: ..., 
  managerName: ..., 
  seed: ..., 
  leagueRank: ..., // optional
  leaguePoints: ..., // optional
  rawJson: ..., 
  status: ..., 
  eliminationRound: ..., // optional
  uid: ..., // optional
};

// Call the `updateParticipant()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateParticipant(updateParticipantVars);
// Variables can be defined inline as well.
const { data } = await updateParticipant({ tournamentId: ..., entryId: ..., teamName: ..., managerName: ..., seed: ..., leagueRank: ..., leaguePoints: ..., rawJson: ..., status: ..., eliminationRound: ..., uid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateParticipant(dataConnect, updateParticipantVars);

console.log(data.participant_upsert);

// Or, you can use the `Promise` API.
updateParticipant(updateParticipantVars).then((response) => {
  const data = response.data;
  console.log(data.participant_upsert);
});
```

### Using `UpdateParticipant`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateParticipantRef, UpdateParticipantVariables } from '@knockoutfpl/dataconnect';

// The `UpdateParticipant` mutation requires an argument of type `UpdateParticipantVariables`:
const updateParticipantVars: UpdateParticipantVariables = {
  tournamentId: ..., 
  entryId: ..., 
  teamName: ..., 
  managerName: ..., 
  seed: ..., 
  leagueRank: ..., // optional
  leaguePoints: ..., // optional
  rawJson: ..., 
  status: ..., 
  eliminationRound: ..., // optional
  uid: ..., // optional
};

// Call the `updateParticipantRef()` function to get a reference to the mutation.
const ref = updateParticipantRef(updateParticipantVars);
// Variables can be defined inline as well.
const ref = updateParticipantRef({ tournamentId: ..., entryId: ..., teamName: ..., managerName: ..., seed: ..., leagueRank: ..., leaguePoints: ..., rawJson: ..., status: ..., eliminationRound: ..., uid: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateParticipantRef(dataConnect, updateParticipantVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.participant_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.participant_upsert);
});
```

## CreateMatch
You can execute the `CreateMatch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createMatch(vars: CreateMatchVariables): MutationPromise<CreateMatchData, CreateMatchVariables>;

interface CreateMatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMatchVariables): MutationRef<CreateMatchData, CreateMatchVariables>;
}
export const createMatchRef: CreateMatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMatch(dc: DataConnect, vars: CreateMatchVariables): MutationPromise<CreateMatchData, CreateMatchVariables>;

interface CreateMatchRef {
  ...
  (dc: DataConnect, vars: CreateMatchVariables): MutationRef<CreateMatchData, CreateMatchVariables>;
}
export const createMatchRef: CreateMatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMatchRef:
```typescript
const name = createMatchRef.operationName;
console.log(name);
```

### Variables
The `CreateMatch` mutation requires an argument of type `CreateMatchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateMatchVariables {
  tournamentId: UUIDString;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId?: number | null;
  isBye: boolean;
}
```
### Return Type
Recall that executing the `CreateMatch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMatchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMatchData {
  match_insert: Match_Key;
}
```
### Using `CreateMatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMatch, CreateMatchVariables } from '@knockoutfpl/dataconnect';

// The `CreateMatch` mutation requires an argument of type `CreateMatchVariables`:
const createMatchVars: CreateMatchVariables = {
  tournamentId: ..., 
  matchId: ..., 
  roundNumber: ..., 
  positionInRound: ..., 
  qualifiesToMatchId: ..., // optional
  isBye: ..., 
};

// Call the `createMatch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMatch(createMatchVars);
// Variables can be defined inline as well.
const { data } = await createMatch({ tournamentId: ..., matchId: ..., roundNumber: ..., positionInRound: ..., qualifiesToMatchId: ..., isBye: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMatch(dataConnect, createMatchVars);

console.log(data.match_insert);

// Or, you can use the `Promise` API.
createMatch(createMatchVars).then((response) => {
  const data = response.data;
  console.log(data.match_insert);
});
```

### Using `CreateMatch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMatchRef, CreateMatchVariables } from '@knockoutfpl/dataconnect';

// The `CreateMatch` mutation requires an argument of type `CreateMatchVariables`:
const createMatchVars: CreateMatchVariables = {
  tournamentId: ..., 
  matchId: ..., 
  roundNumber: ..., 
  positionInRound: ..., 
  qualifiesToMatchId: ..., // optional
  isBye: ..., 
};

// Call the `createMatchRef()` function to get a reference to the mutation.
const ref = createMatchRef(createMatchVars);
// Variables can be defined inline as well.
const ref = createMatchRef({ tournamentId: ..., matchId: ..., roundNumber: ..., positionInRound: ..., qualifiesToMatchId: ..., isBye: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMatchRef(dataConnect, createMatchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.match_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.match_insert);
});
```

## UpdateMatch
You can execute the `UpdateMatch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateMatch(vars: UpdateMatchVariables): MutationPromise<UpdateMatchData, UpdateMatchVariables>;

interface UpdateMatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMatchVariables): MutationRef<UpdateMatchData, UpdateMatchVariables>;
}
export const updateMatchRef: UpdateMatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMatch(dc: DataConnect, vars: UpdateMatchVariables): MutationPromise<UpdateMatchData, UpdateMatchVariables>;

interface UpdateMatchRef {
  ...
  (dc: DataConnect, vars: UpdateMatchVariables): MutationRef<UpdateMatchData, UpdateMatchVariables>;
}
export const updateMatchRef: UpdateMatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMatchRef:
```typescript
const name = updateMatchRef.operationName;
console.log(name);
```

### Variables
The `UpdateMatch` mutation requires an argument of type `UpdateMatchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateMatchVariables {
  tournamentId: UUIDString;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId?: number | null;
  isBye: boolean;
  status: string;
  winnerEntryId?: number | null;
}
```
### Return Type
Recall that executing the `UpdateMatch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMatchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMatchData {
  match_upsert: Match_Key;
}
```
### Using `UpdateMatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMatch, UpdateMatchVariables } from '@knockoutfpl/dataconnect';

// The `UpdateMatch` mutation requires an argument of type `UpdateMatchVariables`:
const updateMatchVars: UpdateMatchVariables = {
  tournamentId: ..., 
  matchId: ..., 
  roundNumber: ..., 
  positionInRound: ..., 
  qualifiesToMatchId: ..., // optional
  isBye: ..., 
  status: ..., 
  winnerEntryId: ..., // optional
};

// Call the `updateMatch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMatch(updateMatchVars);
// Variables can be defined inline as well.
const { data } = await updateMatch({ tournamentId: ..., matchId: ..., roundNumber: ..., positionInRound: ..., qualifiesToMatchId: ..., isBye: ..., status: ..., winnerEntryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMatch(dataConnect, updateMatchVars);

console.log(data.match_upsert);

// Or, you can use the `Promise` API.
updateMatch(updateMatchVars).then((response) => {
  const data = response.data;
  console.log(data.match_upsert);
});
```

### Using `UpdateMatch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMatchRef, UpdateMatchVariables } from '@knockoutfpl/dataconnect';

// The `UpdateMatch` mutation requires an argument of type `UpdateMatchVariables`:
const updateMatchVars: UpdateMatchVariables = {
  tournamentId: ..., 
  matchId: ..., 
  roundNumber: ..., 
  positionInRound: ..., 
  qualifiesToMatchId: ..., // optional
  isBye: ..., 
  status: ..., 
  winnerEntryId: ..., // optional
};

// Call the `updateMatchRef()` function to get a reference to the mutation.
const ref = updateMatchRef(updateMatchVars);
// Variables can be defined inline as well.
const ref = updateMatchRef({ tournamentId: ..., matchId: ..., roundNumber: ..., positionInRound: ..., qualifiesToMatchId: ..., isBye: ..., status: ..., winnerEntryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMatchRef(dataConnect, updateMatchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.match_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.match_upsert);
});
```

## CreateMatchPick
You can execute the `CreateMatchPick` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createMatchPick(vars: CreateMatchPickVariables): MutationPromise<CreateMatchPickData, CreateMatchPickVariables>;

interface CreateMatchPickRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMatchPickVariables): MutationRef<CreateMatchPickData, CreateMatchPickVariables>;
}
export const createMatchPickRef: CreateMatchPickRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMatchPick(dc: DataConnect, vars: CreateMatchPickVariables): MutationPromise<CreateMatchPickData, CreateMatchPickVariables>;

interface CreateMatchPickRef {
  ...
  (dc: DataConnect, vars: CreateMatchPickVariables): MutationRef<CreateMatchPickData, CreateMatchPickVariables>;
}
export const createMatchPickRef: CreateMatchPickRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMatchPickRef:
```typescript
const name = createMatchPickRef.operationName;
console.log(name);
```

### Variables
The `CreateMatchPick` mutation requires an argument of type `CreateMatchPickVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateMatchPickVariables {
  tournamentId: UUIDString;
  matchId: number;
  entryId: number;
  slot: number;
}
```
### Return Type
Recall that executing the `CreateMatchPick` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMatchPickData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMatchPickData {
  matchPick_insert: MatchPick_Key;
}
```
### Using `CreateMatchPick`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMatchPick, CreateMatchPickVariables } from '@knockoutfpl/dataconnect';

// The `CreateMatchPick` mutation requires an argument of type `CreateMatchPickVariables`:
const createMatchPickVars: CreateMatchPickVariables = {
  tournamentId: ..., 
  matchId: ..., 
  entryId: ..., 
  slot: ..., 
};

// Call the `createMatchPick()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMatchPick(createMatchPickVars);
// Variables can be defined inline as well.
const { data } = await createMatchPick({ tournamentId: ..., matchId: ..., entryId: ..., slot: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMatchPick(dataConnect, createMatchPickVars);

console.log(data.matchPick_insert);

// Or, you can use the `Promise` API.
createMatchPick(createMatchPickVars).then((response) => {
  const data = response.data;
  console.log(data.matchPick_insert);
});
```

### Using `CreateMatchPick`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMatchPickRef, CreateMatchPickVariables } from '@knockoutfpl/dataconnect';

// The `CreateMatchPick` mutation requires an argument of type `CreateMatchPickVariables`:
const createMatchPickVars: CreateMatchPickVariables = {
  tournamentId: ..., 
  matchId: ..., 
  entryId: ..., 
  slot: ..., 
};

// Call the `createMatchPickRef()` function to get a reference to the mutation.
const ref = createMatchPickRef(createMatchPickVars);
// Variables can be defined inline as well.
const ref = createMatchPickRef({ tournamentId: ..., matchId: ..., entryId: ..., slot: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMatchPickRef(dataConnect, createMatchPickVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.matchPick_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.matchPick_insert);
});
```

## DeleteTournament
You can execute the `DeleteTournament` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteTournament(vars: DeleteTournamentVariables): MutationPromise<DeleteTournamentData, DeleteTournamentVariables>;

interface DeleteTournamentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTournamentVariables): MutationRef<DeleteTournamentData, DeleteTournamentVariables>;
}
export const deleteTournamentRef: DeleteTournamentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteTournament(dc: DataConnect, vars: DeleteTournamentVariables): MutationPromise<DeleteTournamentData, DeleteTournamentVariables>;

interface DeleteTournamentRef {
  ...
  (dc: DataConnect, vars: DeleteTournamentVariables): MutationRef<DeleteTournamentData, DeleteTournamentVariables>;
}
export const deleteTournamentRef: DeleteTournamentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteTournamentRef:
```typescript
const name = deleteTournamentRef.operationName;
console.log(name);
```

### Variables
The `DeleteTournament` mutation requires an argument of type `DeleteTournamentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteTournamentVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteTournament` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteTournamentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteTournamentData {
  tournament_delete?: Tournament_Key | null;
}
```
### Using `DeleteTournament`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteTournament, DeleteTournamentVariables } from '@knockoutfpl/dataconnect';

// The `DeleteTournament` mutation requires an argument of type `DeleteTournamentVariables`:
const deleteTournamentVars: DeleteTournamentVariables = {
  id: ..., 
};

// Call the `deleteTournament()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteTournament(deleteTournamentVars);
// Variables can be defined inline as well.
const { data } = await deleteTournament({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteTournament(dataConnect, deleteTournamentVars);

console.log(data.tournament_delete);

// Or, you can use the `Promise` API.
deleteTournament(deleteTournamentVars).then((response) => {
  const data = response.data;
  console.log(data.tournament_delete);
});
```

### Using `DeleteTournament`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteTournamentRef, DeleteTournamentVariables } from '@knockoutfpl/dataconnect';

// The `DeleteTournament` mutation requires an argument of type `DeleteTournamentVariables`:
const deleteTournamentVars: DeleteTournamentVariables = {
  id: ..., 
};

// Call the `deleteTournamentRef()` function to get a reference to the mutation.
const ref = deleteTournamentRef(deleteTournamentVars);
// Variables can be defined inline as well.
const ref = deleteTournamentRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteTournamentRef(dataConnect, deleteTournamentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tournament_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament_delete);
});
```

## DeleteMatchPicksByTournament
You can execute the `DeleteMatchPicksByTournament` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteMatchPicksByTournament(vars: DeleteMatchPicksByTournamentVariables): MutationPromise<DeleteMatchPicksByTournamentData, DeleteMatchPicksByTournamentVariables>;

interface DeleteMatchPicksByTournamentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteMatchPicksByTournamentVariables): MutationRef<DeleteMatchPicksByTournamentData, DeleteMatchPicksByTournamentVariables>;
}
export const deleteMatchPicksByTournamentRef: DeleteMatchPicksByTournamentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteMatchPicksByTournament(dc: DataConnect, vars: DeleteMatchPicksByTournamentVariables): MutationPromise<DeleteMatchPicksByTournamentData, DeleteMatchPicksByTournamentVariables>;

interface DeleteMatchPicksByTournamentRef {
  ...
  (dc: DataConnect, vars: DeleteMatchPicksByTournamentVariables): MutationRef<DeleteMatchPicksByTournamentData, DeleteMatchPicksByTournamentVariables>;
}
export const deleteMatchPicksByTournamentRef: DeleteMatchPicksByTournamentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteMatchPicksByTournamentRef:
```typescript
const name = deleteMatchPicksByTournamentRef.operationName;
console.log(name);
```

### Variables
The `DeleteMatchPicksByTournament` mutation requires an argument of type `DeleteMatchPicksByTournamentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteMatchPicksByTournamentVariables {
  tournamentId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteMatchPicksByTournament` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteMatchPicksByTournamentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteMatchPicksByTournamentData {
  matchPick_deleteMany: number;
}
```
### Using `DeleteMatchPicksByTournament`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteMatchPicksByTournament, DeleteMatchPicksByTournamentVariables } from '@knockoutfpl/dataconnect';

// The `DeleteMatchPicksByTournament` mutation requires an argument of type `DeleteMatchPicksByTournamentVariables`:
const deleteMatchPicksByTournamentVars: DeleteMatchPicksByTournamentVariables = {
  tournamentId: ..., 
};

// Call the `deleteMatchPicksByTournament()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteMatchPicksByTournament(deleteMatchPicksByTournamentVars);
// Variables can be defined inline as well.
const { data } = await deleteMatchPicksByTournament({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteMatchPicksByTournament(dataConnect, deleteMatchPicksByTournamentVars);

console.log(data.matchPick_deleteMany);

// Or, you can use the `Promise` API.
deleteMatchPicksByTournament(deleteMatchPicksByTournamentVars).then((response) => {
  const data = response.data;
  console.log(data.matchPick_deleteMany);
});
```

### Using `DeleteMatchPicksByTournament`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteMatchPicksByTournamentRef, DeleteMatchPicksByTournamentVariables } from '@knockoutfpl/dataconnect';

// The `DeleteMatchPicksByTournament` mutation requires an argument of type `DeleteMatchPicksByTournamentVariables`:
const deleteMatchPicksByTournamentVars: DeleteMatchPicksByTournamentVariables = {
  tournamentId: ..., 
};

// Call the `deleteMatchPicksByTournamentRef()` function to get a reference to the mutation.
const ref = deleteMatchPicksByTournamentRef(deleteMatchPicksByTournamentVars);
// Variables can be defined inline as well.
const ref = deleteMatchPicksByTournamentRef({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteMatchPicksByTournamentRef(dataConnect, deleteMatchPicksByTournamentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.matchPick_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.matchPick_deleteMany);
});
```

## DeleteMatchesByTournament
You can execute the `DeleteMatchesByTournament` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteMatchesByTournament(vars: DeleteMatchesByTournamentVariables): MutationPromise<DeleteMatchesByTournamentData, DeleteMatchesByTournamentVariables>;

interface DeleteMatchesByTournamentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteMatchesByTournamentVariables): MutationRef<DeleteMatchesByTournamentData, DeleteMatchesByTournamentVariables>;
}
export const deleteMatchesByTournamentRef: DeleteMatchesByTournamentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteMatchesByTournament(dc: DataConnect, vars: DeleteMatchesByTournamentVariables): MutationPromise<DeleteMatchesByTournamentData, DeleteMatchesByTournamentVariables>;

interface DeleteMatchesByTournamentRef {
  ...
  (dc: DataConnect, vars: DeleteMatchesByTournamentVariables): MutationRef<DeleteMatchesByTournamentData, DeleteMatchesByTournamentVariables>;
}
export const deleteMatchesByTournamentRef: DeleteMatchesByTournamentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteMatchesByTournamentRef:
```typescript
const name = deleteMatchesByTournamentRef.operationName;
console.log(name);
```

### Variables
The `DeleteMatchesByTournament` mutation requires an argument of type `DeleteMatchesByTournamentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteMatchesByTournamentVariables {
  tournamentId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteMatchesByTournament` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteMatchesByTournamentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteMatchesByTournamentData {
  match_deleteMany: number;
}
```
### Using `DeleteMatchesByTournament`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteMatchesByTournament, DeleteMatchesByTournamentVariables } from '@knockoutfpl/dataconnect';

// The `DeleteMatchesByTournament` mutation requires an argument of type `DeleteMatchesByTournamentVariables`:
const deleteMatchesByTournamentVars: DeleteMatchesByTournamentVariables = {
  tournamentId: ..., 
};

// Call the `deleteMatchesByTournament()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteMatchesByTournament(deleteMatchesByTournamentVars);
// Variables can be defined inline as well.
const { data } = await deleteMatchesByTournament({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteMatchesByTournament(dataConnect, deleteMatchesByTournamentVars);

console.log(data.match_deleteMany);

// Or, you can use the `Promise` API.
deleteMatchesByTournament(deleteMatchesByTournamentVars).then((response) => {
  const data = response.data;
  console.log(data.match_deleteMany);
});
```

### Using `DeleteMatchesByTournament`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteMatchesByTournamentRef, DeleteMatchesByTournamentVariables } from '@knockoutfpl/dataconnect';

// The `DeleteMatchesByTournament` mutation requires an argument of type `DeleteMatchesByTournamentVariables`:
const deleteMatchesByTournamentVars: DeleteMatchesByTournamentVariables = {
  tournamentId: ..., 
};

// Call the `deleteMatchesByTournamentRef()` function to get a reference to the mutation.
const ref = deleteMatchesByTournamentRef(deleteMatchesByTournamentVars);
// Variables can be defined inline as well.
const ref = deleteMatchesByTournamentRef({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteMatchesByTournamentRef(dataConnect, deleteMatchesByTournamentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.match_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.match_deleteMany);
});
```

## DeleteRoundsByTournament
You can execute the `DeleteRoundsByTournament` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteRoundsByTournament(vars: DeleteRoundsByTournamentVariables): MutationPromise<DeleteRoundsByTournamentData, DeleteRoundsByTournamentVariables>;

interface DeleteRoundsByTournamentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteRoundsByTournamentVariables): MutationRef<DeleteRoundsByTournamentData, DeleteRoundsByTournamentVariables>;
}
export const deleteRoundsByTournamentRef: DeleteRoundsByTournamentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteRoundsByTournament(dc: DataConnect, vars: DeleteRoundsByTournamentVariables): MutationPromise<DeleteRoundsByTournamentData, DeleteRoundsByTournamentVariables>;

interface DeleteRoundsByTournamentRef {
  ...
  (dc: DataConnect, vars: DeleteRoundsByTournamentVariables): MutationRef<DeleteRoundsByTournamentData, DeleteRoundsByTournamentVariables>;
}
export const deleteRoundsByTournamentRef: DeleteRoundsByTournamentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteRoundsByTournamentRef:
```typescript
const name = deleteRoundsByTournamentRef.operationName;
console.log(name);
```

### Variables
The `DeleteRoundsByTournament` mutation requires an argument of type `DeleteRoundsByTournamentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteRoundsByTournamentVariables {
  tournamentId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteRoundsByTournament` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteRoundsByTournamentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteRoundsByTournamentData {
  round_deleteMany: number;
}
```
### Using `DeleteRoundsByTournament`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteRoundsByTournament, DeleteRoundsByTournamentVariables } from '@knockoutfpl/dataconnect';

// The `DeleteRoundsByTournament` mutation requires an argument of type `DeleteRoundsByTournamentVariables`:
const deleteRoundsByTournamentVars: DeleteRoundsByTournamentVariables = {
  tournamentId: ..., 
};

// Call the `deleteRoundsByTournament()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteRoundsByTournament(deleteRoundsByTournamentVars);
// Variables can be defined inline as well.
const { data } = await deleteRoundsByTournament({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteRoundsByTournament(dataConnect, deleteRoundsByTournamentVars);

console.log(data.round_deleteMany);

// Or, you can use the `Promise` API.
deleteRoundsByTournament(deleteRoundsByTournamentVars).then((response) => {
  const data = response.data;
  console.log(data.round_deleteMany);
});
```

### Using `DeleteRoundsByTournament`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteRoundsByTournamentRef, DeleteRoundsByTournamentVariables } from '@knockoutfpl/dataconnect';

// The `DeleteRoundsByTournament` mutation requires an argument of type `DeleteRoundsByTournamentVariables`:
const deleteRoundsByTournamentVars: DeleteRoundsByTournamentVariables = {
  tournamentId: ..., 
};

// Call the `deleteRoundsByTournamentRef()` function to get a reference to the mutation.
const ref = deleteRoundsByTournamentRef(deleteRoundsByTournamentVars);
// Variables can be defined inline as well.
const ref = deleteRoundsByTournamentRef({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteRoundsByTournamentRef(dataConnect, deleteRoundsByTournamentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.round_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.round_deleteMany);
});
```

## DeleteParticipantsByTournament
You can execute the `DeleteParticipantsByTournament` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteParticipantsByTournament(vars: DeleteParticipantsByTournamentVariables): MutationPromise<DeleteParticipantsByTournamentData, DeleteParticipantsByTournamentVariables>;

interface DeleteParticipantsByTournamentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteParticipantsByTournamentVariables): MutationRef<DeleteParticipantsByTournamentData, DeleteParticipantsByTournamentVariables>;
}
export const deleteParticipantsByTournamentRef: DeleteParticipantsByTournamentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteParticipantsByTournament(dc: DataConnect, vars: DeleteParticipantsByTournamentVariables): MutationPromise<DeleteParticipantsByTournamentData, DeleteParticipantsByTournamentVariables>;

interface DeleteParticipantsByTournamentRef {
  ...
  (dc: DataConnect, vars: DeleteParticipantsByTournamentVariables): MutationRef<DeleteParticipantsByTournamentData, DeleteParticipantsByTournamentVariables>;
}
export const deleteParticipantsByTournamentRef: DeleteParticipantsByTournamentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteParticipantsByTournamentRef:
```typescript
const name = deleteParticipantsByTournamentRef.operationName;
console.log(name);
```

### Variables
The `DeleteParticipantsByTournament` mutation requires an argument of type `DeleteParticipantsByTournamentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteParticipantsByTournamentVariables {
  tournamentId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteParticipantsByTournament` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteParticipantsByTournamentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteParticipantsByTournamentData {
  participant_deleteMany: number;
}
```
### Using `DeleteParticipantsByTournament`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteParticipantsByTournament, DeleteParticipantsByTournamentVariables } from '@knockoutfpl/dataconnect';

// The `DeleteParticipantsByTournament` mutation requires an argument of type `DeleteParticipantsByTournamentVariables`:
const deleteParticipantsByTournamentVars: DeleteParticipantsByTournamentVariables = {
  tournamentId: ..., 
};

// Call the `deleteParticipantsByTournament()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteParticipantsByTournament(deleteParticipantsByTournamentVars);
// Variables can be defined inline as well.
const { data } = await deleteParticipantsByTournament({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteParticipantsByTournament(dataConnect, deleteParticipantsByTournamentVars);

console.log(data.participant_deleteMany);

// Or, you can use the `Promise` API.
deleteParticipantsByTournament(deleteParticipantsByTournamentVars).then((response) => {
  const data = response.data;
  console.log(data.participant_deleteMany);
});
```

### Using `DeleteParticipantsByTournament`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteParticipantsByTournamentRef, DeleteParticipantsByTournamentVariables } from '@knockoutfpl/dataconnect';

// The `DeleteParticipantsByTournament` mutation requires an argument of type `DeleteParticipantsByTournamentVariables`:
const deleteParticipantsByTournamentVars: DeleteParticipantsByTournamentVariables = {
  tournamentId: ..., 
};

// Call the `deleteParticipantsByTournamentRef()` function to get a reference to the mutation.
const ref = deleteParticipantsByTournamentRef(deleteParticipantsByTournamentVars);
// Variables can be defined inline as well.
const ref = deleteParticipantsByTournamentRef({ tournamentId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteParticipantsByTournamentRef(dataConnect, deleteParticipantsByTournamentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.participant_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.participant_deleteMany);
});
```

## DeleteTournamentById
You can execute the `DeleteTournamentById` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteTournamentById(vars: DeleteTournamentByIdVariables): MutationPromise<DeleteTournamentByIdData, DeleteTournamentByIdVariables>;

interface DeleteTournamentByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTournamentByIdVariables): MutationRef<DeleteTournamentByIdData, DeleteTournamentByIdVariables>;
}
export const deleteTournamentByIdRef: DeleteTournamentByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteTournamentById(dc: DataConnect, vars: DeleteTournamentByIdVariables): MutationPromise<DeleteTournamentByIdData, DeleteTournamentByIdVariables>;

interface DeleteTournamentByIdRef {
  ...
  (dc: DataConnect, vars: DeleteTournamentByIdVariables): MutationRef<DeleteTournamentByIdData, DeleteTournamentByIdVariables>;
}
export const deleteTournamentByIdRef: DeleteTournamentByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteTournamentByIdRef:
```typescript
const name = deleteTournamentByIdRef.operationName;
console.log(name);
```

### Variables
The `DeleteTournamentById` mutation requires an argument of type `DeleteTournamentByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteTournamentByIdVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteTournamentById` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteTournamentByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteTournamentByIdData {
  tournament_delete?: Tournament_Key | null;
}
```
### Using `DeleteTournamentById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteTournamentById, DeleteTournamentByIdVariables } from '@knockoutfpl/dataconnect';

// The `DeleteTournamentById` mutation requires an argument of type `DeleteTournamentByIdVariables`:
const deleteTournamentByIdVars: DeleteTournamentByIdVariables = {
  id: ..., 
};

// Call the `deleteTournamentById()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteTournamentById(deleteTournamentByIdVars);
// Variables can be defined inline as well.
const { data } = await deleteTournamentById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteTournamentById(dataConnect, deleteTournamentByIdVars);

console.log(data.tournament_delete);

// Or, you can use the `Promise` API.
deleteTournamentById(deleteTournamentByIdVars).then((response) => {
  const data = response.data;
  console.log(data.tournament_delete);
});
```

### Using `DeleteTournamentById`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteTournamentByIdRef, DeleteTournamentByIdVariables } from '@knockoutfpl/dataconnect';

// The `DeleteTournamentById` mutation requires an argument of type `DeleteTournamentByIdVariables`:
const deleteTournamentByIdVars: DeleteTournamentByIdVariables = {
  id: ..., 
};

// Call the `deleteTournamentByIdRef()` function to get a reference to the mutation.
const ref = deleteTournamentByIdRef(deleteTournamentByIdVars);
// Variables can be defined inline as well.
const ref = deleteTournamentByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteTournamentByIdRef(dataConnect, deleteTournamentByIdVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tournament_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tournament_delete);
});
```

## CreateEmailQueueEntry
You can execute the `CreateEmailQueueEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createEmailQueueEntry(vars: CreateEmailQueueEntryVariables): MutationPromise<CreateEmailQueueEntryData, CreateEmailQueueEntryVariables>;

interface CreateEmailQueueEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEmailQueueEntryVariables): MutationRef<CreateEmailQueueEntryData, CreateEmailQueueEntryVariables>;
}
export const createEmailQueueEntryRef: CreateEmailQueueEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createEmailQueueEntry(dc: DataConnect, vars: CreateEmailQueueEntryVariables): MutationPromise<CreateEmailQueueEntryData, CreateEmailQueueEntryVariables>;

interface CreateEmailQueueEntryRef {
  ...
  (dc: DataConnect, vars: CreateEmailQueueEntryVariables): MutationRef<CreateEmailQueueEntryData, CreateEmailQueueEntryVariables>;
}
export const createEmailQueueEntryRef: CreateEmailQueueEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createEmailQueueEntryRef:
```typescript
const name = createEmailQueueEntryRef.operationName;
console.log(name);
```

### Variables
The `CreateEmailQueueEntry` mutation requires an argument of type `CreateEmailQueueEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateEmailQueueEntryVariables {
  userUid: string;
  toEmail: string;
  type: string;
  event: number;
  subject: string;
  htmlBody: string;
}
```
### Return Type
Recall that executing the `CreateEmailQueueEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateEmailQueueEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateEmailQueueEntryData {
  emailQueue_insert: EmailQueue_Key;
}
```
### Using `CreateEmailQueueEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createEmailQueueEntry, CreateEmailQueueEntryVariables } from '@knockoutfpl/dataconnect';

// The `CreateEmailQueueEntry` mutation requires an argument of type `CreateEmailQueueEntryVariables`:
const createEmailQueueEntryVars: CreateEmailQueueEntryVariables = {
  userUid: ..., 
  toEmail: ..., 
  type: ..., 
  event: ..., 
  subject: ..., 
  htmlBody: ..., 
};

// Call the `createEmailQueueEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createEmailQueueEntry(createEmailQueueEntryVars);
// Variables can be defined inline as well.
const { data } = await createEmailQueueEntry({ userUid: ..., toEmail: ..., type: ..., event: ..., subject: ..., htmlBody: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createEmailQueueEntry(dataConnect, createEmailQueueEntryVars);

console.log(data.emailQueue_insert);

// Or, you can use the `Promise` API.
createEmailQueueEntry(createEmailQueueEntryVars).then((response) => {
  const data = response.data;
  console.log(data.emailQueue_insert);
});
```

### Using `CreateEmailQueueEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createEmailQueueEntryRef, CreateEmailQueueEntryVariables } from '@knockoutfpl/dataconnect';

// The `CreateEmailQueueEntry` mutation requires an argument of type `CreateEmailQueueEntryVariables`:
const createEmailQueueEntryVars: CreateEmailQueueEntryVariables = {
  userUid: ..., 
  toEmail: ..., 
  type: ..., 
  event: ..., 
  subject: ..., 
  htmlBody: ..., 
};

// Call the `createEmailQueueEntryRef()` function to get a reference to the mutation.
const ref = createEmailQueueEntryRef(createEmailQueueEntryVars);
// Variables can be defined inline as well.
const ref = createEmailQueueEntryRef({ userUid: ..., toEmail: ..., type: ..., event: ..., subject: ..., htmlBody: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createEmailQueueEntryRef(dataConnect, createEmailQueueEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.emailQueue_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.emailQueue_insert);
});
```

## CreateParticipantLeagues
You can execute the `CreateParticipantLeagues` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createParticipantLeagues(vars: CreateParticipantLeaguesVariables): MutationPromise<CreateParticipantLeaguesData, CreateParticipantLeaguesVariables>;

interface CreateParticipantLeaguesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateParticipantLeaguesVariables): MutationRef<CreateParticipantLeaguesData, CreateParticipantLeaguesVariables>;
}
export const createParticipantLeaguesRef: CreateParticipantLeaguesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createParticipantLeagues(dc: DataConnect, vars: CreateParticipantLeaguesVariables): MutationPromise<CreateParticipantLeaguesData, CreateParticipantLeaguesVariables>;

interface CreateParticipantLeaguesRef {
  ...
  (dc: DataConnect, vars: CreateParticipantLeaguesVariables): MutationRef<CreateParticipantLeaguesData, CreateParticipantLeaguesVariables>;
}
export const createParticipantLeaguesRef: CreateParticipantLeaguesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createParticipantLeaguesRef:
```typescript
const name = createParticipantLeaguesRef.operationName;
console.log(name);
```

### Variables
The `CreateParticipantLeagues` mutation requires an argument of type `CreateParticipantLeaguesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateParticipantLeaguesVariables {
  data: ({
    tournamentId?: UUIDString | null;
    tournamentId_expr?: {
    };
      entryId?: number | null;
      entryId_expr?: {
      };
        entryId_update?: ({
          inc?: number | null;
          dec?: number | null;
        })[];
          leagueId?: number | null;
          leagueId_expr?: {
          };
            leagueId_update?: ({
              inc?: number | null;
              dec?: number | null;
            })[];
              participant?: Participant_Key | null;
              tournament?: Tournament_Key | null;
              entryRank?: number | null;
              entryRank_expr?: {
              };
                entryRank_update?: ({
                  inc?: number | null;
                  dec?: number | null;
                })[];
                  leagueName?: string | null;
                  leagueName_expr?: {
                  };
  })[];
}
```
### Return Type
Recall that executing the `CreateParticipantLeagues` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateParticipantLeaguesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateParticipantLeaguesData {
  participantLeague_insertMany: ParticipantLeague_Key[];
}
```
### Using `CreateParticipantLeagues`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createParticipantLeagues, CreateParticipantLeaguesVariables } from '@knockoutfpl/dataconnect';

// The `CreateParticipantLeagues` mutation requires an argument of type `CreateParticipantLeaguesVariables`:
const createParticipantLeaguesVars: CreateParticipantLeaguesVariables = {
  data: ..., 
};

// Call the `createParticipantLeagues()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createParticipantLeagues(createParticipantLeaguesVars);
// Variables can be defined inline as well.
const { data } = await createParticipantLeagues({ data: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createParticipantLeagues(dataConnect, createParticipantLeaguesVars);

console.log(data.participantLeague_insertMany);

// Or, you can use the `Promise` API.
createParticipantLeagues(createParticipantLeaguesVars).then((response) => {
  const data = response.data;
  console.log(data.participantLeague_insertMany);
});
```

### Using `CreateParticipantLeagues`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createParticipantLeaguesRef, CreateParticipantLeaguesVariables } from '@knockoutfpl/dataconnect';

// The `CreateParticipantLeagues` mutation requires an argument of type `CreateParticipantLeaguesVariables`:
const createParticipantLeaguesVars: CreateParticipantLeaguesVariables = {
  data: ..., 
};

// Call the `createParticipantLeaguesRef()` function to get a reference to the mutation.
const ref = createParticipantLeaguesRef(createParticipantLeaguesVars);
// Variables can be defined inline as well.
const ref = createParticipantLeaguesRef({ data: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createParticipantLeaguesRef(dataConnect, createParticipantLeaguesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.participantLeague_insertMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.participantLeague_insertMany);
});
```

## UpsertParticipantLeague
You can execute the `UpsertParticipantLeague` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertParticipantLeague(vars: UpsertParticipantLeagueVariables): MutationPromise<UpsertParticipantLeagueData, UpsertParticipantLeagueVariables>;

interface UpsertParticipantLeagueRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertParticipantLeagueVariables): MutationRef<UpsertParticipantLeagueData, UpsertParticipantLeagueVariables>;
}
export const upsertParticipantLeagueRef: UpsertParticipantLeagueRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertParticipantLeague(dc: DataConnect, vars: UpsertParticipantLeagueVariables): MutationPromise<UpsertParticipantLeagueData, UpsertParticipantLeagueVariables>;

interface UpsertParticipantLeagueRef {
  ...
  (dc: DataConnect, vars: UpsertParticipantLeagueVariables): MutationRef<UpsertParticipantLeagueData, UpsertParticipantLeagueVariables>;
}
export const upsertParticipantLeagueRef: UpsertParticipantLeagueRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertParticipantLeagueRef:
```typescript
const name = upsertParticipantLeagueRef.operationName;
console.log(name);
```

### Variables
The `UpsertParticipantLeague` mutation requires an argument of type `UpsertParticipantLeagueVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertParticipantLeagueVariables {
  tournamentId: UUIDString;
  entryId: number;
  leagueId: number;
  leagueName: string;
  entryRank?: number | null;
}
```
### Return Type
Recall that executing the `UpsertParticipantLeague` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertParticipantLeagueData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertParticipantLeagueData {
  participantLeague_upsert: ParticipantLeague_Key;
}
```
### Using `UpsertParticipantLeague`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertParticipantLeague, UpsertParticipantLeagueVariables } from '@knockoutfpl/dataconnect';

// The `UpsertParticipantLeague` mutation requires an argument of type `UpsertParticipantLeagueVariables`:
const upsertParticipantLeagueVars: UpsertParticipantLeagueVariables = {
  tournamentId: ..., 
  entryId: ..., 
  leagueId: ..., 
  leagueName: ..., 
  entryRank: ..., // optional
};

// Call the `upsertParticipantLeague()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertParticipantLeague(upsertParticipantLeagueVars);
// Variables can be defined inline as well.
const { data } = await upsertParticipantLeague({ tournamentId: ..., entryId: ..., leagueId: ..., leagueName: ..., entryRank: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertParticipantLeague(dataConnect, upsertParticipantLeagueVars);

console.log(data.participantLeague_upsert);

// Or, you can use the `Promise` API.
upsertParticipantLeague(upsertParticipantLeagueVars).then((response) => {
  const data = response.data;
  console.log(data.participantLeague_upsert);
});
```

### Using `UpsertParticipantLeague`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertParticipantLeagueRef, UpsertParticipantLeagueVariables } from '@knockoutfpl/dataconnect';

// The `UpsertParticipantLeague` mutation requires an argument of type `UpsertParticipantLeagueVariables`:
const upsertParticipantLeagueVars: UpsertParticipantLeagueVariables = {
  tournamentId: ..., 
  entryId: ..., 
  leagueId: ..., 
  leagueName: ..., 
  entryRank: ..., // optional
};

// Call the `upsertParticipantLeagueRef()` function to get a reference to the mutation.
const ref = upsertParticipantLeagueRef(upsertParticipantLeagueVars);
// Variables can be defined inline as well.
const ref = upsertParticipantLeagueRef({ tournamentId: ..., entryId: ..., leagueId: ..., leagueName: ..., entryRank: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertParticipantLeagueRef(dataConnect, upsertParticipantLeagueVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.participantLeague_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.participantLeague_upsert);
});
```

