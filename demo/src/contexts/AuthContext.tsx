// Context de Autenticação (Vanilla TypeScript)
import { AuthState, AuthContextValue, User, AuthTokens, SignUpData, LoginData } from '../types/auth';
import { authApi } from '../services/authApi';

// Storage para tokens
class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private static readonly USER_KEY = 'auth_user';

  static saveTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(tokens.user));
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

// Actions do reducer
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKENS'; payload: AuthTokens | null }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_AUTH'; payload: AuthTokens };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null
      };

    case 'SET_TOKENS':
      return { ...state, tokens: action.payload };

    case 'SET_AUTH':
      TokenStorage.saveTokens(action.payload);
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload,
        isAuthenticated: true,
        isLoading: false
      };

    case 'CLEAR_AUTH':
      TokenStorage.clearTokens();
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false
      };

    default:
      return state;
  }
}

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true
};

// Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider Component
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Inicializar autenticação
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = TokenStorage.getAccessToken();
        const refreshToken = TokenStorage.getRefreshToken();
        const storedUser = TokenStorage.getUser();

        if (accessToken && storedUser) {
          // Verificar se token é válido
          try {
            const user = await authApi.getUser(accessToken);
            dispatch({ 
              type: 'SET_AUTH', 
              payload: { 
                access_token: accessToken,
                refresh_token: refreshToken || '',
                user,
                expires_in: 3600,
                token_type: 'bearer' as const
              }
            });
          } catch (error) {
            // Token inválido, tentar refresh
            if (refreshToken) {
              try {
                const newTokens = await authApi.refreshToken(refreshToken);
                dispatch({ type: 'SET_AUTH', payload: newTokens });
              } catch {
                dispatch({ type: 'CLEAR_AUTH' });
              }
            } else {
              dispatch({ type: 'CLEAR_AUTH' });
            }
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        dispatch({ type: 'CLEAR_AUTH' });
      }
    };

    initAuth();
  }, []);

  // Processar callback OAuth
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('Erro OAuth:', error);
        return;
      }

      if (code && window.location.pathname === '/callback') {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          const tokens = await authApi.handleOAuthCallback(code);
          dispatch({ type: 'SET_AUTH', payload: tokens });
          
          // Redirecionar para dashboard
          window.history.replaceState({}, document.title, '/dashboard');
        } catch (error) {
          console.error('Erro no callback OAuth:', error);
          dispatch({ type: 'CLEAR_AUTH' });
          window.history.replaceState({}, document.title, '/login');
        }
      }
    };

    handleOAuthCallback();
  }, []);

  // Funções de autenticação
  const login = async (data: LoginData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const tokens = await authApi.login(data);
      dispatch({ type: 'SET_AUTH', payload: tokens });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const signup = async (data: SignUpData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const tokens = await authApi.signup(data);
      dispatch({ type: 'SET_AUTH', payload: tokens });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (state.tokens?.access_token) {
        await authApi.logout(state.tokens.access_token);
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      dispatch({ type: 'CLEAR_AUTH' });
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'github'): Promise<void> => {
    const oauthUrl = authApi.getOAuthUrl(provider);
    window.location.href = oauthUrl;
  };

  const refreshToken = async (): Promise<void> => {
    if (!state.tokens?.refresh_token) {
      throw new Error('Nenhum refresh token disponível');
    }

    try {
      const tokens = await authApi.refreshToken(state.tokens.refresh_token);
      dispatch({ type: 'SET_AUTH', payload: tokens });
    } catch (error) {
      dispatch({ type: 'CLEAR_AUTH' });
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!state.user || !state.tokens?.access_token) {
      throw new Error('Usuário não autenticado');
    }

    const updatedUser = { ...state.user, ...updates };
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  const contextValue: AuthContextValue = {
    ...state,
    login,
    signup,
    logout,
    loginWithOAuth,
    refreshToken,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
