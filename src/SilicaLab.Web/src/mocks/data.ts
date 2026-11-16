// EXAMPLE DATA ONLY. Replace each export with an API call (see the TODO API notes in pages and hooks).

import type {
  AuditEntry,
  Category,
  Certificate,
  Course,
  CourseStatus,
  ExamQuestion,
  ExamSettings,
  Lesson,
  User,
} from "../types";

export const courses: Course[] = [
  {
    id: "c1",
    title: "Introduction to C# and .NET",
    description: "Learn the fundamentals of C# and the .NET platform and write your first console applications.",
    category: "Programming",
    level: "Beginner",
    teacher: "Jan Nowak",
    lessons: 12,
    students: 248,
    status: "Published",
    coverType: "Gradient",
    coverGradient: "teal",
    coverIcon: "code",
    thumbnailUrl: null,
    createdAt: "2026-08-01",
  },
  {
    id: "c2",
    title: "React and TypeScript from Scratch",
    description: "Build modern user interfaces with React, hooks and strict TypeScript typing.",
    category: "Web Development",
    level: "Intermediate",
    teacher: "Maria Wiśniewska",
    lessons: 18,
    students: 412,
    status: "Published",
    coverType: "Gradient",
    coverGradient: "ocean",
    coverIcon: "code",
    thumbnailUrl: null,
    createdAt: "2026-08-20",
  },
  {
    id: "c3",
    title: "SQL and PostgreSQL Essentials",
    description: "Design relational schemas, write queries and understand indexes and transactions.",
    category: "Databases",
    level: "Beginner",
    teacher: "Jan Nowak",
    lessons: 10,
    students: 187,
    status: "Published",
    coverType: "Gradient",
    coverGradient: "forest",
    coverIcon: "database",
    thumbnailUrl: null,
    createdAt: "2026-09-05",
  },
  {
    id: "c4",
    title: "Docker for Developers",
    description: "Containerize applications and run a full stack locally with Docker Compose.",
    category: "DevOps",
    level: "Intermediate",
    teacher: "Piotr Zieliński",
    lessons: 9,
    students: 0,
    status: "Draft",
    coverType: "Gradient",
    coverGradient: "amber",
    coverIcon: "science",
    thumbnailUrl: null,
    createdAt: "2026-10-10",
  },
  {
    id: "c5",
    title: "Clean Architecture in ASP.NET Core",
    description: "Structure larger APIs with layers, services and clear boundaries.",
    category: "Programming",
    level: "Advanced",
    teacher: "Maria Wiśniewska",
    lessons: 15,
    students: 64,
    status: "Published",
    coverType: "Gradient",
    coverGradient: "grape",
    coverIcon: "code",
    thumbnailUrl: null,
    createdAt: "2026-10-25",
  },
  {
    id: "c6",
    title: "UX Design Basics",
    description: "Understand users, wireframes and usability testing in a few practical lessons.",
    category: "Design",
    level: "Beginner",
    teacher: "Anna Kowalska",
    lessons: 8,
    students: 53,
    status: "Suspended",
    suspensionReason: "copied content",
    coverType: "Gradient",
    coverGradient: "sunset",
    coverIcon: "palette",
    thumbnailUrl: null,
    createdAt: "2026-11-01",
  },
];

export const getCourse = (id: string | undefined) => courses.find((c) => c.id === id);

/** Lessons of one course. */
export const lessons: Lesson[] = [
  { id: "l1", order: 1, title: "What is .NET?", duration: "8 min", completed: true, videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ" },
  { id: "l2", order: 2, title: "Setting up your environment", duration: "12 min", completed: true, videoUrl: null },
  { id: "l3", order: 3, title: "Variables and data types", duration: "15 min", completed: false, videoUrl: "https://vimeo.com/76979871" },
  { id: "l4", order: 4, title: "Control flow", duration: "14 min", completed: false, videoUrl: null },
  { id: "l5", order: 5, title: "Methods and classes", duration: "20 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ" },
];

export const lessonContent = [
  "## Declaring variables",
  "",
  "A variable is a named place in memory. In C# every variable has a type that decides which values it can hold.",
  "",
  "```csharp",
  "int age = 25;",
  'string name = "Anna";',
  "bool isStudent = true;",
  "```",
  "",
  "Use `var` when the type is obvious from the right side.",
].join("\n");

export const categories: Category[] = [
  { id: "k1", name: "Programming", courses: 2 },
  { id: "k2", name: "Web Development", courses: 1 },
  { id: "k3", name: "Databases", courses: 1 },
  { id: "k4", name: "DevOps", courses: 1 },
  { id: "k5", name: "Design", courses: 1 },
  { id: "k6", name: "Data Science", courses: 0 },
];

export const examQuestions: ExamQuestion[] = [
  {
    id: "q1",
    text: "Which keyword declares a constant in C#?",
    answers: ["const", "final", "static", "readonly var"],
    correct: 0,
  },
  {
    id: "q2",
    text: "What does the dotnet CLI command `dotnet run` do?",
    answers: ["Builds and runs the project", "Publishes the project", "Creates a new solution"],
    correct: 0,
  },
  {
    id: "q3",
    text: "Which type stores true or false values?",
    answers: ["int", "bool", "char", "decimal"],
    correct: 1,
  },
];

export const examSettings: ExamSettings = {
  attemptNumber: 2,
  maxAttempts: null,
  passMarkPercent: 70,
  timeLimitMinutes: 25,
  maxFocusLosses: 3,
};

/** Latest finished attempt of the logged-in student. */
export const latestAttempt = { score: 85, attemptsLeft: true };

export const certificates: Certificate[] = [
  { code: "LH-7K2M-9QXD", student: "Anna Kowalska", course: "Introduction to C# and .NET", teacher: "Jan Nowak", date: "12 Oct 2026", score: 92, status: "Valid" },
  { code: "LH-4HTR-W8ND", student: "Ewa Lis", course: "React and TypeScript from Scratch", teacher: "Maria Wiśniewska", date: "03 Nov 2026", score: 85, status: "Valid" },
  { code: "LH-B2XQ-5MFC", student: "Piotr Zieliński", course: "SQL and PostgreSQL Essentials", teacher: "Jan Nowak", date: "28 Sep 2026", score: 74, status: "Revoked" },
];

export const findCertificate = (code: string) =>
  certificates.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());

/** Certificates of the logged-in student. The last one is revoked to show that style. */
export const myCertificates = [certificates[0], certificates[2]];

export const enrollments = [
  { course: courses[0], progress: 40 },
  { course: courses[1], progress: 100 },
  { course: courses[2], progress: 0 },
];

export const users: User[] = [
  { id: "u1", name: "Anna Kowalska", email: "anna@example.com", role: "Student", courses: 0, enrollments: 4, certificates: 2, active: true },
  { id: "u2", name: "Jan Nowak", email: "jan@example.com", role: "Teacher", courses: 2, enrollments: 1, certificates: 0, active: true },
  { id: "u3", name: "Maria Wiśniewska", email: "maria@example.com", role: "Teacher", courses: 2, enrollments: 3, certificates: 1, active: true },
  { id: "u4", name: "Piotr Zieliński", email: "piotr@example.com", role: "Student", courses: 0, enrollments: 2, certificates: 0, active: false },
  { id: "u5", name: "Ewa Lis", email: "ewa@example.com", role: "Student", courses: 0, enrollments: 6, certificates: 5, active: true },
  { id: "u6", name: "Site Admin", email: "admin@learnhub.example", role: "Admin", courses: 0, enrollments: 0, certificates: 0, active: true },
];

export const auditLog: AuditEntry[] = [
  { id: "a1", time: "08 Nov 2026, 10:42", at: "2026-11-08T10:42:00", actor: "Site Admin", action: "CourseSuspended", target: "Course: UX Design Basics", details: "Reason: copied content" },
  { id: "a2", time: "07 Nov 2026, 16:05", at: "2026-11-07T16:05:00", actor: "Site Admin", action: "UserDisabled", target: "User: Piotr Zieliński", details: "-" },
  { id: "a3", time: "05 Nov 2026, 09:12", at: "2026-11-05T09:12:00", actor: "Site Admin", action: "CertificateRevoked", target: "Certificate: LH-B2XQ-5MFC", details: "Reason: cheating" },
  { id: "a4", time: "02 Nov 2026, 14:30", at: "2026-11-02T14:30:00", actor: "Site Admin", action: "UserRoleChanged", target: "User: Maria Wiśniewska", details: "Student → Teacher" },
  { id: "a5", time: "30 Oct 2026, 11:00", at: "2026-10-30T11:00:00", actor: "Site Admin", action: "CategoryCreated", target: "Category: Data Science", details: "-" },
];

export const dashboardStats = [
  { label: "Users", value: "1,291", to: "/admin/users" },
  { label: "Courses", value: "142", to: "/admin/courses" },
  { label: "Enrollments", value: "5,380", to: "/admin/courses" },
  { label: "Certificates issued", value: "2,117", to: "/admin/certificates" },
];

export const coursesByStatus: { status: CourseStatus; value: number }[] = [
  { status: "Published", value: 98 },
  { status: "Draft", value: 27 },
  { status: "Unpublished", value: 12 },
  { status: "Suspended", value: 5 },
];

export const usersByRole = [
  { label: "Students", value: 1204 },
  { label: "Teachers", value: 86 },
  { label: "Admins", value: 1 },
];
