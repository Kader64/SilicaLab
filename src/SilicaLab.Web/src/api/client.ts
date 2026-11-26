import axios, { isAxiosError, type AxiosError } from "axios";
import type { AuthResponse } from "../types/auth";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
  }
}

const AUTH_ENDPOINTS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
]);

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;
let refreshPromise: Promise<AuthResponse> | null = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const setOnUnauthorized = (cb: (() => void) | null) => {
  onUnauthorized = cb;
};

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

interface AspNetProblemDetails {
  detail?: string;
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Try again.",
) {
  if (isAxiosError<AspNetProblemDetails>(error)) {
    const data = error.response?.data;

    if (data?.errors) {
      const firstFieldErrors = Object.values(data.errors)[0];
      if (firstFieldErrors?.[0]) return firstFieldErrors[0];
    }

    return data?.detail ?? data?.title ?? data?.message ?? fallback;
  }
  return fallback;
}

export function refreshAccessToken(): Promise<AuthResponse> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<AuthResponse>(
        "/auth/refresh",
        {},
        {
          headers: { "X-Requested-With": "XMLHttpRequest" },
          skipAuthRefresh: true,
        },
      )
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data;
      })
      .catch((err) => {
        setAccessToken(null);
        onUnauthorized?.();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  if (accessToken && !config.skipAuthRefresh) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;
    const isAuthRoute = config?.url ? AUTH_ENDPOINTS.has(config.url) : false;

    if (
      error.response?.status === 401 &&
      config &&
      !config._retry &&
      !config.skipAuthRefresh &&
      !isAuthRoute
    ) {
      config._retry = true;
      const { accessToken: newToken } = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    }

    return Promise.reject(error);
  },
);