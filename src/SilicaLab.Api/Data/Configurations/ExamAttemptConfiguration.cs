using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Configurations;

public class ExamAttemptConfiguration : IEntityTypeConfiguration<ExamAttempt>
{
    public void Configure(EntityTypeBuilder<ExamAttempt> builder)
    {
        builder.ToTable("ExamAttempts");
        builder.HasKey(ea => ea.Id);

        builder.Property(ea => ea.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(ea => ea.ScorePercent)
            .HasPrecision(5, 2);

        builder.HasIndex(ea => new { ea.EnrollmentId, ea.ExamId });

        builder.HasIndex(ea => ea.EnrollmentId)
            .IsUnique()
            .HasFilter("\"Status\" = 'InProgress'");

        builder.HasOne(ea => ea.Enrollment)
            .WithMany(e => e.ExamAttempts)
            .HasForeignKey(ea => ea.EnrollmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ea => ea.Exam)
            .WithMany()
            .HasForeignKey(ea => ea.ExamId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}