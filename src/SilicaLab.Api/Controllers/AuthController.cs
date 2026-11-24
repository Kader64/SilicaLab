using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data;
using SilicaLab.Api.Dtos;

namespace SilicaLab.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext dbContext) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var user = await dbContext.Users.Where(u => u.FullName == request.FullName).FirstOrDefaultAsync();
        if (user == null)
        {
            return NotFound("Brak usera w bazie");
        }
        
        return Ok("Found");
    }
}
