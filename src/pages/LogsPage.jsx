import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import apiService from '../services/api';
import { ENDPOINTS } from '../utils/constants';
import { formatDateTime, getRelativeTime } from '../utils/helpers';

/**
 * Página de visualização de logs
 */
const LogsPage = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    usuario_id: '',
    acao: '',
    data_inicio: '',
    data_fim: ''
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(ENDPOINTS.LOGS, filters);
      if (response.status === 'success') {
        setLogs(response.data?.logs || []);
      }
    } catch (error) {
      showError('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    loadLogs();
  };

  const clearFilters = () => {
    setFilters({
      usuario_id: '',
      acao: '',
      data_inicio: '',
      data_fim: ''
    });
    setTimeout(() => loadLogs(), 100);
  };

  const getActionIcon = (action) => {
    const icons = {
      'Login no sistema': 'fas fa-sign-in-alt',
      'Logout do sistema': 'fas fa-sign-out-alt',
      'Criação': 'fas fa-plus-circle',
      'Atualização': 'fas fa-edit',
      'Exclusão': 'fas fa-trash',
      'Aprovação': 'fas fa-check-circle',
      'Rejeição': 'fas fa-times-circle',
      'Visualização': 'fas fa-eye',
      'Listagem': 'fas fa-list',
      'Associação': 'fas fa-link',
      'Registro': 'fas fa-user-plus'
    };

    const actionKey = Object.keys(icons).find(key => action.includes(key));
    return icons[actionKey] || 'fas fa-info-circle';
  };

  const getActionColor = (action) => {
    if (action.includes('Login') || action.includes('Criação') || action.includes('Aprovação')) {
      return 'success';
    }
    if (action.includes('Exclusão') || action.includes('Rejeição')) {
      return 'danger';
    }
    if (action.includes('Atualização') || action.includes('Associação')) {
      return 'warning';
    }
    return 'info';
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Carregando logs...</p>
      </div>
    );
  }

  return (
    <div className="logs-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Logs do Sistema</h1>
          <p>Visualize atividades e ações dos usuários</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="form-group">
            <label>Ação</label>
            <input
              type="text"
              name="acao"
              value={filters.acao}
              onChange={handleFilterChange}
              placeholder="Filtrar por ação..."
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Data Início</label>
            <input
              type="date"
              name="data_inicio"
              value={filters.data_inicio}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Data Fim</label>
            <input
              type="date"
              name="data_fim"
              value={filters.data_fim}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button 
            className="btn btn-primary"
            onClick={handleSearch}
          >
            <i className="fas fa-search"></i>
            Buscar
          </button>
          <button 
            className="btn btn-secondary"
            onClick={clearFilters}
          >
            <i className="fas fa-times"></i>
            Limpar
          </button>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-clipboard-list"></i>
            <h3>Nenhum log encontrado</h3>
            <p>Não há logs que correspondam aos filtros aplicados.</p>
          </div>
        ) : (
          <div className="logs-timeline">
            {logs.map((log, index) => (
              <div key={log.id} className="log-item">
                <div className="log-marker">
                  <div className={`log-icon ${getActionColor(log.acao)}`}>
                    <i className={getActionIcon(log.acao)}></i>
                  </div>
                  {index < logs.length - 1 && <div className="log-line"></div>}
                </div>
                
                <div className="log-content">
                  <div className="log-header">
                    <span className="log-action">{log.acao}</span>
                    <span className="log-time" title={formatDateTime(log.timestamp)}>
                      {getRelativeTime(log.timestamp)}
                    </span>
                  </div>
                  
                  <div className="log-details">
                    {log.usuario && (
                      <div className="log-user">
                        <i className="fas fa-user"></i>
                        <span>{log.usuario.nome}</span>
                        <span className="user-email">({log.usuario.email})</span>
                        <span className={`user-role role-${log.usuario.role}`}>
                          {log.usuario.role}
                        </span>
                      </div>
                    )}
                    
                    <div className="log-timestamp">
                      <i className="fas fa-clock"></i>
                      {formatDateTime(log.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;