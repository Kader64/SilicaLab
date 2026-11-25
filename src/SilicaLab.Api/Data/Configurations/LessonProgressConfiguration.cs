using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Configurations;

public class LessonProgressConfiguration : IEntityTypeConfiguration<LessonProgress>
{
    public void Configure(EntityTypeBuilder<LessonProgress> builder)
    {
        builder.ToTable("LessonProgress");
        builder.HasKey(lp => lp.Id);

        builder.HasIndex(lp => new { lp.EnrollmentId, lp.LessonId })
            .IsUnique();

        builder.HasOne(lp => lp.Enrollment)
            .WithMany(e => e.LessonProgress)
            .HasForeignKey(lp => lp.EnrollmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(lp => lp.Lesson)
            .WithMany()
            .HasForeignKey(lp => lp.LessonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}