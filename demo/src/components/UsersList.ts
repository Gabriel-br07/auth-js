// Componente para exibir lista de usuários cadastrados
import UserService, { UserWithRole } from '../services/userService';
import { authSystem } from '../contexts/AuthSystem';

class UsersListComponent {
  private users: UserWithRole[] = [];
  private filteredUsers: UserWithRole[] = [];
  private currentFilter: 'all' | 'authenticated' | 'supabase_admin' | 'active' | 'inactive' = 'all';
  private searchTerm = '';

  constructor(private container: HTMLElement) {
    this.loadUsers();
    this.render();
    this.attachEventListeners();
  }

  private loadUsers(): void {
    this.users = UserService.getAllUsers();
    this.applyFilters();
    console.log('📊 Usuários carregados:', this.users.length);
  }

  private applyFilters(): void {
    let filtered = [...this.users];

    // Filtrar por tipo
    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'authenticated' || this.currentFilter === 'supabase_admin') {
        filtered = filtered.filter(user => user.role === this.currentFilter);
      } else if (this.currentFilter === 'active' || this.currentFilter === 'inactive') {
        filtered = filtered.filter(user => user.status === this.currentFilter);
      }
    }

    // Filtrar por termo de busca
    if (this.searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.user_metadata.first_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.user_metadata.last_name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredUsers = filtered;
  }

  private render(): void {
    const stats = UserService.getUserStats();
    const currentUser = authSystem.getState().user;
    const isAdmin = currentUser?.role === 'supabase_admin';

    this.container.innerHTML = `
      <div class="users-list-container">
        <div class="users-header">
          <h2>👥 Usuários Cadastrados</h2>
          <div class="users-stats">
            <div class="stat-card">
              <span class="stat-number">${stats.total}</span>
              <span class="stat-label">Total</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">${stats.byRole.authenticated || 0}</span>
              <span class="stat-label">Usuários</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">${stats.byRole.supabase_admin || 0}</span>
              <span class="stat-label">Admins</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">${stats.recentRegistrations}</span>
              <span class="stat-label">Esta semana</span>
            </div>
          </div>
        </div>

        <div class="users-controls">
          <div class="search-container">
            <input type="text" id="user-search" placeholder="🔍 Buscar usuários..." value="${this.searchTerm}">
          </div>
          
          <div class="filter-container">
            <select id="user-filter">
              <option value="all" ${this.currentFilter === 'all' ? 'selected' : ''}>Todos</option>
              <option value="authenticated" ${this.currentFilter === 'authenticated' ? 'selected' : ''}>Usuários</option>
              <option value="supabase_admin" ${this.currentFilter === 'supabase_admin' ? 'selected' : ''}>Admins</option>
              <option value="active" ${this.currentFilter === 'active' ? 'selected' : ''}>Ativos</option>
              <option value="inactive" ${this.currentFilter === 'inactive' ? 'selected' : ''}>Inativos</option>
            </select>
          </div>

          ${isAdmin ? `
          <button id="refresh-users" class="btn-secondary">
            🔄 Atualizar
          </button>
          ` : ''}
        </div>

        <div class="users-grid">
          ${this.filteredUsers.length === 0 ? `
            <div class="no-users">
              <div class="no-users-icon">👤</div>
              <h3>Nenhum usuário encontrado</h3>
              <p>Não há usuários cadastrados que correspondam aos filtros aplicados.</p>
            </div>
          ` : this.filteredUsers.map(user => this.renderUserCard(user, isAdmin)).join('')}
        </div>
      </div>
    `;
  }

  private renderUserCard(user: UserWithRole, isAdmin: boolean): string {
    const registrationDate = new Date(user.registration_date).toLocaleDateString('pt-BR');
    const lastSignIn = user.last_sign_in_at ? 
      new Date(user.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca';

    const roleIcon = user.role === 'supabase_admin' ? '👑' : '👤';
    const statusIcon = user.status === 'active' ? '✅' : 
                      user.status === 'inactive' ? '❌' : '⏳';

    return `
      <div class="user-card" data-user-id="${user.id}">
        <div class="user-card-header">
          <div class="user-avatar">
            ${user.user_metadata.avatar_url ? 
              `<img src="${user.user_metadata.avatar_url}" alt="Avatar">` : 
              `<span class="avatar-placeholder">${user.user_metadata.first_name.charAt(0)}${user.user_metadata.last_name.charAt(0)}</span>`
            }
          </div>
          <div class="user-info">
            <h4>${user.user_metadata.first_name} ${user.user_metadata.last_name}</h4>
            <p class="user-email">${user.email}</p>
          </div>
        </div>

        <div class="user-details">
          <div class="user-detail">
            <span class="detail-label">Role:</span>
            <span class="detail-value role-badge ${user.role}">
              ${roleIcon} ${user.role === 'supabase_admin' ? 'Admin' : 'Usuário'}
            </span>
          </div>
          
          <div class="user-detail">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-badge ${user.status}">
              ${statusIcon} ${user.status === 'active' ? 'Ativo' : 
                           user.status === 'inactive' ? 'Inativo' : 'Pendente'}
            </span>
          </div>

          <div class="user-detail">
            <span class="detail-label">Cadastro:</span>
            <span class="detail-value">${registrationDate}</span>
          </div>

          <div class="user-detail">
            <span class="detail-label">Último acesso:</span>
            <span class="detail-value">${lastSignIn}</span>
          </div>
        </div>

        ${isAdmin && user.id !== authSystem.getState().user?.id ? `
        <div class="user-actions">
          <button class="btn-sm btn-outline change-role" data-user-id="${user.id}">
            🔄 Alterar Role
          </button>
          <button class="btn-sm btn-outline change-status" data-user-id="${user.id}">
            📝 Alterar Status
          </button>
        </div>
        ` : ''}
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Busca
    const searchInput = this.container.querySelector('#user-search') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      this.searchTerm = (e.target as HTMLInputElement).value;
      this.applyFilters();
      this.render();
    });

    // Filtro
    const filterSelect = this.container.querySelector('#user-filter') as HTMLSelectElement;
    filterSelect?.addEventListener('change', (e) => {
      this.currentFilter = (e.target as HTMLSelectElement).value as any;
      this.applyFilters();
      this.render();
    });

    // Botão de atualizar
    const refreshBtn = this.container.querySelector('#refresh-users');
    refreshBtn?.addEventListener('click', () => {
      this.loadUsers();
      this.render();
    });

    // Ações de admin
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const userId = target.dataset.userId;

      if (target.classList.contains('change-role') && userId) {
        this.changeUserRole(userId);
      } else if (target.classList.contains('change-status') && userId) {
        this.changeUserStatus(userId);
      }
    });
  }

  private changeUserRole(userId: string): void {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const newRole = user.role === 'authenticated' ? 'supabase_admin' : 'authenticated';
    const confirmation = confirm(
      `Alterar role de ${user.user_metadata.first_name} ${user.user_metadata.last_name} para ${newRole === 'supabase_admin' ? 'Admin' : 'Usuário'}?`
    );

    if (confirmation) {
      UserService.updateUserRole(userId, newRole);
      this.loadUsers();
      this.render();
    }
  }

  private changeUserStatus(userId: string): void {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const confirmation = confirm(
      `Alterar status de ${user.user_metadata.first_name} ${user.user_metadata.last_name} para ${newStatus === 'active' ? 'Ativo' : 'Inativo'}?`
    );

    if (confirmation) {
      UserService.updateUserStatus(userId, newStatus);
      this.loadUsers();
      this.render();
    }
  }

  // Método público para atualizar a lista
  public refresh(): void {
    this.loadUsers();
    this.render();
  }
}

export default UsersListComponent;
