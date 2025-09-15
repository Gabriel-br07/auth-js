// Sistema de Autenticação (Vanilla TypeScript)
import { AuthState, User, AuthTokens, SignUpData, LoginData } from '../types/auth';
import { authApi } from '../services/authApi';
import UserService from '../services/userService';

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

// Event System para notificar mudanças
type AuthEventType = 'auth_state_changed' | 'loading_changed' | 'error';

interface AuthEvent {
  type: AuthEventType;
  data: any;
}

class EventEmitter {
  private listeners: Map<AuthEventType, Array<(data: any) => void>> = new Map();

  on(event: AuthEventType, listener: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: AuthEventType, listener: (data: any) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: AuthEventType, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
}

// Sistema de Autenticação Principal
class AuthSystem {
  private static instance: AuthSystem;
  private state: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    redirectTo: undefined
  };
  
  private eventEmitter = new EventEmitter();
  private tokenCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.init();
  }

  static getInstance(): AuthSystem {
    if (!AuthSystem.instance) {
      AuthSystem.instance = new AuthSystem();
    }
    return AuthSystem.instance;
  }

  // Inicializar autenticação
  private async init(): Promise<void> {
    try {
      const accessToken = TokenStorage.getAccessToken();
      const refreshToken = TokenStorage.getRefreshToken();
      const storedUser = TokenStorage.getUser();

      if (accessToken && storedUser) {
        // Verificar se token é válido
        try {
          const user = await authApi.getUser(accessToken);
          this.setState({
            user,
            tokens: {
              access_token: accessToken,
              refresh_token: refreshToken || '',
              user,
              expires_in: 3600,
              token_type: 'bearer' as const
            },
            isAuthenticated: true,
            isLoading: false
          });
          
          // Iniciar validação periódica de token
          this.startTokenValidation();
          
        } catch (error) {
          // Token inválido, tentar refresh
          if (refreshToken) {
            try {
              const newTokens = await authApi.refreshToken(refreshToken);
              TokenStorage.saveTokens(newTokens);
              this.setState({
                user: newTokens.user,
                tokens: newTokens,
                isAuthenticated: true,
                isLoading: false
              });
              this.startTokenValidation();
            } catch {
              this.clearAuth();
            }
          } else {
            this.clearAuth();
          }
        }
      } else {
        this.setState({ ...this.state, isLoading: false });
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
      this.clearAuth();
    }

    // Processar callback OAuth se necessário
    this.handleOAuthCallback();
    
    console.log('🔧 AuthSystem inicializado com estado:', this.state);
  }

  // Processar callback OAuth
  private async handleOAuthCallback(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    console.log('🔍 Verificando callback OAuth:', { 
      pathname: window.location.pathname,
      code: code ? 'presente' : 'ausente',
      error: error || 'nenhum',
      accessToken: accessToken ? 'presente' : 'ausente',
      refreshToken: refreshToken ? 'presente' : 'ausente',
      search: window.location.search
    });

    // Detectar provider do sessionStorage
    const provider = sessionStorage.getItem('oauth_provider') as 'github' | 'google' | null;
    console.log('🔍 Provider detectado:', provider);

    if (error) {
      console.error('❌ Erro OAuth:', error);
      this.eventEmitter.emit('error', { message: `Erro OAuth: ${error}` });
      // Limpar sessionStorage e redirecionar para login
      sessionStorage.removeItem('oauth_provider');
      window.history.replaceState({}, document.title, '/login');
      this.setState({ redirectTo: '/login' });
      return;
    }

    // Se estamos na página de callback
    if (window.location.pathname === '/callback') {
      console.log('✅ Processando callback OAuth');
      this.setLoading(true);
      
      try {
        let tokens: any;

        // Se temos tokens diretamente na URL (Supabase implicit flow)
        if (accessToken) {
          console.log('📝 Processando tokens da URL (Supabase implicit flow)');
          
          // Obter dados do usuário usando o token
          const user = await authApi.getUser(accessToken);
          
          tokens = {
            access_token: accessToken,
            refresh_token: refreshToken || '',
            expires_in: 3600,
            token_type: 'bearer' as const,
            user: user
          };
          
        } else if (code) {
          console.log('📝 Processando código de autorização');
          // Processar código OAuth (para providers que usam authorization code flow)
          tokens = await authApi.handleOAuthCallback(code, provider || undefined);
        } else {
          // Tentar obter token do hash (alguns providers usam fragment)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashAccessToken = hashParams.get('access_token');
          const hashRefreshToken = hashParams.get('refresh_token');
          
          if (hashAccessToken) {
            console.log('📝 Processando tokens do hash da URL');
            const user = await authApi.getUser(hashAccessToken);
            
            tokens = {
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken || '',
              expires_in: parseInt(hashParams.get('expires_in') || '3600'),
              token_type: 'bearer' as const,
              user: user
            };
          } else {
            throw new Error('Nenhum token ou código encontrado no callback');
          }
        }

        TokenStorage.saveTokens(tokens);
        
        this.setState({
          user: tokens.user,
          tokens: tokens,
          isAuthenticated: true,
          isLoading: false
        });

        // Adicionar usuário ao sistema para dashboard
        UserService.addUser(tokens.user);

        console.log('✅ Login OAuth realizado com sucesso:', {
          email: tokens.user.email,
          provider: provider || 'desconhecido'
        });        // Limpar sessionStorage após sucesso
        sessionStorage.removeItem('oauth_provider');
        
        // Limpar URL e redirecionar
        window.history.replaceState({}, document.title, '/home');
        
        // Emitir evento de mudança de estado com redirecionamento
        setTimeout(() => {
          this.setState({ redirectTo: '/home' });
        }, 100);
        
        // Iniciar validação de token
        this.startTokenValidation();
        
      } catch (error) {
        console.error('❌ Erro no callback OAuth:', error);
        this.setLoading(false);
        sessionStorage.removeItem('oauth_provider');
        
        // Redirecionar para login em caso de erro
        window.history.replaceState({}, document.title, '/login');
        this.setState({ redirectTo: '/login' });
        
        this.eventEmitter.emit('error', { 
          message: error instanceof Error ? error.message : 'Erro no callback OAuth' 
        });
      }
    }
  }

  // Getters
  getState(): AuthState {
    return { ...this.state };
  }

  getUser(): User | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  // Event listeners
  onAuthStateChange(callback: (state: AuthState) => void): () => void {
    this.eventEmitter.on('auth_state_changed', callback);
    return () => this.eventEmitter.off('auth_state_changed', callback);
  }

  onError(callback: (error: { message: string }) => void): () => void {
    this.eventEmitter.on('error', callback);
    return () => this.eventEmitter.off('error', callback);
  }

  // Private methods
  private setState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.eventEmitter.emit('auth_state_changed', this.state);
  }

  private setLoading(loading: boolean): void {
    this.setState({ isLoading: loading });
  }

  private clearAuth(): void {
    this.stopTokenValidation();
    TokenStorage.clearTokens();
    this.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      redirectTo: undefined
    });
  }

  clearRedirect(): void {
    this.setState({ redirectTo: undefined });
  }

  // Validação de token
  private startTokenValidation(): void {
    // Parar validação anterior se existir
    this.stopTokenValidation();
    
    // Validar token a cada 5 minutos
    this.tokenCheckInterval = setInterval(() => {
      this.validateToken();
    }, 5 * 60 * 1000);
  }

  private stopTokenValidation(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  private async validateToken(): Promise<void> {
    const tokens = this.state.tokens;
    if (!tokens || !this.isTokenExpired(tokens)) {
      return;
    }

    try {
      if (tokens.refresh_token) {
        const newTokens = await authApi.refreshToken(tokens.refresh_token);
        TokenStorage.saveTokens(newTokens);
        this.setState({
          tokens: newTokens,
          user: newTokens.user
        });
      } else {
        this.clearAuth();
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      this.clearAuth();
    }
  }

  private isTokenExpired(tokens: AuthTokens): boolean {
    // Implementação básica - pode ser melhorada
    return false; // Por enquanto, assumir que tokens não expiram
  }

  // Public methods
  async login(data: LoginData): Promise<void> {
    this.setLoading(true);
    try {
      const tokens = await authApi.login(data);
      TokenStorage.saveTokens(tokens);
      this.setState({
        user: tokens.user,
        tokens: tokens,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Adicionar usuário ao sistema para dashboard
      UserService.addUser(tokens.user);
      
      this.startTokenValidation();
    } catch (error) {
      this.setLoading(false);
      throw error;
    }
  }

  async signup(data: SignUpData): Promise<void> {
    this.setLoading(true);
    try {
      const tokens = await authApi.signup(data);
      TokenStorage.saveTokens(tokens);
      this.setState({
        user: tokens.user,
        tokens: tokens,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Adicionar usuário ao sistema para dashboard
      UserService.addUser(tokens.user);
      
      this.startTokenValidation();
    } catch (error) {
      this.setLoading(false);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.state.tokens?.access_token) {
        await authApi.logout(this.state.tokens.access_token);
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      this.clearAuth();
    }
  }

  async loginWithOAuth(provider: 'google' | 'github'): Promise<void> {
    // Salvar o provider no sessionStorage para detecção no callback
    sessionStorage.setItem('oauth_provider', provider);
    
    const oauthUrl = authApi.getOAuthUrl(provider);
    window.location.href = oauthUrl;
  }

  async refreshToken(): Promise<void> {
    if (!this.state.tokens?.refresh_token) {
      throw new Error('Nenhum refresh token disponível');
    }

    try {
      const tokens = await authApi.refreshToken(this.state.tokens.refresh_token);
      TokenStorage.saveTokens(tokens);
      this.setState({
        user: tokens.user,
        tokens: tokens,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  async updateUser(updates: Partial<User>): Promise<void> {
    if (!this.state.user || !this.state.tokens?.access_token) {
      throw new Error('Usuário não autenticado');
    }

    const updatedUser = { ...this.state.user, ...updates };
    this.setState({ user: updatedUser });
  }

  // Admin methods
  async getUsers(): Promise<any[]> {
    if (!this.state.tokens?.access_token) {
      throw new Error('Token de acesso necessário');
    }
    
    return authApi.getUsers(this.state.tokens.access_token);
  }

  async updateUserRole(userId: string, updates: Partial<User>): Promise<User> {
    if (!this.state.tokens?.access_token) {
      throw new Error('Token de acesso necessário');
    }
    
    return authApi.updateUser(userId, updates, this.state.tokens.access_token);
  }
}

// Exportar instância singleton
export const authSystem = AuthSystem.getInstance();

// Funções helper para compatibilidade
export function useAuth() {
  return {
    ...authSystem.getState(),
    login: authSystem.login.bind(authSystem),
    signup: authSystem.signup.bind(authSystem),
    logout: authSystem.logout.bind(authSystem),
    loginWithOAuth: authSystem.loginWithOAuth.bind(authSystem),
    refreshToken: authSystem.refreshToken.bind(authSystem),
    updateUser: authSystem.updateUser.bind(authSystem),
    onAuthStateChange: authSystem.onAuthStateChange.bind(authSystem),
    onError: authSystem.onError.bind(authSystem)
  };
}