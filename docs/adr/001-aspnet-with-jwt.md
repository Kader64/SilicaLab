# ADR-001: Use ASP.NET Core Identity with JWT

Status: Accepted

## Context
SilicaLab needs registration, login, password handling, account lockout, and role-based access (`Student`, `Teacher`, `Admin`). While authentication is security-critical, our domain only requires a single role per user, basic lockout, and refresh token rotation—without two-factor authentication, external OAuth logins, email confirmation tokens, or security stamps. Pulling in full ASP.NET Core Identity adds 7 extra tables (`AspNetUsers`, `AspNetRoles`, `AspNetUserRoles`, etc.) and abstraction overhead we do not need.

## Decision
- Model a custom `AppUser` entity stored in a single `Users` table, with a `UserRole` enum column (`Student`, `Teacher`, `Admin`) stored as a string.
- Use ASP.NET Core's standalone `IPasswordHasher<AppUser>` (`PasswordHasher<AppUser>`, PBKDF2-HMAC-SHA512) for cryptographic password hashing.
- Handle account lockout explicitly on `AppUser` via `FailedLoginAttempts` and `LockoutEnd` (5 failed attempts triggers a 5-minute lockout).
- Validate password strength and registration rules via FluentValidation (`RegisterRequestValidator`).
- Issue JWT access tokens from our own `TokenService` and authorize endpoints using standard ASP.NET Core JWT Bearer authentication with role-based policies (`CanLearn`, `CanTeach`, `AdminOnly`).
- Seed the initial `Admin` account on startup from environment variables.

## Consequences
+ Clean, single-table `Users` schema with zero unused Identity tables or columns.
+ Uses Microsoft's battle-tested `IPasswordHasher<AppUser>` cryptographic implementation without Identity's persistence bloat.
+ Full transparency and direct control over login, lockout, role changes, and refresh-token revocation in `AuthService` and `AdminService`.
- Lockout counters (`FailedLoginAttempts`, `LockoutEnd`) and account status checks (`IsActive`) must be maintained explicitly in our own service layer.