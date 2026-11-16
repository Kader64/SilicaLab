import { Link, useLocation, useParams } from "react-router-dom";
import { cn } from "../../lib/cn";
import { examSettings, latestAttempt } from "../../mocks/data";

/** Variants: passed, not passed (a cancelled attempt arrives with state.cancelled and counts as 0%). */
export default function ExamResult() {
  const { courseId } = useParams();
  const location = useLocation();
  const cancelled = Boolean((location.state as { cancelled?: boolean } | null)?.cancelled);

  // TODO API: GET /api/exams/{courseId}/attempts/latest
  const { passMarkPercent } = examSettings;
  const score = cancelled ? 0 : latestAttempt.score;
  const passed = score >= passMarkPercent;

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className={cn("eyebrow", passed ? "text-success" : "text-danger-dark")}>{passed ? "Passed" : "Not passed"}</p>
      <h1 className="mt-2 text-7xl font-extrabold tracking-tight text-ink">{score}%</h1>
      <p className="mt-3 text-muted">
        {passed ? `Pass mark is ${passMarkPercent}%. Well done.` : `Pass mark is ${passMarkPercent}%.`}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {passed ? (
          <Link to="/certificates" className="btn btn-primary">
            View certificate
          </Link>
        ) : latestAttempt.attemptsLeft ? (
          <Link to={`/exam/${courseId}`} className="btn btn-primary">
            Try again
          </Link>
        ) : (
          <p className="text-sm font-semibold text-muted">No attempts left</p>
        )}
        <Link to="/my-learning" className="btn btn-secondary">
          Back to my learning
        </Link>
      </div>
    </div>
  );
}
