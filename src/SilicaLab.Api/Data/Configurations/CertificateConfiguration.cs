using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Configurations;

public class CertificateConfiguration : IEntityTypeConfiguration<Certificate>
{
    public void Configure(EntityTypeBuilder<Certificate> builder)
    {
        builder.ToTable("Certificates");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(12);

        builder.Property(c => c.StudentName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.CourseTitle)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(c => c.TeacherName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.ScorePercent)
            .HasPrecision(5, 2);

        builder.Property(c => c.RevocationReason)
            .HasMaxLength(300);

        builder.HasIndex(c => c.Code)
            .IsUnique();

        builder.HasIndex(c => new { c.StudentId, c.CourseId })
            .IsUnique();

        builder.HasIndex(c => c.AttemptId)
            .IsUnique();

        builder.HasOne(c => c.Student)
            .WithMany()
            .HasForeignKey(c => c.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Course)
            .WithMany()
            .HasForeignKey(c => c.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Attempt)
            .WithOne(ea => ea.Certificate)
            .HasForeignKey<Certificate>(c => c.AttemptId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.RevokedByUser)
            .WithMany()
            .HasForeignKey(c => c.RevokedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}