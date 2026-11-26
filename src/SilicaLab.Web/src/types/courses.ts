export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export type CourseStatus = "Draft" | "Published" | "Suspended";
export type CoverType = "Gradient" | "Image";

export interface CategoryDto {
  id: string;
  name: string;
}

export interface CourseCoverData {
  coverType: CoverType;
  coverGradient?: string | null;
  coverIcon?: string | null;
  thumbnailUrl?: string | null;
}

export interface CourseSummaryDto extends CourseCoverData {
  id: string;
  title: string;
  description: string;
  category: string;
  teacher: string;
  level: CourseLevel;
  status: CourseStatus;
  lessons: number;
  createdAt: string;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CourseQueryParams {
  search?: string;
  category?: string;
  level?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}