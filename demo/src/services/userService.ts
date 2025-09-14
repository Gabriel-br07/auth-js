// Serviço para gerenciar usuários cadastrados
import { User } from '../types/auth';

interface UserWithRole extends User {
  registration_date: string;
  status: 'active' | 'inactive' | 'pending';
}

class UserService {
  private static readonly USERS_STORAGE_KEY = 'app_registered_users';

  // Obter todos os usuários cadastrados
  static getAllUsers(): UserWithRole[] {
    const users = localStorage.getItem(this.USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Adicionar um novo usuário ao cadastro
  static addUser(user: User): void {
    const users = this.getAllUsers();
    
    // Verificar se usuário já existe
    const existingUser = users.find(u => u.email === user.email);
    if (existingUser) {
      return; // Usuário já cadastrado
    }

    const userWithRole: UserWithRole = {
      ...user,
      registration_date: new Date().toISOString(),
      status: 'active'
    };

    users.push(userWithRole);
    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    
    console.log('✅ Usuário adicionado ao sistema:', userWithRole);
  }

  // Atualizar role do usuário
  static updateUserRole(userId: string, newRole: 'authenticated' | 'supabase_admin'): boolean {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return false;
    }

    users[userIndex].role = newRole;
    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    
    console.log('✅ Role do usuário atualizada:', users[userIndex]);
    return true;
  }

  // Atualizar status do usuário
  static updateUserStatus(userId: string, newStatus: 'active' | 'inactive' | 'pending'): boolean {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return false;
    }

    users[userIndex].status = newStatus;
    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    
    console.log('✅ Status do usuário atualizado:', users[userIndex]);
    return true;
  }

  // Remover usuário
  static removeUser(userId: string): boolean {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length === users.length) {
      return false; // Usuário não encontrado
    }

    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(filteredUsers));
    
    console.log('✅ Usuário removido do sistema:', userId);
    return true;
  }

  // Obter usuário por ID
  static getUserById(userId: string): UserWithRole | null {
    const users = this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }

  // Obter usuário por email
  static getUserByEmail(email: string): UserWithRole | null {
    const users = this.getAllUsers();
    return users.find(u => u.email === email) || null;
  }

  // Obter estatísticas dos usuários
  static getUserStats(): {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    recentRegistrations: number;
  } {
    const users = this.getAllUsers();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentRegistrations = users.filter(user => 
      new Date(user.registration_date) >= oneWeekAgo
    ).length;

    return {
      total: users.length,
      byRole,
      byStatus,
      recentRegistrations
    };
  }

  // Limpar todos os usuários (para testes)
  static clearAllUsers(): void {
    localStorage.removeItem(this.USERS_STORAGE_KEY);
    console.log('🗑️ Todos os usuários removidos do sistema');
  }
}

export default UserService;
export type { UserWithRole };
