# System Architecture

> **Status:** DRAFT - needs diagrams and implementation verification
> **Last Updated:** December 2025

---

## System Diagram (DRAFT)

<!-- TODO: Add proper diagram -->

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React + Vite + TypeScript               │   │
│  │                    shadcn/ui + Tailwind             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Firebase                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Auth        │  │  Firestore   │  │  Cloud Functions │  │
│  │  (users)     │  │  (data)      │  │  (FPL proxy)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      FPL API (External)                      │
│            fantasy.premierleague.com/api/                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend (DRAFT)

<!-- TODO: Verify this matches current implementation -->

### Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool, dev server |
| TypeScript | Type safety |
| shadcn/ui | Component library |
| Tailwind CSS | Styling |
| React Router | Client-side routing |

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

<!-- TODO: Verify routes match router.tsx -->

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Landing | No |
| `/login` | Login | No |
| `/signup` | Sign Up | No |
| `/dashboard` | Dashboard | Yes |
| `/connect` | FPL Connection | Yes |
| `/leagues` | Mini-Leagues List | Yes |
| `/league/:id` | League Detail | Yes |
| `/tournament/:id` | Tournament Bracket | Yes |

---

## Backend - Firebase (DRAFT)

<!-- TODO: Verify Firebase configuration -->

### Services Used

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Authentication | Email/password auth | Unlimited |
| Firestore | NoSQL database | 50K reads/day, 20K writes/day |
| Cloud Functions | FPL API proxy, scheduled tasks | 2M invocations/month |
| Hosting | Static site hosting | 10GB storage, 360MB/day bandwidth |

### Firebase Auth

- Email/password authentication
- Session persistence
- Auth state listener in React context

### Firestore

- Collections: `users`, `tournaments`
- See [data/data-dictionary.md](./data/data-dictionary.md) for schema

### Cloud Functions

<!-- TODO: Verify function list -->

| Function | Trigger | Purpose |
|----------|---------|---------|
| `fplProxy` | HTTP | Proxy FPL API calls (CORS bypass) |
| `processRounds` | Scheduled | Update scores, advance brackets |

---

## External Services (DRAFT)

### FPL API

- Unofficial public API
- No authentication required
- CORS blocked → must proxy via Cloud Functions
- See [integrations/fpl-api.md](./integrations/fpl-api.md) for details

---

## Key Architectural Decisions (DRAFT)

<!-- TODO: Document rationale for each -->

### Why Firebase?

- [x] Free tier sufficient for MVP
- [x] Integrated auth + database + hosting
- [x] Real-time capabilities (future)
- [x] Serverless (no infrastructure management)
- [ ] Vendor lock-in risk accepted

### Why no dedicated backend?

- [x] Cloud Functions sufficient for API proxying
- [x] Firestore handles data persistence
- [x] Reduces complexity
- [ ] May need to revisit for complex features

### Why Vite over Create React App?

- [x] Faster development builds
- [x] Better DX
- [x] Modern ESM-first approach

### Why shadcn/ui?

- [x] Accessible by default
- [x] Copy-paste components (no npm dependency)
- [x] Tailwind-based (consistent styling)
- [x] Customizable

---

## Environments (DRAFT)

<!-- TODO: Document environment setup -->

| Environment | URL | Firebase Project |
|-------------|-----|------------------|
| Local | localhost:5173 | Emulators |
| Development | <!-- TODO --> | knockoutfpl-dev |
| Production | <!-- TODO --> | knockoutfpl |

---

## Related

- [data/](./data/CLAUDE.md) - Data structures
- [integrations/](./integrations/CLAUDE.md) - External APIs
- [../product/specs/functional-spec.md](../product/specs/functional-spec.md) - How the system behaves
