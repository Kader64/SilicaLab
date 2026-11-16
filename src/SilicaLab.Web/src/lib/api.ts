import axios, { isAxiosError } from "axios";

/** Base client. The Vite dev server proxies /api to the ASP.NET Core backend. */
export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});


export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Try again.",
) {
  if (isAxiosError<{ detail?: string; title?: string }>(error)) {
    return (
      error.response?.data?.detail ?? error.response?.data?.title ?? fallback
    );
  }
  return fallback;
}
