using Microsoft.EntityFrameworkCore;
using SilicaLab.Api.Data;

namespace SilicaLab.Api.Services;

public sealed class TokenCleanupService(
    IServiceScopeFactory scopeFactory,
    ILogger<TokenCleanupService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);
    private static readonly TimeSpan Retention = TimeSpan.FromDays(7);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);

        while (!stoppingToken.IsCancellationRequested &&
               await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var now = DateTimeOffset.UtcNow;
                var cutoff = now.Subtract(Retention);

                var deleted = await db.RefreshTokens
                    .Where(rt => rt.ExpiresAt <= now || (rt.RevokedAt != null && rt.RevokedAt <= cutoff))
                    .ExecuteDeleteAsync(stoppingToken);

                if (deleted > 0)
                    logger.LogInformation("Cleaned up {Count} expired/revoked refresh tokens.", deleted);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Error occurred while cleaning up refresh tokens.");
            }
        }
    }
}