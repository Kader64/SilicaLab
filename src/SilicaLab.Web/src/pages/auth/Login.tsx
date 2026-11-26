import { isAxiosError } from "axios";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Field from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email")).trim();
    const password = String(data.get("password"));

    try {
      const user = await login({ email, password });
      const from = (location.state as { from?: Location })?.from?.pathname;
      const defaultPath =
        user.role === "Admin"
          ? "/admin"
          : user.role === "Teacher"
            ? "/teach/courses"
            : "/courses";

      navigate(from || defaultPath, { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(getApiErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-muted">Log in to continue learning.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Email">
          {(control) => (
            <input
              {...control}
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          )}
        </Field>
        <Field label="Password">
          {(control) => (
            <input
              {...control}
              name="password"
              type="password"
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          )}
        </Field>

        {error && (
          <p role="alert" className="alert alert-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        No account yet?{" "}
        <Link to="/register" className="link">
          Register
        </Link>
      </p>
    </>
  );
}