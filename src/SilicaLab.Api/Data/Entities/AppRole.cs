using Microsoft.AspNetCore.Identity;

namespace SilicaLab.Api.Data.Entities;

public class AppRole : IdentityRole<Guid>
{
    public AppRole() { }
    public AppRole(string name) : base(name) { }
}

