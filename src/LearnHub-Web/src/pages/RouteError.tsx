import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

/** Shown when a route fails to load or throws while rendering. */
export default function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "An unexpected error occurred. Try reloading the page.";

  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>
      <p role="alert" className="text-muted">
        {message}
      </p>
      <div className="flex gap-3">
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload
        </button>
        <Link to="/" className="btn btn-secondary">
          Start page
        </Link>
      </div>
    </main>
  );
}
