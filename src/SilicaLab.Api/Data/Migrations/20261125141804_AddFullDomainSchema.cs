using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SilicaLab.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFullDomainSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Exams_PassMarkPercent",
                table: "Exams");

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TargetType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TargetId = table.Column<Guid>(type: "uuid", nullable: false),
                    Details = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Enrollments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnrolledAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Enrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Enrollments_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Enrollments_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExamAttempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnrollmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExamId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    SubmittedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ShuffleSeed = table.Column<int>(type: "integer", nullable: false),
                    PassMarkPercent = table.Column<int>(type: "integer", nullable: false),
                    ScorePercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    Passed = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamAttempts_Enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "Enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExamAttempts_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LessonProgress",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnrollmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    LessonId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonProgress", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LessonProgress_Enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "Enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonProgress_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AttemptAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AttemptId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    SelectedAnswerId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttemptAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttemptAnswers_Answers_SelectedAnswerId",
                        column: x => x.SelectedAnswerId,
                        principalTable: "Answers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttemptAnswers_ExamAttempts_AttemptId",
                        column: x => x.AttemptId,
                        principalTable: "ExamAttempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttemptAnswers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Certificates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    AttemptId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CourseTitle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    TeacherName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ScorePercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    IssuedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    RevokedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    RevokedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    RevocationReason = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Certificates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Certificates_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Certificates_ExamAttempts_AttemptId",
                        column: x => x.AttemptId,
                        principalTable: "ExamAttempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Certificates_Users_RevokedByUserId",
                        column: x => x.RevokedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Certificates_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Exams_PassMarkPercent",
                table: "Exams",
                sql: "\"PassMarkPercent\" >= 0 AND \"PassMarkPercent\" <= 100");

            migrationBuilder.CreateIndex(
                name: "IX_AttemptAnswers_AttemptId_QuestionId",
                table: "AttemptAnswers",
                columns: new[] { "AttemptId", "QuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttemptAnswers_QuestionId",
                table: "AttemptAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_AttemptAnswers_SelectedAnswerId",
                table: "AttemptAnswers",
                column: "SelectedAnswerId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_ActorUserId_CreatedAt",
                table: "AuditLogs",
                columns: new[] { "ActorUserId", "CreatedAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TargetType_TargetId_CreatedAt",
                table: "AuditLogs",
                columns: new[] { "TargetType", "TargetId", "CreatedAt" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_AttemptId",
                table: "Certificates",
                column: "AttemptId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_Code",
                table: "Certificates",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_CourseId",
                table: "Certificates",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_RevokedByUserId",
                table: "Certificates",
                column: "RevokedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_StudentId_CourseId",
                table: "Certificates",
                columns: new[] { "StudentId", "CourseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_CourseId",
                table: "Enrollments",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_StudentId_CourseId",
                table: "Enrollments",
                columns: new[] { "StudentId", "CourseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExamAttempts_EnrollmentId",
                table: "ExamAttempts",
                column: "EnrollmentId",
                unique: true,
                filter: "\"Status\" = 'InProgress'");

            migrationBuilder.CreateIndex(
                name: "IX_ExamAttempts_EnrollmentId_ExamId",
                table: "ExamAttempts",
                columns: new[] { "EnrollmentId", "ExamId" });

            migrationBuilder.CreateIndex(
                name: "IX_ExamAttempts_ExamId",
                table: "ExamAttempts",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonProgress_EnrollmentId_LessonId",
                table: "LessonProgress",
                columns: new[] { "EnrollmentId", "LessonId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LessonProgress_LessonId",
                table: "LessonProgress",
                column: "LessonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttemptAnswers");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "Certificates");

            migrationBuilder.DropTable(
                name: "LessonProgress");

            migrationBuilder.DropTable(
                name: "ExamAttempts");

            migrationBuilder.DropTable(
                name: "Enrollments");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Exams_PassMarkPercent",
                table: "Exams");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Exams_PassMarkPercent",
                table: "Exams",
                sql: "\"PassMarkPercent\" >= 50 AND \"PassMarkPercent\" <= 100");
        }
    }
}
