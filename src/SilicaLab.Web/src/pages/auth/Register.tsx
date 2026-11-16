import { GraduationCap, PenSquare } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../../components/ui/Field";

const roles = [
  { value: "student", title: "Student", text: "Learn from courses", icon: GraduationCap },
  { value: "teacher", title: "Teacher", text: "Create and publish courses", icon: PenSquare },
];

const MIN_PASSWORD_LENGTH = 8;

type Errors = { password?: string; confirm?: string; form?: string };

export default function Register() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password"));
    const next: Errors = {};

    if (password.length < MIN_PASSWORD_LENGTH) next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (password !== data.get("confirm")) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // TODO API: POST /api/auth/register. On 409 set errors.form to "This email is already registered."
    navigate("/courses");
  }

  return (
    <>
      <h1 className="page-title sm:text-3xl">Create your account</h1>
      <p className="mt-2 text-muted">Join our community in less than a minute.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Field label="Full name">
          {(control) => <input {...control} name="name" className="input" placeholder="Anna Kowalska" autoComplete="name" required />}
        </Field>
        <Field label="Email">
          {(control) => <input {...control} name="email" type="email" className="input" placeholder="you@example.com" autoComplete="email" required />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password" error={errors.password}>
            {(control) => (
              <input {...control} name="password" type="password" className="input" placeholder="••••••••" autoComplete="new-password" required />
            )}
          </Field>
          <Field label="Confirm password" error={errors.confirm}>
            {(control) => (
              <input {...control} name="confirm" type="password" className="input" placeholder="••••••••" autoComplete="new-password" required />
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
                <input type="radio" name="role" value={role.value} defaultChecked={role.value === "student"} className="sr-only" />
                <role.icon size={20} aria-hidden="true" className="text-accent" />
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

        <button type="submit" className="btn btn-primary w-full">
          Create account
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
