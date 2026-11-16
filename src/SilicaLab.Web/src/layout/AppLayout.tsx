import { useState, Suspense } from "react";
import { Award, BookOpen, GraduationCap, LogOut } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Logo from "../components/ui/Logo";
import MenuToggleButton from "../components/ui/MenuToggleButton";
import PageLoader from "../components/ui/PageLoader";
import { cn } from "../lib/cn";

// TODO API: add "Teaching" (/teach/courses) and "Admin" (/admin) links by the user's role
const links = [
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/my-learning", label: "My learning", icon: GraduationCap },
  { to: "/certificates", label: "Certificates", icon: Award },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
    isActive ? "bg-accent-soft text-accent-dark" : "text-muted hover:bg-line/60 hover:text-ink",
  );

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-(--header-h) max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* TODO API: end the session before navigating */}
            <Link to="/login" className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink md:flex">
              Log out
              <LogOut size={18} aria-hidden="true" />
            </Link>
            <MenuToggleButton open={menuOpen} controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" />
          </div>
        </div>

        <nav
          id="mobile-nav"
          aria-label="Main"
          className={cn("flex-col gap-1 border-t border-line px-4 py-3 md:hidden", menuOpen ? "flex" : "hidden")}
        >
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={closeMenu}>
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <div className="my-2 h-px w-full bg-line" />
          <Link to="/login" onClick={closeMenu} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-ink">
            <LogOut size={16} aria-hidden="true" />
            Log out
          </Link>
        </nav>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
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
