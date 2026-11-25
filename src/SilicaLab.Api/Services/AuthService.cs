using ErrorOr;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data;
using SilicaLab.Api.Data.Entities;
using SilicaLab.Api.Dtos.Auth;

namespace SilicaLab.Api.Services;

public interface IAuthService
{
    Task<ErrorOr<AuthSessionResult>> RegisterAsync(RegisterRequest request);
    Task<ErrorOr<AuthSessionResult>> LoginAsync(LoginRequest request);
    Task<ErrorOr<AuthSessionResult>> RefreshAsync(string rawRefreshToken);
    Task<ErrorOr<Success>> LogoutAsync(string? rawRefreshToken);
    Task<ErrorOr<UserDto>> GetCurrentUserAsync(Guid userId);
}

public class AuthService(
    AppDbContext dbContext,
    IPasswordHasher<AppUser> passwordHasher,
    ITokenService tokenService) : IAuthService
{
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(5);

    public async Task<ErrorOr<AuthSessionResult>> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim();
        var emailExists = await dbContext.Users.AnyAsync(u => u.Email == email);

        if (emailExists)
            return Error.Conflict("Auth.EmailInUse", "An account with this email already exists.");

        if (!Enum.TryParse<UserRole>(request.Role, ignoreCase: true, out var role) || role == UserRole.Admin)
            return Error.Validation("Auth.InvalidRole", "Role must be either Student or Teacher.");

        var user = new AppUser
        {
            Id = Guid.CreateVersion7(),
            Email = email,
            FullName = request.FullName.Trim(),
            Role = role,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        dbContext.Users.Add(user);
        var session = IssueSessionTokens(user);
        await dbContext.SaveChangesAsync();
        return session;
    }

    private AuthSessionResult IssueSessionTokens(AppUser user)
    {
        var now = DateTimeOffset.UtcNow;
        var accessToken = tokenService.GenerateAccessToken(user);
        var refreshToken = tokenService.GenerateRefreshToken();

        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.CreateVersion7(),
            UserId = user.Id,
            TokenHash = refreshToken.TokenHash,
            ExpiresAt = refreshToken.ExpiresAt,
            CreatedAt = now
        });

        var response = new AuthResponse(accessToken.Token, accessToken.ExpiresInSeconds, MapToUserDto(user));
        return new AuthSessionResult(response, refreshToken.RawToken, refreshToken.ExpiresAt);
    }
    public async Task<ErrorOr<AuthSessionResult>> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null)
            return Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password.");

        if (!user.IsActive)
            return Error.Forbidden("Auth.AccountDisabled", "Your account has been disabled.");

        var now = DateTimeOffset.UtcNow;

        if (user.LockoutEnd.HasValue && user.LockoutEnd > now)
        {
            var remainingMinutes = Math.Ceiling((user.LockoutEnd.Value - now).TotalMinutes);
            return Error.Forbidden("Auth.LockedOut", $"Account is locked. Try again in {remainingMinutes} minute(s).");
        }

        var verifyResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (verifyResult == PasswordVerificationResult.Failed)
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= MaxFailedAttempts)
            {
                user.LockoutEnd = now.Add(LockoutDuration);
                user.FailedLoginAttempts = 0;
            }

            await dbContext.SaveChangesAsync();
            return Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password.");
        }

        if (verifyResult == PasswordVerificationResult.SuccessRehashNeeded)
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;

        var session = IssueSessionTokens(user);
        await dbContext.SaveChangesAsync();

        return session;
    }

    public async Task<ErrorOr<AuthSessionResult>> RefreshAsync(string rawRefreshToken)
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
            return Error.Unauthorized("Auth.MissingRefreshToken", "Refresh token is required.");

        var tokenHash = tokenService.HashToken(rawRefreshToken);
        var existingToken = await dbContext.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        if (existingToken is null)
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Invalid refresh token.");

        var now = DateTimeOffset.UtcNow;

        if (existingToken.RevokedAt is not null)
        {
            await RevokeAllUserTokensAsync(existingToken.UserId, now);
            await dbContext.SaveChangesAsync();
            return Error.Unauthorized("Auth.TokenReuseDetected", "Refresh token has already been used.");
        }

        if (existingToken.ExpiresAt <= now)
            return Error.Unauthorized("Auth.RefreshTokenExpired", "Refresh token has expired.");

        if (!existingToken.User.IsActive)
            return Error.Forbidden("Auth.AccountDisabled", "Your account has been disabled.");

        var newRefresh = tokenService.GenerateRefreshToken();
        var newRefreshEntity = new RefreshToken
        {
            Id = Guid.CreateVersion7(),
            UserId = existingToken.UserId,
            TokenHash = newRefresh.TokenHash,
            ExpiresAt = newRefresh.ExpiresAt,
            CreatedAt = now
        };

        existingToken.RevokedAt = now;
        existingToken.ReplacedByTokenId = newRefreshEntity.Id;

        dbContext.RefreshTokens.Add(newRefreshEntity);

        var accessToken = tokenService.GenerateAccessToken(existingToken.User);
        await dbContext.SaveChangesAsync();

        var response = new AuthResponse(accessToken.Token, accessToken.ExpiresInSeconds, MapToUserDto(existingToken.User));
        return new AuthSessionResult(response, newRefresh.RawToken, newRefresh.ExpiresAt);
    }

    public async Task<ErrorOr<Success>> LogoutAsync(string? rawRefreshToken)
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
            return Result.Success;

        var tokenHash = tokenService.HashToken(rawRefreshToken);

        await dbContext.RefreshTokens
            .Where(rt => rt.TokenHash == tokenHash && rt.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(rt => rt.RevokedAt, DateTimeOffset.UtcNow));

        return Result.Success;
    }

    public async Task<ErrorOr<UserDto>> GetCurrentUserAsync(Guid userId)
    {
        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user is null)
            return Error.NotFound("Auth.UserNotFound", "User not found.");

        return MapToUserDto(user);
    }

    private async Task RevokeAllUserTokensAsync(Guid userId, DateTimeOffset now)
    {
        var activeTokens = await dbContext.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null)
            .ToListAsync();

        foreach (var token in activeTokens)
            token.RevokedAt = now;
    }

    private static UserDto MapToUserDto(AppUser user) => new(user.Id, user.FullName, user.Email, user.Role.ToString());
}