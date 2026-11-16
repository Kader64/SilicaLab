import { BarChart3, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { pluralize } from "../../lib/format";
import type { Course } from "../../types";
import CourseCover from "./CourseCover";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="card-feature card-interactive group flex h-full flex-col overflow-hidden"
    >
      <CourseCover cover={course} className="h-40">
        <span className="absolute bottom-0 left-0 z-20 rounded-tr-xl bg-white px-4 py-2 text-xs font-bold text-body">
          {course.category}
        </span>
      </CourseCover>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-tight text-ink">
          {course.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-muted">
          By {course.teacher}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-body">
          {course.description}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between border-t border-line pt-4 text-xs font-semibold text-muted">
            <span className="flex items-center gap-1.5">
              <BarChart3 size={15} aria-hidden="true" className="text-faint" />
              {course.level}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={15} aria-hidden="true" className="text-faint" />
              {course.lessons} {pluralize(course.lessons, "lesson")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
