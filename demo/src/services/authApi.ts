// Serviço de API para autenticação
import { User, AuthTokens, SignUpData, LoginData, ApiError, AdminUser } from '../types/auth';

const BASE_URL = 'http://localhost:9999';

class AuthApiService {
  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorData: ApiError;
      
      if (isJson) {
        errorData = await response.json();
      } else {
        errorData = {
          error: 'network_error',
          error_description: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      throw new Error(errorData.error_description || errorData.error || errorData.message || 'Erro desconhecido');
    }

    if (isJson) {
      return response.json();
    }

    return {} as T;
  }

  // Cadastro com email/senha
  async signup(data: SignUpData): Promise<AuthTokens> {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        data: {
          first_name: data.first_name,
          last_name: data.last_name
        }
      })
    });

    return this.handleResponse<AuthTokens>(response);
  }

  // Login tradicional
  async login(data: LoginData): Promise<AuthTokens> {
    const response = await fetch(`${BASE_URL}/token?grant_type=password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email: data.email,
        password: data.password
      })
    });

    return this.handleResponse<AuthTokens>(response);
  }

  // Logout
  async logout(token: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: this.getHeaders(token)
    });

    return this.handleResponse<void>(response);
  }

  // Obter dados do usuário logado
  async getUser(token: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/user`, {
      method: 'GET',
      headers: this.getHeaders(token)
    });

    return this.handleResponse<User>(response);
  }

  // Iniciar OAuth
  getOAuthUrl(provider: 'google' | 'github'): string {
    const redirectUrl = encodeURIComponent(window.location.origin + '/callback');
    
    // Para Supabase, usar sempre a API local que vai gerenciar o OAuth
    return `${BASE_URL}/authorize?provider=${provider}&redirect_to=${redirectUrl}`;
  }

  // Processar callback OAuth
  async handleOAuthCallback(code: string, provider?: 'github' | 'google'): Promise<AuthTokens> {
    // Para Supabase, sempre usar a API local para processar o callback
    const response = await fetch(`${BASE_URL}/callback`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ code, provider })
    });

    return this.handleResponse<AuthTokens>(response);
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${BASE_URL}/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    return this.handleResponse<AuthTokens>(response);
  }

  // Admin: Listar usuários
  async getUsers(serviceRoleToken: string): Promise<AdminUser[]> {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: this.getHeaders(serviceRoleToken)
    });

    return this.handleResponse<AdminUser[]>(response);
  }

  // Admin: Atualizar usuário
  async updateUser(userId: string, updates: Partial<User>, serviceRoleToken: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(serviceRoleToken),
      body: JSON.stringify(updates)
    });

    return this.handleResponse<User>(response);
  }
}

export const authApi = new AuthApiService();
