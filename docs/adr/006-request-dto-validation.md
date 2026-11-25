# ADR-006: Request validation with DataAnnotations

Status: Accepted

## Context
Incoming HTTP request DTOs need structural and format validation at the API boundary, while database entities already define schema rules via EF Core Fluent API (`ADR-003`). We want built-in validation and OpenAPI schema generation without adding external validation libraries or mixing database attributes into domain entities.

## Decision
- Validate incoming Request DTOs using `System.ComponentModel.DataAnnotations` attributes (`[Required]`, `[MaxLength]`, `[EmailAddress]`, `[RegularExpression]`) directly on DTO `record` parameters.
- Rely on ASP.NET Core `[ApiController]` automatic model validation to return `400 Bad Request` (`ValidationProblemDetails`) before controller actions execute.
- Do not add validation attributes to Response DTOs or EF Core entities (all database constraints remain in `Data/Configuration/` via EF Core Fluent API).
- Keep business-rule errors (duplicate email, account lockout, invalid credentials) in services using the `Result<T>` pattern.

## Consequences
+ Zero extra NuGet dependencies or custom validation filter boilerplate.
+ OpenAPI / Scalar documentation automatically reflects `required`, `minLength`, and `maxLength` constraints.
+ Domain entities remain clean POCOs with all persistence rules centralized in EF Core Fluent API configurations.
- Complex multi-field or cross-entity checks must be handled explicitly in services via `Result<T>` rather than attributes.
- Field length limits must be kept aligned between Request DTO attributes and EF Core entity configurations.