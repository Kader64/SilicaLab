import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";
import { api } from "./client";

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data).then((r) => r.data),

  logout: () =>
    api.post("/auth/logout", {}, { skipAuthRefresh: true }),
};