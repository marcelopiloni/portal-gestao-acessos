import React, { useState } from 'react';
import Button from '../common/Button';
import { ConfirmModal } from '../common/Modal';
import './UsersTable.css';

/**
 * Tabela de usuários com ações
 */
const UsersTable = ({ 
  users = [], 
  companies = [], 
  onApprove, 
  onAssociate, 
  onEdit, 
  currentUserRole 
}) => {
  const [sortField, setSortField] = useState('nome');
  const [sortDirection, setSortDirection] = useState('asc');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    user: null,
    action: null
  });

  // Função para ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Ordenar usuários
  const sortedUsers = [...users].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Tratamento especial para empresa
    if (sortField === 'empresa') {
      const aCompany = companies.find(c => c.id === a.empresa_id);
      const bCompany = companies.find(c => c.id === b.empresa_id);
      aValue = aCompany ? aCompany.nome : '';
      bValue = bCompany ? bCompany.nome : '';
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Obter nome da empresa
  const getCompanyName = (empresaId) => {
    const company = companies.find(c => c.id === empresaId);
    return company ? company.nome : 'Não associado';
  };

  // Renderizar badge de status
  const renderStatusBadge = (status) => {
    const badges = {
      pendente: { class: 'status-pending', icon: 'fas fa-clock', text: 'Pendente' },
      aprovado: { class: 'status-approved', icon: 'fas fa-check-circle', text: 'Aprovado' },
      rejeitado: { class: 'status-rejected', icon: 'fas fa-times-circle', text: 'Rejeitado' }
    };

    const badge = badges[status] || badges.pendente;

    return (
      <span className={`status-badge ${badge.class}`}>
        <i className={badge.icon}></i>
        {badge.text}
      </span>
    );
  };

  // Renderizar badge de role
  const renderRoleBadge = (role) => {
    const badges = {
      admin: { class: 'role-admin', icon: 'fas fa-crown', text: 'Admin' },
      gerente: { class: 'role-manager', icon: 'fas fa-user-tie', text: 'Gerente' },
      operador: { class: 'role-operator', icon: 'fas fa-user', text: 'Operador' }
    };

    const badge = badges[role] || badges.operador;

    return (
      <span className={`role-badge ${badge.class}`}>
        <i className={badge.icon}></i>
        {badge.text}
      </span>
    );
  };

  // Renderizar ícone de ordenação
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <i className="fas fa-sort sort-icon"></i>;
    }
    return (
      <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} sort-icon active`}></i>
    );
  };

  // Verificar permissões
  const canApprove = (user) => {
    return currentUserRole === 'admin' && user.status === 'pendente';
  };

  const canAssociate = (user) => {
    return currentUserRole === 'admin';
  };

  const canEdit = (user) => {
    return currentUserRole === 'admin' || 
           (currentUserRole === 'gerente' && user.role !== 'admin');
  };

  // Handlers de confirmação
  const handleConfirmAction = (user, action) => {
    setConfirmModal({
      isOpen: true,
      user,
      action
    });
  };

  const executeAction = () => {
    const { user, action } = confirmModal;
    
    switch (action) {
      case 'approve':
        onApprove(user);
        break;
      case 'reject':
        onApprove(user);
        break;
      case 'associate':
        onAssociate(user);
        break;
      case 'edit':
        onEdit(user);
        break;
    }
    
    setConfirmModal({ isOpen: false, user: null, action: null });
  };

  // Formatear data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (users.length === 0) {
    return (
      <div className="empty-table">
        <div className="empty-icon">
          <i className="fas fa-users"></i>
        </div>
        <h3>Nenhum usuário encontrado</h3>
        <p>Não há usuários cadastrados ou que correspondam aos filtros aplicados.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th 
                className="sortable"
                onClick={() => handleSort('nome')}
              >
                Nome
                {renderSortIcon('nome')}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('email')}
              >
                Email
                {renderSortIcon('email')}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('role')}
              >
                Função
                {renderSortIcon('role')}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('status')}
              >
                Status
                {renderSortIcon('status')}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('empresa')}
              >
                Empresa
                {renderSortIcon('empresa')}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('criado_em')}
              >
                Cadastro
                {renderSortIcon('criado_em')}
              </th>
              <th className="actions-column">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => (
              <tr key={user.id} className="user-row">
                <td className="user-name">
                  <div className="user-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <span>{user.nome}</span>
                </td>
                <td className="user-email">{user.email}</td>
                <td>{renderRoleBadge(user.role)}</td>
                <td>{renderStatusBadge(user.status)}</td>
                <td className="user-company">
                  {user.empresa_id ? (
                    <span className="company-name">
                      <i className="fas fa-building"></i>
                      {getCompanyName(user.empresa_id)}
                    </span>
                  ) : (
                    <span className="no-company">Não associado</span>
                  )}
                </td>
                <td className="user-date">
                  {formatDate(user.criado_em)}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {canApprove(user) && (
                      <>
                        <Button
                          variant="success"
                          size="small"
                          icon="fas fa-check"
                          onClick={() => handleConfirmAction(user, 'approve')}
                          title="Aprovar usuário"
                        />
                        <Button
                          variant="danger"
                          size="small"
                          icon="fas fa-times"
                          onClick={() => handleConfirmAction(user, 'reject')}
                          title="Rejeitar usuário"
                        />
                      </>
                    )}
                    
                    {canAssociate(user) && (
                      <Button
                        variant="info"
                        size="small"
                        icon="fas fa-building"
                        onClick={() => onAssociate(user)}
                        title="Associar empresa"
                      />
                    )}
                    
                    {canEdit(user) && (
                      <Button
                        variant="secondary"
                        size="small"
                        icon="fas fa-edit"
                        onClick={() => onEdit(user)}
                        title="Editar usuário"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
        onConfirm={executeAction}
        title="Confirmar Ação"
        message={getConfirmMessage(confirmModal.action, confirmModal.user)}
        confirmText={getConfirmText(confirmModal.action)}
        confirmVariant={getConfirmVariant(confirmModal.action)}
      />
    </>
  );
};

// Funções auxiliares para o modal de confirmação
const getConfirmMessage = (action, user) => {
  if (!user) return '';
  
  const messages = {
    approve: `Tem certeza que deseja aprovar o usuário "${user.nome}"?`,
    reject: `Tem certeza que deseja rejeitar o usuário "${user.nome}"?`,
    associate: `Associar empresa ao usuário "${user.nome}"?`,
    edit: `Editar informações do usuário "${user.nome}"?`
  };
  
  return messages[action] || 'Confirmar esta ação?';
};

const getConfirmText = (action) => {
  const texts = {
    approve: 'Aprovar',
    reject: 'Rejeitar',
    associate: 'Associar',
    edit: 'Editar'
  };
  
  return texts[action] || 'Confirmar';
};

const getConfirmVariant = (action) => {
  const variants = {
    approve: 'success',
    reject: 'danger',
    associate: 'info',
    edit: 'primary'
  };
  
  return variants[action] || 'primary';
};

export default UsersTable;