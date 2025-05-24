import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NAVIGATION_ITEMS } from '../../utils/constants';
import './Sidebar.css';

/**
 * Componente de navegação lateral
 */
const Sidebar = ({ activeSection, setActiveSection, isOpen, onClose }) => {
  const { user, canAccessRoute } = useAuth();

  const handleNavClick = (item) => {
    setActiveSection(item.id);
    // Fechar sidebar em mobile após navegação
    if (window.innerWidth <= 768) {
      onClose?.();
    }
  };

  // Filtrar itens de navegação baseado nas permissões do usuário
  const filteredItems = NAVIGATION_ITEMS.filter(item => 
    canAccessRoute(item.roles)
  );

  const getItemBadge = (itemId) => {
    // Aqui você pode adicionar lógica para mostrar badges
    // Por exemplo, número de usuários pendentes
    switch (itemId) {
      case 'usuarios':
        // Retornar badge se houver usuários pendentes
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <i className="fas fa-bars"></i>
            <span>Menu Principal</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Navegação</span>
            
            {filteredItems.map(item => {
              const badge = getItemBadge(item.id);
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                >
                  <div className="nav-item-content">
                    <i className={item.icon}></i>
                    <span className="nav-item-label">{item.label}</span>
                  </div>
                  {badge && (
                    <span className="nav-item-badge">{badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Informações</span>
            
            <div className="user-card">
              <div className="user-card-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-card-info">
                <span className="user-card-name">{user?.nome}</span>
                <span className="user-card-role">{user?.role}</span>
                <span className="user-card-status">
                  {user?.status === 'aprovado' ? (
                    <>
                      <i className="fas fa-check-circle text-success"></i>
                      Aprovado
                    </>
                  ) : (
                    <>
                      <i className="fas fa-clock text-warning"></i>
                      Pendente
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="knapp-branding">
            <i className="fas fa-shield-alt"></i>
            <div className="branding-text">
              <span>KNAPP</span>
              <span>SUDAMERICA</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;