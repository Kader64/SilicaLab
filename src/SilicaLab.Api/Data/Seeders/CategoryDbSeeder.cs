using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Seeders;

public static class CategoryDbSeeder
{
    private static readonly string[] DefaultCategories =
    [
        "Programming",
        "Databases",
        "Web Development",
        "DevOps & Cloud",
        "Cybersecurity",
        "Algorithms"
    ];

    public static async Task SeedAsync(AppDbContext dbContext)
    {
        var existingNames = await dbContext.Categories
            .Select(c => c.Name)
            .ToHashSetAsync();

        var newCategories = DefaultCategories
            .Where(name => !existingNames.Contains(name))
            .Select(name => new Category
            {
                Id = Guid.CreateVersion7(),
                Name = name
            })
            .ToList();

        if (newCategories.Count > 0)
        {
            dbContext.Categories.AddRange(newCategories);
            await dbContext.SaveChangesAsync();
        }
    }
}