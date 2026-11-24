using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Seeders;

public static class AdminDbSeeder
{
    public static async Task SeedAsync(
        AppDbContext dbContext,
        IPasswordHasher<AppUser> passwordHasher)
    {
        const string adminEmail = "admin@silicalab.local";
        const string adminPassword = "Admin@12333";

        var adminExists = await dbContext.Users
            .AnyAsync(u => u.Role == UserRole.Admin || u.Email == adminEmail);

        if (adminExists)
            return;

        var admin = new AppUser
        {
            Id = Guid.CreateVersion7(),
            Email = adminEmail,
            FullName = "Admin",
            Role = UserRole.Admin,
            IsActive = true,
            FailedLoginAttempts = 0,
            CreatedAt = DateTimeOffset.UtcNow
        };

        admin.PasswordHash = passwordHasher.HashPassword(admin, adminPassword);

        dbContext.Users.Add(admin);
        await dbContext.SaveChangesAsync();
    }
}