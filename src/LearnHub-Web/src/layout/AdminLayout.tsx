import { useState, Suspense } from "react";
import { ArrowLeft, Award, BookOpen, LayoutDashboard, ScrollText, Tags, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import Logo from "../components/ui/Logo";
import MenuToggleButton from "../components/ui/MenuToggleButton";
import PageLoader from "../components/ui/PageLoader";
import { cn } from "../lib/cn";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users, end: false },
  { to: "/admin/courses", label: "Courses", icon: BookOpen, end: false },
  { to: "/admin/certificates", label: "Certificates", icon: Award, end: false },
  { to: "/admin/categories", label: "Categories", icon: Tags, end: false },
  { to: "/admin/audit", label: "Audit log", icon: ScrollText, end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
    isActive ? "bg-accent-soft text-accent-dark" : "text-muted hover:bg-page hover:text-ink",
  );

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <aside className="border-b border-line bg-white p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-5">
        <div className="flex items-center justify-between lg:mb-8">
          <div className="flex items-center gap-3">
            <Logo to="/admin" />
            <span className="eyebrow">Admin</span>
          </div>
          <MenuToggleButton open={menuOpen} controls="admin-nav" onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden" />
        </div>

        <nav
          id="admin-nav"
          aria-label="Admin"
          className={cn("flex-col gap-1 lg:mt-0 lg:flex", menuOpen ? "mt-5 flex" : "hidden")}
        >
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={closeMenu}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}

          <div className="my-3 h-px w-full bg-line lg:hidden" />

          <NavLink to="/courses" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted hover:text-ink lg:mt-10">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to the app
          </NavLink>
        </nav>
      </aside>

      <main id="main" tabIndex={-1} className="min-w-0 flex-1 p-4 sm:p-8">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
