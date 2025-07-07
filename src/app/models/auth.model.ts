export interface RegisterRequest {
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  message?: string;
  statusCode?: number;
  role?: string;
  name?: string;
  email?: string;
}