namespace SilicaLab.Api.Dtos.Auth;

public record UserDto(Guid Id, string FullName, string Email, string Role);

public record AuthResponse(
    string AccessToken,
    int ExpiresInSeconds,
    UserDto User
);

public record AuthSessionResult(
    AuthResponse Response,
    string RawRefreshToken,
    DateTimeOffset RefreshTokenExpiresAt
);