import { useId, useState } from "react";
import Field from "./Field";
import Modal from "./Modal";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function ReasonForm({ formId, description, onSubmit }: { formId: string; description: string; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      id={formId}
      noValidate
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = reason.trim();
        if (!trimmed) return setError("Enter a reason.");
        onSubmit(trimmed);
      }}
    >
      <p>{description}</p>
      <Field label="Reason" hint="Saved in the audit log." error={error}>
        {(control) => (
          <textarea
            {...control}
            className="input min-h-24"
            maxLength={500}
            autoFocus
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
          />
        )}
      </Field>
    </form>
  );
}

/** Asks an admin for a reason before a destructive action (suspend, revoke). */
export default function ReasonDialog({ open, title, description, confirmLabel, onClose, onConfirm }: Props) {
  const formId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form={formId} className="btn btn-danger">
            {confirmLabel}
          </button>
        </>
      }
    >
      <ReasonForm formId={formId} description={description} onSubmit={onConfirm} />
    </Modal>
  );
}
