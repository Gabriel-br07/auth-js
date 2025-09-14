// Painel Administrativo
interface AdminUser {
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
  sign_in_count?: number;
  confirmed_at?: string;
  banned_until?: string;
}

class AdminPanelComponent {
  private users: AdminUser[] = [];
  private filteredUsers: AdminUser[] = [];
  private isLoading = true;
  private currentFilter = 'all';
  private searchTerm = '';
  private editingUser: AdminUser | null = null;

  constructor(private container: HTMLElement) {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadUsers();
    this.render();
    this.attachEventListeners();
  }

  private async loadUsers(): Promise<void> {
    try {
      // Simular carregamento de usuários da API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Dados simulados
      this.users = [
        {
          id: 'user_1',
          email: 'admin@exemplo.com',
          role: 'supabase_admin',
          user_metadata: {
            first_name: 'João',
            last_name: 'Admin',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
          },
          app_metadata: {
            provider: 'email',
            providers: ['email']
          },
          created_at: '2024-01-15T10:30:00Z',
          last_sign_in_at: new Date().toISOString(),
          sign_in_count: 145,
          confirmed_at: '2024-01-15T10:35:00Z'
        },
        {
          id: 'user_2',
          email: 'maria@exemplo.com',
          role: 'authenticated',
          user_metadata: {
            first_name: 'Maria',
            last_name: 'Silva'
          },
          app_metadata: {
            provider: 'google',
            providers: ['google', 'email']
          },
          created_at: '2024-02-20T14:15:00Z',
          last_sign_in_at: '2024-09-10T09:20:00Z',
          sign_in_count: 23,
          confirmed_at: '2024-02-20T14:15:00Z'
        },
        {
          id: 'user_3',
          email: 'carlos@exemplo.com',
          role: 'authenticated',
          user_metadata: {
            first_name: 'Carlos',
            last_name: 'Santos'
          },
          app_metadata: {
            provider: 'github',
            providers: ['github']
          },
          created_at: '2024-03-10T16:45:00Z',
          last_sign_in_at: '2024-09-08T11:30:00Z',
          sign_in_count: 67,
          confirmed_at: '2024-03-10T16:45:00Z'
        },
        {
          id: 'user_4',
          email: 'ana@exemplo.com',
          role: 'authenticated',
          user_metadata: {
            first_name: 'Ana',
            last_name: 'Costa'
          },
          app_metadata: {
            provider: 'email',
            providers: ['email']
          },
          created_at: '2024-08-25T08:20:00Z',
          last_sign_in_at: undefined,
          sign_in_count: 0,
          confirmed_at: undefined
        }
      ];

      this.filteredUsers = [...this.users];
      this.isLoading = false;
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      this.isLoading = false;
    }
  }

  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Nunca';
    
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  private filterUsers(): void {
    let filtered = [...this.users];

    // Filtro por role
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(user => user.role === this.currentFilter);
    }

    // Filtro por busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(term) ||
        user.user_metadata.first_name.toLowerCase().includes(term) ||
        user.user_metadata.last_name.toLowerCase().includes(term)
      );
    }

    this.filteredUsers = filtered;
    this.updateUsersTable();
    this.updateStats();
  }

  private updateStats(): void {
    const totalUsers = this.users.length;
    const admins = this.users.filter(u => u.role === 'supabase_admin').length;
    const activeUsers = this.users.filter(u => u.confirmed_at && !u.banned_until).length;
    const recentSignIns = this.users.filter(u => {
      if (!u.last_sign_in_at) return false;
      const lastSignIn = new Date(u.last_sign_in_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastSignIn > weekAgo;
    }).length;

    // Atualizar elementos na interface
    this.updateStatElement('total-users', totalUsers.toString());
    this.updateStatElement('admin-users', admins.toString());
    this.updateStatElement('active-users', activeUsers.toString());
    this.updateStatElement('recent-signins', recentSignIns.toString());
  }

  private updateStatElement(id: string, value: string): void {
    const element = this.container.querySelector(`#${id}`);
    if (element) {
      element.textContent = value;
    }
  }

  private async updateUserRole(userId: string, newRole: 'authenticated' | 'supabase_admin'): Promise<void> {
    try {
      console.log(`Atualizando role do usuário ${userId} para ${newRole}`);
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Atualizar localmente
      const userIndex = this.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        this.users[userIndex].role = newRole;
        this.filterUsers(); // Reaplica filtros e atualiza interface
        
        this.showNotification(`Role atualizada para ${newRole}`, 'success');
      }
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      this.showNotification('Erro ao atualizar role do usuário', 'error');
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  private openEditModal(user: AdminUser): void {
    this.editingUser = user;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Editar Usuário</h3>
          <button class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="user-info-header">
            <div class="user-avatar">
              ${user.user_metadata.avatar_url 
                ? `<img src="${user.user_metadata.avatar_url}" alt="Avatar">`
                : `<div class="avatar-initials">${this.getInitials(user.user_metadata.first_name, user.user_metadata.last_name)}</div>`
              }
            </div>
            <div>
              <h4>${user.user_metadata.first_name} ${user.user_metadata.last_name}</h4>
              <p>${user.email}</p>
            </div>
          </div>

          <div class="form-group">
            <label>Role do Usuário</label>
            <select id="user-role-select">
              <option value="authenticated" ${user.role === 'authenticated' ? 'selected' : ''}>
                👤 Usuário
              </option>
              <option value="supabase_admin" ${user.role === 'supabase_admin' ? 'selected' : ''}>
                🛡️ Administrador
              </option>
            </select>
          </div>

          <div class="user-details">
            <div class="detail-row">
              <strong>ID:</strong>
              <span>${user.id}</span>
            </div>
            <div class="detail-row">
              <strong>Criado em:</strong>
              <span>${this.formatDate(user.created_at)}</span>
            </div>
            <div class="detail-row">
              <strong>Último acesso:</strong>
              <span>${this.formatDate(user.last_sign_in_at)}</span>
            </div>
            <div class="detail-row">
              <strong>Logins:</strong>
              <span>${user.sign_in_count || 0}</span>
            </div>
            <div class="detail-row">
              <strong>Provider:</strong>
              <span>${user.app_metadata?.provider || 'email'}</span>
            </div>
            <div class="detail-row">
              <strong>Status:</strong>
              <span class="status-badge ${user.confirmed_at ? 'confirmed' : 'pending'}">
                ${user.confirmed_at ? '✓ Confirmado' : '⏳ Pendente'}
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary modal-close">Cancelar</button>
          <button id="save-user-changes" class="btn-primary">Salvar Alterações</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners do modal
    const closeButtons = modal.querySelectorAll('.modal-close');
    const saveButton = modal.querySelector('#save-user-changes');

    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.remove();
        this.editingUser = null;
      });
    });

    saveButton?.addEventListener('click', async () => {
      const roleSelect = modal.querySelector('#user-role-select') as HTMLSelectElement;
      const newRole = roleSelect.value as 'authenticated' | 'supabase_admin';

      if (newRole !== user.role) {
        await this.updateUserRole(user.id, newRole);
      }

      modal.remove();
      this.editingUser = null;
    });

    // Fechar modal clicando fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        this.editingUser = null;
      }
    });
  }

  private updateUsersTable(): void {
    const tbody = this.container.querySelector('#users-table-body');
    if (!tbody) return;

    if (this.filteredUsers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="no-users">
            ${this.searchTerm || this.currentFilter !== 'all' ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredUsers.map(user => `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar">
              ${user.user_metadata.avatar_url 
                ? `<img src="${user.user_metadata.avatar_url}" alt="Avatar">`
                : `<div class="avatar-initials">${this.getInitials(user.user_metadata.first_name, user.user_metadata.last_name)}</div>`
              }
            </div>
            <div class="user-info">
              <div class="user-name">${user.user_metadata.first_name} ${user.user_metadata.last_name}</div>
              <div class="user-email">${user.email}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="role-badge ${user.role}">
            ${user.role === 'supabase_admin' ? '🛡️ Admin' : '👤 User'}
          </span>
        </td>
        <td>
          <span class="provider-badge">${user.app_metadata?.provider || 'email'}</span>
        </td>
        <td>${this.formatDate(user.created_at)}</td>
        <td>${this.formatDate(user.last_sign_in_at)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon edit" onclick="window.adminPanel.openEdit('${user.id}')" title="Editar usuário">
              ✏️
            </button>
            <button class="btn-icon ${user.confirmed_at ? 'confirmed' : 'pending'}" title="${user.confirmed_at ? 'Usuário confirmado' : 'Usuário pendente'}">
              ${user.confirmed_at ? '✓' : '⏳'}
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Expor método para os botões inline
    (window as any).adminPanel = {
      openEdit: (userId: string) => {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          this.openEditModal(user);
        }
      }
    };
  }

  private attachEventListeners(): void {
    // Filtros de role
    const roleFilters = this.container.querySelectorAll('.filter-button');
    roleFilters.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const filter = target.dataset.filter || 'all';
        
        // Atualizar botões ativos
        roleFilters.forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        
        this.currentFilter = filter;
        this.filterUsers();
      });
    });

    // Campo de busca
    const searchInput = this.container.querySelector('#user-search') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      this.searchTerm = (e.target as HTMLInputElement).value;
      this.filterUsers();
    });

    // Botão de refresh
    const refreshButton = this.container.querySelector('#refresh-users');
    refreshButton?.addEventListener('click', async () => {
      this.isLoading = true;
      this.render();
      await this.loadUsers();
      this.render();
    });

    // Botão voltar
    const backButton = this.container.querySelector('#back-to-dashboard');
    backButton?.addEventListener('click', () => {
      console.log('Voltando para o dashboard...');
      // Em produção: window.location.href = '/dashboard';
    });
  }

  private render(): void {
    if (this.isLoading) {
      this.container.innerHTML = `
        <div class="admin-loading">
          <div class="loading-spinner large"></div>
          <p>Carregando usuários...</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="admin-container">
        <!-- Header -->
        <header class="admin-header">
          <div class="header-content">
            <div class="header-left">
              <button id="back-to-dashboard" class="btn-back">
                ← Dashboard
              </button>
              <h1>Painel Administrativo</h1>
            </div>
            <div class="header-actions">
              <button id="refresh-users" class="btn-secondary">
                🔄 Atualizar
              </button>
            </div>
          </div>
        </header>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>Total de Usuários</h3>
              <span class="stat-number" id="total-users">0</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🛡️</div>
            <div class="stat-content">
              <h3>Administradores</h3>
              <span class="stat-number" id="admin-users">0</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>Usuários Ativos</h3>
              <span class="stat-number" id="active-users">0</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🕐</div>
            <div class="stat-content">
              <h3>Logins (7 dias)</h3>
              <span class="stat-number" id="recent-signins">0</span>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="admin-controls">
          <div class="filter-section">
            <h3>Filtros</h3>
            <div class="filter-buttons">
              <button class="filter-button active" data-filter="all">
                Todos (${this.users.length})
              </button>
              <button class="filter-button" data-filter="authenticated">
                👤 Usuários (${this.users.filter(u => u.role === 'authenticated').length})
              </button>
              <button class="filter-button" data-filter="supabase_admin">
                🛡️ Admins (${this.users.filter(u => u.role === 'supabase_admin').length})
              </button>
            </div>
          </div>

          <div class="search-section">
            <input 
              type="text" 
              id="user-search" 
              placeholder="Buscar por nome ou email..."
              class="search-input"
            >
          </div>
        </div>

        <!-- Users Table -->
        <div class="users-section">
          <div class="table-header">
            <h3>Usuários (${this.filteredUsers.length})</h3>
          </div>
          
          <div class="table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Role</th>
                  <th>Provider</th>
                  <th>Criado em</th>
                  <th>Último acesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody id="users-table-body">
                <!-- Conteúdo será inserido dinamicamente -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.updateUsersTable();
    this.updateStats();
    this.attachEventListeners();
  }
}

// Função para inicializar o componente
export function initAdminPanel(containerId: string): void {
  const container = document.getElementById(containerId);
  if (container) {
    new AdminPanelComponent(container);
  }
}
