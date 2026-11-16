import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../../components/ui/Field";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    // TODO API: POST /api/auth/login. On 401 call setError("Invalid email or password.")
    navigate("/courses");
  }

  return (
    <>
      <h1 className="page-title sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-muted">Log in to continue learning.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Email">
          {(control) => <input {...control} name="email" type="email" className="input" placeholder="you@example.com" autoComplete="email" required />}
        </Field>
        <Field label="Password">
          {(control) => (
            <input {...control} name="password" type="password" className="input" placeholder="••••••••" autoComplete="current-password" required />
          )}
        </Field>

        {error && (
          <p role="alert" className="alert alert-danger">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full">
          Log in
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
