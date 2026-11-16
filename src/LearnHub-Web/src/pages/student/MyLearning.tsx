import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import CourseCover from "../../components/course/CourseCover";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import { enrollments } from "../../mocks/data";

export default function MyLearning() {
  // TODO API: GET /api/me/enrollments
  if (enrollments.length === 0) {
    return (
      <>
        <PageHeader title="My learning" />
        <div className="card">
          <EmptyState
            icon={GraduationCap}
            title="You have not enrolled in any course yet"
            description="Pick a course and your progress will show up here."
            action={
              <Link to="/courses" className="btn btn-primary">
                Browse courses
              </Link>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="My learning"
        description="Pick up where you left off."
      />

      <ul className="space-y-4">
        {enrollments.map(({ course, progress }) => (
          <li
            key={course.id}
            className="card-feature card-interactive group flex flex-col overflow-hidden sm:flex-row"
          >
            <CourseCover
              cover={course}
              className="h-32 sm:h-auto sm:w-56 sm:shrink-0"
            />

            <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-ink">
                  <Link to={`/courses/${course.id}`}>{course.title}</Link>
                </h2>
                <p className="mt-0.5 text-xs font-medium text-muted">
                  By {course.teacher}
                </p>
                <div className="mt-4 max-w-sm">
                  <ProgressBar
                    done={progress}
                    total={100}
                    valueLabel={`${progress}%`}
                    label={`Progress in ${course.title}`}
                  />
                </div>
              </div>
              <Link
                to={`/courses/${course.id}`}
                className="btn btn-primary w-full sm:w-44"
              >
                {progress === 0
                  ? "Start learning"
                  : progress === 100
                    ? "Review course"
                    : "Continue"}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
