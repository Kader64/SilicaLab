import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseDetailsForm from "../../components/course/CourseDetailsForm";
import CourseNotFound from "../../components/course/CourseNotFound";
import CoverPicker from "../../components/course/CoverPicker";
import LessonsSection from "../../components/course/LessonsSection";
import PublishPanel, {
  type ChecklistItem,
} from "../../components/course/PublishPanel";
import PageHeader from "../../components/ui/PageHeader";
import { randomCover } from "../../lib/cover";
import { examQuestions, getCourse, lessons } from "../../mocks/data";
import type { CourseCoverData } from "../../types/courses";

const FORM_ID = "course-form";

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const course = getCourse(id);

  const [cover, setCover] = useState<CourseCoverData>(() =>
    course
      ? {
          coverType: course.coverType,
          coverGradient: course.coverGradient,
          coverIcon: course.coverIcon,
          thumbnailUrl: course.thumbnailUrl,
        }
      : randomCover(),
  );

  if (!isNew && !course) {
    return <CourseNotFound backTo="/teach/courses" backLabel="My courses" />;
  }

  const readOnly = course?.status === "Suspended";

  // TODO API: the checklist comes from GET /api/courses/{id}/publish-check
  const checklist: ChecklistItem[] = [
    {
      label: "Title and description are filled in",
      ok: !!course?.title && !!course.description,
    },
    { label: "At least one lesson", ok: !isNew && lessons.length > 0 },
    {
      label: "The final exam has at least one question",
      ok: examQuestions.length > 0,
    },
    {
      label: "Every question has 2-6 answers and one correct answer",
      ok: examQuestions.every(
        (q) =>
          q.answers.length >= 2 &&
          q.answers.length <= 6 &&
          q.correct < q.answers.length,
      ),
    },
  ];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO API: POST /api/courses or PUT /api/courses/{id}, with `cover` in the body
    navigate("/teach/courses");
  }

  return (
    <>
      <PageHeader
        title={isNew ? "New course" : "Edit course"}
        description={
          isNew
            ? "Fill in the details. You can add lessons after the first save."
            : undefined
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <form id={FORM_ID} onSubmit={handleSubmit} className="min-w-0">
          <fieldset
            disabled={readOnly}
            className="min-w-0 divide-y divide-line"
          >
            <CourseDetailsForm course={course} />
            <CoverPicker cover={cover} onChange={setCover} />
            {!isNew && id && (
              <LessonsSection
                courseId={id}
                initialLessons={lessons}
                examQuestionCount={examQuestions.length}
                readOnly={readOnly}
              />
            )}
          </fieldset>
        </form>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
          <PublishPanel
            status={course?.status ?? "Draft"}
            checklist={checklist}
            suspensionReason={course?.suspensionReason}
            formId={FORM_ID}
          />
        </aside>
      </div>
    </>
  );
}
