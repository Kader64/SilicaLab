import { isAxiosError } from "axios";
import { GraduationCap, PenSquare } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../api/client";

const roles = [
  {
    value: "Student",
    title: "Student",
    text: "Learn from courses",
    icon: GraduationCap,
  },
  {
    value: "Teacher",
    title: "Teacher",
    text: "Create and publish courses",
    icon: PenSquare,
  },
] as const;

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 256;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const fullName = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    const role = String(data.get("role")) as "Student" | "Teacher";

    const next: Errors = {};

    if (!fullName) {
      next.fullName = "Full name is required.";
    } else if (fullName.length > MAX_NAME_LENGTH) {
      next.fullName = `Full name must not exceed ${MAX_NAME_LENGTH} characters.`;
    }

    if (!email) {
      next.email = "Email is required.";
    } else if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      next.email = "Enter a valid email address.";
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    } else if (password.length > MAX_PASSWORD_LENGTH) {
      next.password = `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`;
    }

    if (password !== confirm) {
      next.confirm = "Passwords do not match.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    try {
      await register({ fullName, email, password, role });
      navigate("/courses", { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setErrors({ email: "An account with this email already exists." });
      } else {
        setErrors({ form: getApiErrorMessage(err) });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title sm:text-3xl">Create your account</h1>
      <p className="mt-2 text-muted">
        Join our community in less than a minute.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Field label="Full name" error={errors.fullName}>
          {(control) => (
            <input
              {...control}
              name="name"
              className="input"
              placeholder="Anna Kowalska"
              autoComplete="name"
              maxLength={MAX_NAME_LENGTH}
              required
            />
          )}
        </Field>
        <Field label="Email" error={errors.email}>
          {(control) => (
            <input
              {...control}
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={MAX_EMAIL_LENGTH}
              required
            />
          )}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password" error={errors.password}>
            {(control) => (
              <input
                {...control}
                name="password"
                type="password"
                className="input"
                placeholder="••••••••"
                autoComplete="new-password"
                maxLength={MAX_PASSWORD_LENGTH}
                required
              />
            )}
          </Field>
          <Field label="Confirm password" error={errors.confirm}>
            {(control) => (
              <input
                {...control}
                name="confirm"
                type="password"
                className="input"
                placeholder="••••••••"
                autoComplete="new-password"
                maxLength={MAX_PASSWORD_LENGTH}
                required
              />
            )}
          </Field>
        </div>

        <fieldset>
          <legend className="label">I want to join as</legend>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <label
                key={role.value}
                className="flex cursor-pointer flex-col gap-1 rounded-xl border border-line-strong p-4 transition-colors has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:ring-2 has-focus-visible:ring-accent"
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  defaultChecked={role.value === "Student"}
                  className="sr-only"
                />
                <role.icon
                  size={20}
                  aria-hidden="true"
                  className="text-accent"
                />
                <span className="font-bold text-ink">{role.title}</span>
                <span className="text-xs text-muted">{role.text}</span>
              </label>
            ))}
          </div>
        </fieldset>

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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="link">
          Log in
        </Link>
      </p>
    </>
  );
}
