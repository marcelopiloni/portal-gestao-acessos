import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

/**
 * Context para gerenciamento de autenticação
 */
const AuthContext = createContext();

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

/**
 * Provider do contexto de autenticação
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Verificar autenticação ao inicializar
   */
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Fazer login
   */
  const login = async (email, senha) => {
    try {
      const result = await authService.login(email, senha);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  /**
   * Fazer logout
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Registrar novo usuário
   */
  const register = async (userData) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  /**
   * Atualizar dados do usuário
   */
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    authService.updateUser(userData);
  };

  /**
   * Verificar se usuário tem permissão
   */
  const hasPermission = (permission) => {
    return authService.hasPermission(permission);
  };

  /**
   * Verificar se usuário pode acessar rota
   */
  const canAccessRoute = (requiredRoles) => {
    return authService.canAccessRoute(requiredRoles);
  };

  /**
   * Obter role do usuário
   */
  const getUserRole = () => {
    return authService.getUserRole();
  };

  /**
   * Verificar se usuário está aprovado
   */
  const isUserApproved = () => {
    return authService.isUserApproved();
  };

  const value = {
    // Estado
    user,
    loading,
    isAuthenticated,
    
    // Métodos
    login,
    logout,
    register,
    updateUser,
    
    // Verificações
    hasPermission,
    canAccessRoute,
    getUserRole,
    isUserApproved,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};