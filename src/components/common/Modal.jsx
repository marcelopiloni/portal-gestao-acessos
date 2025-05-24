import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import './Modal.css';

/**
 * Componente de modal reutilizável
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscKey = true,
  footer,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Focar no modal quando abrir
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Gerenciar tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (closeOnEscKey && e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll do body quando modal estiver aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscKey, onClose]);

  // Gerenciar clique no overlay
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const modalClasses = [
    'modal-content',
    `modal-${size}`,
    className
  ].filter(Boolean).join(' ');

  const modalElement = (
    <div 
      className="modal-overlay" 
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div 
        className={modalClasses}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="modal-title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="small"
                icon="fas fa-times"
                onClick={onClose}
                className="modal-close-btn"
                aria-label="Fechar modal"
              />
            )}
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar no body usando portal
  return createPortal(modalElement, document.body);
};

/**
 * Componente de modal de confirmação
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger',
  loading = false,
  icon = 'fas fa-question-circle',
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose?.();
  };

  const footer = (
    <div className="btn-group">
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={handleConfirm}
        loading={loading}
        icon={loading ? undefined : 'fas fa-check'}
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={footer}
      closeOnOverlayClick={!loading}
      closeOnEscKey={!loading}
    >
      <div className="confirm-modal-content">
        {icon && (
          <div className="confirm-modal-icon">
            <i className={icon}></i>
          </div>
        )}
        <div className="confirm-modal-message">
          {message}
        </div>
      </div>
    </Modal>
  );
};

export default Modal;