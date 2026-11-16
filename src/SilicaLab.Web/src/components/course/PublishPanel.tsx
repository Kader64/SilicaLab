import { CheckCircle2, XCircle } from "lucide-react";
import type { CourseStatus } from "../../types";
import StatusBadge from "../ui/StatusBadge";

export interface ChecklistItem {
  label: string;
  ok: boolean;
}

interface Props {
  status: CourseStatus;
  checklist: ChecklistItem[];
  suspensionReason?: string;
  /** Id of the <form> that Save changes submits. */
  formId: string;
}

export default function PublishPanel({
  status,
  checklist,
  suspensionReason,
  formId,
}: Props) {
  const canPublish = checklist.every((item) => item.ok);

  if (status === "Suspended") {
    return (
      <div className="alert alert-danger">
        <p className="font-bold">Suspended by an admin</p>
        <p className="mt-1">
          Reason: {suspensionReason ?? "not given"}. The course is read-only.
        </p>
      </div>
    );
  }

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink">Status</h2>
        <StatusBadge status={status} />
      </div>

      <ul className="mt-4 space-y-3">
        {checklist.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5 text-sm">
            {item.ok ? (
              <CheckCircle2
                size={18}
                aria-label="Done"
                className="mt-0.5 shrink-0 text-success"
              />
            ) : (
              <XCircle
                size={18}
                aria-label="Missing"
                className="mt-0.5 shrink-0 text-danger"
              />
            )}
            <span className="text-body">{item.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-3">
        <button
          type="submit"
          form={formId}
          className="btn btn-primary w-full"
        >
          Save changes
        </button>
        {/* Published courses show "Unpublish course" (btn-secondary) instead. */}
        {status === "Published" ? (
          <button type="button" className="btn btn-secondary w-full">
            Unpublish course
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={!canPublish}
          >
            Publish course
          </button>
        )}
      </div>
    </section>
  );
}
