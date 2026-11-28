using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using SilicaLab.Api.Common;
using SilicaLab.Api.Data;
using SilicaLab.Api.Data.Entities;
using SilicaLab.Api.Data.Seeders;
using SilicaLab.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT
builder.Services.AddOptions<JwtOptions>()
    .BindConfiguration(JwtOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtOptions>>((bearer, jwt) =>
    {
        bearer.MapInboundClaims = false;
        bearer.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Value.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Value.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Value.Key)),
            ClockSkew = TimeSpan.Zero,
            NameClaimType = "name",
            RoleClaimType = "role",
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Policies.CanLearn, p => p.RequireRole(Roles.Student, Roles.Teacher))
    .AddPolicy(Policies.CanTeach, p => p.RequireRole(Roles.Teacher))
    .AddPolicy(Policies.AdminOnly, p => p.RequireRole(Roles.Admin))
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build()); // All endpoint require authorization on default

// Services
builder.Services.AddProblemDetails(); // For description in built-in error bodies
builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();
builder.Services.AddSingleton<ITokenService, TokenService>(); // Provides JWT token for auth
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHostedService<TokenCleanupService>();

builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();


builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
    app.MapScalarApiReference().AllowAnonymous();

    // Auto migrate DB on development
    await using var scope = app.Services.CreateAsyncScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();

    // Seeding
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AppUser>>();
    await AdminDbSeeder.SeedAsync(dbContext, passwordHasher);
    await CategoryDbSeeder.SeedAsync(dbContext);
    // TEMP Seeder for testing ONLY
    await FullDbSeeder.SeedAsync(dbContext, passwordHasher);
}

app.UseHttpsRedirection();
app.UseStatusCodePages();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();