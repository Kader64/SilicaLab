import { useId, type ReactNode } from "react";

export interface ControlProps {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

interface Props {
  label: string;
  hint?: string;
  error?: string | null;
  className?: string;
  /** Spread the received props onto the input, select or textarea. */
  children: (control: ControlProps) => ReactNode;
}

/** Label, control, hint and error message wired together for screen readers. */
export default function Field({ label, hint, error, className, children }: Props) {
  const id = useId();
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": messageId })}
      {error ? (
        <p id={messageId} role="alert" className="field-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="field-hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
