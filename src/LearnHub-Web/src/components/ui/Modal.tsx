import { useEffect, useId, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  actions: ReactNode;
}

export default function Modal({ open, onClose, title, icon, children, actions }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-white p-0 shadow-xl backdrop:bg-ink/40"
    >
      {open && (
        <div className="p-6">
          <div className="flex items-start gap-3">
            {icon}
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-lg font-bold text-ink">
                {title}
              </h2>
              <div className="mt-2 space-y-3 text-sm text-body">{children}</div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">{actions}</div>
        </div>
      )}
    </dialog>
  );
}
