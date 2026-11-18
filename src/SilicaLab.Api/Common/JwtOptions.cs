namespace SilicaLab.Api.Common;

public class JwtOptions
{
    public const string Section = "Jwt";
    public string Key { get; set; } = "";
    public string Issuer { get; set; } = "";
    public string Audience { get; set; } = "";
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 7;
    public int RefreshGraceSeconds { get; set; } = 10;
    public bool CookieSecure { get; set; } = true;
}
