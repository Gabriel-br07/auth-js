// Componente Home - Página principal após login
import { authSystem } from '../contexts/AuthSystem';
import { getRouter } from '../router/AppRouter';

class HomeComponent {
  private user: any = null;

  constructor(private container: HTMLElement) {
    this.verifyAuthentication();
    this.user = authSystem.getUser();
    this.render();
    this.attachEventListeners();
  }

  private verifyAuthentication(): void {
    const authState = authSystem.getState();
    
    console.log('🔐 Verificando autenticação no componente Home:', authState);
    
    if (!authState.isAuthenticated || !authState.user) {
      console.log('❌ Usuário não autenticado tentando acessar Home');
      
      // Redirecionar para login
      import('../router/AppRouter').then(({ getRouter }) => {
        const router = getRouter();
        router.navigate('/login');
      });
      
      // Mostrar mensagem
      this.container.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          font-family: var(--font-family);
        ">
          <div>
            <h2>🔒 Acesso Negado</h2>
            <p>Você precisa fazer login para acessar esta página.</p>
            <div class="loading-spinner large" style="margin: 2rem auto;"></div>
            <p>Redirecionando para login...</p>
          </div>
        </div>
      `;
      return;
    }
  }

  private handleNavigateToDashboard(): void {
    const router = getRouter();
    router.navigate('/dashboard');
  }

  private handleNavigateToAdmin(): void {
    const router = getRouter();
    router.navigate('/admin');
  }

  private async handleLogout(): Promise<void> {
    try {
      await authSystem.logout();
      const router = getRouter();
      router.navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  private attachEventListeners(): void {
    const dashboardBtn = this.container.querySelector('#dashboard-btn') as HTMLButtonElement;
    const adminBtn = this.container.querySelector('#admin-btn') as HTMLButtonElement;
    const logoutBtn = this.container.querySelector('#logout-btn') as HTMLButtonElement;

    dashboardBtn?.addEventListener('click', () => {
      this.handleNavigateToDashboard();
    });

    adminBtn?.addEventListener('click', () => {
      this.handleNavigateToAdmin();
    });

    logoutBtn?.addEventListener('click', () => {
      this.handleLogout();
    });
  }

  private render(): void {
    const isAdmin = this.user?.role === 'supabase_admin';
    const userName = this.user?.user_metadata?.first_name || this.user?.email || 'Usuário';
    const userEmail = this.user?.email || '';

    this.container.innerHTML = `
      <div class="home-container">
        <!-- Header corporativo -->
        <header class="corporate-header">
          <div class="header-content">
            <div class="logo-section">
              <div class="company-logo">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#2563eb"/>
                  <path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2z" fill="white"/>
                </svg>
              </div>
              <div class="company-info">
                <h1>AuthFlow Enterprise</h1>
                <p>Sistema de Autenticação Corporativa</p>
              </div>
            </div>
            <div class="user-section">
              <div class="user-info">
                <div class="user-avatar">
                  ${this.user?.user_metadata?.avatar_url ? 
                    `<img src="${this.user.user_metadata.avatar_url}" alt="Avatar">` :
                    `<div class="avatar-placeholder">${userName.charAt(0).toUpperCase()}</div>`
                  }
                </div>
                <div class="user-details">
                  <span class="user-name">${userName}</span>
                  <span class="user-email">${userEmail}</span>
                  <span class="user-role">${isAdmin ? 'Administrador' : 'Usuário'}</span>
                </div>
              </div>
              <button id="logout-btn" class="logout-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sair
              </button>
            </div>
          </div>
        </header>

        <!-- Conteúdo principal -->
        <main class="home-main">
          <div class="welcome-section">
            <h2>Bem-vindo, ${userName}!</h2>
            <p>Você está conectado ao sistema de autenticação da empresa. Escolha uma das opções abaixo para continuar.</p>
          </div>

          <div class="features-grid">
            <!-- Card Dashboard -->
            <div class="feature-card">
              <div class="feature-icon dashboard-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3>Dashboard do Usuário</h3>
                <p>Visualize suas informações pessoais, preferências e histórico de atividades no sistema.</p>
                <ul class="feature-list">
                  <li>Perfil do usuário</li>
                  <li>Configurações de conta</li>
                  <li>Histórico de acessos</li>
                  <li>Preferências do sistema</li>
                </ul>
              </div>
              <button id="dashboard-btn" class="feature-btn primary">
                Acessar Dashboard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            </div>

            <!-- Card Admin (se for admin) -->
            ${isAdmin ? `
            <div class="feature-card admin-card">
              <div class="feature-icon admin-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <polyline points="17,11 19,13 23,9"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3>Painel Administrativo</h3>
                <p>Gerencie usuários, roles e permissões do sistema de autenticação da empresa.</p>
                <ul class="feature-list">
                  <li>Gerenciar usuários</li>
                  <li>Atribuir roles</li>
                  <li>Monitorar acessos</li>
                  <li>Relatórios de segurança</li>
                </ul>
              </div>
              <button id="admin-btn" class="feature-btn admin">
                Painel Admin
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            </div>
            ` : ''}

            <!-- Card Documentação -->
            <div class="feature-card">
              <div class="feature-icon docs-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3>Documentação</h3>
                <p>Acesse guias, manuais e documentação técnica sobre o sistema de autenticação.</p>
                <ul class="feature-list">
                  <li>Guias de usuário</li>
                  <li>API de autenticação</li>
                  <li>Políticas de segurança</li>
                  <li>Suporte técnico</li>
                </ul>
              </div>
              <button class="feature-btn secondary" onclick="window.open('#', '_blank')">
                Ver Documentação
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Informações da empresa -->
          <div class="company-info-section">
            <div class="info-grid">
              <div class="info-item">
                <h4>Segurança</h4>
                <p>Sistema com criptografia de ponta e autenticação multifator.</p>
              </div>
              <div class="info-item">
                <h4>Compliance</h4>
                <p>Atende aos padrões LGPD, GDPR e normas de segurança corporativa.</p>
              </div>
              <div class="info-item">
                <h4>Suporte 24/7</h4>
                <p>Equipe de suporte técnico disponível para auxiliar os usuários.</p>
              </div>
            </div>
          </div>
        </main>

        <!-- Footer corporativo -->
        <footer class="corporate-footer">
          <div class="footer-content">
            <p>&copy; 2025 AuthFlow Enterprise. Todos os direitos reservados.</p>
            <div class="footer-links">
              <a href="#">Política de Privacidade</a>
              <a href="#">Termos de Uso</a>
              <a href="#">Suporte</a>
            </div>
          </div>
        </footer>
      </div>
    `;
  }
}

// Função para inicializar o componente
export function initHome(containerId: string): void {
  const container = document.getElementById(containerId);
  if (container) {
    new HomeComponent(container);
  }
}
