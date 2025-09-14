// Tipos e interfaces para o sistema de autenticação

export interface User {
  id: string;
  email: string;
  role: 'authenticated' | 'supabase_admin';
  user_metadata: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'bearer';
  user: User;
}

export interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  redirectTo?: string;
}

export interface AuthContextValue extends AuthState {
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export interface ApiError {
  error: string;
  error_description?: string;
  message?: string;
}

export interface AdminUser extends User {
  sign_in_count?: number;
  confirmed_at?: string;
  banned_until?: string;
}

export type UserRole = 'authenticated' | 'supabase_admin';

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}
