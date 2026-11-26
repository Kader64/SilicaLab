import { Suspense, useState } from "react";
import {
  Award,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from "../components/ui/Logo";
import MenuToggleButton from "../components/ui/MenuToggleButton";
import PageLoader from "../components/ui/PageLoader";
import UserMenu, { type UserMenuItem } from "../components/ui/UserMenu";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/cn";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const studentLinks: NavItem[] = [
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/my-learning", label: "My learning", icon: GraduationCap },
  { to: "/certificates", label: "Certificates", icon: Award },
];

const teacherLinks: NavItem[] = [
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/teacher/courses", label: "Teaching", icon: LayoutDashboard },
];

const adminLinks: NavItem[] = [
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/admin", label: "Admin", icon: Shield },
];

const userMenuItems: UserMenuItem[] = [];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
    isActive
      ? "bg-accent-soft text-accent-dark"
      : "text-muted hover:bg-line/60 hover:text-ink",
  );

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const links =
    user?.role === "Teacher"
      ? teacherLinks
      : user?.role === "Admin"
        ? adminLinks
        : studentLinks;

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    closeMenu();

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-(--header-h) max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav
              aria-label="Main"
              className="hidden items-center gap-1 md:flex"
            >
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden md:block">
                <UserMenu
                  user={user}
                  items={userMenuItems}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                />
              </div>
            )}
            <MenuToggleButton
              open={menuOpen}
              controls="mobile-nav"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden"
            />
          </div>
        </div>

        <nav
          id="mobile-nav"
          aria-label="Main"
          className={cn(
            "flex-col gap-1 border-t border-line px-4 py-3 md:hidden",
            menuOpen ? "flex" : "hidden",
          )}
        >
          {user && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-line/40 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
              <span className="ml-2 shrink-0 rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
                {user.role}
              </span>
            </div>
          )}

          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={closeMenu}>
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}

          {userMenuItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={closeMenu}>
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}

          <div className="my-2 h-px w-full bg-line" />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <LogOut size={16} aria-hidden="true" />
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </nav>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6"
      >
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-line bg-white py-6 text-center text-sm text-muted">
        Made by Wojciech Lichtoń
      </footer>
    </div>
  );
}
