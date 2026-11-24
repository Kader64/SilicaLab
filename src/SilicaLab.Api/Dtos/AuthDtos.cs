namespace SilicaLab.Api.Dtos;

public record UserDto(Guid Id, string FullName, string Email, string Role);

public record RegisterRequest(string FullName, string Email, string Password, string Role);
public record RegisterResponse(string AccessToken, int ExpiresInSeconds, UserDto User);