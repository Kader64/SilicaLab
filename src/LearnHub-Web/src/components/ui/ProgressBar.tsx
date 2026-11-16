interface Props {
  done: number;
  total: number;
  /** Text next to the bar. Defaults to "done/total". */
  valueLabel?: string;
  label?: string;
}

export default function ProgressBar({ done, total, valueLabel, label = "Course progress" }: Props) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div
        className="progress"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <span className="min-w-10 text-right text-xs font-semibold tabular-nums text-muted">
        {valueLabel ?? `${done}/${total}`}
      </span>
    </div>
  );
}
