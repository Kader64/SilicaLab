using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Configurations;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.ToTable("Enrollments");
        builder.HasKey(e => e.Id);

        builder.HasIndex(e => new { e.StudentId, e.CourseId })
            .IsUnique();

        builder.HasOne(e => e.Student)
            .WithMany()
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Course)
            .WithMany()
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}