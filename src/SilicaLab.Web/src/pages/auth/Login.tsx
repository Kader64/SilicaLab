import { isAxiosError } from "axios";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Field from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../api/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  email?: string;
  password?: string;
  form?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const next: Errors = {};
    if (!email) {
      next.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Password is required.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    try {
      await login({ email, password });
      const from = (location.state as { from?: Location })?.from?.pathname;
      const defaultPath = "/courses"

      navigate(from || defaultPath, { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setErrors({ form: "Invalid email or password." });
      } else {
        setErrors({ form: getApiErrorMessage(err) });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-muted">Log in to continue learning.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Field label="Email" error={errors.email}>
          {(control) => (
            <input
              {...control}
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={256}
              required
            />
          )}
        </Field>
        <Field label="Password" error={errors.password}>
          {(control) => (
            <input
              {...control}
              name="password"
              type="password"
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
              maxLength={128}
              required
            />
          )}
        </Field>

        {errors.form && (
          <p role="alert" className="alert alert-danger">
            {errors.form}
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