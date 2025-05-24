import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import Button from './Button';
import './Alert.css';

/**
 * Componente de alerta individual
 */
const Alert = ({ 
  notification, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Tempo da animação de saída
  };

  const getIcon = () => {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
      loading: 'fas fa-spinner fa-spin'
    };
    
    return icons[notification.type] || icons.info;
  };

  const alertClasses = [
    'alert',
    `alert-${notification.type}`,
    isVisible ? 'alert-visible' : '',
    isExiting ? 'alert-exiting' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={alertClasses}>
      <div className="alert-content">
        <div className="alert-icon">
          <i className={getIcon()}></i>
        </div>
        
        <div className="alert-body">
          {notification.title && (
            <div className="alert-title">{notification.title}</div>
          )}
          <div className="alert-message">{notification.message}</div>
        </div>
        
        <div className="alert-actions">
          {notification.type === 'confirm' && (
            <>
              <Button
                variant="success"
                size="small"
                onClick={() => {
                  notification.onConfirm?.();
                  handleClose();
                }}
              >
                Confirmar
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  notification.onCancel?.();
                  handleClose();
                }}
              >
                Cancelar
              </Button>
            </>
          )}
          
          <button
            className="alert-close"
            onClick={handleClose}
            aria-label="Fechar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      {/* Barra de progresso para auto-close */}
      {autoClose && duration > 0 && (
        <div 
          className="alert-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};

/**
 * Container de notificações
 */
export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Alert
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
          autoClose={notification.duration > 0}
          duration={notification.duration}
        />
      ))}
    </div>
  );
};

/**
 * Alert estático para uso inline
 */
export const StaticAlert = ({ 
  type = 'info', 
  title, 
  message, 
  children,
  onClose,
  className = '' 
}) => {
  const getIcon = () => {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    
    return icons[type] || icons.info;
  };

  return (
    <div className={`static-alert static-alert-${type} ${className}`}>
      <div className="alert-content">
        <div className="alert-icon">
          <i className={getIcon()}></i>
        </div>
        
        <div className="alert-body">
          {title && <div className="alert-title">{title}</div>}
          {message && <div className="alert-message">{message}</div>}
          {children}
        </div>
        
        {onClose && (
          <button
            className="alert-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;