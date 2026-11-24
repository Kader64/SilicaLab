using Microsoft.AspNetCore.Mvc;

namespace SilicaLab.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register()
    {
        return Ok("Gitówa");
    }
}
