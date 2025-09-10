import { AuthClient } from '@supabase/auth-js'
import { Provider, Session, User, AuthChangeEvent } from '@supabase/auth-js'

// Configuração do cliente de autenticação
const AUTH_URL = 'http://localhost:9999'

interface AuthConfig {
  url: string;
  autoRefreshToken?: boolean;
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
}

class AuthDemo {
  private client: InstanceType<typeof AuthClient>
  private statusElement: HTMLElement
  private userInfoElement: HTMLElement
  private logoutButton: HTMLElement

  constructor() {
    const config: AuthConfig = {
      url: AUTH_URL,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }

    this.client = new AuthClient(config)
    
    // Elementos DOM
    this.statusElement = document.getElementById('status')!
    this.userInfoElement = document.getElementById('userInfo')!
    this.logoutButton = document.getElementById('logoutBtn')!

    this.init()
  }

  private async init(): Promise<void> {
    try {
      // Escutar mudanças de autenticação
      this.client.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session)
        this.handleAuthStateChange(event, session)
      })

      // Verificar sessão existente
      const { data: { session } } = await this.client.getSession()
      if (session) {
        this.showUserInfo(session.user)
      }

      // Configurar event listeners
      this.setupEventListeners()

      // Processar callback OAuth se presente na URL
      await this.handleOAuthCallback()

      this.showStatus('Pronto para autenticação', 'success')
    } catch (error) {
      console.error('Erro na inicialização:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.showStatus(`Erro na inicialização: ${errorMessage}`, 'error')
    }
  }

  private setupEventListeners(): void {
    // Botões OAuth
    const oauthButtons = document.querySelectorAll('.oauth-btn')
    oauthButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const provider = (e.currentTarget as HTMLElement).dataset.provider as Provider
        await this.signInWithOAuth(provider)
      })
    })

    // Botão de logout
    this.logoutButton.addEventListener('click', () => this.signOut())
  }

  private async signInWithOAuth(provider: Provider): Promise<void> {
    try {
      this.showStatus(`Iniciando autenticação com ${provider}...`, 'loading')

      const { data, error } = await this.client.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + window.location.pathname,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        throw error
      }

      // O redirecionamento acontecerá automaticamente
      this.showStatus(`Redirecionando para ${provider}...`, 'loading')
    } catch (error) {
      console.error('Erro no OAuth:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no OAuth'
      this.showStatus(`Erro no OAuth: ${errorMessage}`, 'error')
    }
  }

  private async handleOAuthCallback(): Promise<void> {
    try {
      // Verificar se há parâmetros de callback na URL
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        throw new Error(`Erro OAuth: ${error}`)
      }

      if (code) {
        this.showStatus('Processando callback OAuth...', 'loading')
        
        const { data, error: sessionError } = await this.client.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (data.session) {
          this.showUserInfo(data.session.user)
          this.showStatus('Autenticação realizada com sucesso!', 'success')
          
          // Limpar URL
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }
    } catch (error) {
      console.error('Erro no callback OAuth:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no callback'
      this.showStatus(`Erro no callback: ${errorMessage}`, 'error')
    }
  }

  private handleAuthStateChange(event: AuthChangeEvent, session: Session | null): void {
    switch (event) {
      case 'SIGNED_IN':
        if (session?.user) {
          this.showUserInfo(session.user)
          this.showStatus('Login realizado com sucesso!', 'success')
        }
        break
      case 'SIGNED_OUT':
        this.hideUserInfo()
        this.showStatus('Logout realizado com sucesso!', 'success')
        break
      case 'TOKEN_REFRESHED':
        console.log('Token atualizado')
        break
    }
  }

  private async signOut(): Promise<void> {
    try {
      this.showStatus('Fazendo logout...', 'loading')
      
      const { error } = await this.client.signOut()
      
      if (error) {
        throw error
      }

      this.hideUserInfo()
      this.showStatus('Logout realizado com sucesso!', 'success')
    } catch (error) {
      console.error('Erro no logout:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no logout'
      this.showStatus(`Erro no logout: ${errorMessage}`, 'error')
    }
  }

  private showUserInfo(user: User): void {
    const emailElement = document.getElementById('userEmail')!
    const providerElement = document.getElementById('userProvider')!

    emailElement.textContent = `Email: ${user.email || 'N/A'}`
    providerElement.textContent = `Provider: ${user.app_metadata?.provider || 'N/A'}`

    this.userInfoElement.style.display = 'block'

    console.log('Dados do usuário:', user)
  }

  private hideUserInfo(): void {
    this.userInfoElement.style.display = 'none'
  }

  private showStatus(message: string, type: 'success' | 'error' | 'loading'): void {
    this.statusElement.textContent = message
    this.statusElement.className = `status ${type}`
    this.statusElement.style.display = 'block'

    // Auto-hide success/error messages after 5 seconds
    if (type !== 'loading') {
      setTimeout(() => {
        this.statusElement.style.display = 'none'
      }, 5000)
    }
  }

  // Métodos públicos para debug
  public async getSession() {
    return await this.client.getSession()
  }

  public async getUser() {
    return await this.client.getUser()
  }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  const authDemo = new AuthDemo()
  
  // Expor para debug no console
  ;(window as any).authDemo = authDemo
})

export { AuthDemo }
