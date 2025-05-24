import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

/**
 * Hook personalizado para usar o contexto de notificações
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  
  return context;
};