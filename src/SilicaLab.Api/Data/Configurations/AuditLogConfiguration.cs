using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");
        builder.HasKey(al => al.Id);

        builder.Property(al => al.Action)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(al => al.TargetType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(al => al.Details)
            .HasColumnType("jsonb");

        builder.HasIndex(al => new { al.TargetType, al.TargetId, al.CreatedAt })
            .IsDescending(false, false, true);

        builder.HasIndex(al => new { al.ActorUserId, al.CreatedAt })
            .IsDescending(false, true);

        builder.HasOne(al => al.ActorUser)
            .WithMany()
            .HasForeignKey(al => al.ActorUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}