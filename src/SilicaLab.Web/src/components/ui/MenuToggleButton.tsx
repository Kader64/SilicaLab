import { Menu, X } from "lucide-react";
import { cn } from "../../lib/cn";

interface Props {
  open: boolean;
  controls: string;
  onClick: () => void;
  className?: string;
}

export default function MenuToggleButton({ open, controls, onClick, className }: Props) {
  return (
    <button
      type="button"
      className={cn("icon-btn", className)}
      onClick={onClick}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? "Close menu" : "Open menu"}
    >
      {open ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}
