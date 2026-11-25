using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("Courses");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(c => c.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(c => c.CoverType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.CoverGradient)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(c => c.CoverIcon)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(c => c.ThumbnailUrl)
            .HasMaxLength(500);

        builder.Property(c => c.Level)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.SuspensionReason)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(c => new { c.Status, c.CategoryId });
        builder.HasIndex(c => c.TeacherId);

        // Relationships
        builder.HasOne(c => c.Teacher)
            .WithMany()
            .HasForeignKey(c => c.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.SuspendedByUser)
            .WithMany()
            .HasForeignKey(c => c.SuspendedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Category)
            .WithMany(cat => cat.Courses)
            .HasForeignKey(c => c.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}