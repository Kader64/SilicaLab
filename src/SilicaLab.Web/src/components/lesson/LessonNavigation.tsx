import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import type { Lesson } from "../../types";
import { lessonLink } from "./lessonLink";

type Props = {
  prev?: Lesson;
  next?: Lesson;
  isCompleted: boolean;
  /** False once the exam is passed: lessons can't be un-completed anymore. */
  canUndo: boolean;
  onComplete: () => void;
  onUndo: () => void;
};

export default function LessonNavigation({ prev, next, isCompleted, canUndo, onComplete, onUndo }: Props) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
      {prev ? (
        <Link to={lessonLink(prev.id)} className="btn btn-secondary">
          <ArrowLeft size={16} /> Previous
        </Link>
      ) : (
        <button type="button" className="btn btn-secondary" disabled>
          <ArrowLeft size={16} /> Previous
        </button>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {isCompleted ? (
          <>
            <span className="flex items-center gap-2 text-sm font-semibold text-success">
              <CheckCircle2 size={18} aria-hidden="true" /> Completed
            </span>
            {canUndo && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onUndo}>
                Undo
              </button>
            )}
          </>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onComplete}>
            Mark as completed
          </button>
        )}

        {next && (
          <Link to={lessonLink(next.id)} className={cn("btn", isCompleted ? "btn-primary" : "btn-secondary")}>
            Next <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
