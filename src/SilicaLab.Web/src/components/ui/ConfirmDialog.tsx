import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import Modal from "./Modal";

interface Props {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={cn("btn", tone === "danger" ? "btn-danger" : "btn-primary")} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
