import apiService from './api';
import { ENDPOINTS } from '../utils/constants';

/**
 * Serviço para gerenciamento de usuários
 */
class UserService {
  /**
   * Obter lista de todos os usuários
   */
  async getUsers() {
    try {
      const response = await apiService.get(ENDPOINTS.USERS);
      return {
        success: true,
        users: response.data?.usuarios || [],
        total: response.results || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        users: [],
        total: 0,
      };
    }
  }

  /**
   * Obter um usuário específico por ID
   */
  async getUserById(id) {
    try {
      const response = await apiService.get(ENDPOINTS.USER_BY_ID(id));
      return {
        success: true,
        user: response.data?.usuario || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        user: null,
      };
    }
  }

  /**
   * Criar novo usuário
   */
  async createUser(userData) {
    try {
      const response = await apiService.post(ENDPOINTS.USERS, userData);
      return {
        success: true,
        user: response.data?.usuario,
        message: 'Usuário criado com sucesso!',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Atualizar usuário existente
   */
  async updateUser(id, userData) {
    try {
      const response = await apiService.put(ENDPOINTS.USER_BY_ID(id), userData);
      return {
        success: true,
        user: response.data?.usuario,
        message: 'Usuário atualizado com sucesso!',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Aprovar ou rejeitar usuário
   */
  async approveUser(id, status) {
    try {
      const response = await apiService.patch(ENDPOINTS.APPROVE_USER(id), { status });
      return {
        success: true,
        user: response.data?.usuario,
        message: `Usuário ${status === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso!`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Associar usuário a uma empresa
   */
  async associateCompany(userId, companyId) {
    try {
      const response = await apiService.patch(ENDPOINTS.ASSOCIATE_COMPANY(userId), { 
        empresa_id: companyId 
      });
      return {
        success: true,
        user: response.data?.usuario,
        message: 'Empresa associada com sucesso!',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obter estatísticas de usuários
   */
  async getUserStats() {
    try {
      const response = await apiService.get(ENDPOINTS.USERS);
      const users = response.data?.usuarios || [];

      const stats = {
        total: users.length,
        pendentes: users.filter(user => user.status === 'pendente').length,
        aprovados: users.filter(user => user.status === 'aprovado').length,
        rejeitados: users.filter(user => user.status === 'rejeitado').length,
        admins: users.filter(user => user.role === 'admin').length,
        gerentes: users.filter(user => user.role === 'gerente').length,
        operadores: users.filter(user => user.role === 'operador').length,
      };

      return {
        success: true,
        stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stats: {},
      };
    }
  }

  /**
   * Buscar usuários por termo
   */
  async searchUsers(searchTerm) {
    try {
      const response = await apiService.get(ENDPOINTS.USERS);
      const users = response.data?.usuarios || [];
      
      const filteredUsers = users.filter(user => 
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return {
        success: true,
        users: filteredUsers,
        total: filteredUsers.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        users: [],
        total: 0,
      };
    }
  }

  /**
   * Filtrar usuários por critérios
   */
  async filterUsers(filters = {}) {
    try {
      const response = await apiService.get(ENDPOINTS.USERS, filters);
      return {
        success: true,
        users: response.data?.usuarios || [],
        total: response.results || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        users: [],
        total: 0,
      };
    }
  }

  /**
   * Obter dados do usuário logado
   */
  async getMe() {
    try {
      const response = await apiService.get('/usuarios/me');
      return {
        success: true,
        user: response.data?.usuario || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        user: null,
      };
    }
  }
}

export default new UserService();