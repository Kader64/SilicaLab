# ADR-005: Result Pattern (`Result<T>` and `AppError`) for Domain Error Handling

Status: Accepted

## Context
Expected domain failures (invalid credentials, duplicate enrollment, exhausted attempts, missing resources) are normal business outcomes, not crashes. Throwing exceptions for control flow hides failure modes from method signatures and adds stack-trace overhead.

## Decision
- Return `Result` / `Result<T>` with a typed `AppError` (`ErrorType`: `Validation`, `Unauthorized`, `Forbidden`, `NotFound`, `Conflict`, `BusinessRule`) from all service methods.
- Provide implicit conversions from `T` and `AppError` to `Result<T>` to avoid boilerplate.
- Map `AppError` to **RFC 9457 ProblemDetails** (`400`, `401`, `403`, `404`, `409`, `422`) centrally in `ResultExtensions.ToActionResult()`.
- Reserve exceptions strictly for unexpected system crashes, handled by `app.UseExceptionHandler()` as `500`.

## Alternatives considered
- **Custom domain exceptions + middleware:** Hidden control flow, stack-trace overhead, and exception-based unit tests.
- **Third-party libraries (`FluentResults`, `ErrorOr`):** External dependency for something solved in ~60 lines tailored to `ProblemDetails`.

## Consequences
+ Explicit failure modes in service signatures (`Task<Result<T>>`) and thin 3-line controllers.
+ Zero exception overhead for domain errors; clean unit tests.
- Callers must inspect `IsSuccess` / `IsFailure` or forward via `ToActionResult()`.