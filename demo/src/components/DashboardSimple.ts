// Dashboard Simplificado - Apenas Lista de Usuários
import { authSystem } from '../contexts/AuthSystem';
import UsersListComponent from './UsersList';
import UserService from '../services/userService';

interface User {
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
  last_sign_in_at?: string;
}

class DashboardSimpleComponent {
  private user: User | null = null;
  private isLoading = true;
  private usersListComponent: UsersListComponent | null = null;

  constructor(private container: HTMLElement) {
    this.init();
  }

  private async init(): Promise<void> {
    // Verificar autenticação
    if (!this.verifyAuthentication()) {
      return;
    }
    
    await this.loadUserData();
    this.render();
  }

  private verifyAuthentication(): boolean {
    const authState = authSystem.getState();
    
    console.log('🔐 Verificando autenticação no Dashboard:', authState);
    
    if (!authState.isAuthenticated || !authState.user) {
      console.log('❌ Usuário não autenticado tentando acessar Dashboard');
      
      this.container.innerHTML = `
        <div style="
          padding: 2rem;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          margin: 2rem 0;
        ">
          <h2>🔒 Acesso Negado</h2>
          <p>Você precisa fazer login para acessar esta área.</p>
          <button onclick="window.location.hash='#/login'" style="
            background: white;
            color: #667eea;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 1rem;
          ">Fazer Login</button>
        </div>
      `;
      
      // Redirecionar automaticamente após 3 segundos
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 3000);
      
      return false;
    }
    
    return true;
  }

  private async loadUserData(): Promise<void> {
    try {
      const authState = authSystem.getState();
      this.user = authState.user;
      this.isLoading = false;
      
      console.log('✅ Dados do usuário carregados:', this.user);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      this.isLoading = false;
    }
  }

  private renderLoadingState(): string {
    return `
      <div class="dashboard-loading">
        <div class="loading-spinner large"></div>
        <p>Carregando dados do usuário...</p>
      </div>
    `;
  }

  private renderDashboard(): string {
    if (!this.user) {
      return `
        <div class="dashboard-error">
          <h2>Erro ao carregar dados</h2>
          <p>Não foi possível carregar as informações do usuário.</p>
          <button onclick="location.reload()" class="retry-button">Tentar Novamente</button>
        </div>
      `;
    }

    return `
      <div class="dashboard-container">
        <!-- Header -->
        <header class="dashboard-header">
          <div class="header-content">
            <h1>🏠 Dashboard - Sistema de Usuários</h1>
            <div class="header-actions">
              <div class="current-user-info">
                <span class="current-user-name">
                  👋 ${this.user.user_metadata.first_name} ${this.user.user_metadata.last_name}
                </span>
                <span class="role-badge ${this.user.role}">
                  ${this.user.role === 'supabase_admin' ? '🛡️ Admin' : '👤 Usuário'}
                </span>
              </div>
              <button id="logout-button" class="action-button logout">
                🚪 Sair
              </button>
            </div>
          </div>
        </header>

        <!-- Users Section -->
        <div class="users-section">
          <div id="users-list-container"></div>
        </div>
      </div>
    `;
  }

  private render(): void {
    this.container.innerHTML = this.isLoading ? this.renderLoadingState() : this.renderDashboard();
    
    if (!this.isLoading) {
      this.attachEventListeners();
      this.initUsersListComponent();
    }
  }

  private attachEventListeners(): void {
    const logoutButton = this.container.querySelector('#logout-button');

    logoutButton?.addEventListener('click', () => {
      this.handleLogout();
    });
  }

  private async handleLogout(): Promise<void> {
    if (confirm('Tem certeza que deseja sair?')) {
      try {
        console.log('🚪 Fazendo logout...');
        
        // Usar o AuthSystem para fazer logout
        await authSystem.logout();
        
        // Mostrar mensagem de sucesso
        this.showNotification('Logout realizado com sucesso!');
        
        // Redirecionar para página inicial após um breve delay
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1500);
        
      } catch (error) {
        console.error('❌ Erro no logout:', error);
        this.showNotification('Erro ao fazer logout. Tente novamente.', 'error');
      }
    }
  }

  private initUsersListComponent(): void {
    const usersContainer = this.container.querySelector('#users-list-container') as HTMLElement;
    if (usersContainer) {
      this.usersListComponent = new UsersListComponent(usersContainer);
    }
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✓' : '✗'}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Método público para atualizar a lista
  public refreshUsers(): void {
    if (this.usersListComponent) {
      this.usersListComponent.refresh();
    }
  }
}

// Função para inicializar o componente
export function initDashboardSimple(containerId: string): void {
  const container = document.getElementById(containerId);
  if (container) {
    new DashboardSimpleComponent(container);
  }
}

export default DashboardSimpleComponent;
