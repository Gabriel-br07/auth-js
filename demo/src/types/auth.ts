// --- Perfis e Usuários ---
export type UserRole = 'authenticated' | 'supabase_admin';

export interface User {
  id: string;
  aud?: string;
  role: UserRole;

  email?: string | null;
  phone?: string | null;

  // Datas em ISO string
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  phone_confirmed_at?: string | null;
  confirmed_at?: string | null;

  // Sessões anônimas
  is_anonymous?: boolean;

  user_metadata: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    name?: string;
    avatar_url?: string;  
    username?: string;
    picture?: string;      
  };

  app_metadata?: {
    provider?: string;    
    providers?: string[];  
    oauth_provider_data?: {
      provider_id?: string;
      provider_username?: string;
      provider_avatar?: string;
    };
  };

  identities?: Array<Record<string, unknown>>;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'bearer';
  user: User;
  expires_at?: number; 
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

export interface ApiError {
  error: string;
  error_description?: string;
  message?: string;
}

export interface AdminUser extends User {
  sign_in_count?: number;
  banned_until?: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

// --- Dados vindos de provedores OAuth ---
export interface OAuthUserData {
  // Google
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;

  // GitHub
  login?: string;
  avatar_url?: string;

  // Comuns
  email?: string;
  [key: string]: unknown;
}

// --- Provedores OAuth ---
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  EMAIL: 'email',
} as const;

export type OAuthProvider = typeof OAUTH_PROVIDERS[keyof typeof OAUTH_PROVIDERS];

/**
 * Obtém o nome de exibição do usuário seguindo uma hierarquia segura.
 * Lida com cenários sem e-mail (telefone/anônimo) e aplica trim.
 */

export const getUserDisplayName = (user: User | null): string => {
  if (!user) return '';
  const m = user.user_metadata ?? {};

  const fullName = m.full_name?.trim();
  if (fullName) return fullName;

  const name = m.name?.trim();
  if (name) return name;

  const first = m.first_name?.trim();
  const last = m.last_name?.trim();
  if (first && last) return `${first} ${last}`;
  if (first) return first;

  const username = m.username?.trim();
  if (username) return username;

  if (user.email) {
    const local = user.email.split('@')[0];
    if (local) return local;
  }

  return 'Usuário';
};

/**
 * Obtém a URL do avatar do usuário, priorizando um campo canônico.
 */
export const getUserAvatar = (user: User | null): string | undefined => {
  if (!user) return undefined;
  const m = user.user_metadata ?? {};
  const app = user.app_metadata ?? {};

  return (
    m.avatar_url?.trim() ||
    m.picture?.trim() ||
    app.oauth_provider_data?.provider_avatar?.trim() ||
    undefined
  );
};

/**
 * Obtém o provedor de autenticação principal; se indisponível, tenta o primeiro da lista; fallback para 'email'.
 */
export const getUserProvider = (user: User | null): string => {
  if (!user) return OAUTH_PROVIDERS.EMAIL;
  const app = user.app_metadata;
  return app?.provider || app?.providers?.[0] || OAUTH_PROVIDERS.EMAIL;
};

/**
 * Normaliza dados do usuário vindos de diferentes provedores OAuth.
 */
export const normalizeOAuthUserData = (
  userData: OAuthUserData,
  provider: OAuthProvider,
): Partial<User['user_metadata']> => {
  const normalized: Partial<User['user_metadata']> = {};

  const s = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined);

  switch (provider) {
    case OAUTH_PROVIDERS.GOOGLE: {
      const name = s(userData.name);
      const given = s(userData.given_name);
      const family = s(userData.family_name);
      const picture = s(userData.picture);

      if (name) normalized.full_name = name;
      if (given) normalized.first_name = given;
      if (family) normalized.last_name = family;
      if (picture) {
        normalized.avatar_url = picture; 
        normalized.picture = picture;    
      }
      break;
    }

    case OAUTH_PROVIDERS.GITHUB: {
      const name = s((userData as any).name);
      const login = s(userData.login);
      const avatar = s(userData.avatar_url);

      if (name) {
        normalized.full_name = name;
        normalized.name = name;
      }
      if (login) normalized.username = login;
      if (avatar) normalized.avatar_url = avatar;
      break;
    }

    default: {
      for (const key of Object.keys(userData)) {
        const value = (userData as Record<string, unknown>)[key];
        const val = s(value);
        if (val !== undefined) (normalized as Record<string, string>)[key] = val;
      }
    }
  }

  return normalized;
};

export const isAdmin = (user: User | null): boolean => user?.role === 'supabase_admin';

export const isAuthenticated = (user: User | null): boolean =>
  !!user && (user.role === 'authenticated' || user.role === 'supabase_admin');
