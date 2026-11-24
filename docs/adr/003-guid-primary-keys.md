# ADR-003: Guid primary keys (UUIDv7)

Status: Accepted

## Context
IDs appear in API URLs and are exposed to the client. Sequential integers
reveal how many records exist and are easy to enumerate, while purely random
UUIDv4 keys cause B-tree index fragmentation in PostgreSQL on insert-heavy tables.

## Decision
- All entities (including our custom `AppUser` entity) use `Guid` primary keys mapped to PostgreSQL `uuid`.
- Generate IDs in the application using `Guid.CreateVersion7()` (UUIDv7), which embeds a millisecond timestamp prefix followed by cryptographically random bits.
- Configure EF Core with `ValueGeneratedNever()` on primary keys so the application controls ID generation explicitly.

## Consequences
+ IDs are non-guessable and cannot be enumerated sequentially.
+ Time-ordered UUIDv7 keys avoid PostgreSQL B-tree index fragmentation and give natural chronological ordering without extra sorting.
- Larger than `int` (16 bytes vs. 4 bytes) and less readable when debugging raw SQL.
- Authorization checks are still required on every endpoint—GUIDs are not a security control.