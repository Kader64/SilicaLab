import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ to = "/courses" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-lg">
      <GraduationCap size={24} className="text-accent-dark" aria-hidden="true" />
      <span className="text-lg font-extrabold tracking-tight text-ink">SilicaLab</span>
    </Link>
  );
}
