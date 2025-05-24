// Configurações da API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Endpoints da API
export const ENDPOINTS = {
  // Autenticação
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Usuários
  USERS: '/usuarios',
  USER_BY_ID: (id) => `/usuarios/${id}`,
  APPROVE_USER: (id) => `/usuarios/${id}/aprovar`,
  ASSOCIATE_COMPANY: (id) => `/usuarios/${id}/associar-empresa`,
  
  // Empresas
  COMPANIES: '/empresas',
  COMPANY_BY_ID: (id) => `/empresas/${id}`,
  
  // Logs
  LOGS: '/logs',
  
  // Simulação JSON
  SIMULATE_USER_JSON: '/simulacao-json/usuario',
  SIMULATE_GROUP_JSON: '/simulacao-json/grupo',
};

// Roles de usuário
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'gerente',
  OPERATOR: 'operador',
};

// Status de usuário
export const USER_STATUS = {
  PENDING: 'pendente',
  APPROVED: 'aprovado',
  REJECTED: 'rejeitado',
};

// Permissões por role
export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'view_dashboard',
    'manage_users',
    'manage_companies',
    'view_logs',
    'generate_json',
    'approve_users',
    'associate_companies',
  ],
  [USER_ROLES.MANAGER]: [
    'view_dashboard',
    'view_users',
    'view_company_users',
    'view_logs',
    'generate_json',
  ],
  [USER_ROLES.OPERATOR]: [
    'view_dashboard',
    'generate_json',
  ],
};

// Navegação do sistema
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fas fa-tachometer-alt',
    path: '/dashboard',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATOR],
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    icon: 'fas fa-users',
    path: '/usuarios',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  },
  {
    id: 'empresas',
    label: 'Empresas',
    icon: 'fas fa-building',
    path: '/empresas',
    roles: [USER_ROLES.ADMIN],
  },
  {
    id: 'logs',
    label: 'Logs',
    icon: 'fas fa-clipboard-list',
    path: '/logs',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  },
  {
    id: 'json-simulator',
    label: 'Simulador JSON',
    icon: 'fas fa-code',
    path: '/json-simulator',
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.OPERATOR],
  },
];

// Mensagens do sistema
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login realizado com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!',
    USER_APPROVED: 'Usuário aprovado com sucesso!',
    USER_REJECTED: 'Usuário rejeitado com sucesso!',
    USER_CREATED: 'Usuário criado com sucesso!',
    USER_UPDATED: 'Usuário atualizado com sucesso!',
    COMPANY_CREATED: 'Empresa criada com sucesso!',
    COMPANY_UPDATED: 'Empresa atualizada com sucesso!',
    COMPANY_DELETED: 'Empresa excluída com sucesso!',
    COMPANY_ASSOCIATED: 'Empresa associada com sucesso!',
  },
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    UNAUTHORIZED: 'Acesso não autorizado.',
    FORBIDDEN: 'Você não tem permissão para esta ação.',
    NOT_FOUND: 'Recurso não encontrado.',
    VALIDATION: 'Dados inválidos. Verifique os campos.',
    COMPANY_HAS_USERS: 'Não é possível excluir a empresa porque existem usuários associados.',
  },
  WARNING: {
    UNSAVED_CHANGES: 'Você tem alterações não salvas.',
    DELETE_CONFIRMATION: 'Tem certeza que deseja excluir?',
  },
  INFO: {
    LOADING: 'Carregando...',
    NO_DATA: 'Nenhum dado encontrado.',
    PENDING_APPROVAL: 'Aguardando aprovação.',
  },
};

// Configurações de validação
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Digite um email válido',
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MESSAGE: 'A senha deve ter pelo menos 6 caracteres',
  },
  NAME: {
    MIN_LENGTH: 2,
    MESSAGE: 'O nome deve ter pelo menos 2 caracteres',
  },
  COMPANY: {
    MIN_LENGTH: 2,
    MESSAGE: 'O nome da empresa deve ter pelo menos 2 caracteres',
  },
};

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
};

// Configurações de tema
export const THEME = {
  COLORS: {
    PRIMARY: '#AEC455',
    SECONDARY: '#416d9c',
    SUCCESS: '#28a745',
    DANGER: '#dc3545',
    WARNING: '#ffc107',
    INFO: '#17a2b8',
  },
  BREAKPOINTS: {
    SM: '576px',
    MD: '768px',
    LG: '992px',
    XL: '1200px',
  },
};

// Configurações de local storage
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  PREFERENCES: 'user_preferences',
};

// OCI JSON Templates
export const OCI_TEMPLATES = {
  USER: {
    compartmentId: "ocid1.tenancy.oc1.maisinteligencia.infrastructure",
    name: "",
    description: "User for web platform access"
  },
  GROUP: {
    compartmentId: "ocid1.tenancy.oc1.maisinteligencia.infrastructure",
    name: "",
    description: "Group for web platform users"
  },
  POLICY: {
    compartmentId: "ocid1.tenancy.oc1.maisinteligencia.infrastructure",
    name: "",
    description: "Policy to grant web platform permissions",
    statements: []
  },
};