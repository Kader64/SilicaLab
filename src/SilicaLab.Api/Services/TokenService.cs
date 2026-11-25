using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SilicaLab.Api.Common;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Services;

public record AccessTokenResult(string Token, int ExpiresInSeconds);
public record RefreshTokenResult(string RawToken, string TokenHash, DateTimeOffset ExpiresAt);

public interface ITokenService
{
    AccessTokenResult GenerateAccessToken(AppUser user); // JWT
    RefreshTokenResult GenerateRefreshToken(); // Cookie
    string HashToken(string rawToken);
}

public class TokenService(IOptions<JwtOptions> jwtOptions) : ITokenService
{
    private readonly JwtOptions _jwt = jwtOptions.Value;

    public AccessTokenResult GenerateAccessToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new("name", user.FullName),
            new("email", user.Email),
            new("role", user.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.CreateVersion7().ToString())
        };
        var expires = DateTime.UtcNow.AddMinutes(_jwt.AccessTokenMinutes);

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        var writtenToken = new JwtSecurityTokenHandler().WriteToken(token);
        return new AccessTokenResult(writtenToken, _jwt.AccessTokenMinutes * 60);
    }

    public RefreshTokenResult GenerateRefreshToken()
    {
        var rawToken = Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(32));
        var tokenHash = HashToken(rawToken);
        var expiresAt = DateTimeOffset.UtcNow.AddDays(_jwt.RefreshTokenDays);

        return new RefreshTokenResult(rawToken, tokenHash, expiresAt);
    }
    public string HashToken(string rawToken)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexStringLower(hashBytes);
    }
}