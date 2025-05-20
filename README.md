# Portal de Gestão de Acessos

Este projeto consiste em uma API para um sistema de gerenciamento de acessos que permite criar e gerenciar usuários, empresas e suas permissões. O sistema implementa controle de acesso baseado em funções (RBAC) com três níveis de acesso: Admin, Gerente e Operador.

## 📋 Estrutura do Projeto

```
PORTAL-GESTAO-ACESSOS/
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── authController.js
│   ├── empresaController.js
│   ├── jsonController.js
│   ├── logController.js
│   └── usuarioController.js
│
├── init/
│   ├── setupDB.js
│   ├── auth.js
│   ├── roles.js
│   └── validation.js
│
├── middleware/
│   └── [arquivos de middleware personalizados]
│
├── models/
│   ├── Empresa.js
│   ├── index.js
│   ├── Log.js
│   └── Usuario.js
│
├── routes/
│   ├── authRoutes.js
│   ├── empresaRoutes.js
│   ├── jsonRoutes.js
│   ├── logRoutes.js
│   └── usuarioRoutes.js
│
├── utils/
│   └── logger.js
│
├── .env
├── .gitignore
├── app.js
├── package-lock.json
├── package.json
└── server.js
```

## 🛠️ Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript server-side
- **Express.js**: Framework web para Node.js
- **MySQL**: Banco de dados relacional
- **Sequelize**: ORM (Object-Relational Mapping) para Node.js
- **JWT**: JSON Web Tokens para autenticação
- **bcrypt**: Para criptografia de senhas

## ✅ Requisitos

- Node.js (v14+)
- NPM (v6+)
- MySQL (v5.7+)

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

# Execute o script SQL inicial (se você tiver um)
mysql -u root -p portal_gestao_acessos < setup.sql
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
3. **Operador**: Acesso básico para executar operações padrão.

O primeiro login de admin é:
- **Email**: admin@example.com
- **Senha**: admin123

## 📱 Guia de Uso com Postman

### 📌 Configuração do Postman

1. Abra o Postman
2. Crie uma nova coleção chamada "Portal de Gestão de Acessos"
3. Configure uma variável de ambiente:
   - Nome: `base_url`
   - Valor inicial: `http://localhost:3000/api`
   - Valor atual: `http://localhost:3000/api`

### 🔑 1. Autenticação

#### Login
- **Método**: POST
- **URL**: `{{base_url}}/auth/login`
- **Body** (JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
- **O que acontece**: Retorna um token JWT que deve ser usado nas próximas requisições.
- **Como usar o token**: Copie o valor do token do campo `token` na resposta.

![Imagem ilustrativa de login no Postman](https://via.placeholder.com/600x300?text=Login+no+Postman)

#### Como configurar o token para as próximas requisições:
1. Clique na requisição que deseja fazer
2. Vá na aba "Authorization"
3. Selecione Type: "Bearer Token"
4. Cole o token no campo "Token"

![Imagem ilustrativa de configuração do token](https://via.placeholder.com/600x300?text=Configuração+do+Token)

### 👤 2. Gerenciamento de Usuários

#### Cadastrar novo usuário
- **Método**: POST
- **URL**: `{{base_url}}/usuarios`
- **Authorization**: Bearer Token
- **Body** (JSON):
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "empresa_id": 1
}
```

#### Listar todos os usuários
- **Método**: GET
- **URL**: `{{base_url}}/usuarios`
- **Authorization**: Bearer Token

#### Obter usuário por ID
- **Método**: GET
- **URL**: `{{base_url}}/usuarios/1`
- **Authorization**: Bearer Token

#### Atualizar usuário
- **Método**: PUT
- **URL**: `{{base_url}}/usuarios/1`
- **Authorization**: Bearer Token
- **Body** (JSON):
```json
{
  "nome": "João Silva Atualizado",
  "role": "gerente"
}
```

#### Aprovar usuário
- **Método**: PATCH
- **URL**: `{{base_url}}/usuarios/1/aprovar`
- **Authorization**: Bearer Token

#### Excluir usuário
- **Método**: DELETE
- **URL**: `{{base_url}}/usuarios/1`
- **Authorization**: Bearer Token

### 🏢 3. Gerenciamento de Empresas

#### Criar empresa
- **Método**: POST
- **URL**: `{{base_url}}/empresas`
- **Authorization**: Bearer Token
- **Body** (JSON):
```json
{
  "nome": "Empresa ABC",
  "localizacao": "São Paulo, SP"
}
```

#### Listar empresas
- **Método**: GET
- **URL**: `{{base_url}}/empresas`
- **Authorization**: Bearer Token

#### Obter empresa por ID
- **Método**: GET
- **URL**: `{{base_url}}/empresas/1`
- **Authorization**: Bearer Token

#### Atualizar empresa
- **Método**: PUT
- **URL**: `{{base_url}}/empresas/1`
- **Authorization**: Bearer Token
- **Body** (JSON):
```json
{
  "nome": "Empresa ABC Ltda.",
  "localizacao": "Rio de Janeiro, RJ"
}
```

#### Excluir empresa
- **Método**: DELETE
- **URL**: `{{base_url}}/empresas/1`
- **Authorization**: Bearer Token

### 📝 4. Visualização de Logs

#### Listar logs do sistema
- **Método**: GET
- **URL**: `{{base_url}}/logs`
- **Authorization**: Bearer Token

#### Listar logs por usuário
- **Método**: GET
- **URL**: `{{base_url}}/logs/usuario/1`
- **Authorization**: Bearer Token

### 🔄 Fluxo de Teste Completo

Para testar completamente o sistema, siga este fluxo:

1. **Login como Admin**:
   - Use `admin@example.com` e `admin123`
   - Guarde o token recebido

2. **Crie uma Empresa**:
   - Use o token do admin
   - Crie uma nova empresa

3. **Cadastre um Usuário Gerente**:
   - Use o token do admin
   - Crie um usuário com role "gerente" e associe à empresa criada

4. **Aprove o Usuário Gerente**:
   - Use o token do admin
   - Aprove o usuário gerente

5. **Faça Login como Gerente**:
   - Use as credenciais do gerente
   - Guarde o novo token

6. **Cadastre um Usuário Operador**:
   - Use o token do gerente
   - Crie um usuário com role "operador" na mesma empresa

7. **Verifique os Logs**:
   - Use o token do admin
   - Visualize os logs do sistema para verificar as ações realizadas

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

## 🔒 Considerações de Segurança

- Todas as senhas são armazenadas de forma criptografada usando bcrypt
- A autenticação é realizada via tokens JWT
- Controle de acesso baseado em funções (RBAC) implementado
- Validação de entrada em todas as rotas

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

