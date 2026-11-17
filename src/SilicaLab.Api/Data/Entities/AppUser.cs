using Microsoft.AspNetCore.Identity;

namespace SilicaLab.Api.Data.Entities;

public class AppUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
