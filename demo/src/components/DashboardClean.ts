// Dashboard Principal - Versão Simplificada (apenas usuários cadastrados)
import { authSystem } from '../contexts/AuthSystem';
import UsersListComponent from './UsersList';

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

class DashboardComponent {
  private user: User | null = null;
  private isLoading = true;
  private usersListComponent: UsersListComponent | null = null;

  constructor(private container: HTMLElement) {
    this.init();
  }

  private async init(): Promise<void> {
    // Verificar autenticação antes de tudo
    if (!this.verifyAuthentication()) {
      return;
    }
    
    await this.loadUserData();
    this.render();
    this.attachEventListeners();
  }

  private verifyAuthentication(): boolean {
    // Usar authSystem importado corretamente
    const authState = authSystem.getState();
    
    console.log('🔐 Verificando autenticação no Dashboard:', authState);
    
    if (!authState.isAuthenticated || !authState.user) {
      console.log('❌ Usuário não autenticado tentando acessar Dashboard');
      
      this.container.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #f8fafc;
          color: #64748b;
          text-align: center;
          padding: 2rem;
        ">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
          <h2 style="color: #1e293b; margin-bottom: 1rem;">Acesso Restrito</h2>
          <p style="margin-bottom: 2rem; max-width: 400px;">
            Você precisa estar logado para acessar o dashboard.
          </p>
          <button onclick="window.location.hash = '#/login'" style="
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 500;
          ">
            Fazer Login
          </button>
        </div>
      `;
      
      return false;
    }

    this.user = authState.user;
    return true;
  }

  private async loadUserData(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Simular carregamento (os dados já estão no authSystem)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isLoading = false;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      this.isLoading = false;
    }
  }

  private renderLoadingState(): string {
    return `
      <div class="simplified-dashboard-loading">
        <div class="loading-spinner large"></div>
        <p>Carregando dashboard...</p>
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
      <div class="simplified-dashboard-container">
        <!-- Header Simplificado -->
        <header class="simplified-dashboard-header">
          <div class="header-content">
            <div class="user-welcome">
              <h1>👥 Dashboard de Usuários</h1>
              <p class="user-greeting">
                Olá, <strong>${this.user.user_metadata.first_name}</strong>!
                <span class="user-role ${this.user.role}">
                  ${this.user.role === 'supabase_admin' ? '👑 Admin' : '👤 Usuário'}
                </span>
              </p>
            </div>
            <div class="header-actions">
              <button id="logout-button" class="action-button logout">
                🚪 Sair
              </button>
            </div>
          </div>
        </header>

        <!-- Lista de Usuários -->
        <main class="users-main-content">
          <div id="users-list-container"></div>
        </main>
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
        
        // Fazer logout através do AuthSystem
        await authSystem.logout();
        
        console.log('✅ Logout realizado com sucesso');
        
        // Redirecionar para login
        window.location.hash = '#/login';
        
      } catch (error) {
        console.error('❌ Erro no logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
      }
    }
  }

  private initUsersListComponent(): void {
    const usersContainer = this.container.querySelector('#users-list-container') as HTMLElement;
    
    if (usersContainer && !this.usersListComponent) {
      this.usersListComponent = new UsersListComponent(usersContainer);
    }
  }

  // Método público para atualizar os dados
  public refresh(): void {
    if (this.usersListComponent) {
      this.usersListComponent.refresh();
    }
  }
}

// Função para inicializar o componente
export function initDashboard(containerId: string): void {
  const container = document.getElementById(containerId);
  if (container) {
    new DashboardComponent(container);
  } else {
    console.error('Container do dashboard não encontrado:', containerId);
  }
}

export default DashboardComponent;
