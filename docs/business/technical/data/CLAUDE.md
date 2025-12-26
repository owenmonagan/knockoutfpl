# Data Layer Documentation

Entity definitions, field specifications, and data flow documentation.

---

## Documents

- **[data-dictionary.md](./data-dictionary.md)** - Complete entity and field reference. Every collection, every field, every constraint.

- **[data-flow.md](./data-flow.md)** - How data moves through the system. Read flows, write flows, and background processes.

---

## Reading Order

1. Start with **data-dictionary.md** to understand what we store
2. Reference **data-flow.md** to understand how data moves

---

## Quick Reference

| Collection | Purpose |
|------------|---------|
| `users` | User accounts and FPL connections |
| `tournaments` | Tournament structure, participants, matches |

---

## Related

- See [../architecture.md](../architecture.md) for system overview
- See [../../product/specs/functional-spec.md](../../product/specs/functional-spec.md) for business rules
- See [../integrations/fpl-api.md](../integrations/fpl-api.md) for external data sources
