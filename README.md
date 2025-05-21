# Portal de Gestão de Acessos - Backend API

Este projeto consiste em uma API RESTful para um sistema de gerenciamento de acessos que permite criar e gerenciar usuários, empresas e suas permissões, além de simular a geração de requisições JSON para Oracle Cloud Infrastructure (OCI). O sistema implementa controle de acesso baseado em funções (RBAC) com três níveis de acesso: Admin, Gerente e Operador.

> **Nota**: Esta é a implementação do backend. A integração com o frontend será realizada em uma etapa posterior do projeto.

## 📋 Estrutura do Projeto

```
PORTAL-GESTAO-ACESSOS/
│
├── config/
│   └── database.js       # Configuração de conexão com o MySQL
│
├── controllers/
│   ├── authController.js     # Lógica de autenticação
│   ├── empresaController.js  # Gerenciamento de empresas
│   ├── jsonController.js     # Geração de JSONs para OCI (simulação)
│   ├── logController.js      # Registro e consulta de logs
│   └── usuarioController.js  # Gerenciamento de usuários
│
├── init/
│   ├── setupDB.js        # Script para inicialização do banco de dados
│   ├── auth.js           # Configurações de autenticação
│   ├── roles.js          # Definição de funções e permissões
│   └── validation.js     # Validações de entrada
│
├── middleware/
│   └── [arquivos de middleware] # Middlewares personalizados (autenticação, validação, etc.)
│
├── models/
│   ├── Empresa.js        # Modelo de dados para empresas
│   ├── index.js          # Configuração do Sequelize e relações entre modelos
│   ├── Log.js            # Modelo para registro de atividades
│   └── Usuario.js        # Modelo de dados para usuários
│
├── routes/
│   ├── authRoutes.js     # Rotas de autenticação
│   ├── empresaRoutes.js  # Rotas para gerenciamento de empresas
│   ├── jsonRoutes.js     # Rotas para geração de JSONs 
│   ├── logRoutes.js      # Rotas para consulta de logs
│   └── usuarioRoutes.js  # Rotas para gerenciamento de usuários
│
├── utils/
│   └── logger.js         # Utilitário para registro de logs
│
├── .env                  # Variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git
├── app.js                # Configuração do Express
├── package-lock.json
├── package.json
└── server.js             # Inicialização do servidor
```

## 🛠️ Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript server-side
- **Express.js**: Framework web para Node.js
- **MySQL**: Banco de dados relacional
- **Sequelize**: ORM (Object-Relational Mapping) para Node.js
- **JWT**: JSON Web Tokens para autenticação
- **bcrypt**: Para criptografia de senhas
- **Morgan**: Middleware de logging para Express

## ✅ Requisitos do Projeto

### 1. Autenticação e Gerenciamento de Usuários
- Implementação de login e auto-registro de usuários
- Aprovação de novos usuários por administradores
- Controle de acesso baseado em funções (Admin, Manager, Operator)
- Login inicial do sistema: `admin/admin`

### 2. Banco de Dados
- Armazenamento de usuários, permissões, funções, empresas
- Formato JSON para integração com OCI
- Logs de atividades do sistema

### 3. Gerenciamento de Empresas
- Cadastro e gerenciamento de empresas
- Associação entre usuários e empresas (1:1)
- Empresas podem ter múltiplos usuários (1:N)

### 4. Geração de JSON para OCI
- Simulação de geração de JSONs no formato da API da OCI
- Endpoints para criação de usuário, grupo e política

### 5. Logs
- Registro de todas as ações dos usuários no sistema

## 📥 Instalação

### 1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/portal-gestao-acessos.git
cd portal-gestao-acessos
```

### 2. Instale as dependências:
```bash
npm install
```

### 3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com:
```
# Configuração do Servidor
PORT=3000
NODE_ENV=development

# Configuração do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=portal_gestao_acessos

# Configuração JWT
JWT_SECRET=seu_segredo_jwt
JWT_EXPIRES_IN=1d
```

### 4. Configure o banco de dados:
```bash
# Crie o banco de dados
mysql -u root -p -e "CREATE DATABASE portal_gestao_acessos;"
```

### 5. Inicialize o banco de dados:
```bash
# Executa o script que cria tabelas e dados iniciais
node init/setupDB.js
```

### 6. Inicie o servidor:
```bash
npm start
```

## 🔐 Sistema de Autenticação

O sistema trabalha com três níveis de acesso:

1. **Admin**: Acesso total ao sistema, podendo gerenciar usuários, empresas e todas as funcionalidades.
2. **Gerente**: Pode gerenciar usuários vinculados à sua empresa.
3. **Operador**: Acesso básico para gerar e enviar requisições JSON.

O primeiro login de admin é:
- **Email**: admin@example.com
- **Senha**: admin

## 📱 API Endpoints

### 🔑 Autenticação

```
POST /api/login              # Autenticação de usuário
POST /api/register           # Auto-registro de usuário
```

### 👤 Usuários

```
GET    /api/usuarios         # Listar todos os usuários
POST   /api/usuarios         # Criar um novo usuário
GET    /api/usuarios/:id     # Obter usuário por ID
PUT    /api/usuarios/:id     # Atualizar usuário
DELETE /api/usuarios/:id     # Excluir usuário
PATCH  /api/usuarios/:id/aprovar  # Aprovar usuário
```

### 🏢 Empresas

```
GET    /api/empresas         # Listar todas as empresas
POST   /api/empresas         # Criar uma nova empresa
GET    /api/empresas/:id     # Obter empresa por ID 
PUT    /api/empresas/:id     # Atualizar empresa
DELETE /api/empresas/:id     # Excluir empresa
```

### 📝 Logs

```
GET    /api/logs             # Listar todos os logs
GET    /api/logs/usuario/:id # Listar logs por usuário
```

### 💾 Simulação JSON para OCI

```
POST   /api/simulacao-json/usuario  # Gerar JSON para criação de usuário na OCI
POST   /api/simulacao-json/grupo    # Gerar JSON para criação de grupo na OCI
POST   /api/simulacao-json/politica # Gerar JSON para criação de política na OCI
```

## 📊 Modelo de Dados

### Usuario
- **id**: Identificador único
- **nome**: Nome do usuário
- **email**: Email do usuário (único)
- **senha_hash**: Senha criptografada
- **role**: Função (admin, gerente, operador)
- **status**: Status (pendente, aprovado, rejeitado)
- **empresa_id**: ID da empresa associada
- **criado_em**: Data de criação

### Empresa
- **id**: Identificador único
- **nome**: Nome da empresa
- **localizacao**: Localização da empresa

### Log
- **id**: Identificador único
- **usuario_id**: ID do usuário que realizou a ação
- **acao**: Descrição da ação realizada
- **timestamp**: Data e hora da ação

## 📋 Exemplos de Requisição e Resposta

### Login de Usuário
```
POST /api/login
```
Requisição:
```json
{
  "email": "admin@example.com",
  "password": "admin"
}
```
Resposta:
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Criar Empresa
```
POST /api/empresas
```
Requisição:
```json
{
  "nome": "KNAPP SUDAMERICA",
  "localizacao": "Curitiba, PR"
}
```
Resposta:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "nome": "KNAPP SUDAMERICA",
    "localizacao": "Curitiba, PR",
    "criado_em": "2025-05-20T10:30:00.000Z"
  }
}
```

### Gerar JSON para OCI (Simulação)
```
POST /api/simulacao-json/usuario
```
Requisição:
```json
{
  "nome": "novousuario@empresa.com",
  "descricao": "Usuário para acesso à plataforma"
}
```
Resposta:
```json
{
  "status": "success",
  "data": {
    "compartmentId": "ocid1.tenancy.oc1.maisinteligencia.infrastructure",
    "name": "novousuario@empresa.com",
    "description": "Usuário para acesso à plataforma"
  }
}
```

## 🔒 Considerações de Segurança

- Todas as senhas são armazenadas de forma criptografada usando bcrypt
- A autenticação é realizada via tokens JWT
- Controle de acesso baseado em funções (RBAC) implementado
- Validação de entrada em todas as rotas
- Registro de logs para auditoria

## 🚀 Próximos Passos

- Desenvolvimento do frontend para integração com esta API
- Interface de usuário seguindo as diretrizes de UI/UX do projeto
- Implementação de dashboard para visualização de informações

## 🐛 Resolução de Problemas

### Problemas com o Banco de Dados
- Verifique se o MySQL está em execução
- Confirme as credenciais no arquivo `.env`
- Execute `node init/setupDB.js` para reinicializar o banco

### Erro "Token inválido"
- O token pode ter expirado; faça login novamente
- Verifique se o token está sendo enviado corretamente no header Authorization

### Erro "Acesso negado"
- Verifique se o usuário tem as permissões necessárias para acessar o recurso
- Admin pode acessar tudo; Gerente só pode gerenciar usuários da sua empresa

## 📄 Licença

Este projeto está licenciado sob a licença MIT.