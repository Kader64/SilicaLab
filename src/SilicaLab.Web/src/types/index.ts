import type { CourseLevel, CourseStatus, CoverType } from "./courses";

export interface CourseCoverData {
  coverType: CoverType;
  coverGradient: string;
  coverIcon: string;
  thumbnailUrl: string;
}

export interface Course extends CourseCoverData {
  id: string;
  title: string;
  description: string;
  category: string;
  teacher: string;
  teacherId: string;
  level: CourseLevel;
  status: CourseStatus;
  lessons: number;
  students: number;
  createdAt: string;
  suspensionReason?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Lesson {
  id: string;
  order: number;
  title: string;
  duration: string;
  completed: boolean;
  /** Null = text-only lessons. */
  videoUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  courses: number;
}

export interface ExamQuestion {
  id: string;
  text: string;
  answers: string[];
  correct: number;
}

/** The student never receives the correct answer. */
export type StudentQuestion = Omit<ExamQuestion, "correct">;

export interface ExamSettings {
  attemptNumber: number;
  /** Null = unlimited. */
  maxAttempts: number | null;
  passMarkPercent: number;
  timeLimitMinutes: number;
  maxFocusLosses: number;
}

export type CertificateStatus = "Valid" | "Revoked";

export interface Certificate {
  code: string;
  student: string;
  course: string;
  teacher: string;
  date: string;
  score: number;
  status: CertificateStatus;
}

export type UserRole = "Student" | "Teacher" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  courses: number;
  enrollments: number;
  certificates: number;
  active: boolean;
}

export interface AuditEntry {
  id: string;
  time: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  details: string;
}
