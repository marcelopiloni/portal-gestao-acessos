import React from 'react';
import './Loading.css';

/**
 * Componente de loading reutilizável
 */
const Loading = ({ 
  size = 'medium', 
  text = 'Carregando...', 
  variant = 'spinner',
  overlay = false,
  fullscreen = false 
}) => {
  const loadingClasses = [
    'loading-container',
    `loading-${size}`,
    `loading-${variant}`,
    overlay ? 'loading-overlay' : '',
    fullscreen ? 'loading-fullscreen' : ''
  ].filter(Boolean).join(' ');

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className="loading-pulse">
            <div className="pulse-circle"></div>
          </div>
        );
      
      case 'bars':
        return (
          <div className="loading-bars">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        );
      
      case 'ring':
        return (
          <div className="loading-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        );
      
      default: // spinner
        return (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        );
    }
  };

  return (
    <div className={loadingClasses}>
      <div className="loading-content">
        {renderSpinner()}
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
};

/**
 * Loading inline para botões
 */
export const InlineLoading = ({ size = 'small' }) => (
  <span className={`inline-loading loading-${size}`}>
    <i className="fas fa-spinner fa-spin"></i>
  </span>
);

/**
 * Loading para skeleton
 */
export const SkeletonLoading = ({ lines = 3, width = '100%' }) => (
  <div className="skeleton-container">
    {Array.from({ length: lines }, (_, index) => (
      <div 
        key={index}
        className="skeleton-line"
        style={{ 
          width: Array.isArray(width) ? width[index] || '100%' : width 
        }}
      />
    ))}
  </div>
);

/**
 * Loading para cards
 */
export const CardLoading = () => (
  <div className="card-loading">
    <div className="skeleton-header">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-info">
        <div className="skeleton-line" style={{ width: '60%' }}></div>
        <div className="skeleton-line" style={{ width: '40%' }}></div>
      </div>
    </div>
    <div className="skeleton-content">
      <div className="skeleton-line" style={{ width: '100%' }}></div>
      <div className="skeleton-line" style={{ width: '80%' }}></div>
      <div className="skeleton-line" style={{ width: '60%' }}></div>
    </div>
  </div>
);

export default Loading;