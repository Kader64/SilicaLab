using System.Buffers.Text;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using SilicaLab.Api.Common;
using SilicaLab.Api.Data;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Services;

public class TokenService(IOptions<JwtOptions> jwt, AppDbContext db, TimeProvider time)
{
    private readonly JwtOptions _options = jwt.Value;

    public int AccessTokenSeconds => _options.AccessTokenMinutes * 60;

    public string CreateAccessToken(AppUser user, string role)
    {
        var now = time.GetUtcNow();
        var claims = new List<Claim>
        {
            new("sub", user.Id.ToString()),
            new("email", user.Email ?? ""),
            new("name", user.FullName),
            new("role", role),
        };

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            Subject = new ClaimsIdentity(claims),
            NotBefore = now.UtcDateTime,
            Expires = now.AddMinutes(_options.AccessTokenMinutes).UtcDateTime,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key)),
                SecurityAlgorithms.HmacSha256),
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }

    public static string NewRawRefreshToken() => Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));
    public static string Hash(string rawToken) => Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

    public async Task RevokeAllAsync(Guid userId)
    {
        var now = time.GetUtcNow();
        await db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now));
    }
}
