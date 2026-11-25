using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SilicaLab.Api.Data.Entities;

namespace SilicaLab.Api.Data.Configurations;

public class AttemptAnswerConfiguration : IEntityTypeConfiguration<AttemptAnswer>
{
    public void Configure(EntityTypeBuilder<AttemptAnswer> builder)
    {
        builder.ToTable("AttemptAnswers");
        builder.HasKey(aa => aa.Id);

        builder.HasIndex(aa => new { aa.AttemptId, aa.QuestionId })
            .IsUnique();

        builder.HasOne(aa => aa.Attempt)
            .WithMany(ea => ea.AttemptAnswers)
            .HasForeignKey(aa => aa.AttemptId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(aa => aa.Question)
            .WithMany()
            .HasForeignKey(aa => aa.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(aa => aa.SelectedAnswer)
            .WithMany()
            .HasForeignKey(aa => aa.SelectedAnswerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}