// Componente de Cadastro
import { authSystem } from '../contexts/AuthSystem';
import UserService from '../services/userService';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

class SignUpComponent {
  private formData: SignUpFormData = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  };

  private errors: Partial<Record<keyof SignUpFormData, string>> = {};
  private isLoading = false;
  private passwordStrength: PasswordStrength = { score: 0, feedback: [], isValid: false };

  constructor(private container: HTMLElement) {
    this.render();
    this.attachEventListeners();
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private calculatePasswordStrength(password: string): PasswordStrength {
    let score = 0;
    const feedback: string[] = [];

    if (password.length < 8) {
      feedback.push('Senha deve ter pelo menos 8 caracteres');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Adicione letras minúsculas');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Adicione letras maiúsculas');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('Adicione números');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Adicione símbolos especiais');
    } else {
      score += 1;
    }

    return {
      score,
      feedback: feedback.length > 0 ? feedback : ['Senha forte!'],
      isValid: score >= 3 && password.length >= 8
    };
  }

  private validateForm(): boolean {
    this.errors = {};

    // Validar email
    if (!this.formData.email) {
      this.errors.email = 'Email é obrigatório';
    } else if (!this.validateEmail(this.formData.email)) {
      this.errors.email = 'Email inválido';
    }

    // Validar primeiro nome
    if (!this.formData.firstName.trim()) {
      this.errors.firstName = 'Primeiro nome é obrigatório';
    }

    // Validar último nome
    if (!this.formData.lastName.trim()) {
      this.errors.lastName = 'Último nome é obrigatório';
    }

    // Validar senha
    if (!this.formData.password) {
      this.errors.password = 'Senha é obrigatória';
    } else if (!this.passwordStrength.isValid) {
      this.errors.password = 'Senha não atende aos critérios de segurança';
    }

    // Validar confirmação de senha
    if (!this.formData.confirmPassword) {
      this.errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (this.formData.password !== this.formData.confirmPassword) {
      this.errors.confirmPassword = 'Senhas não coincidem';
    }

    return Object.keys(this.errors).length === 0;
  }

  private getPasswordStrengthColor(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return '#ef4444'; // red
      case 2:
        return '#f59e0b'; // amber
      case 3:
        return '#3b82f6'; // blue
      case 4:
      case 5:
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  }

  private getPasswordStrengthText(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return 'Muito fraca';
      case 2:
        return 'Fraca';
      case 3:
        return 'Média';
      case 4:
      case 5:
        return 'Forte';
      default:
        return '';
    }
  }

  private async handleSubmit(): Promise<void> {
    if (!this.validateForm()) {
      this.renderErrors();
      return;
    }

    this.isLoading = true;
    this.updateSubmitButton();

    try {
      // Preparar dados de cadastro
      const signupData = {
        email: this.formData.email,
        password: this.formData.password,
        first_name: this.formData.firstName,
        last_name: this.formData.lastName
      };

      console.log('📝 Iniciando cadastro:', { email: signupData.email });

      // Realizar cadastro através do AuthSystem
      await authSystem.signup(signupData);

      // Obter o usuário recém-cadastrado do AuthSystem
      const currentUser = authSystem.getState().user;
      
      if (currentUser) {
        // Adicionar usuário ao sistema de usuários para aparecer no dashboard
        UserService.addUser(currentUser);
        console.log('✅ Usuário adicionado ao dashboard de usuários');
      }

      this.showSuccess();

      // Redirecionar para dashboard após sucesso
      setTimeout(() => {
        window.location.hash = '#/dashboard';
      }, 2500);

    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      this.showError(error instanceof Error ? error.message : 'Erro no cadastro');
    } finally {
      this.isLoading = false;
      this.updateSubmitButton();
    }
  }

  private showSuccess(): void {
    const statusDiv = this.container.querySelector('#signup-status')!;
    statusDiv.innerHTML = `
      <div class="success-message">
        <div class="success-icon">✓</div>
        <h3>Cadastro realizado com sucesso!</h3>
        <p>Usuário cadastrado e adicionado ao sistema!</p>
        <p>Redirecionando para o dashboard...</p>
      </div>
    `;
    statusDiv.className = 'status-container success';
  }

  private showError(message: string): void {
    const statusDiv = this.container.querySelector('#signup-status')!;
    statusDiv.innerHTML = `
      <div class="error-message">
        <div class="error-icon">✕</div>
        <p>${message}</p>
      </div>
    `;
    statusDiv.className = 'status-container error';
  }

  private updateSubmitButton(): void {
    const button = this.container.querySelector('#signup-submit') as HTMLButtonElement;
    if (this.isLoading) {
      button.innerHTML = '<span class="loading-spinner"></span> Cadastrando...';
      button.disabled = true;
    } else {
      button.innerHTML = 'Criar Conta';
      button.disabled = false;
    }
  }

  private renderErrors(): void {
    Object.keys(this.errors).forEach(field => {
      const errorElement = this.container.querySelector(`#${field}-error`) as HTMLElement;
      if (errorElement) {
        errorElement.textContent = this.errors[field as keyof SignUpFormData] || '';
        errorElement.style.display = this.errors[field as keyof SignUpFormData] ? 'block' : 'none';
      }
    });
  }

  private attachEventListeners(): void {
    // Event listeners para os campos
    const emailInput = this.container.querySelector('#email') as HTMLInputElement;
    const passwordInput = this.container.querySelector('#password') as HTMLInputElement;
    const confirmPasswordInput = this.container.querySelector('#confirmPassword') as HTMLInputElement;
    const firstNameInput = this.container.querySelector('#firstName') as HTMLInputElement;
    const lastNameInput = this.container.querySelector('#lastName') as HTMLInputElement;
    const form = this.container.querySelector('#signup-form') as HTMLFormElement;

    // Atualizar dados do formulário
    emailInput?.addEventListener('input', (e) => {
      this.formData.email = (e.target as HTMLInputElement).value;
      this.clearFieldError('email');
    });

    passwordInput?.addEventListener('input', (e) => {
      this.formData.password = (e.target as HTMLInputElement).value;
      this.passwordStrength = this.calculatePasswordStrength(this.formData.password);
      this.updatePasswordStrength();
      this.clearFieldError('password');
    });

    confirmPasswordInput?.addEventListener('input', (e) => {
      this.formData.confirmPassword = (e.target as HTMLInputElement).value;
      this.clearFieldError('confirmPassword');
    });

    firstNameInput?.addEventListener('input', (e) => {
      this.formData.firstName = (e.target as HTMLInputElement).value;
      this.clearFieldError('firstName');
    });

    lastNameInput?.addEventListener('input', (e) => {
      this.formData.lastName = (e.target as HTMLInputElement).value;
      this.clearFieldError('lastName');
    });

    // Submit do formulário
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  private clearFieldError(field: keyof SignUpFormData): void {
    delete this.errors[field];
    const errorElement = this.container.querySelector(`#${field}-error`) as HTMLElement;
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  private updatePasswordStrength(): void {
    const strengthMeter = this.container.querySelector('#password-strength-meter') as HTMLElement;
    const strengthText = this.container.querySelector('#password-strength-text') as HTMLElement;
    const strengthFeedback = this.container.querySelector('#password-strength-feedback') as HTMLElement;

    if (strengthMeter) {
      const percentage = (this.passwordStrength.score / 5) * 100;
      strengthMeter.style.width = `${percentage}%`;
      strengthMeter.style.backgroundColor = this.getPasswordStrengthColor(this.passwordStrength.score);
    }

    if (strengthText) {
      strengthText.textContent = this.getPasswordStrengthText(this.passwordStrength.score);
      strengthText.style.color = this.getPasswordStrengthColor(this.passwordStrength.score);
    }

    if (strengthFeedback) {
      strengthFeedback.innerHTML = this.passwordStrength.feedback.map(f => `<li>${f}</li>`).join('');
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="signup-container">
        <div class="signup-card">
          <div class="signup-header">
            <div class="company-branding">
              <div class="company-logo">
                <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#2563eb"/>
                  <path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2z" fill="white"/>
                </svg>
              </div>
              <h2>AuthFlow Enterprise</h2>
              <p>Criar nova conta corporativa</p>
            </div>
          </div>

          <form id="signup-form" class="signup-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">Primeiro Nome</label>
                <input type="text" id="firstName" placeholder="Digite seu primeiro nome">
                <span class="error-message" id="firstName-error"></span>
              </div>

              <div class="form-group">
                <label for="lastName">Último Nome</label>
                <input type="text" id="lastName" placeholder="Digite seu último nome">
                <span class="error-message" id="lastName-error"></span>
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="Digite seu email">
              <span class="error-message" id="email-error"></span>
            </div>

            <div class="form-group">
              <label for="password">Senha</label>
              <input type="password" id="password" placeholder="Digite sua senha">
              <div class="password-strength">
                <div class="strength-meter-container">
                  <div class="strength-meter" id="password-strength-meter"></div>
                </div>
                <span class="strength-text" id="password-strength-text"></span>
              </div>
              <ul class="strength-feedback" id="password-strength-feedback"></ul>
              <span class="error-message" id="password-error"></span>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar Senha</label>
              <input type="password" id="confirmPassword" placeholder="Confirme sua senha">
              <span class="error-message" id="confirmPassword-error"></span>
            </div>

            <button type="submit" id="signup-submit" class="submit-button">
              Criar Conta
            </button>
          </form>

          <div id="signup-status" class="status-container"></div>

          <div class="signup-footer">
            <p>Já tem uma conta? <a href="#" id="login-link">Fazer Login</a></p>
          </div>
        </div>
      </div>
    `;

    // Adicionar event listener para o link de login
    const loginLink = this.container.querySelector('#login-link');
    loginLink?.addEventListener('click', (e) => {
      e.preventDefault();
      // Importar router dinamicamente para evitar dependência circular
      import('../router/AppRouter').then(({ getRouter }) => {
        const router = getRouter();
        router.navigate('/login');
      });
    });
  }
}

// Função para inicializar o componente
export function initSignUp(containerId: string): void {
  const container = document.getElementById(containerId);
  if (container) {
    new SignUpComponent(container);
  }
}
