# Portal de Gestão de Acessos - Backend

Este é o backend para o Portal de Gestão de Acessos, desenvolvido com Node.js, Express e MySQL.

## Tecnologias Utilizadas

- Node.js com Express
- MySQL (com Sequelize ORM)
- JWT para autenticação
- bcrypt para criptografia de senhas
- express-validator para validação de dados

## Estrutura do Projeto

O projeto segue a arquitetura MVC (Model-View-Controller):

- **Models**: Definições das tabelas do banco de dados
- **Controllers**: Lógica de negócios
- **Routes**: Definição de endpoints da API
- **Middleware**: Funções intermediárias para autenticação, autorização, etc.
- **Utils**: Funções utilitárias

## Configuração e Instalação

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Crie um arquivo `.env` baseado no `.env.example`
4. Configure o banco de dados MySQL
5. Inicialize o banco de dados:
   ```
   node init/setupDB.js
   ```
6. Inicie o servidor:
   ```
   npm run dev
   ```

## Endpoints da API

### Autenticação
- `POST /api/login` - Login e geração de token JWT
- `POST /api/register` - Registro de novo usuário (pendente de aprovação)

### Usuários
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/:id` - Obter um usuário específico
- `GET /api/usuarios/me` - Obter dados do usuário logado
- `PATCH /api/usuarios/:id/aprovar` - Aprovar/rejeitar usuário
- `PATCH /api/usuarios/:id/empresa` - Associar usuário a uma empresa

### Empresas
- `GET /api/empresas` - Listar empresas
- `GET /api/empresas/:id` - Obter uma empresa específica
- `POST /api/empresas` - Criar empresa
- `PUT /api/empresas/:id` - Atualizar empresa
- `DELETE /api/empresas/:id` - Excluir empresa

### Logs
- `GET /api/logs` - Listar logs de ações

### Simulação JSON
- `GET /api/simulacao-json/usuario` - JSON simulado de usuário
- `GET /api/simulacao-json/grupo` - JSON simulado de grupo

## Papéis e Permissões

- **admin**: Acesso total ao sistema
- **gerente**: Pode gerenciar usuários da própria empresa
- **operador**: Pode apenas ver seu perfil e gerar JSON simulado

## Segurança

- Autenticação via JWT
- Senhas criptografadas com bcrypt
- Validação de dados em todas as entradas
- Controle de acesso baseado em papéis