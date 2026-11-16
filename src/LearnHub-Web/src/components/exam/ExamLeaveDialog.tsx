import { LogOut } from "lucide-react";
import Modal from "../ui/Modal";

type Props = {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
};

export default function ExamLeaveDialog({ open, onStay, onLeave }: Props) {
  return (
    <Modal
      open={open}
      onClose={onStay}
      title="Leave the exam?"
      icon={<LogOut size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-warning" />}
      actions={
        <>
          <button type="button" className="btn btn-danger" onClick={onLeave}>
            Leave and fail the exam
          </button>
          <button type="button" className="btn btn-primary" onClick={onStay}>
            Stay on the exam
          </button>
        </>
      }
    >
      <p>If you leave now, this attempt counts as failed and your answers are not graded.</p>
    </Modal>
  );
}
