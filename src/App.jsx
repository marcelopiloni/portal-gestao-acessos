import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationContainer } from './components/common/Alert';

// Componentes
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Button from './components/common/Button';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CompaniesPage from './pages/CompaniesPage';
import LogsPage from './pages/LogsPage';
import JsonSimulatorPage from './pages/JsonSimulatorPage';

// Estilos
import './styles/variables.css';
import './styles/globals.css';
import './App.css';

/**
 * Componente principal da aplicação
 */
const AppContent = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading inicial
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h2>Portal de Gestão de Acessos</h2>
          <p>Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Tela de login se não autenticado
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Verificar se usuário está aprovado
  if (user?.status !== 'aprovado') {
    return (
      <div className="app-pending">
        <div className="pending-container">
          <div className="pending-icon">
            <i className="fas fa-clock"></i>
          </div>
          <h2>Aguardando Aprovação</h2>
          <p>
            Seu cadastro foi enviado com sucesso e está aguardando aprovação 
            de um administrador. Você receberá uma notificação quando for aprovado.
          </p>
          <div className="pending-info">
            <div className="info-item">
              <strong>Nome:</strong> {user.nome}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="info-item">
              <strong>Status:</strong> 
              <span className="status-pending">Pendente</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            icon="fas fa-refresh"
          >
            Atualizar Status
          </Button>
        </div>
      </div>
    );
  }

  // Renderizar página baseada na seção ativa
  const renderPage = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardPage />;
      case 'usuarios':
        return <UsersPage />;
      case 'empresas':
        return <CompaniesPage />;
      case 'logs':
        return <LogsPage />;
      case 'json-simulator':
        return <JsonSimulatorPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app">
      <Header />
      
      {/* Botão do menu mobile */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
      >
        <i className="fas fa-bars"></i>
      </button>

      <div className="app-container">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="app-content">
          <div className="content-wrapper">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * Componente raiz com providers
 */
const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
        <NotificationContainer />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;