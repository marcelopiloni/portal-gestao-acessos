import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import companyService from '../services/companyService';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { ConfirmModal } from '../components/common/Modal';

/**
 * Página de gerenciamento de empresas
 */
const CompaniesPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // create, edit
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, company: null });
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    localizacao: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const result = await companyService.getCompaniesWithStats();
      if (result.success) {
        setCompanies(result.companies);
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar empresas
  const filteredCompanies = companies.filter(company =>
    company.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.localizacao && company.localizacao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handlers do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (modalType === 'create') {
        result = await companyService.createCompany(formData);
      } else {
        result = await companyService.updateCompany(selectedCompany.id, formData);
      }

      if (result.success) {
        showSuccess(result.message);
        closeModal();
        loadCompanies();
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Erro ao salvar empresa');
    }
  };

  const handleDelete = async (company) => {
    try {
      const canDelete = await companyService.canDeleteCompany(company.id);
      if (!canDelete.canDelete) {
        showError(canDelete.reason);
        return;
      }

      const result = await companyService.deleteCompany(company.id);
      if (result.success) {
        showSuccess(result.message);
        loadCompanies();
        setConfirmModal({ isOpen: false, company: null });
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Erro ao excluir empresa');
    }
  };

  // Modais
  const openModal = (type, company = null) => {
    setModalType(type);
    setSelectedCompany(company);
    
    if (company) {
      setFormData({
        nome: company.nome,
        localizacao: company.localizacao || ''
      });
    } else {
      setFormData({ nome: '', localizacao: '' });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCompany(null);
    setFormData({ nome: '', localizacao: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Carregando empresas...</p>
      </div>
    );
  }

  return (
    <div className="companies-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Gerenciamento de Empresas</h1>
          <p>Gerencie empresas e visualize usuários associados</p>
        </div>
        
        <div className="header-actions">
          <Button
            variant="primary"
            icon="fas fa-building"
            onClick={() => openModal('create')}
          >
            Nova Empresa
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar por nome ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Lista de empresas */}
      <div className="companies-grid">
        {filteredCompanies.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-building"></i>
            <h3>Nenhuma empresa encontrada</h3>
            <p>Não há empresas cadastradas ou que correspondam ao filtro aplicado.</p>
          </div>
        ) : (
          filteredCompanies.map(company => (
            <div key={company.id} className="company-card">
              <div className="company-header">
                <div className="company-icon">
                  <i className="fas fa-building"></i>
                </div>
                <div className="company-info">
                  <h3>{company.nome}</h3>
                  {company.localizacao && (
                    <p className="company-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {company.localizacao}
                    </p>
                  )}
                </div>
              </div>

              <div className="company-stats">
                <div className="stat-item">
                  <span className="stat-number">{company.totalUsers || 0}</span>
                  <span className="stat-label">Total de Usuários</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{company.activeUsers || 0}</span>
                  <span className="stat-label">Ativos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{company.pendingUsers || 0}</span>
                  <span className="stat-label">Pendentes</span>
                </div>
              </div>

              <div className="company-actions">
                <Button
                  variant="secondary"
                  size="small"
                  icon="fas fa-edit"
                  onClick={() => openModal('edit', company)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  icon="fas fa-trash"
                  onClick={() => setConfirmModal({ isOpen: true, company })}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulário */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalType === 'create' ? 'Nova Empresa' : 'Editar Empresa'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="company-form">
          <div className="form-group">
            <label htmlFor="nome">
              <i className="fas fa-building"></i>
              Nome da Empresa *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Digite o nome da empresa"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="localizacao">
              <i className="fas fa-map-marker-alt"></i>
              Localização
            </label>
            <input
              type="text"
              id="localizacao"
              name="localizacao"
              value={formData.localizacao}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Digite a localização"
            />
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={modalType === 'create' ? "fas fa-plus" : "fas fa-save"}
            >
              {modalType === 'create' ? 'Criar Empresa' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, company: null })}
        onConfirm={() => handleDelete(confirmModal.company)}
        title="Excluir Empresa"
        message={`Tem certeza que deseja excluir a empresa "${confirmModal.company?.nome}"?`}
        confirmText="Excluir"
        confirmVariant="danger"
        icon="fas fa-exclamation-triangle"
      />
    </div>
  );
};

export default CompaniesPage;