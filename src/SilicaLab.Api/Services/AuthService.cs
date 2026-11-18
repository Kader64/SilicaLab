using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SilicaLab.Api.Common;
using SilicaLab.Api.Data;
using SilicaLab.Api.Data.Entities;
using SilicaLab.Api.DTO;
using SilicaLab.Api.Exceptions;
using ValidationException = SilicaLab.Api.Exceptions.ValidationException;

namespace SilicaLab.Api.Services;

public record AuthResult(AuthResponse Response, string? RefreshToken);

public class AuthService(
    UserManager<AppUser> users,
    TokenService tokens,
    AppDbContext db,
    TimeProvider time,
    IOptions<JwtOptions> jwtOptions)
{
    private readonly JwtOptions _jwt = jwtOptions.Value;
    private const string InvalidCredentials = "Invalid email or password.";
    private const string SessionExpired = "Session expired. Log in again.";

    public async Task<AuthResult> RegisterAsync(RegisterRequest request)
    {
        var role = string.Equals(request.Role, Roles.Teacher, StringComparison.OrdinalIgnoreCase) ? Roles.Teacher : Roles.Student;
        var email = request.Email.Trim();

        await using var tx = await db.Database.BeginTransactionAsync();

        var user = new AppUser
        {
            Id = Guid.CreateVersion7(),
            UserName = email,
            Email = email,
            FullName = request.FullName.Trim(),
            CreatedAt = time.GetUtcNow(),
            IsActive = true,
        };

        var created = await users.CreateAsync(user, request.Password);
        if (!created.Succeeded) throw ToValidationException(created);

        var addedRole = await users.AddToRoleAsync(user, role);
        if (!addedRole.Succeeded) throw ToValidationException(addedRole);

        var result = await IssueAsync(user, role);
        await tx.CommitAsync();
        return result;
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request)
    {
        var user = await users.FindByEmailAsync(request.Email.Trim()) ?? throw new UnauthorizedException(InvalidCredentials);

        if (await users.IsLockedOutAsync(user))
        {
            throw new UnauthorizedException("Too many failed attempts. Try again in a few minutes.");
        }

        if (!await users.CheckPasswordAsync(user, request.Password))
        {
            await users.AccessFailedAsync(user);
            throw new UnauthorizedException(InvalidCredentials);
        }

        if (!user.IsActive) throw new UnauthorizedException("This account is disabled.");

        await users.ResetAccessFailedCountAsync(user);
        return await IssueAsync(user, await GetRoleAsync(user));
    }

    public async Task<AuthResult> RefreshAsync(string? rawToken)
    {
        if (string.IsNullOrEmpty(rawToken)) throw new UnauthorizedException(SessionExpired);

        var hash = TokenService.Hash(rawToken);
        var token = await db.RefreshTokens.Include(t => t.User).FirstOrDefaultAsync(t => t.TokenHash == hash)
            ?? throw new UnauthorizedException(SessionExpired);
        var now = time.GetUtcNow();

        if (token.RevokedAt is not null)
        {
            if (token.ReplacedByTokenId is null) throw new UnauthorizedException(SessionExpired);

            if (now - token.RevokedAt.Value <= TimeSpan.FromSeconds(_jwt.RefreshGraceSeconds) && token.User.IsActive)
            {
                var replacement = await db.RefreshTokens.AsNoTracking().FirstOrDefaultAsync(t => t.Id == token.ReplacedByTokenId);
                if (replacement is { RevokedAt: null } && replacement.ExpiresAt > now)
                {
                    return new AuthResult(BuildResponse(token.User, await GetRoleAsync(token.User)), null);
                }
            }

            await tokens.RevokeAllAsync(token.UserId);
            throw new UnauthorizedException(SessionExpired);
        }

        if (token.ExpiresAt <= now || !token.User.IsActive) throw new UnauthorizedException(SessionExpired);

        var raw = TokenService.NewRawRefreshToken();
        var next = new RefreshToken
        {
            UserId = token.UserId,
            TokenHash = TokenService.Hash(raw),
            CreatedAt = now,
            ExpiresAt = now.AddDays(_jwt.RefreshTokenDays),
        };
        token.RevokedAt = now;
        token.ReplacedByTokenId = next.Id;
        db.RefreshTokens.Add(next);
        await db.SaveChangesAsync();

        return new AuthResult(BuildResponse(token.User, await GetRoleAsync(token.User)), raw);
    }

    public async Task LogoutAsync(string? rawToken)
    {
        if (string.IsNullOrEmpty(rawToken)) return;

        var hash = TokenService.Hash(rawToken);
        var token = await db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash && t.RevokedAt == null);
        if (token is null) return;

        token.RevokedAt = time.GetUtcNow();
        await db.SaveChangesAsync();
    }

    private async Task<string> GetRoleAsync(AppUser user) =>
        (await users.GetRolesAsync(user)).FirstOrDefault() ?? Roles.Student;

    private async Task<AuthResult> IssueAsync(AppUser user, string role)
    {
        var now = time.GetUtcNow();
        var raw = TokenService.NewRawRefreshToken();

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = TokenService.Hash(raw),
            CreatedAt = now,
            ExpiresAt = now.AddDays(_jwt.RefreshTokenDays),
        });

        var cutoff = now.AddDays(-30);
        await db.RefreshTokens.Where(t => t.UserId == user.Id && t.ExpiresAt < cutoff).ExecuteDeleteAsync();
        await db.SaveChangesAsync();

        return new AuthResult(BuildResponse(user, role), raw);
    }

    private AuthResponse BuildResponse(AppUser user, string role) =>
        new(tokens.CreateAccessToken(user, role), tokens.AccessTokenSeconds, ToDto(user, role));

    private static UserDto ToDto(AppUser user, string role) => new(user.Id, user.FullName, user.Email ?? "", role);

    private static ValidationException ToValidationException(IdentityResult result)
    {
        var errors = new Dictionary<string, List<string>>();

        foreach (var error in result.Errors)
        {
            var (field, message) = error.Code switch
            {
                "DuplicateEmail" or "DuplicateUserName" => ("email", "This email is already registered."),
                "InvalidEmail" or "InvalidUserName" => ("email", "Enter a valid email address."),
                var code when code.StartsWith("Password") => ("password", error.Description),
                _ => ("form", error.Description),
            };

            if (!errors.TryGetValue(field, out var list)) errors[field] = list = [];
            if (!list.Contains(message)) list.Add(message);
        }

        return new ValidationException(errors.ToDictionary(e => e.Key, e => e.Value.ToArray()));
    }
}
