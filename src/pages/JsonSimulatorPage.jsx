import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import apiService from '../services/api';
import Button from '../components/common/Button';
import { copyToClipboard, downloadFile } from '../utils/helpers';
import { OCI_TEMPLATES } from '../utils/constants';

/**
 * Página do simulador de JSON para Oracle Cloud Infrastructure
 */
const JsonSimulatorPage = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [activeTab, setActiveTab] = useState('user');
  const [jsonOutput, setJsonOutput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados dos formulários
  const [userForm, setUserForm] = useState({
    name: '',
    description: '',
    email: ''
  });
  
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    members: []
  });
  
  const [policyForm, setPolicyForm] = useState({
    name: '',
    description: '',
    statements: ['']
  });

  // Handlers para formulário de usuário
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateUserJson = async () => {
    if (!userForm.name) {
      showError('Nome do usuário é obrigatório');
      return;
    }

    setLoading(true);
    try {
      // Simular chamada para API ou gerar JSON localmente
      const userJson = {
        ...OCI_TEMPLATES.USER,
        name: userForm.email || `${userForm.name.toLowerCase().replace(/\s+/g, '.')}@exemplo.com`,
        description: userForm.description || `User ${userForm.name} for web platform access`
      };

      setJsonOutput(JSON.stringify(userJson, null, 2));
      showSuccess('JSON do usuário gerado com sucesso!');
    } catch (error) {
      showError('Erro ao gerar JSON do usuário');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para formulário de grupo
  const handleGroupInputChange = (e) => {
    const { name, value } = e.target;
    setGroupForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateGroupJson = async () => {
    if (!groupForm.name) {
      showError('Nome do grupo é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const groupJson = {
        ...OCI_TEMPLATES.GROUP,
        name: groupForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: groupForm.description || `Group ${groupForm.name} for web platform users`
      };

      setJsonOutput(JSON.stringify(groupJson, null, 2));
      showSuccess('JSON do grupo gerado com sucesso!');
    } catch (error) {
      showError('Erro ao gerar JSON do grupo');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para formulário de política
  const handlePolicyInputChange = (e) => {
    const { name, value } = e.target;
    setPolicyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatementChange = (index, value) => {
    setPolicyForm(prev => ({
      ...prev,
      statements: prev.statements.map((stmt, i) => i === index ? value : stmt)
    }));
  };

  const addStatement = () => {
    setPolicyForm(prev => ({
      ...prev,
      statements: [...prev.statements, '']
    }));
  };

  const removeStatement = (index) => {
    setPolicyForm(prev => ({
      ...prev,
      statements: prev.statements.filter((_, i) => i !== index)
    }));
  };

  const generatePolicyJson = async () => {
    if (!policyForm.name) {
      showError('Nome da política é obrigatório');
      return;
    }

    const validStatements = policyForm.statements.filter(stmt => stmt.trim());
    if (validStatements.length === 0) {
      showError('Pelo menos uma declaração é obrigatória');
      return;
    }

    setLoading(true);
    try {
      const policyJson = {
        ...OCI_TEMPLATES.POLICY,
        name: policyForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: policyForm.description || `Policy ${policyForm.name} for web platform permissions`,
        statements: validStatements
      };

      setJsonOutput(JSON.stringify(policyJson, null, 2));
      showSuccess('JSON da política gerado com sucesso!');
    } catch (error) {
      showError('Erro ao gerar JSON da política');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para JSON output
  const copyJson = async () => {
    if (!jsonOutput) {
      showInfo('Nenhum JSON para copiar');
      return;
    }

    const success = await copyToClipboard(jsonOutput);
    if (success) {
      showSuccess('JSON copiado para a área de transferência!');
    } else {
      showError('Erro ao copiar JSON');
    }
  };

  const downloadJson = () => {
    if (!jsonOutput) {
      showInfo('Nenhum JSON para download');
      return;
    }

    const filename = `oci-${activeTab}-${Date.now()}.json`;
    downloadFile(jsonOutput, filename, 'application/json');
    showSuccess('JSON baixado com sucesso!');
  };

  const clearJson = () => {
    setJsonOutput('');
    showInfo('JSON limpo');
  };

  // Simulação de chamada para API do backend
  const fetchSampleJson = async (type) => {
    setLoading(true);
    try {
      const endpoint = type === 'user' ? '/simulacao-json/usuario' : '/simulacao-json/grupo';
      const response = await apiService.get(endpoint);
      setJsonOutput(JSON.stringify(response, null, 2));
      showSuccess(`Exemplo de JSON ${type === 'user' ? 'do usuário' : 'do grupo'} carregado!`);
    } catch (error) {
      showError('Erro ao carregar exemplo');
    } finally {
      setLoading(false);
    }
  };

  const renderUserForm = () => (
    <div className="form-container">
      <h3>Criar Usuário OCI</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="user-name">
            <i className="fas fa-user"></i>
            Nome do Usuário *
          </label>
          <input
            type="text"
            id="user-name"
            name="name"
            value={userForm.name}
            onChange={handleUserInputChange}
            placeholder="João Silva"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="user-email">
            <i className="fas fa-envelope"></i>
            Email
          </label>
          <input
            type="email"
            id="user-email"
            name="email"
            value={userForm.email}
            onChange={handleUserInputChange}
            placeholder="joao.silva@empresa.com"
            className="form-input"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="user-description">
            <i className="fas fa-info-circle"></i>
            Descrição
          </label>
          <textarea
            id="user-description"
            name="description"
            value={userForm.description}
            onChange={handleUserInputChange}
            placeholder="Usuário para acesso à plataforma web"
            className="form-input"
            rows="3"
          />
        </div>
      </div>

      <div className="form-actions">
        <Button
          variant="secondary"
          icon="fas fa-file-code"
          onClick={() => fetchSampleJson('user')}
        >
          Exemplo
        </Button>
        <Button
          variant="primary"
          icon="fas fa-code"
          onClick={generateUserJson}
          loading={loading}
        >
          Gerar JSON
        </Button>
      </div>
    </div>
  );

  const renderGroupForm = () => (
    <div className="form-container">
      <h3>Criar Grupo OCI</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="group-name">
            <i className="fas fa-users"></i>
            Nome do Grupo *
          </label>
          <input
            type="text"
            id="group-name"
            name="name"
            value={groupForm.name}
            onChange={handleGroupInputChange}
            placeholder="web-platform-admins"
            className="form-input"
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="group-description">
            <i className="fas fa-info-circle"></i>
            Descrição
          </label>
          <textarea
            id="group-description"
            name="description"
            value={groupForm.description}
            onChange={handleGroupInputChange}
            placeholder="Grupo para administradores da plataforma web"
            className="form-input"
            rows="3"
          />
        </div>
      </div>

      <div className="form-actions">
        <Button
          variant="secondary"
          icon="fas fa-file-code"
          onClick={() => fetchSampleJson('group')}
        >
          Exemplo
        </Button>
        <Button
          variant="primary"
          icon="fas fa-code"
          onClick={generateGroupJson}
          loading={loading}
        >
          Gerar JSON
        </Button>
      </div>
    </div>
  );

  const renderPolicyForm = () => (
    <div className="form-container">
      <h3>Criar Política OCI</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="policy-name">
            <i className="fas fa-shield-alt"></i>
            Nome da Política *
          </label>
          <input
            type="text"
            id="policy-name"
            name="name"
            value={policyForm.name}
            onChange={handlePolicyInputChange}
            placeholder="web-platform-policy"
            className="form-input"
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="policy-description">
            <i className="fas fa-info-circle"></i>
            Descrição
          </label>
          <textarea
            id="policy-description"
            name="description"
            value={policyForm.description}
            onChange={handlePolicyInputChange}
            placeholder="Política para conceder permissões da plataforma web"
            className="form-input"
            rows="3"
          />
        </div>

        <div className="form-group full-width">
          <label>
            <i className="fas fa-list"></i>
            Declarações da Política *
          </label>
          {policyForm.statements.map((statement, index) => (
            <div key={index} className="statement-input">
              <input
                type="text"
                value={statement}
                onChange={(e) => handleStatementChange(index, e.target.value)}
                placeholder="Allow group web-platform-admins to manage all-resources in tenancy"
                className="form-input"
              />
              {policyForm.statements.length > 1 && (
                <Button
                  variant="danger"
                  size="small"
                  icon="fas fa-trash"
                  onClick={() => removeStatement(index)}
                />
              )}
            </div>
          ))}
          <Button
            variant="secondary"
            size="small"
            icon="fas fa-plus"
            onClick={addStatement}
          >
            Adicionar Declaração
          </Button>
        </div>
      </div>

      <div className="form-actions">
        <Button
          variant="primary"
          icon="fas fa-code"
          onClick={generatePolicyJson}
          loading={loading}
        >
          Gerar JSON
        </Button>
      </div>
    </div>
  );

  return (
    <div className="json-simulator-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Simulador JSON Oracle Cloud</h1>
          <p>Gere JSONs compatíveis com Oracle Cloud Infrastructure</p>
        </div>
      </div>

      <div className="simulator-content">
        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'user' ? 'active' : ''}`}
              onClick={() => setActiveTab('user')}
            >
              <i className="fas fa-user"></i>
              Usuário
            </button>
            <button
              className={`tab ${activeTab === 'group' ? 'active' : ''}`}
              onClick={() => setActiveTab('group')}
            >
              <i className="fas fa-users"></i>
              Grupo
            </button>
            <button
              className={`tab ${activeTab === 'policy' ? 'active' : ''}`}
              onClick={() => setActiveTab('policy')}
            >
              <i className="fas fa-shield-alt"></i>
              Política
            </button>
          </div>
        </div>

        <div className="simulator-layout">
          {/* Formulário */}
          <div className="form-section">
            {activeTab === 'user' && renderUserForm()}
            {activeTab === 'group' && renderGroupForm()}
            {activeTab === 'policy' && renderPolicyForm()}
          </div>

          {/* Output JSON */}
          <div className="output-section">
            <div className="output-header">
              <h3>JSON Gerado</h3>
              <div className="output-actions">
                <Button
                  variant="secondary"
                  size="small"
                  icon="fas fa-copy"
                  onClick={copyJson}
                  disabled={!jsonOutput}
                >
                  Copiar
                </Button>
                <Button
                  variant="info"
                  size="small"
                  icon="fas fa-download"
                  onClick={downloadJson}
                  disabled={!jsonOutput}
                >
                  Download
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  icon="fas fa-trash"
                  onClick={clearJson}
                  disabled={!jsonOutput}
                >
                  Limpar
                </Button>
              </div>
            </div>

            <div className="json-output">
              {jsonOutput ? (
                <pre className="json-code">
                  <code>{jsonOutput}</code>
                </pre>
              ) : (
                <div className="empty-output">
                  <i className="fas fa-code"></i>
                  <p>Preencha o formulário e clique em "Gerar JSON" para ver o resultado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="info-section">
          <div className="info-card">
            <h4>
              <i className="fas fa-info-circle"></i>
              Como usar
            </h4>
            <ol>
              <li>Selecione o tipo de recurso que deseja criar (Usuário, Grupo ou Política)</li>
              <li>Preencha os campos do formulário com as informações necessárias</li>
              <li>Clique em "Gerar JSON" para criar o JSON compatível com OCI</li>
              <li>Use os botões "Copiar" ou "Download" para usar o JSON gerado</li>
            </ol>
          </div>

          <div className="info-card">
            <h4>
              <i className="fas fa-cloud"></i>
              Oracle Cloud Infrastructure
            </h4>
            <p>
              Os JSONs gerados são compatíveis com a API do Oracle Cloud Infrastructure
              e podem ser usados para criar usuários, grupos e políticas automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonSimulatorPage;