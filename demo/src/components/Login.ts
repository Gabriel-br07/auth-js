// Componente de Login
import { authSystem } from '../contexts/AuthSystem';
import UserService from '../services/userService';
import { showPopup } from '../utils/ui';

interface LoginFormData {
  email: string;
  password: string;
}

class LoginComponent {
  private formData: LoginFormData = {
    email: '',
    password: ''
  };

  private errors: Partial<Record<keyof LoginFormData, string>> = {};
  private isLoading = false;

  constructor(private container: HTMLElement) {
    this.render();
    this.attachEventListeners();
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateForm(): boolean {
    this.errors = {};

    // Validar email
    if (!this.formData.email) {
      this.errors.email = 'Email é obrigatório';
    } else if (!this.validateEmail(this.formData.email)) {
      this.errors.email = 'Email inválido';
    }

    // Validar senha
    if (!this.formData.password) {
      this.errors.password = 'Senha é obrigatória';
    }

    return Object.keys(this.errors).length === 0;
  }

  private async handleLogin(): Promise<void> {
    if (!this.validateForm()) {
      this.renderErrors();
      return;
    }

    this.isLoading = true;
    this.updateSubmitButton();

    try {
      const loadingPopup = showPopup({
      message: 'Aguarde, estamos processando seu login...',
      type: 'loading',
      dismissible: false
    });

      // Realizar login através do AuthSystem
      await authSystem.login({
        email: this.formData.email,
        password: this.formData.password
      });

      // Obter o usuário logado do AuthSystem
      const currentUser = authSystem.getState().user;
      
      if (currentUser) {
        // Adicionar usuário ao sistema caso ainda não esteja (para usuários antigos)
        UserService.addUser(currentUser);
        loadingPopup.close();
      showPopup({
        message: 'Login realizado com sucesso!',
        type: 'success',
        duration: 2000
       });
      }

      this.showSuccess();

      // Redirecionar para dashboard após sucesso
      setTimeout(() => {
        window.location.hash = '#/dashboard';
      }, 2000);

    } catch (error) {
       showPopup({
      message: error instanceof Error ? error.message : 'Erro ao realizar login.',
      type: 'error'
    });
    } finally {
      this.isLoading = false;
      this.updateSubmitButton();
    }
  }

  private async handleOAuthLogin(provider: 'google' | 'github'): Promise<void> {
    try {      
      // Importar authApi dinamicamente
      const { authApi } = await import('../services/authApi');
      
      // Salvar o provider no sessionStorage para uso posterior
      sessionStorage.setItem('oauth_provider', provider);
      
      // Obter URL OAuth real
      const oauthUrl = authApi.getOAuthUrl(provider);
      
      console.log(`🔗 Redirecionando para ${provider}:`, oauthUrl);

      showPopup({
      message: `Redirecionando para ${provider}...`,
      type: 'loading',
      duration: 2000
    });
      
      // Fazer redirecionamento real
      window.location.href = oauthUrl;

    } catch (error) {
      showPopup({
        message: error instanceof Error ? error.message : 'Erro ao realizar login.',
        type: 'error'
      });
      sessionStorage.removeItem('oauth_provider');
    }
  }

  private showSuccess(message: string = 'Login realizado com sucesso!'): void {
    const statusDiv = this.container.querySelector('#login-status')!;
    statusDiv.innerHTML = `
      <div class="success-message">
        <div class="success-icon">✓</div>
        <h3>${message}</h3>
        <p>Redirecionando para o dashboard...</p>
      </div>
    `;
    statusDiv.className = 'status-container success';

    // Simular redirecionamento
    setTimeout(() => {
      console.log('Redirecionando para dashboard...');
    }, 2000);
  }

  private showError(message: string): void {
    const statusDiv = this.container.querySelector('#login-status')!;
    statusDiv.innerHTML = `
      <div class="error-message">
        <div class="error-icon">✕</div>
        <p>${message}</p>
      </div>
    `;
    statusDiv.className = 'status-container error';
  }

  private showStatus(message: string, type: 'loading' | 'info'): void {
    const statusDiv = this.container.querySelector('#login-status')!;
    const icon = type === 'loading' ? '<span class="loading-spinner"></span>' : 'ℹ️';
    statusDiv.innerHTML = `
      <div class="info-message">
        <div class="info-icon">${icon}</div>
        <p>${message}</p>
      </div>
    `;
    statusDiv.className = `status-container ${type}`;
  }

  private updateSubmitButton(): void {
    const button = this.container.querySelector('#login-submit') as HTMLButtonElement;
    if (this.isLoading) {
      button.innerHTML = '<span class="loading-spinner"></span> Entrando...';
      button.disabled = true;
    } else {
      button.innerHTML = 'Entrar';
      button.disabled = false;
    }
  }

  private renderErrors(): void {
    Object.keys(this.errors).forEach(field => {
      const errorElement = this.container.querySelector(`#${field}-error`) as HTMLElement;
      if (errorElement) {
        errorElement.textContent = this.errors[field as keyof LoginFormData] || '';
        errorElement.style.display = this.errors[field as keyof LoginFormData] ? 'block' : 'none';
      }
    });
  }

  private attachEventListeners(): void {
    // Event listeners para os campos
    const emailInput = this.container.querySelector('#email') as HTMLInputElement;
    const passwordInput = this.container.querySelector('#password') as HTMLInputElement;
    const form = this.container.querySelector('#login-form') as HTMLFormElement;
    const googleButton = this.container.querySelector('#google-login') as HTMLButtonElement;
    const githubButton = this.container.querySelector('#github-login') as HTMLButtonElement;

    // Atualizar dados do formulário
    emailInput?.addEventListener('input', (e) => {
      this.formData.email = (e.target as HTMLInputElement).value;
      this.clearFieldError('email');
    });

    passwordInput?.addEventListener('input', (e) => {
      this.formData.password = (e.target as HTMLInputElement).value;
      this.clearFieldError('password');
    });

    // Submit do formulário
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // OAuth buttons
    googleButton?.addEventListener('click', () => {
      this.handleOAuthLogin('google');
    });

    githubButton?.addEventListener('click', () => {
      this.handleOAuthLogin('github');
    });
  }

  private clearFieldError(field: keyof LoginFormData): void {
    delete this.errors[field];
    const errorElement = this.container.querySelector(`#${field}-error`) as HTMLElement;
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <div class="company-branding">
              <div class="company-logo">
                <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#2563eb"/>
                  <path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2z" fill="white"/>
                </svg>
              </div>
              <h2>AuthFlow Enterprise</h2>
              <p>Acesse sua conta corporativa</p>
            </div>
          </div>

          <!-- OAuth Buttons -->
          <div class="oauth-section">
            <button id="google-login" class="oauth-button google">
              <div class="oauth-icon">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
              </div>
              Continuar com Google
            </button>

            <button id="github-login" class="oauth-button github">
              <div class="oauth-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              Continuar com GitHub
            </button>
          </div>

          <div class="divider">
            <span>ou</span>
          </div>

          <!-- Email/Password Form -->
          <form id="login-form" class="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="Digite seu email">
              <span class="error-message" id="email-error"></span>
            </div>

            <div class="form-group">
              <label for="password">Senha</label>
              <input type="password" id="password" placeholder="Digite sua senha">
              <span class="error-message" id="password-error"></span>
            </div>

            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" id="remember-me">
                <span class="checkmark"></span>
                Lembrar de mim
              </label>
              <a href="#" class="forgot-password">Esqueceu a senha?</a>
            </div>

            <button type="submit" id="login-submit" class="submit-button">
              Entrar
            </button>
          </form>

          <div id="login-status" class="status-container"></div>

          <div class="login-footer">
            <p>Não tem uma conta? <a href="#" id="signup-link">Criar conta</a></p>
          </div>
        </div>
      </div>
    `;

    // Adicionar event listener para o link de signup
    const signupLink = this.container.querySelector('#signup-link');
    signupLink?.addEventListener('click', (e) => {
      e.preventDefault();
      // Importar router dinamicamente para evitar dependência circular
      import('../router/AppRouter').then(({ getRouter }) => {
        const router = getRouter();
        router.navigate('/signup');
      });
    });
  }
}

// Função para inicializar o componente
export function initLogin(containerId: string): void {
  const container = document.getElementById(containerId);
  if (container) {
    new LoginComponent(container);
  }
}
