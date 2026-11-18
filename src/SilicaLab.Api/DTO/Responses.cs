namespace SilicaLab.Api.DTO;

public record UserDto(Guid Id, string FullName, string Email, string Role);

public record AuthResponse(string AccessToken, int ExpiresInSeconds, UserDto User);
