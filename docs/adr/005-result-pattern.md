# ADR-005: Result Pattern (`ErrorOr`) for Domain Error Handling

Status: Accepted

## Context

Expected domain failures (invalid credentials, duplicate enrollment, exhausted attempts, missing resources) are normal business outcomes, not crashes. Throwing exceptions for control flow hides failure modes from method signatures and adds stack-trace overhead, while maintaining a custom `Result<T>` implementation duplicates battle-tested primitives.

## Decision

- Use the **`ErrorOr`** NuGet package (`ErrorOr<T>`, `ErrorOr<Success>`, `ErrorOr<Created>`, `ErrorOr<Updated>`, `ErrorOr<Deleted>`) as the return type for all service methods.
- Represent domain failures using `ErrorOr.Error` factory methods (`Error.Validation`, `Error.Unauthorized`, `Error.Forbidden`, `Error.NotFound`, `Error.Conflict`) or `Error.Custom` for specialized HTTP status codes (e.g., `422 Unprocessable Entity`), leveraging implicit conversions to avoid wrapper boilerplate.
- Map `List<Error>` / `Error` to **RFC 9457 ProblemDetails** (`400`, `401`, `403`, `404`, `409`, `422`) centrally in a single `ProblemDetailsExtensions.ToProblem()` helper invoked via `.Match(...)` in controllers.
- Reserve exceptions strictly for unexpected system failures and infrastructure crashes, handled globally by `app.UseExceptionHandler()` as `500 Internal Server Error`.

## Alternatives considered

- **Custom domain exceptions + middleware:** Hidden control flow, stack-trace overhead on high-frequency failures (e.g., invalid logins), and exception-driven unit tests.
- **Custom `Result<T>` + `AppError` implementation:** Zero external dependencies, but requires maintaining our own result wrapper, multi-error aggregation, and async chaining helpers (`.ThenAsync`, `.Match`).

## Consequences

+ Explicit failure modes in service signatures (`Task<ErrorOr<T>>`) and thin, declarative controllers using `.Match(...)`.
- Zero exception overhead for domain errors; clean, assertion-friendly unit tests.
