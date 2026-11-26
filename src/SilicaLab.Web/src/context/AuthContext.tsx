import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth.api";
import {
  refreshAccessToken,
  setAccessToken,
  setOnUnauthorized,
} from "../api/client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserDto,
} from "../types/auth";

interface AuthContextValue {
  user: UserDto | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<UserDto>;
  register: (data: RegisterRequest) => Promise<UserDto>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserDto | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setOnUnauthorized(clearSession);
    return () => setOnUnauthorized(null);
  }, [clearSession]);

  // Restore the session on page refresh using the 7-day refresh token cookie
  useEffect(() => {
    let isMounted = true;

    refreshAccessToken()
      .then((res) => {
        if (isMounted) setUser(res.user);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsInitializing(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const applySession = (res: AuthResponse): UserDto => {
    setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  };

  const loginMutation = useMutation({ mutationFn: authApi.login });
  const registerMutation = useMutation({ mutationFn: authApi.register });

  const login = async (data: LoginRequest) => {
    const res = await loginMutation.mutateAsync(data);
    return applySession(res);
  };

  const register = async (data: RegisterRequest) => {
    const res = await registerMutation.mutateAsync(data);
    return applySession(res);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitializing,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}