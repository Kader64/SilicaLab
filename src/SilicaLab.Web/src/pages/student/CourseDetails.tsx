import { BarChart3, BookOpen, ClipboardCheck, Clock, User } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import CourseNotFound from "../../components/course/CourseNotFound";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import DescriptionList from "../../components/ui/DescriptionList";
import ProgressBar from "../../components/ui/ProgressBar";
import { pluralize } from "../../lib/format";
import { getCourse, lessons } from "../../mocks/data";

export default function CourseDetails() {
  const { id } = useParams();
  const course = getCourse(id);
  const [enrolled, setEnrolled] = useState(false);

  if (!course) return <CourseNotFound />;

  const done = lessons.filter((l) => l.completed).length;
  const nextLesson = lessons.find((l) => !l.completed) ?? lessons[0];
  const lessonPath = (lessonId: string) =>
    `/learn/${course.id}?lesson=${lessonId}`;

  return (
    <div className="mx-auto max-w-6xl">
      <Breadcrumbs
        items={[{ label: "Courses", to: "/courses" }, { label: course.title }]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          <h1 className="page-title">{course.title}</h1>
          <p className="mt-3 text-lg leading-relaxed text-body">
            {course.description}
          </p>

          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted">
            <li className="flex items-center gap-2">
              <User size={16} aria-hidden="true" /> {course.teacher}
            </li>
            <li className="flex items-center gap-2">
              <BarChart3 size={16} aria-hidden="true" /> {course.level}
            </li>
            <li className="flex items-center gap-2">
              <BookOpen size={16} aria-hidden="true" /> {course.lessons}{" "}
              {pluralize(course.lessons, "lesson")}
            </li>
          </ul>

          <h2 className="section-title mt-10">Course content</h2>
          <ol className="card mt-4 divide-y divide-line">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-4 px-5 py-4">
                <span className="w-6 text-sm font-semibold tabular-nums text-muted">
                  {lesson.order}
                </span>
                <span className="flex-1 font-semibold text-ink">
                  {enrolled ? (
                    <Link
                      to={lessonPath(lesson.id)}
                      className="hover:text-accent-dark"
                    >
                      {lesson.title}
                    </Link>
                  ) : (
                    lesson.title
                  )}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted">
                  <Clock size={14} aria-hidden="true" /> {lesson.duration}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-4 bg-page px-5 py-4">
              <ClipboardCheck
                size={18}
                aria-hidden="true"
                className="ml-1 text-accent-dark"
              />
              <span className="flex-1 font-semibold text-ink">Final exam</span>
              <span className="text-sm text-muted">
                Unlocks after all lessons
              </span>
            </li>
          </ol>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
          <div className="card-feature p-6">
            {/* Variants: not enrolled (Enroll button) and enrolled (progress and Continue button) */}
            {enrolled ? (
              <>
                <p className="eyebrow">Your progress</p>
                <div className="mt-3">
                  <ProgressBar
                    done={done}
                    total={lessons.length}
                    valueLabel={`${Math.round((done / lessons.length) * 100)}%`}
                  />
                </div>
                <Link
                  to={lessonPath(nextLesson.id)}
                  className="btn btn-primary mt-5 w-full"
                >
                  Continue learning
                </Link>
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold text-ink">Free</p>
                <p className="mt-1 text-sm text-muted">
                  Includes certificate upon passing the exam.
                </p>
                {/* TODO API: POST /api/courses/{id}/enroll */}
                <DescriptionList
                  className="mt-4"
                  items={[
                    { label: "Students", value: course.students },
                    { label: "Category", value: course.category },
                    { label: "Level", value: course.level },
                  ]}
                />
                <button
                  type="button"
                  className="btn btn-primary mt-5 w-full"
                  onClick={() => setEnrolled(true)}
                >
                  Enroll in this course
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
