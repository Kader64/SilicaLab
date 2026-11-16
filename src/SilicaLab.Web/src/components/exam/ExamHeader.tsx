import { Clock } from "lucide-react";
import { cn } from "../../lib/cn";

type Props = {
  courseTitle: string;
  answered: number;
  total: number;
  warnings: number;
  maxWarnings: number;
  remainingMs: number;
};

function formatTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function ExamHeader({ courseTitle, answered, total, warnings, maxWarnings, remainingMs }: Props) {
  const timeLow = remainingMs < 5 * 60 * 1000;

  return (
    <div className="sticky top-(--header-h) z-10 flex items-center justify-between gap-3 border-b border-line bg-page/95 px-5 py-4 backdrop-blur sm:px-6">
      <div className="min-w-0">
        <h1 className="text-lg font-extrabold text-ink sm:text-xl">Final exam</h1>
        <p className="hidden truncate text-sm text-muted sm:block">{courseTitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3 text-xs sm:text-sm">
        {warnings > 0 && (
          <span className="font-semibold text-warning">
            Warnings {warnings}/{maxWarnings}
          </span>
        )}
        <span className="tabular-nums text-muted">
          {answered}/{total} answered
        </span>
        <span
          role="timer"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold tabular-nums",
            timeLow ? "bg-danger-soft text-danger-dark" : "bg-warning-soft text-warning",
          )}
        >
          <Clock size={14} aria-hidden="true" /> {formatTime(remainingMs)} left
        </span>
      </div>
    </div>
  );
}
