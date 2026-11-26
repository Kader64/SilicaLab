import { Outlet } from "react-router-dom";
import Logo from "../components/ui/Logo";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10 sm:py-16">
      <Logo to="/" />
      <main id="main" className="mt-10 w-full max-w-md">
        <Outlet />
      </main>
    </div>
  );
}
