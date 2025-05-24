import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Button from '../components/common/Button';
import './LoginPage.css';

/**
 * Página de login
 */
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
    role: 'operador'
  });

  const { login, register } = useAuth();
  const { showError, showSuccess, showInfo } = useNotification();

  // Handlers para login
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.senha);
      
      if (!result.success) {
        showError(result.error);
      }
    } catch (error) {
      showError('Erro inesperado ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para registro
  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateRegisterForm = () => {
    const errors = [];

    if (!registerData.nome.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!registerData.email.trim()) {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errors.push('Email inválido');
    }

    if (!registerData.senha) {
      errors.push('Senha é obrigatória');
    } else if (registerData.senha.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (registerData.senha !== registerData.confirmSenha) {
      errors.push('Senhas não coincidem');
    }

    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const errors = validateRegisterForm();
    if (errors.length > 0) {
      errors.forEach(error => showError(error));
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        nome: registerData.nome,
        email: registerData.email,
        senha: registerData.senha,
        role: registerData.role
      });

      if (result.success) {
        showSuccess('Cadastro realizado com sucesso! Aguarde aprovação.');
        setShowRegister(false);
        setRegisterData({
          nome: '',
          email: '',
          senha: '',
          confirmSenha: '',
          role: 'operador'
        });
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Erro inesperado ao cadastrar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções utilitárias
  const fillDemoCredentials = (userType) => {
    const credentials = {
      admin: { email: 'admin@example.com', senha: 'batata123' },
      gerente: { email: 'maria.silva@empresa.com', senha: 'batata123' },
      operador: { email: 'ana.costa@empresa.com', senha: 'batata123' }
    };

    if (credentials[userType]) {
      setFormData(credentials[userType]);
      showInfo(`Credenciais de ${userType} preenchidas`);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="background-pattern"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h1>Portal de Gestão</h1>
            <p>KNAPP SUDAMERICA - Sistema de Acessos</p>
          </div>

          {/* Formulário de Login */}
          {!showRegister ? (
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Digite seu email"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha">
                  <i className="fas fa-lock"></i>
                  Senha
                </label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  required
                  className="form-input"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={isLoading}
                icon="fas fa-sign-in-alt"
              >
                Entrar
              </Button>

              {/* Credenciais de demonstração */}
              <div className="demo-credentials">
                <p>Credenciais de demonstração:</p>
                <div className="demo-buttons">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => fillDemoCredentials('admin')}
                    icon="fas fa-crown"
                  >
                    Admin
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => fillDemoCredentials('gerente')}
                    icon="fas fa-user-tie"
                  >
                    Gerente
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => fillDemoCredentials('operador')}
                    icon="fas fa-user"
                  >
                    Operador
                  </Button>
                </div>
              </div>

              {/* Link para registro */}
              <div className="login-footer">
                <p>
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setShowRegister(true)}
                  >
                    Cadastre-se aqui
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Formulário de Registro */
            <form onSubmit={handleRegister} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="register-nome">
                    <i className="fas fa-user"></i>
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="register-nome"
                    name="nome"
                    value={registerData.nome}
                    onChange={handleRegisterInputChange}
                    placeholder="Digite seu nome completo"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-role">
                    <i className="fas fa-id-badge"></i>
                    Função
                  </label>
                  <select
                    id="register-role"
                    name="role"
                    value={registerData.role}
                    onChange={handleRegisterInputChange}
                    className="form-input"
                  >
                    <option value="operador">Operador</option>
                    <option value="gerente">Gerente</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-email">
                  <i className="fas fa-envelope"></i>
                  Email
                </label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterInputChange}
                  placeholder="Digite seu email"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="register-senha">
                    <i className="fas fa-lock"></i>
                    Senha
                  </label>
                  <input
                    type="password"
                    id="register-senha"
                    name="senha"
                    value={registerData.senha}
                    onChange={handleRegisterInputChange}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-confirm-senha">
                    <i className="fas fa-lock"></i>
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    id="register-confirm-senha"
                    name="confirmSenha"
                    value={registerData.confirmSenha}
                    onChange={handleRegisterInputChange}
                    placeholder="Confirme sua senha"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="register-info">
                <div className="info-item">
                  <i className="fas fa-info-circle"></i>
                  <span>Seu cadastro será analisado por um administrador</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <span>Você receberá uma notificação quando for aprovado</span>
                </div>
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowRegister(false)}
                  disabled={isLoading}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  loading={isLoading}
                  icon="fas fa-user-plus"
                >
                  Cadastrar
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Informações do sistema */}
        <div className="system-info">
          <div className="info-card">
            <h3>
              <i className="fas fa-shield-alt"></i>
              Sistema Seguro
            </h3>
            <p>
              Controle de acesso baseado em roles com autenticação JWT 
              e aprovação de usuários.
            </p>
          </div>

          <div className="info-card">
            <h3>
              <i className="fas fa-building"></i>
              Gestão de Empresas
            </h3>
            <p>
              Organize usuários por empresa e gerencie permissões 
              de forma centralizada.
            </p>
          </div>

          <div className="info-card">
            <h3>
              <i className="fas fa-code"></i>
              Integração OCI
            </h3>
            <p>
              Geração de JSONs compatíveis com Oracle Cloud Infrastructure 
              para automação de processos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;