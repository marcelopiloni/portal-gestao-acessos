import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import userService from '../services/userService';
import companyService from '../services/companyService';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import UsersTable from '../components/tables/UsersTable';
import UserForm from '../components/forms/UserForm';
import './UsersPage.css';

/**
 * Página de gerenciamento de usuários
 */
const UsersPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterRole, setFilterRole] = useState('todos');
  
  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // create, edit, approve, associate
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResult, companiesResult] = await Promise.all([
        userService.getUsers(),
        companyService.getCompanies()
      ]);

      if (usersResult.success) {
        setUsers(usersResult.users);
      }

      if (companiesResult.success) {
        setCompanies(companiesResult.companies);
      }
    } catch (error) {
      showError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || user.status === filterStatus;
    const matchesRole = filterRole === 'todos' || user.role === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Handlers
  const handleApproveUser = async (userId, status) => {
    try {
      const result = await userService.approveUser(userId, status);
      if (result.success) {
        showSuccess(`Usuário ${status === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso!`);
        loadData();
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Erro ao atualizar status do usuário');
    }
  };

  const handleAssociateCompany = async (userId, companyId) => {
    try {
      const result = await userService.associateCompany(userId, companyId);
      if (result.success) {
        showSuccess('Empresa associada com sucesso!');
        loadData();
        setShowModal(false);
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Erro ao associar empresa');
    }
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Estatísticas rápidas
  const stats = {
    total: filteredUsers.length,
    pendentes: filteredUsers.filter(u => u.status === 'pendente').length,
    aprovados: filteredUsers.filter(u => u.status === 'aprovado').length,
    rejeitados: filteredUsers.filter(u => u.status === 'rejeitado').length,
  };

  const renderModal = () => {
    switch (modalType) {
      case 'approve':
        return (
          <Modal
            isOpen={showModal}
            onClose={closeModal}
            title="Aprovar/Rejeitar Usuário"
            size="small"
          >
            <div className="approve-modal-content">
              <div className="user-info">
                <h3>{selectedUser?.nome}</h3>
                <p>{selectedUser?.email}</p>
                <p>Função: {selectedUser?.role}</p>
              </div>
              
              <div className="approve-actions">
                <Button
                  variant="success"
                  onClick={() => {
                    handleApproveUser(selectedUser.id, 'aprovado');
                    closeModal();
                  }}
                  icon="fas fa-check"
                >
                  Aprovar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    handleApproveUser(selectedUser.id, 'rejeitado');
                    closeModal();
                  }}
                  icon="fas fa-times"
                >
                  Rejeitar
                </Button>
              </div>
            </div>
          </Modal>
        );

      case 'associate':
        return (
          <Modal
            isOpen={showModal}
            onClose={closeModal}
            title="Associar Empresa"
            size="medium"
          >
            <div className="associate-modal-content">
              <div className="user-info">
                <h3>{selectedUser?.nome}</h3>
                <p>{selectedUser?.email}</p>
              </div>
              
              <div className="form-group">
                <label>Selecionar Empresa:</label>
                <select 
                  className="form-input"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssociateCompany(selectedUser.id, parseInt(e.target.value));
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Modal>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Gerenciamento de Usuários</h1>
          <p>Gerencie usuários, aprove cadastros e associe empresas</p>
        </div>
        
        {user.role === 'admin' && (
          <div className="header-actions">
            <Button
              variant="primary"
              icon="fas fa-user-plus"
              onClick={() => openModal('create')}
            >
              Novo Usuário
            </Button>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pendentes}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-number">{stats.aprovados}</div>
          <div className="stat-label">Aprovados</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-number">{stats.rejeitados}</div>
          <div className="stat-label">Rejeitados</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendentes</option>
            <option value="aprovado">Aprovados</option>
            <option value="rejeitado">Rejeitados</option>
          </select>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todas as Funções</option>
            <option value="admin">Administrador</option>
            <option value="gerente">Gerente</option>
            <option value="operador">Operador</option>
          </select>
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="table-section">
        <UsersTable
          users={filteredUsers}
          companies={companies}
          onApprove={(user) => openModal('approve', user)}
          onAssociate={(user) => openModal('associate', user)}
          onEdit={(user) => openModal('edit', user)}
          currentUserRole={user.role}
        />
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default UsersPage;