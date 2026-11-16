import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseNotFound from "../../components/course/CourseNotFound";
import ExamCancelled from "../../components/exam/ExamCancelled";
import ExamHeader from "../../components/exam/ExamHeader";
import ExamIntro from "../../components/exam/ExamIntro";
import ExamLeaveDialog from "../../components/exam/ExamLeaveDialog";
import FocusWarningDialog from "../../components/exam/FocusWarningDialog";
import QuestionCard from "../../components/exam/QuestionCard";
import SubmitDialog from "../../components/exam/SubmitDialog";
import { useCountdown } from "../../hooks/useCountdown";
import { useExamGuard } from "../../hooks/useExamGuard";
import { examQuestions, examSettings, getCourse } from "../../mocks/data";

type Phase = "intro" | "running" | "cancelled";

export default function Exam() {
  const { courseId } = useParams();
  const course = getCourse(courseId);
  const navigate = useNavigate();
  const { timeLimitMinutes, maxFocusLosses } = examSettings;

  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [expiresAt, setExpiresAt] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showUnanswered, setShowUnanswered] = useState(false);
  const submitted = useRef(false);

  const running = phase === "running";
  const guard = useExamGuard(running, maxFocusLosses, () => {
    setConfirmOpen(false);
    setPhase("cancelled");
  });

  // TODO API: questions come from GET /api/exams/{courseId}/attempts/{id}, without the correct answers
  const questions = examQuestions.map(({ id, text, answers: options }) => ({
    id,
    text,
    answers: options,
  }));
  const total = questions.length;
  const answered = questions.filter((q) => answers[q.id] !== undefined).length;
  const resultPath = `/exam/${courseId}/result`;

  function submit() {
    if (submitted.current) return;
    submitted.current = true;
    // TODO API: POST /api/attempts/{id}/submit
    guard.allowLeaving();
    navigate(resultPath);
  }

  const remainingMs = useCountdown(expiresAt, running, submit);

  function start() {
    // TODO API: POST /api/exams/{courseId}/attempts. Starting uses up an attempt.
    setExpiresAt(Date.now() + timeLimitMinutes * 60 * 1000);
    setPhase("running");
  }

  function reviewUnanswered() {
    setConfirmOpen(false);
    setShowUnanswered(true);
    const first = questions.find((q) => answers[q.id] === undefined);
    if (first)
      document
        .getElementById(`question-${first.id}`)
        ?.scrollIntoView({ block: "center" });
  }

  if (!course) return <CourseNotFound />;

  if (phase === "intro") {
    return (
      <ExamIntro
        course={course}
        questionCount={total}
        settings={examSettings}
        onStart={start}
      />
    );
  }

  if (phase === "cancelled") {
    return (
      <ExamCancelled maxWarnings={maxFocusLosses} resultPath={resultPath} />
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-12">
      <ExamHeader
        courseTitle={course.title}
        answered={answered}
        total={total}
        warnings={guard.warnings}
        maxWarnings={maxFocusLosses}
        remainingMs={remainingMs}
      />

      <ol className="mt-6 space-y-5">
        {questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={index}
            total={total}
            selected={answers[q.id]}
            missing={showUnanswered && answers[q.id] === undefined}
            onSelect={(i) => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
          />
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 pt-6 sm:px-6">
        <span className="text-sm text-muted">
          {answered} of {total} answered
        </span>
        <button
          type="button"
          className="btn btn-primary w-full px-6 sm:w-auto"
          onClick={() => setConfirmOpen(true)}
        >
          Submit exam
        </button>
      </div>

      {/* Dialogs */}
      <FocusWarningDialog
        open={guard.warningOpen}
        onClose={guard.dismissWarning}
        count={guard.warnings}
        limit={maxFocusLosses}
      />
      <ExamLeaveDialog
        open={guard.leaveDialogOpen}
        onStay={guard.stay}
        onLeave={guard.leaveAnyway}
      />
      <SubmitDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        total={total}
        unanswered={total - answered}
        onReview={reviewUnanswered}
        onSubmit={submit}
      />
    </div>
  );
}
