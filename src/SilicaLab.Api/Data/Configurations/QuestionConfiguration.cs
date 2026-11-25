using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("Questions");
        builder.HasKey(q => q.Id);

        builder.Property(q => q.Text)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasOne(q => q.Exam)
            .WithMany(e => e.Questions)
            .HasForeignKey(q => q.ExamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}