import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import userService from '../services/userService';
import companyService from '../services/companyService';
import './DashboardPage.css';

/**
 * Página principal do dashboard
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  const [stats, setStats] = useState({
    usuarios: { total: 0, pendentes: 0, aprovados: 0, rejeitados: 0 },
    empresas: { total: 0, ativas: 0 },
    logs: { total: 0, hoje: 0 },
    loading: true
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersResult, companiesResult] = await Promise.all([
        userService.getUserStats(),
        user.role === 'admin' ? companyService.getCompanyStats() : Promise.resolve({ success: true, stats: {} })
      ]);

      if (usersResult.success) {
        setStats(prev => ({
          ...prev,
          usuarios: usersResult.stats,
          empresas: companiesResult.success ? companiesResult.stats : prev.empresas,
          loading: false
        }));
      }

      // Simular atividades recentes
      setRecentActivities([
        { id: 1, type: 'login', user: 'João Silva', time: '2 min atrás', icon: 'fas fa-sign-in-alt' },
        { id: 2, type: 'approval', user: 'Maria Santos', time: '15 min atrás', icon: 'fas fa-check-circle' },
        { id: 3, type: 'registration', user: 'Pedro Costa', time: '1 hora atrás', icon: 'fas fa-user-plus' },
        { id: 4, type: 'company', user: 'Nova Empresa Ltd', time: '2 horas atrás', icon: 'fas fa-building' },
      ]);

    } catch (error) {
      showError('Erro ao carregar dados do dashboard');
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getRoleDisplayName = (role) => {
    const roles = {
      admin: 'Administrador',
      gerente: 'Gerente',
      operador: 'Operador'
    };
    return roles[role] || role;
  };

  if (stats.loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header de boas-vindas */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{getGreeting()}, {user.nome}!</h1>
          <p>
            Você está logado como <span className="role-badge">{getRoleDisplayName(user.role)}</span>
          </p>
        </div>
        <div className="date-section">
          <div className="current-date">
            <i className="fas fa-calendar-alt"></i>
            <span>{new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.usuarios.total}</h3>
            <p>Total de Usuários</p>
            <div className="stat-details">
              <span className="stat-detail success">
                {stats.usuarios.aprovados} aprovados
              </span>
              <span className="stat-detail warning">
                {stats.usuarios.pendentes} pendentes
              </span>
            </div>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="stat-card secondary">
            <div className="stat-icon">
              <i className="fas fa-building"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.empresas.totalCompanies || 0}</h3>
              <p>Empresas Cadastradas</p>
              <div className="stat-details">
                <span className="stat-detail info">
                  {stats.empresas.companiesWithUsers || 0} com usuários
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="stat-card success">
          <div className="stat-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.usuarios.pendentes}</h3>
            <p>Aguardando Aprovação</p>
            <div className="stat-details">
              <span className="stat-detail">
                Requer atenção
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <h3>99.5%</h3>
            <p>Uptime do Sistema</p>
            <div className="stat-details">
              <span className="stat-detail success">
                Funcionando normalmente
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="dashboard-content">
        {/* Atividades recentes */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Atividades Recentes</h2>
            <button className="btn-link">Ver todas</button>
          </div>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <i className={activity.icon}></i>
                </div>
                <div className="activity-content">
                  <div className="activity-description">
                    <strong>{activity.user}</strong> {getActivityDescription(activity.type)}
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Ações Rápidas</h2>
          </div>
          <div className="quick-actions">
            {user.role === 'admin' && (
              <>
                <div className="quick-action-card">
                  <i className="fas fa-user-plus"></i>
                  <h3>Aprovar Usuários</h3>
                  <p>Revisar e aprovar novos cadastros</p>
                  <span className="action-badge">{stats.usuarios.pendentes}</span>
                </div>
                <div className="quick-action-card">
                  <i className="fas fa-building"></i>
                  <h3>Gerenciar Empresas</h3>
                  <p>Adicionar e editar empresas</p>
                </div>
              </>
            )}
            <div className="quick-action-card">
              <i className="fas fa-code"></i>
              <h3>Simulador JSON</h3>
              <p>Gerar JSONs para Oracle Cloud</p>
            </div>
            <div className="quick-action-card">
              <i className="fas fa-chart-bar"></i>
              <h3>Relatórios</h3>
              <p>Visualizar logs e estatísticas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Função auxiliar para descrição das atividades
const getActivityDescription = (type) => {
  const descriptions = {
    login: 'fez login no sistema',
    approval: 'foi aprovado no sistema',
    registration: 'se registrou no sistema',
    company: 'foi cadastrada'
  };
  return descriptions[type] || 'realizou uma ação';
};

export default DashboardPage;