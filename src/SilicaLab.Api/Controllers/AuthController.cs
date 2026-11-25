using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilicaLab.Api.Dtos.Auth;
using SilicaLab.Api.Extensions;
using SilicaLab.Api.Services;

namespace SilicaLab.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private const string RefreshCookieName = "silicalab_refresh_token";

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IResult> Register(RegisterRequest request)
    {
        var result = await authService.RegisterAsync(request);

        return result.Match(
            session =>
            {
                SetRefreshTokenCookie(session.RawRefreshToken, session.RefreshTokenExpiresAt);
                return Results.Created("/api/auth/me", session.Response);
            },
            errors => errors.ToProblem());
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IResult> Login(LoginRequest request)
    {
        var result = await authService.LoginAsync(request);

        return result.Match(
            session =>
            {
                SetRefreshTokenCookie(session.RawRefreshToken, session.RefreshTokenExpiresAt);
                return Results.Ok(session.Response);
            },
            errors => errors.ToProblem());
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<IResult> Refresh(RefreshRequest? request = null)
    {
        var rawToken = Request.Cookies[RefreshCookieName] ?? request?.RefreshToken ?? string.Empty;
        var result = await authService.RefreshAsync(rawToken);

        return result.Match(
            session =>
            {
                SetRefreshTokenCookie(session.RawRefreshToken, session.RefreshTokenExpiresAt);
                return Results.Ok(session.Response);
            },
            errors =>
            {
                ClearRefreshTokenCookie();
                return errors.ToProblem();
            });
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IResult> Logout(RefreshRequest? request = null)
    {
        var rawToken = Request.Cookies[RefreshCookieName] ?? request?.RefreshToken;
        await authService.LogoutAsync(rawToken);

        ClearRefreshTokenCookie();
        return Results.NoContent();
    }

    [HttpGet("me")]
    public async Task<IResult> Me()
    {
        var sub = User.FindFirstValue("sub");
        if (!Guid.TryParse(sub, out var userId))
            return Results.Unauthorized();

        var result = await authService.GetCurrentUserAsync(userId);

        return result.Match(
            user => Results.Ok(user),
            errors => errors.ToProblem());
    }

    private void SetRefreshTokenCookie(string rawToken, DateTimeOffset expiresAt)
    {
        Response.Cookies.Append(RefreshCookieName, rawToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth",
            Expires = expiresAt
        });
    }

    private void ClearRefreshTokenCookie()
    {
        Response.Cookies.Delete(RefreshCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth"
        });
    }
}