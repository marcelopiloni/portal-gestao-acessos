import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../common/Button';
import { VALIDATION_RULES } from '../../utils/constants';
import './UserForm.css';

/**
 * Formulário para criação e edição de usuários
 */
const UserForm = ({ 
  user = null, 
  companies = [], 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const { user: currentUser } = useAuth();
  const { showError } = useNotification();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
    role: 'operador',
    empresa_id: '',
    status: 'pendente'
  });
  
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        senha: '',
        confirmSenha: '',
        role: user.role || 'operador',
        empresa_id: user.empresa_id || '',
        status: user.status || 'pendente'
      });
      setIsEditing(true);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < VALIDATION_RULES.NAME.MIN_LENGTH) {
      newErrors.nome = VALIDATION_RULES.NAME.MESSAGE;
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!VALIDATION_RULES.EMAIL.PATTERN.test(formData.email)) {
      newErrors.email = VALIDATION_RULES.EMAIL.MESSAGE;
    }

    // Validar senha (apenas para criação ou se preenchida na edição)
    if (!isEditing || formData.senha) {
      if (!formData.senha) {
        newErrors.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
        newErrors.senha = VALIDATION_RULES.PASSWORD.MESSAGE;
      }

      if (formData.senha !== formData.confirmSenha) {
        newErrors.confirmSenha = 'Senhas não coincidem';
      }
    }

    // Validar role
    if (!formData.role) {
      newErrors.role = 'Função é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário');
      return;
    }

    const submitData = { ...formData };
    
    // Remover confirmSenha dos dados enviados
    delete submitData.confirmSenha;
    
    // Se não há senha na edição, remover do objeto
    if (isEditing && !submitData.senha) {
      delete submitData.senha;
    }

    onSubmit(submitData);
  };

  const canEditRole = () => {
    return currentUser.role === 'admin';
  };

  const canEditStatus = () => {
    return currentUser.role === 'admin';
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-grid">
        {/* Nome */}
        <div className="form-group">
          <label htmlFor="nome">
            <i className="fas fa-user"></i>
            Nome Completo *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            className={`form-input ${errors.nome ? 'error' : ''}`}
            placeholder="Digite o nome completo"
            required
          />
          {errors.nome && <span className="error-message">{errors.nome}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">
            <i className="fas fa-envelope"></i>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="Digite o email"
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        {/* Senha */}
        <div className="form-group">
          <label htmlFor="senha">
            <i className="fas fa-lock"></i>
            Senha {!isEditing && '*'}
          </label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleInputChange}
            className={`form-input ${errors.senha ? 'error' : ''}`}
            placeholder={isEditing ? "Deixe em branco para manter atual" : "Mínimo 6 caracteres"}
            required={!isEditing}
          />
          {errors.senha && <span className="error-message">{errors.senha}</span>}
        </div>

        {/* Confirmar Senha */}
        <div className="form-group">
          <label htmlFor="confirmSenha">
            <i className="fas fa-lock"></i>
            Confirmar Senha {!isEditing && '*'}
          </label>
          <input
            type="password"
            id="confirmSenha"
            name="confirmSenha"
            value={formData.confirmSenha}
            onChange={handleInputChange}
            className={`form-input ${errors.confirmSenha ? 'error' : ''}`}
            placeholder="Confirme a senha"
            required={!isEditing}
          />
          {errors.confirmSenha && <span className="error-message">{errors.confirmSenha}</span>}
        </div>

        {/* Função/Role */}
        <div className="form-group">
          <label htmlFor="role">
            <i className="fas fa-id-badge"></i>
            Função *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className={`form-input ${errors.role ? 'error' : ''}`}
            disabled={!canEditRole()}
            required
          >
            <option value="">Selecione uma função</option>
            <option value="operador">Operador</option>
            <option value="gerente">Gerente</option>
            {currentUser.role === 'admin' && (
              <option value="admin">Administrador</option>
            )}
          </select>
          {errors.role && <span className="error-message">{errors.role}</span>}
        </div>

        {/* Empresa */}
        <div className="form-group">
          <label htmlFor="empresa_id">
            <i className="fas fa-building"></i>
            Empresa
          </label>
          <select
            id="empresa_id"
            name="empresa_id"
            value={formData.empresa_id}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="">Nenhuma empresa</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Status (apenas para admin) */}
        {canEditStatus() && (
          <div className="form-group">
            <label htmlFor="status">
              <i className="fas fa-check-circle"></i>
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </div>
        )}
      </div>

      {/* Informações adicionais */}
      <div className="form-info">
        <div className="info-item">
          <i className="fas fa-info-circle"></i>
          <span>
            {isEditing 
              ? 'Deixe os campos de senha em branco para manter a senha atual'
              : 'O usuário receberá um email de confirmação após o cadastro'
            }
          </span>
        </div>
        {!canEditRole() && (
          <div className="info-item warning">
            <i className="fas fa-exclamation-triangle"></i>
            <span>Você não tem permissão para alterar a função do usuário</span>
          </div>
        )}
      </div>

      {/* Ações do formulário */}
      <div className="form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={isEditing ? "fas fa-save" : "fas fa-user-plus"}
        >
          {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;