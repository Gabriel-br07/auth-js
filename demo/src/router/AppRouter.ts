// Sistema de Rotas Integrado
import { authSystem } from '../contexts/AuthSystem';
import { initLogin } from '../components/Login';
import { initSignUp } from '../components/SignUp';
import { initHome } from '../components/Home';
import { initDashboard } from '../components/Dashboard';
import { initAdminPanel } from '../components/AdminPanel';

interface Route {
  path: string;
  component: (container: HTMLElement) => void;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  title?: string;
}

class AppRouter {
  private routes: Route[] = [];
  private currentPath = '/';
  private container: HTMLElement;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
    this.setupRoutes();
    this.init();
  }

  private setupRoutes(): void {
    this.routes = [
      {
        path: '/',
        component: (container: HTMLElement) => {
          // Redirecionar baseado na autenticação
          const authState = authSystem.getState();
          if (authState.isAuthenticated) {
            this.navigate('/home');
          } else {
            this.navigate('/login');
          }
        },
        title: 'Home'
      },
      {
        path: '/login',
        component: (container: HTMLElement) => {
          container.innerHTML = `
            <link rel="stylesheet" href="/src/styles/auth.css">
            <div id="login-container"></div>
          `;
          initLogin('login-container');
        },
        title: 'Login'
      },
      {
        path: '/signup',
        component: (container: HTMLElement) => {
          container.innerHTML = `
            <link rel="stylesheet" href="/src/styles/auth.css">
            <div id="signup-container"></div>
          `;
          initSignUp('signup-container');
        },
        title: 'Cadastro'
      },
      {
        path: '/home',
        component: (container: HTMLElement) => {
          container.innerHTML = `
            <link rel="stylesheet" href="/src/styles/auth.css">
            <div id="home-container"></div>
          `;
          initHome('home-container');
        },
        requiresAuth: true,
        title: 'Home - AuthFlow Enterprise'
      },
      {
        path: '/dashboard',
        component: (container: HTMLElement) => {
          container.innerHTML = `
            <link rel="stylesheet" href="/src/styles/auth.css">
            <div id="dashboard-container"></div>
          `;
          initDashboard('dashboard-container');
        },
        requiresAuth: true,
        title: 'Dashboard'
      },
      {
        path: '/admin',
        component: (container: HTMLElement) => {
          container.innerHTML = `
            <link rel="stylesheet" href="/src/styles/auth.css">
            <div id="admin-container"></div>
          `;
          initAdminPanel('admin-container');
        },
        requiresAuth: true,
        requiresAdmin: true,
        title: 'Painel Admin'
      },
      {
        path: '/callback',
        component: (container: HTMLElement) => {
          container.innerHTML = `
            <div class="callback-loading">
              <div class="loading-spinner large"></div>
              <p>Processando autenticação...</p>
            </div>
          `;
          // O sistema de auth vai processar automaticamente
        },
        title: 'Callback'
      }
    ];
  }

  private async checkAuth(route: Route): Promise<boolean> {
    const authState = authSystem.getState();
    
    console.log('🔐 Verificando autenticação para rota:', {
      path: route.path,
      requiresAuth: route.requiresAuth,
      requiresAdmin: route.requiresAdmin,
      isAuthenticated: authState.isAuthenticated,
      userRole: authState.user?.role,
      hasToken: !!authState.tokens?.access_token
    });
    
    // Se a rota requer autenticação
    if (route.requiresAuth) {
      // Verificar se está autenticado
      if (!authState.isAuthenticated) {
        console.log('❌ Usuário não autenticado, redirecionando para login');
        this.navigate('/login');
        return false;
      }
      
      // Verificar se tem token válido
      if (!authState.tokens?.access_token) {
        console.log('❌ Token de acesso não encontrado, redirecionando para login');
        await authSystem.logout();
        this.navigate('/login');
        return false;
      }
      
      // Para rotas administrativas, verificar role
      if (route.requiresAdmin && authState.user?.role !== 'supabase_admin') {
        console.log('❌ Usuário não é admin, redirecionando para home');
        this.navigate('/home');
        return false;
      }
      
      console.log('✅ Autenticação válida para rota protegida');
    }
    
    return true;
  }

  private isTokenExpired(tokens: any): boolean {
    if (!tokens.access_token) return true;
    
    try {
      // Decodificar o JWT para verificar expiração
      const payload = JSON.parse(atob(tokens.access_token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('⏰ Token JWT expirado');
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('❌ Erro ao verificar expiração do token:', error);
      return true; // Tratar erro como token inválido
    }
  }

  private showAccessDenied(): void {
    // Mostrar mensagem temporária de acesso negado
    const tempMsg = document.createElement('div');
    tempMsg.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-family: var(--font-family);
      ">
        🚫 Acesso negado: Privilégios de administrador necessários
      </div>
    `;
    
    document.body.appendChild(tempMsg);
    
    setTimeout(() => {
      document.body.removeChild(tempMsg);
    }, 4000);
  }

  async navigate(path: string, addToHistory = true): Promise<void> {
    console.log('🧭 Navegando para:', path);
    
    const route = this.routes.find(r => r.path === path);
    
    if (!route) {
      console.warn(`❌ Rota não encontrada: ${path}. Redirecionando para home.`);
      this.navigate('/');
      return;
    }

    // Verificar autenticação antes de navegar
    const isAuthorized = await this.checkAuth(route);
    if (!isAuthorized) {
      console.log('🔒 Navegação bloqueada por falha na autenticação');
      return;
    }

    this.currentPath = path;
    
    if (addToHistory && window.location.pathname !== path) {
      window.history.pushState({}, route.title || '', path);
    }

    // Update page title
    document.title = route.title ? `${route.title} - Auth Demo` : 'Auth Demo';

    // Clear container and render component
    this.container.innerHTML = '<div class="loading-spinner large"></div>';
    
    try {
      // Verificar novamente antes de renderizar (segurança adicional)
      if (route.requiresAuth || route.requiresAdmin) {
        const authState = authSystem.getState();
        if (!authState.isAuthenticated || (route.requiresAdmin && authState.user?.role !== 'supabase_admin')) {
          console.log('🚫 Verificação final falhou, bloqueando renderização');
          this.navigate('/login');
          return;
        }
      }
      
      route.component(this.container);
      console.log('✅ Componente renderizado com sucesso para:', path);
    } catch (error) {
      console.error('❌ Erro ao renderizar componente:', error);
      this.container.innerHTML = `
        <div class="error-message" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
          padding: 2rem;
        ">
          <h2 style="color: var(--error-color); margin-bottom: 1rem;">Erro ao carregar página</h2>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Ocorreu um erro ao carregar esta página.</p>
          <button onclick="location.reload()" class="btn-primary" style="
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius);
            cursor: pointer;
            font-weight: 600;
          ">Recarregar Página</button>
        </div>
      `;
    }
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  private init(): void {
    // Listen for browser back/forward
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });

    // Listen for auth state changes
    authSystem.onAuthStateChange((state: any) => {
      console.log('🔄 Router recebeu mudança de estado de auth:', { 
        isAuthenticated: state.isAuthenticated, 
        redirectTo: state.redirectTo,
        currentPath: this.currentPath 
      });
      
      // Update global auth state for route checks
      (window as any).__authState = state;
      
      // Handle redirects based on auth state
      if (state.redirectTo) {
        console.log('📍 Router redirecionando para:', state.redirectTo);
        this.navigate(state.redirectTo);
        
        // Limpar o redirectTo após processar
        setTimeout(() => {
          authSystem.clearRedirect();
        }, 100);
        return;
      }
      
      // If user logged out, redirect to login
      if (!state.isAuthenticated && this.currentPath !== '/login' && this.currentPath !== '/signup') {
        console.log('🔓 Usuário não autenticado, redirecionando para login');
        this.navigate('/login');
      }
      
      // If user is on login/signup but is authenticated, redirect to home
      if (state.isAuthenticated && (this.currentPath === '/login' || this.currentPath === '/signup' || this.currentPath === '/')) {
        console.log('🔐 Usuário autenticado, redirecionando para home');
        this.navigate('/home');
      }
    });

    // Start routing
    const initialPath = window.location.pathname;
    console.log('🚀 Inicializando router com path:', initialPath);
    
    // Verificar se é uma tentativa de acesso direto a rota protegida
    this.checkDirectUrlAccess(initialPath);
    
    this.navigate(initialPath, false);
  }

  private checkDirectUrlAccess(path: string): void {
    const route = this.routes.find(r => r.path === path);
    
    if (route && route.requiresAuth) {
      const authState = authSystem.getState();
      
      console.log('🔐 Verificando acesso direto à rota protegida:', {
        path: path,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading
      });
      
      // Se não está autenticado e não está carregando, bloquear acesso
      if (!authState.isAuthenticated && !authState.isLoading) {
        console.log('🚫 Acesso direto negado à rota protegida, redirecionando para login');
        window.history.replaceState({}, '', '/login');
        this.showAccessDeniedMessage();
      }
    }
  }

  private showAccessDeniedMessage(): void {
    // Mostrar mensagem de acesso negado
    const tempMsg = document.createElement('div');
    tempMsg.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #dc2626;
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-family: var(--font-family);
        text-align: center;
      ">
        🔒 Faça login para acessar esta página
      </div>
    `;
    
    document.body.appendChild(tempMsg);
    
    setTimeout(() => {
      if (document.body.contains(tempMsg)) {
        document.body.removeChild(tempMsg);
      }
    }, 4000);
  }
}

// Export router instance
let router: AppRouter | null = null;

export function initRouter(containerId: string): AppRouter {
  if (!router) {
    router = new AppRouter(containerId);
  }
  return router;
}

export function getRouter(): AppRouter {
  if (!router) {
    throw new Error('Router not initialized');
  }
  return router;
}
