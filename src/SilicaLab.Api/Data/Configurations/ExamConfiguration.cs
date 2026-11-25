using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Configurations;

public class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.ToTable("Exams", t =>
        {
            t.HasCheckConstraint("CK_Exams_PassMarkPercent", "\"PassMarkPercent\" >= 0 AND \"PassMarkPercent\" <= 100");
            t.HasCheckConstraint("CK_Exams_TimeLimitMinutes", "\"TimeLimitMinutes\" IS NULL OR \"TimeLimitMinutes\" > 0");
            t.HasCheckConstraint("CK_Exams_MaxAttempts", "\"MaxAttempts\" IS NULL OR \"MaxAttempts\" >= 1");
        });

        builder.HasKey(e => e.Id);

        builder.HasIndex(e => e.CourseId)
            .IsUnique();

        builder.HasOne(e => e.Course)
            .WithOne(c => c.Exam)
            .HasForeignKey<Exam>(e => e.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}