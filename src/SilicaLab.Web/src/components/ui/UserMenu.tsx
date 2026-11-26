import { ChevronDown, LogOut, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import type { UserDto } from "../../types/auth";

export interface UserMenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  user: UserDto;
  items?: UserMenuItem[];
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export default function UserMenu({
  user,
  items = [],
  onLogout,
  isLoggingOut = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-line/60",
          open && "bg-line/60",
        )}
      >
        <span className="max-w-44 truncate">{user.fullName}</span>

        <span className="inline-flex items-center rounded-md bg-accent-soft px-2 py-1 text-[11px] font-bold leading-none tracking-wide text-accent-dark">
          {user.role}
        </span>

        <ChevronDown
          size={15}
          aria-hidden="true"
          className={cn(
            "text-muted transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl border border-line bg-white p-1.5 shadow-lg ring-1 ring-black/5"
        >
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-sm font-bold text-ink">
              {user.fullName}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
          </div>

          {items.length > 0 && (
            <div className="py-1">
              {items.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-line/60 hover:text-ink"
                >
                  <Icon size={16} aria-hidden="true" className="text-muted" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          <div
            className={cn(
              items.length > 0 ? "border-t border-line pt-1" : "pt-1",
            )}
          >
            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <LogOut size={16} aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
