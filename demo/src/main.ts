// Sistema Completo de Autenticação
import { authSystem } from './contexts/AuthSystem';
import { initRouter } from './router/AppRouter';
import './styles/auth.css';

// Classe principal da aplicação
class AuthApp {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('🚀 Inicializando Sistema de Autenticação...');
      
      // Aguardar o DOM estar pronto
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Inicializar o router
      const router = initRouter('app');
      console.log('✅ Router inicializado');

      // Configurar tratamento global de erros
      this.setupErrorHandling();
      
      // Expor funcionalidades globais para debugging
      this.setupGlobalDebug();

      this.initialized = true;
      console.log('✅ Sistema de Autenticação inicializado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar aplicação:', error);
      this.showFatalError(error as Error);
    }
  }

  private setupErrorHandling(): void {
    // Lidar com erros de autenticação
    authSystem.onError((error) => {
      console.error('Auth Error:', error);
      this.showNotification(error.message, 'error');
    });

    // Lidar com erros globais
    window.addEventListener('error', (event) => {
      console.error('Global Error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    });
  }

  private setupGlobalDebug(): void {
    // Expor para debugging no console
    (window as any).authDebug = {
      authSystem,
      getAuthState: () => authSystem.getState(),
      getUser: () => authSystem.getUser(),
      logout: () => authSystem.logout(),
      login: (email: string, password: string) => authSystem.login({ email, password }),
      signup: (email: string, password: string, firstName: string, lastName: string) => 
        authSystem.signup({ email, password, first_name: firstName, last_name: lastName })
    };

    console.log('🔧 Debug tools available at window.authDebug');
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Remover após 5 segundos
    setTimeout(() => {
      notification.remove();
    }, 5000);

    // Permitir fechar clicando
    notification.addEventListener('click', () => {
      notification.remove();
    });
  }

  private showFatalError(error: Error): void {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="fatal-error">
          <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h1>Erro Fatal</h1>
            <p>Ocorreu um erro ao inicializar a aplicação.</p>
            <details>
              <summary>Detalhes do erro</summary>
              <pre>${error.message}\n${error.stack}</pre>
            </details>
            <button onclick="location.reload()" class="btn-primary">
              Recarregar Página
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Estilos para erro fatal
const fatalErrorStyles = `
  .fatal-error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  .error-container {
    background: white;
    padding: 48px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 500px;
  }
  
  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .error-container h1 {
    color: #dc2626;
    margin-bottom: 16px;
  }
  
  .error-container p {
    color: #6b7280;
    margin-bottom: 24px;
  }
  
  .error-container details {
    text-align: left;
    margin: 24px 0;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
  }
  
  .error-container pre {
    font-size: 12px;
    color: #374151;
    white-space: pre-wrap;
  }
  
  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-primary:hover {
    background: #2563eb;
  }
`;

// Adicionar estilos de erro fatal
const style = document.createElement('style');
style.textContent = fatalErrorStyles;
document.head.appendChild(style);

// Inicializar aplicação
const app = new AuthApp();
app.init();

// Hot Module Replacement (HMR) support para desenvolvimento
if ((import.meta as any).hot) {
  (import.meta as any).hot.accept(() => {
    console.log('🔥 Hot reloading...');
    location.reload();
  });
}
