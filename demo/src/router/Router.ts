// Sistema de Rotas e Proteção
import { authSystem } from '../contexts/AuthSystem';
import { initLogin } from '../components/Login';
import { initSignUp } from '../components/SignUp';
import { initDashboard } from '../components/Dashboard';
import { initAdminPanel } from '../components/AdminPanel';

interface Route {
  path: string;
  component: (container: HTMLElement) => void;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  title?: string;
}

class Router {
  private routes: Route[] = [];
  private currentPath = '/';
  private isAuthenticated = false;
  private isAdmin = false;

  constructor() {
    this.setupRoutes();
    this.init();
  }

  private setupRoutes(): void {
    this.routes = [
      {
        path: '/',
        component: () => this.renderHome(),
        title: 'Home - Auth Demo'
      },
      {
        path: '/login',
        component: () => this.renderLogin(),
        title: 'Login - Auth Demo'
      },
      {
        path: '/signup',
        component: () => this.renderSignUp(),
        title: 'Cadastro - Auth Demo'
      },
      {
        path: '/dashboard',
        component: () => this.renderDashboard(),
        requiresAuth: true,
        title: 'Dashboard - Auth Demo'
      },
      {
        path: '/admin',
        component: () => this.renderAdmin(),
        requiresAuth: true,
        requiresAdmin: true,
        title: 'Admin Panel - Auth Demo'
      },
      {
        path: '/callback',
        component: () => this.renderCallback(),
        title: 'Callback - Auth Demo'
      }
    ];
  }

  private init(): void {
    // Listener para mudanças de URL
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });

    // Carregar estado de autenticação
    this.loadAuthState();
    
    // Navegar para a rota atual
    this.navigate(window.location.pathname, false);
  }

  private loadAuthState(): void {
    // Simular carregamento do estado de autenticação
    const accessToken = localStorage.getItem('auth_access_token');
    const user = localStorage.getItem('auth_user');
    
    this.isAuthenticated = !!(accessToken && user);
    
    if (this.isAuthenticated && user) {
      try {
        const userData = JSON.parse(user);
        this.isAdmin = userData.role === 'supabase_admin';
      } catch {
        this.isAuthenticated = false;
        this.isAdmin = false;
      }
    }
  }

  public navigate(path: string, addToHistory = true): void {
    this.currentPath = path;
    
    if (addToHistory) {
      window.history.pushState({}, '', path);
    }

    const route = this.findRoute(path);
    
    if (!route) {
      this.render404();
      return;
    }

    // Verificar autenticação
    if (route.requiresAuth && !this.isAuthenticated) {
      this.navigate('/login');
      return;
    }

    // Verificar permissão de admin
    if (route.requiresAdmin && !this.isAdmin) {
      this.renderUnauthorized();
      return;
    }

    // Atualizar título da página
    if (route.title) {
      document.title = route.title;
    }

    // Renderizar componente
    route.component();
  }

  private findRoute(path: string): Route | undefined {
    return this.routes.find(route => route.path === path);
  }

  private renderHome(): void {
    const container = document.getElementById('app')!;
    
    if (this.isAuthenticated) {
      this.navigate('/dashboard');
      return;
    }

    container.innerHTML = `
      <div class="home-container">
        <div class="home-content">
          <div class="home-header">
            <h1>Sistema de Autenticação</h1>
            <p>Demo completo com cadastro, login e painel administrativo</p>
          </div>
          
          <div class="home-features">
            <div class="feature">
              <div class="feature-icon">🔐</div>
              <h3>Autenticação Segura</h3>
              <p>Login com email/senha e OAuth (Google, GitHub)</p>
            </div>
            <div class="feature">
              <div class="feature-icon">👥</div>
              <h3>Gerenciamento de Usuários</h3>
              <p>Painel administrativo para gerenciar usuários</p>
            </div>
            <div class="feature">
              <div class="feature-icon">🛡️</div>
              <h3>Proteção de Rotas</h3>
              <p>Sistema de rotas protegidas por autenticação</p>
            </div>
          </div>
          
          <div class="home-actions">
            <button onclick="router.navigate('/login')" class="btn-primary">
              Fazer Login
            </button>
            <button onclick="router.navigate('/signup')" class="btn-secondary">
              Criar Conta
            </button>
          </div>
        </div>
      </div>
    `;

    this.addHomeStyles();
  }

  private addHomeStyles(): void {
    if (document.querySelector('#home-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'home-styles';
    styles.textContent = `
      .home-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .home-content {
        max-width: 600px;
        text-align: center;
        color: white;
      }
      
      .home-header h1 {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 16px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .home-header p {
        font-size: 20px;
        opacity: 0.9;
        margin-bottom: 48px;
      }
      
      .home-features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 32px;
        margin-bottom: 48px;
      }
      
      .feature {
        background: rgba(255,255,255,0.1);
        padding: 24px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
      }
      
      .feature-icon {
        font-size: 32px;
        margin-bottom: 16px;
      }
      
      .feature h3 {
        font-size: 18px;
        margin-bottom: 12px;
      }
      
      .feature p {
        font-size: 14px;
        opacity: 0.8;
      }
      
      .home-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .home-actions .btn-primary,
      .home-actions .btn-secondary {
        min-width: 140px;
      }
    `;
    
    document.head.appendChild(styles);
  }

  private renderLogin(): void {
    const container = document.getElementById('app')!;
    container.innerHTML = `<div id="login-container"></div>`;
    
    // Importar e inicializar componente de login
    import('./components/Login.js').then(({ initLogin }) => {
      initLogin('login-container');
    }).catch(() => {
      // Fallback se o módulo não carregar
      container.innerHTML = `
        <div class="error-container">
          <h2>Erro ao carregar página</h2>
          <p>Não foi possível carregar o componente de login.</p>
          <button onclick="router.navigate('/')" class="btn-primary">
            Voltar ao Início
          </button>
        </div>
      `;
    });
  }

  private renderSignUp(): void {
    const container = document.getElementById('app')!;
    container.innerHTML = `<div id="signup-container"></div>`;
    
    // Importar e inicializar componente de cadastro
    import('./components/SignUp.js').then(({ initSignUp }) => {
      initSignUp('signup-container');
    }).catch(() => {
      // Fallback se o módulo não carregar
      container.innerHTML = `
        <div class="error-container">
          <h2>Erro ao carregar página</h2>
          <p>Não foi possível carregar o componente de cadastro.</p>
          <button onclick="router.navigate('/')" class="btn-primary">
            Voltar ao Início
          </button>
        </div>
      `;
    });
  }

  private renderDashboard(): void {
    const container = document.getElementById('app')!;
    container.innerHTML = `<div id="dashboard-container"></div>`;
    
    // Importar e inicializar dashboard
    import('./components/Dashboard.js').then(({ initDashboard }) => {
      initDashboard('dashboard-container');
    }).catch(() => {
      // Fallback se o módulo não carregar
      container.innerHTML = `
        <div class="error-container">
          <h2>Erro ao carregar dashboard</h2>
          <p>Não foi possível carregar o dashboard.</p>
          <button onclick="router.navigate('/')" class="btn-primary">
            Voltar ao Início
          </button>
        </div>
      `;
    });
  }

  private renderAdmin(): void {
    const container = document.getElementById('app')!;
    container.innerHTML = `<div id="admin-container"></div>`;
    
    // Importar e inicializar painel admin
    import('./components/AdminPanel.js').then(({ initAdminPanel }) => {
      initAdminPanel('admin-container');
    }).catch(() => {
      // Fallback se o módulo não carregar
      container.innerHTML = `
        <div class="error-container">
          <h2>Erro ao carregar painel administrativo</h2>
          <p>Não foi possível carregar o painel de administração.</p>
          <button onclick="router.navigate('/dashboard')" class="btn-primary">
            Voltar ao Dashboard
          </button>
        </div>
      `;
    });
  }

  private renderCallback(): void {
    const container = document.getElementById('app')!;
    container.innerHTML = `
      <div class="callback-container">
        <div class="callback-content">
          <div class="loading-spinner large"></div>
          <h2>Processando autenticação...</h2>
          <p>Aguarde enquanto finalizamos seu login.</p>
        </div>
      </div>
    `;

    this.addCallbackStyles();

    // Simular processamento de callback
    setTimeout(() => {
      // Aqui seria processado o callback OAuth real
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        container.innerHTML = `
          <div class="callback-container">
            <div class="callback-content error">
              <div class="error-icon">✕</div>
              <h2>Erro na autenticação</h2>
              <p>${error}</p>
              <button onclick="router.navigate('/login')" class="btn-primary">
                Tentar Novamente
              </button>
            </div>
          </div>
        `;
        return;
      }

      if (code) {
        // Simular sucesso na autenticação
        this.isAuthenticated = true;
        this.navigate('/dashboard');
      } else {
        this.navigate('/login');
      }
    }, 2000);
  }

  private addCallbackStyles(): void {
    if (document.querySelector('#callback-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'callback-styles';
    styles.textContent = `
      .callback-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--background);
      }
      
      .callback-content {
        text-align: center;
        padding: 48px;
        background: var(--surface);
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        max-width: 400px;
      }
      
      .callback-content h2 {
        margin: 24px 0 12px;
        font-size: 24px;
      }
      
      .callback-content p {
        color: var(--text-secondary);
        margin-bottom: 24px;
      }
      
      .callback-content.error {
        border: 2px solid var(--error-color);
      }
      
      .error-icon {
        font-size: 48px;
        color: var(--error-color);
        margin-bottom: 16px;
      }
    `;
    
    document.head.appendChild(styles);
  }

  private renderUnauthorized(): void {
    const container = document.getElementById('app')!;
    container.innerHTML = `
      <div class="error-container">
        <div class="error-content">
          <div class="error-icon">🚫</div>
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
          <div class="error-actions">
            <button onclick="router.navigate('/dashboard')" class="btn-primary">
              Voltar ao Dashboard
            </button>
            <button onclick="router.logout()" class="btn-secondary">
              Fazer Logout
            </button>
          </div>
        </div>
      </div>
    `;

    this.addErrorStyles();
  }

  private render404(): void {
    const container = document.getElementById('app')!;
    container.innerHTML = `
      <div class="error-container">
        <div class="error-content">
          <div class="error-icon">🔍</div>
          <h2>Página não encontrada</h2>
          <p>A página que você está procurando não existe.</p>
          <div class="error-actions">
            <button onclick="router.navigate('/')" class="btn-primary">
              Voltar ao Início
            </button>
            ${this.isAuthenticated ? `
              <button onclick="router.navigate('/dashboard')" class="btn-secondary">
                Ir para Dashboard
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    this.addErrorStyles();
  }

  private addErrorStyles(): void {
    if (document.querySelector('#error-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'error-styles';
    styles.textContent = `
      .error-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--background);
        padding: 24px;
      }
      
      .error-content {
        text-align: center;
        padding: 48px;
        background: var(--surface);
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        max-width: 500px;
      }
      
      .error-content .error-icon {
        font-size: 64px;
        margin-bottom: 24px;
        display: block;
      }
      
      .error-content h2 {
        font-size: 28px;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
      
      .error-content p {
        color: var(--text-secondary);
        margin-bottom: 32px;
        font-size: 16px;
      }
      
      .error-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .error-actions .btn-primary,
      .error-actions .btn-secondary {
        min-width: 140px;
      }
    `;
    
    document.head.appendChild(styles);
  }

  public logout(): void {
    // Limpar dados de autenticação
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');
    
    this.isAuthenticated = false;
    this.isAdmin = false;
    
    // Redirecionar para home
    this.navigate('/');
  }

  public login(): void {
    // Atualizar estado de autenticação
    this.loadAuthState();
    
    // Redirecionar para dashboard
    this.navigate('/dashboard');
  }
}

// Inicializar router global
const router = new Router();

// Exportar router para uso global
(window as any).router = router;

export { Router };
