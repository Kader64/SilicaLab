import { cn } from "../../lib/cn";

interface Props<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export default function SegmentedControl<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-line-strong bg-white p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors",
            value === option.value ? "bg-accent text-white" : "text-body hover:bg-page",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
