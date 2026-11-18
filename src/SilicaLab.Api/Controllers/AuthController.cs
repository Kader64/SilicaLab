using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SilicaLab.Api.Common;
using SilicaLab.Api.DTO;
using SilicaLab.Api.Services;

namespace SilicaLab.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService auth, IOptions<JwtOptions> jwt, TimeProvider time) : ControllerBase
{
    private const string CookieName = "refresh_token";
    private const string CookiePath = "/api/auth";

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var result = await auth.RegisterAsync(request);
        SetRefreshCookie(result.RefreshToken);
        return Ok(result.Response);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var result = await auth.LoginAsync(request);
        SetRefreshCookie(result.RefreshToken);
        return Ok(result.Response);
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh()
    {
        var result = await auth.RefreshAsync(Request.Cookies[CookieName]);
        SetRefreshCookie(result.RefreshToken);
        return Ok(result.Response);
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await auth.LogoutAsync(Request.Cookies[CookieName]);
        Response.Cookies.Delete(CookieName, new CookieOptions { Path = CookiePath });
        return NoContent();
    }

    private void SetRefreshCookie(string? token)
    {
        if (token is null) return;

        Response.Cookies.Append(CookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = jwt.Value.CookieSecure,
            SameSite = SameSiteMode.Strict,
            Path = CookiePath,
            Expires = time.GetUtcNow().AddDays(jwt.Value.RefreshTokenDays),
        });
    }
}
