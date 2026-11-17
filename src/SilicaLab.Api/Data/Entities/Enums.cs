namespace SilicaLab.Api.Data.Entities;

public static class Roles
{
    public const string Student = "Student";
    public const string Teacher = "Teacher";
    public const string Admin = "Admin";

    public static readonly string[] All = [Student, Teacher, Admin];
}

public static class Policies
{
    public const string CanLearn = "CanLearn";
    public const string CanTeach = "CanTeach";
    public const string AdminOnly = "AdminOnly";
}