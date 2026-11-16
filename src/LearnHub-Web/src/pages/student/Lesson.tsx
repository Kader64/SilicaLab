import { useSearchParams, useParams } from "react-router-dom";
import CourseNotFound from "../../components/course/CourseNotFound";
import ExamUnlock from "../../components/lesson/ExamUnlock";
import LessonMarkdown from "../../components/lesson/LessonMarkdown";
import LessonNavigation from "../../components/lesson/LessonNavigation";
import LessonSidebar from "../../components/lesson/LessonSidebar";
import LessonVideo from "../../components/lesson/LessonVideo";
import MobileLessonMenu from "../../components/lesson/MobileLessonMenu";
import { useFocusOnChange } from "../../hooks/useFocusOnChange";
import { useLessonProgress } from "../../hooks/useLessonProgress";
import { getCourse, lessonContent, lessons } from "../../mocks/data";

export default function Lesson() {
  const { courseId } = useParams();
  const course = getCourse(courseId);
  const [searchParams] = useSearchParams();

  // TODO API: GET /api/courses/{id}/lessons and GET /api/lessons/{lessonId}
  const lesson = lessons.find((l) => l.id === searchParams.get("lesson")) ?? lessons[0];
  const index = lessons.indexOf(lesson);
  const { completedIds, remaining, complete, undo } = useLessonProgress(lessons);
  const titleRef = useFocusOnChange<HTMLHeadingElement>(lesson.id);

  if (!course) return <CourseNotFound />;

  const examPath = `/exam/${course.id}`;
  const list = { lessons, currentId: lesson.id, completedIds, remaining, examPath };

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <LessonSidebar courseTitle={course.title} {...list} />

      <div className="min-w-0 space-y-6">
        <MobileLessonMenu {...list} />

        <section>
          <p className="eyebrow">
            Lesson {lesson.order} · {lesson.duration}
          </p>
          <h1 ref={titleRef} tabIndex={-1} className="page-title mt-2">
            {lesson.title}
          </h1>

          {lesson.videoUrl && <LessonVideo url={lesson.videoUrl} title={lesson.title} />}
          <LessonMarkdown>{lessonContent}</LessonMarkdown>

          <LessonNavigation
            prev={lessons[index - 1]}
            next={lessons[index + 1]}
            isCompleted={completedIds.has(lesson.id)}
            canUndo
            onComplete={() => complete(lesson.id)}
            onUndo={() => undo(lesson.id)}
          />
          <ExamUnlock remaining={remaining} examPath={examPath} />
        </section>
      </div>
    </div>
  );
}
