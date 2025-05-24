import React from 'react';
import './Button.css';

/**
 * Componente de botão reutilizável
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const fullWidthClass = fullWidth ? 'btn-full-width' : '';
  const disabledClass = (disabled || loading) ? 'btn-disabled' : '';
  const loadingClass = loading ? 'btn-loading' : '';
  
  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    disabledClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const renderIcon = (position) => {
    if (!icon || iconPosition !== position) return null;
    
    return (
      <span className={`btn-icon btn-icon-${position}`}>
        {typeof icon === 'string' ? <i className={icon}></i> : icon}
      </span>
    );
  };

  const renderLoadingSpinner = () => {
    if (!loading) return null;
    
    return (
      <span className="btn-spinner">
        <i className="fas fa-spinner fa-spin"></i>
      </span>
    );
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderLoadingSpinner()}
      {renderIcon('left')}
      
      <span className="btn-content">
        {children}
      </span>
      
      {renderIcon('right')}
    </button>
  );
};

export default Button;