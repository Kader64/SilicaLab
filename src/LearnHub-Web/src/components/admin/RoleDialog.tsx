import { useId, useState } from "react";
import type { User, UserRole } from "../../types";
import Field from "../ui/Field";
import Modal from "../ui/Modal";

interface Props {
  /** The user being edited, or null when the dialog is closed. */
  user: User | null;
  onClose: () => void;
  onConfirm: (role: UserRole) => void;
}

const ROLES: UserRole[] = ["Student", "Teacher"];

function RoleDialogBody({ user, onClose, onConfirm }: Props) {
  const formId = useId();
  const [role, setRole] = useState<UserRole>(user?.role ?? "Student");

  // A teacher who owns courses can't become a student.
  const blocked = user !== null && user.role === "Teacher" && role === "Student" && user.courses > 0;
  const unchanged = role === user?.role;

  return (
    <Modal
      open={user !== null}
      onClose={onClose}
      title="Change role"
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={blocked || unchanged}>
            Change role
          </button>
        </>
      }
    >
      <form
        id={formId}
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!blocked) onConfirm(role);
        }}
      >
        <p>
          New role for <strong className="text-ink">{user?.name}</strong>.
        </p>
        <Field label="Role">
          {(control) => (
            <select {...control} className="input" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          )}
        </Field>
        {blocked && <p className="alert alert-danger">This teacher still owns courses and cannot become a student.</p>}
      </form>
    </Modal>
  );
}

/** Remounts per user, so the selected role resets every time the dialog opens. */
export default function RoleDialog(props: Props) {
  return <RoleDialogBody key={props.user?.id ?? "closed"} {...props} />;
}
