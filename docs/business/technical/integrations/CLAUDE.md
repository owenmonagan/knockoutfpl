# Integrations Documentation

External services and APIs the system depends on.

---

## Documents

- **[fpl-api.md](./fpl-api.md)** - FPL API endpoints, data structures, rate limits, and error handling.

---

## Current Integrations

| Service | Purpose | Critical? |
|---------|---------|-----------|
| FPL API | Team data, scores, leagues | Yes - core functionality |
| Firebase Auth | User authentication | Yes - auth system |
| Firebase Data Connect (PostgreSQL) | Data persistence | Yes - database |

---

## Future Integrations

<!-- TODO: Plan these as needed -->

| Service | Purpose | Status |
|---------|---------|--------|
| Email (SendGrid, etc.) | Notifications | Not planned for MVP |
| Analytics | Usage tracking | Not planned for MVP |

---

## Related

- See [../architecture.md](../architecture.md) for system overview
- See [../data/](../data/CLAUDE.md) for data structures
- See [../../product/specs/functional-spec.md](../../product/specs/functional-spec.md) for how we use this data
