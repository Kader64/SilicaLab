import { CheckCircle2, Circle, ClipboardCheck, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { pluralize } from "../../lib/format";
import type { Lesson } from "../../types";
import { lessonLink } from "./lessonLink";

export type LessonListProps = {
  lessons: Lesson[];
  currentId: string;
  completedIds: Set<string>;
  remaining: number;
  examPath: string;
  /** Called after a lesson link is clicked (closes the mobile menu). */
  onNavigate?: () => void;
};

function LessonRow({
  lesson,
  isCurrent,
  isDone,
  onNavigate,
}: {
  lesson: Lesson;
  isCurrent: boolean;
  isDone: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={lessonLink(lesson.id)}
      onClick={onNavigate}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
        isCurrent ? "bg-accent-soft font-semibold text-accent-dark" : "text-body hover:bg-line/60 hover:text-ink",
      )}
    >
      {isDone ? (
        <CheckCircle2 size={17} aria-label="Completed" className="shrink-0 text-success" />
      ) : (
        <Circle
          size={17}
          aria-hidden="true"
          className={cn("shrink-0 transition-colors", isCurrent ? "text-accent-dark" : "text-muted group-hover:text-ink")}
        />
      )}
      <span>
        {lesson.order}. {lesson.title}
      </span>
    </Link>
  );
}

function ExamRow({ remaining, examPath }: { remaining: number; examPath: string }) {
  if (remaining === 0) {
    return (
      <Link
        to={examPath}
        className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-semibold text-accent-dark transition-colors hover:bg-accent-soft"
      >
        <ClipboardCheck size={17} aria-hidden="true" className="shrink-0" />
        Final exam
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 px-2.5 py-2 text-sm text-muted">
      <Lock size={17} aria-hidden="true" className="shrink-0" />
      <span>
        Final exam
        <span className="ml-2 text-xs">
          {remaining} {pluralize(remaining, "lesson")} left
        </span>
      </span>
    </div>
  );
}

export default function LessonList({ lessons, currentId, completedIds, remaining, examPath, onNavigate }: LessonListProps) {
  return (
    <ul className="space-y-0.5">
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <LessonRow
            lesson={lesson}
            isCurrent={lesson.id === currentId}
            isDone={completedIds.has(lesson.id)}
            onNavigate={onNavigate}
          />
        </li>
      ))}
      <li>
        <ExamRow remaining={remaining} examPath={examPath} />
      </li>
    </ul>
  );
}
