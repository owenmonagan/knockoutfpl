# System Architecture

> **Last Updated:** December 2025

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              React + Vite + TypeScript                   │    │
│  │                  shadcn/ui + Tailwind                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Firebase                                 │
│                                                                  │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────┐ │
│  │     Auth     │  │   Data Connect    │  │ Cloud Functions  │ │
│  │   (Google)   │  │    (GraphQL)      │  │  (FPL proxy,     │ │
│  │              │  │                   │  │   scheduled)     │ │
│  └──────────────┘  └─────────┬─────────┘  └──────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│                    ┌───────────────────┐                        │
│                    │  Cloud SQL        │                        │
│                    │  (PostgreSQL)     │                        │
│                    │                   │                        │
│                    │  10 tables        │                        │
│                    └───────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FPL API (External)                          │
│              fantasy.premierleague.com/api/                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend

### Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool, dev server |
| TypeScript | Type safety |
| shadcn/ui | Component library |
| Tailwind CSS | Styling |
| React Router | Client-side routing |
| Firebase Data Connect | Type-safe GraphQL client |

### Key Directories

```
src/
├── components/     # Reusable UI components
├── pages/          # Route-level components
├── services/       # API and Firebase interactions
├── contexts/       # React contexts (auth, etc.)
├── lib/            # Utilities, helpers
├── types/          # TypeScript type definitions
└── hooks/          # Custom React hooks
```

### Routing

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Landing | No |
| `/login` | Login | No |
| `/signup` | Sign Up | No |
| `/dashboard` | Dashboard | Yes |
| `/connect` | FPL Connection | Yes |
| `/leagues` | Mini-Leagues List | Yes |
| `/league/:fpl_league_id` | Tournament Bracket | No (public) |
| `/profile` | User Profile | Yes |

---

## Backend

### Services

| Service | Purpose |
|---------|---------|
| Firebase Auth | Google authentication |
| Cloud SQL (PostgreSQL) | Relational database |
| Firebase Data Connect | GraphQL API layer |
| Cloud Functions | FPL API proxy, scheduled jobs |
| Firebase Hosting | Static site hosting |

### Database

**PostgreSQL via Firebase Data Connect**

10 tables across 4 layers:

| Layer | Tables | Purpose |
|-------|--------|---------|
| FPL Cache (2) | `events`, `leagues` | Re-fetchable from FPL API |
| FPL Records (2) | `entries`, `picks` | Authoritative for result verification |
| User (1) | `users` | Firebase Auth accounts |
| Tournament (5) | `tournaments`, `rounds`, `participants`, `matches`, `match_picks` | Tournament structure |

See [data/data-dictionary.md](./data/data-dictionary.md) for full schema.

### Data Connect (GraphQL)

Type-safe GraphQL layer between frontend and PostgreSQL:

- Auto-generated TypeScript types from schema
- Real-time subscriptions (future)
- Built-in auth integration with Firebase Auth

### Cloud Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `fplProxy` | HTTP | Proxy FPL API calls (CORS bypass) |
| `syncGameweek` | Scheduled (hourly) | Update `events` table with current GW |
| `resolveRounds` | Scheduled (2 hours) | Fetch scores, determine winners, advance brackets |

---

## External Services

### FPL API

- Unofficial public API at `fantasy.premierleague.com/api/`
- No authentication required
- CORS blocked → must proxy via Cloud Functions
- See [integrations/fpl-api.md](./integrations/fpl-api.md) for endpoints

---

## Key Architectural Decisions

### Why PostgreSQL over Firestore?

- **Relational power** - JOINs, transactions, bulk operations
- **Scale** - Handles 1M+ participants per tournament
- **SQL familiarity** - Standard queries, easy to optimize
- **Data Connect** - Type-safe GraphQL with Firebase Auth integration

### Why Firebase Data Connect?

- **Type safety** - Auto-generated TypeScript from GraphQL schema
- **Auth integration** - Row-level security with Firebase Auth
- **Managed** - No GraphQL server to maintain
- **Real-time ready** - Subscriptions for future live updates

### Why Cloud Functions for FPL API?

- **CORS bypass** - FPL API blocks browser requests
- **Caching** - Can cache responses to reduce API load
- **Rate limiting** - Control request frequency
- **Error handling** - Consistent error responses

### Why Google Auth only?

- **Simplicity** - One auth flow to maintain
- **Trust** - Users familiar with Google sign-in
- **No password management** - Reduces security surface

---

## Data Flow Summary

```
User Action          → Data Flow
─────────────────────────────────────────────────────────
Sign in              → Firebase Auth → users table
Connect FPL          → Cloud Function → FPL API → entries table
View leagues         → entries.raw_json (cached leagues)
Create tournament    → Cloud Function → FPL API → 7 tables written
View bracket         → Data Connect → matches, participants, picks
Score resolution     → Scheduled Function → FPL API → picks → matches
```

See [data/data-flow.md](./data/data-flow.md) for detailed flows.

---

## Environments

| Environment | URL | Database |
|-------------|-----|----------|
| Local | localhost:5173 | Local PostgreSQL or emulator |
| Production | knockoutfpl.com | Cloud SQL |

---

## Related

- [data/](./data/CLAUDE.md) - Data structures and flow
- [integrations/](./integrations/CLAUDE.md) - External APIs
- [../product/](../product/CLAUDE.md) - Product specifications
