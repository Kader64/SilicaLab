export type UserRole = "Student" | "Teacher" | "Admin";

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: UserDto;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: "Student" | "Teacher";
}