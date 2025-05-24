import apiService from './api';
import { ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

/**
 * Serviço de autenticação
 */
class AuthService {
  /**
   * Fazer login do usuário
   */
  async login(email, senha) {
    try {
      const response = await apiService.post(ENDPOINTS.LOGIN, { email, senha });
      
      if (response.token && response.data?.usuario) {
        this.setAuthData(response.token, response.data.usuario);
        return {
          success: true,
          user: response.data.usuario,
          token: response.token,
        };
      }
      
      throw new Error('Resposta inválida do servidor');
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Registrar novo usuário
   */
  async register(userData) {
    try {
      const response = await apiService.post(ENDPOINTS.REGISTER, userData);
      
      return {
        success: true,
        message: response.message,
        user: response.data?.usuario,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fazer logout do usuário
   */
  logout() {
    this.clearAuthData();
    window.location.href = '/login';
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) {
      return false;
    }

    // Verificar se o token não expirou
    if (this.isTokenExpired(token)) {
      this.clearAuthData();
      return false;
    }

    return true;
  }

  /**
   * Obter token do localStorage
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Obter dados do usuário do localStorage
   */
  getUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Salvar dados de autenticação no localStorage
   */
  setAuthData(token, user) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Limpar dados de autenticação do localStorage
   */
  clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Verificar se o token JWT está expirado
   */
  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obter role do usuário
   */
  getUserRole() {
    const user = this.getUser();
    return user?.role || null;
  }

  /**
   * Verificar se o usuário tem uma permissão específica
   */
  hasPermission(permission) {
    const role = this.getUserRole();
    if (!role) return false;

    const { PERMISSIONS } = require('../utils/constants');
    return PERMISSIONS[role]?.includes(permission) || false;
  }

  /**
   * Verificar se o usuário tem acesso a uma rota
   */
  canAccessRoute(requiredRoles = []) {
    const userRole = this.getUserRole();
    return requiredRoles.includes(userRole);
  }

  /**
   * Atualizar dados do usuário no localStorage
   */
  updateUser(userData) {
    const currentUser = this.getUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  }

  /**
   * Verificar status de aprovação do usuário
   */
  isUserApproved() {
    const user = this.getUser();
    return user?.status === 'aprovado';
  }
}

export default new AuthService();