import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

/**
 * Componente de cabeçalho da aplicação
 */
const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      logout();
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrador',
      gerente: 'Gerente',
      operador: 'Operador',
    };
    return roleNames[role] || role;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <i className="fas fa-shield-alt"></i>
          <div className="logo-text">
            <span className="logo-title">Portal de Gestão de Acessos</span>
            <span className="logo-subtitle">KNAPP SUDAMERICA</span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="user-details">
              <span className="user-name">{user?.nome}</span>
              <span className="user-role">{getRoleDisplayName(user?.role)}</span>
            </div>
          </div>
          
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title="Sair do sistema"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span className="logout-text">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;