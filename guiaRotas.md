# Guia Completo Postman - Portal de Gestão de Acessos

## 🚀 Configuração Inicial

### 1. Configuração Base
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json` (para todas as requisições)

### 2. Variáveis de Ambiente no Postman
Crie uma Collection e configure estas variáveis:
- `base_url`: `http://localhost:3000/api`
- `admin_token`: (será preenchido após login)
- `manager_token`: (será preenchido após login)
- `operator_token`: (será preenchido após login)

---

## 📋 Cenário 1: Configuração Inicial do Sistema

### 1.1 Inicializar Banco de Dados (Terminal)
```bash
# Execute antes de começar os testes
node init/setupDB.js
```

### 1.2 Verificar se o servidor está rodando
```
GET {{base_url}}/
```
**Resposta esperada**: 404 (normal, não temos rota raiz definida)

---

## 🔐 Cenário 2: Autenticação - Login Inicial Admin

### 2.1 Login como Admin (Credenciais iniciais)
```
POST {{base_url}}/auth/login
```

**Body (JSON)**:
```json
{
  "email": "admin@example.com",
  "senha": "batata123"
}
```

**Resposta esperada**:
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "usuario": {
      "id": 1,
      "nome": "Administrador",
      "email": "admin@example.com",
      "role": "admin",
      "empresa_id": 1
    }
  }
}
```

**⚠️ IMPORTANTE**: Copie o token da resposta e salve na variável `admin_token` no Postman.

---

## 👥 Cenário 3: Cadastro e Aprovação de Usuários

### 3.1 Auto-registro de um Gerente
```
POST {{base_url}}/auth/register
```

**Body (JSON)**:
```json
{
  "nome": "Maria Silva",
  "email": "maria.silva@empresa.com",
  "senha": "senha123",
  "role": "gerente"
}
```

**Resposta esperada**:
```json
{
  "status": "success",
  "message": "Cadastro realizado com sucesso. Aguarde aprovação.",
  "data": {
    "usuario": {
      "id": 2,
      "nome": "Maria Silva",
      "email": "maria.silva@empresa.com",
      "status": "pendente",
      "role": "gerente"
    }
  }
}
```

### 3.2 Auto-registro de um Operador
```
POST {{base_url}}/auth/register
```

**Body (JSON)**:
```json
{
  "nome": "João Santos",
  "email": "joao.santos@empresa.com",
  "senha": "senha123",
  "role": "operador"
}
```

### 3.3 Listar Usuários Pendentes (como Admin)
```
GET {{base_url}}/usuarios
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

### 3.4 Aprovar o Gerente (como Admin)
```
PATCH {{base_url}}/usuarios/2/aprovar
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Body (JSON)**:
```json
{
  "status": "aprovado"
}
```

### 3.5 Aprovar o Operador (como Admin)
```
PATCH {{base_url}}/usuarios/3/aprovar
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Body (JSON)**:
```json
{
  "status": "aprovado"
}
```

---

## 🏢 Cenário 4: Gerenciamento de Empresas

### 4.1 Criar Nova Empresa (como Admin)
```
POST {{base_url}}/empresas
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Body (JSON)**:
```json
{
  "nome": "KNAPP SUDAMERICA",
  "localizacao": "Curitiba, PR"
}
```

### 4.2 Criar Segunda Empresa
```
POST {{base_url}}/empresas
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Body (JSON)**:
```json
{
  "nome": "MAIS INTELIGENCIA",
  "localizacao": "São Paulo, SP"
}
```

### 4.3 Listar Todas as Empresas
```
GET {{base_url}}/empresas
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

### 4.4 Associar Gerente à Empresa KNAPP (como Admin)
```
PATCH {{base_url}}/usuarios/2/empresa
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Body (JSON)**:
```json
{
  "empresa_id": 2
}
```

### 4.5 Associar Operador à Empresa KNAPP (como Admin)
```
PATCH {{base_url}}/usuarios/3/empresa
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Body (JSON)**:
```json
{
  "empresa_id": 2
}
```

---

## 🔑 Cenário 5: Login dos Usuários Aprovados

### 5.1 Login como Gerente
```
POST {{base_url}}/auth/login
```

**Body (JSON)**:
```json
{
  "email": "maria.silva@empresa.com",
  "senha": "senha123"
}
```

**⚠️ IMPORTANTE**: Salve o token na variável `manager_token`.

### 5.2 Login como Operador
```
POST {{base_url}}/auth/login
```

**Body (JSON)**:
```json
{
  "email": "joao.santos@empresa.com",
  "senha": "senha123"
}
```

**⚠️ IMPORTANTE**: Salve o token na variável `operator_token`.

---

## 🎭 Cenário 6: Testando Controle de Acesso por Roles

### 6.1 Admin - Acesso Total
```
GET {{base_url}}/usuarios
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Resultado**: ✅ Deve listar TODOS os usuários.

### 6.2 Gerente - Acesso Restrito à Sua Empresa
```
GET {{base_url}}/usuarios
```

**Headers**:
```
Authorization: Bearer {{manager_token}}
```

**Resultado**: ✅ Deve listar apenas usuários da empresa KNAPP.

### 6.3 Operador - Tentativa de Acesso Negado
```
GET {{base_url}}/usuarios
```

**Headers**:
```
Authorization: Bearer {{operator_token}}
```

**Resultado**: ❌ Deve retornar erro 403 - Acesso negado.

### 6.4 Operador - Acesso ao Próprio Perfil
```
GET {{base_url}}/usuarios/me
```

**Headers**:
```
Authorization: Bearer {{operator_token}}
```

**Resultado**: ✅ Deve retornar dados do próprio usuário.

---

## 📊 Cenário 7: Sistema de Logs

### 7.1 Visualizar Logs (como Admin)
```
GET {{base_url}}/logs
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

### 7.2 Filtrar Logs por Usuário
```
GET {{base_url}}/logs?usuario_id=2
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

### 7.3 Logs do Gerente (vê apenas logs da sua empresa)
```
GET {{base_url}}/logs
```

**Headers**:
```
Authorization: Bearer {{manager_token}}
```

### 7.4 Logs do Operador (vê apenas seus próprios logs)
```
GET {{base_url}}/logs
```

**Headers**:
```
Authorization: Bearer {{operator_token}}
```

---

## 🔄 Cenário 8: Simulação de JSON para OCI

### 8.1 Gerar JSON de Usuário (como Operador)
```
GET {{base_url}}/simulacao-json/usuario
```

**Headers**:
```
Authorization: Bearer {{operator_token}}
```

**Resposta esperada**:
```json
{
  "id": "usr_123456",
  "displayName": "Usuário de Exemplo",
  "email": "usuario@exemplo.com",
  "groups": [
    {
      "id": "grp_001",
      "name": "Grupo Financeiro"
    }
  ],
  "active": true
}
```

### 8.2 Gerar JSON de Grupo
```
GET {{base_url}}/simulacao-json/grupo
```

**Headers**:
```
Authorization: Bearer {{operator_token}}
```

---

## 🚫 Cenário 9: Testes de Validação e Segurança

### 9.1 Tentativa de Login com Credenciais Inválidas
```
POST {{base_url}}/auth/login
```

**Body (JSON)**:
```json
{
  "email": "inexistente@email.com",
  "senha": "senhaerrada"
}
```

**Resultado**: ❌ Deve retornar erro 401.

### 9.2 Tentativa de Acesso sem Token
```
GET {{base_url}}/usuarios
```

**Headers**: (sem Authorization)

**Resultado**: ❌ Deve retornar erro 401.

### 9.3 Registro com Email Duplicado
```
POST {{base_url}}/auth/register
```

**Body (JSON)**:
```json
{
  "nome": "Usuário Duplicado",
  "email": "maria.silva@empresa.com",
  "senha": "senha123"
}
```

**Resultado**: ❌ Deve retornar erro 400 - Email já em uso.

### 9.4 Gerente Tentando Criar Empresa
```
POST {{base_url}}/empresas
```

**Headers**:
```
Authorization: Bearer {{manager_token}}
```

**Body (JSON)**:
```json
{
  "nome": "Empresa Não Autorizada",
  "localizacao": "Local"
}
```

**Resultado**: ❌ Deve retornar erro 403 - Acesso negado.

---

## 📈 Cenário 10: Gerenciamento Avançado

### 10.1 Admin Visualizando Empresa Específica
```
GET {{base_url}}/empresas/2
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

### 10.2 Atualizar Empresa (como Admin)
```
PUT {{base_url}}/empresas/2
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Body (JSON)**:
```json
{
  "nome": "KNAPP SUDAMERICA LTDA",
  "localizacao": "Curitiba, Paraná, Brasil"
}
```

### 10.3 Rejeitar um Usuário Pendente
```
PATCH {{base_url}}/usuarios/ID_DO_USUARIO/aprovar
```

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Body (JSON)**:
```json
{
  "status": "rejeitado"
}
```

---

## 🎯 Checklist de Validação dos Requisitos

### ✅ Autenticação & User Management
- [x] Login page implementado (via API)
- [x] Auto-registro com aprovação admin
- [x] Role-based access control (Admin, Gerente, Operador)
- [x] Login inicial admin/admin funcionando

### ✅ Database & Data Management
- [x] Informações de usuário armazenadas
- [x] Logs de ações mantidos
- [x] Tabelas de parâmetros para API OCI
- [x] Detalhes de empresa armazenados

### ✅ Company Management
- [x] Admin pode criar/gerenciar empresas
- [x] Usuários associados a uma empresa (1:1)
- [x] Empresa pode ter múltiplos usuários (1:N)
- [x] Admin pode associar usuários a empresas

### ✅ JSON Request Handling & OCI Interaction
- [x] Página para gerar JSON requests (via API)
- [x] Formato JSON compatível com OCI
- [x] Logs de requests mantidos

### ✅ Security
- [x] Senhas criptografadas
- [x] Autenticação via JWT
- [x] Validação de entrada
- [x] Controle de acesso baseado em roles

---

## 🔧 Dicas para Testes no Postman

1. **Organize em Collections**: Crie uma collection para cada cenário
2. **Use Variáveis**: Configure base_url e tokens como variáveis
3. **Tests Scripts**: Use os scripts de teste do Postman para validar respostas
4. **Environments**: Crie environments para Dev/Prod
5. **Pre-request Scripts**: Configure tokens automaticamente

### Exemplo de Test Script no Postman:
```javascript
// Para salvar token após login
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("admin_token", response.token);
}

// Para validar status da resposta
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success status", function () {
    pm.expect(pm.response.json().status).to.eql("success");
});
```

Este guia cobre todos os requisitos do projeto e demonstra o funcionamento completo da API!