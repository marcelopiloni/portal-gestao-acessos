import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Context para gerenciamento de notificações
 */
const NotificationContext = createContext();

/**
 * Hook para usar o contexto de notificações
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};

/**
 * Provider do contexto de notificações
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Adicionar nova notificação
   */
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover notificação após duração especificada
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  /**
   * Remover notificação
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  /**
   * Limpar todas as notificações
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Notificação de sucesso
   */
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      title: 'Sucesso',
      message,
      ...options,
    });
  }, [addNotification]);

  /**
   * Notificação de erro
   */
  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      title: 'Erro',
      message,
      duration: 0, // Não auto-remover erros
      ...options,
    });
  }, [addNotification]);

  /**
   * Notificação de aviso
   */
  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      title: 'Atenção',
      message,
      ...options,
    });
  }, [addNotification]);

  /**
   * Notificação de informação
   */
  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      title: 'Informação',
      message,
      ...options,
    });
  }, [addNotification]);

  /**
   * Notificação de loading
   */
  const showLoading = useCallback((message, options = {}) => {
    return addNotification({
      type: 'loading',
      title: 'Carregando',
      message,
      duration: 0, // Não auto-remover loading
      ...options,
    });
  }, [addNotification]);

  /**
   * Confirmar ação com notificação
   */
  const confirm = useCallback((message, onConfirm, options = {}) => {
    return addNotification({
      type: 'confirm',
      title: 'Confirmação',
      message,
      duration: 0,
      onConfirm,
      onCancel: () => {},
      ...options,
    });
  }, [addNotification]);

  const value = {
    // Estado
    notifications,
    
    // Métodos gerais
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Métodos específicos por tipo
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    confirm,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};