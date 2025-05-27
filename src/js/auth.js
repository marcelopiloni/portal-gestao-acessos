// Auth.js - Gerenciamento de autenticação
class AuthManager {
    constructor() {
        this.token = null;
        this.user = null;
        this.refreshTimer = null;
        this.sessionCheckInterval = null;
        
        this.init();
    }

    init() {
        // Carregar dados salvos
        this.loadStoredAuth();
        
        // Configurar verificação periódica de sessão
        this.startSessionCheck();
        
        // Event listeners para visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkSessionValidity();
            }
        });

        // Event listener para storage changes (múltiplas abas)
        window.addEventListener('storage', (e) => {
            if (e.key === 'token' || e.key === 'userData') {
                this.handleStorageChange();
            }
        });
    }

    // Carregar dados de autenticação salvos
    loadStoredAuth() {
        this.token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (userData) {
            try {
                this.user = JSON.parse(userData);
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                this.clearAuth();
            }
        }
    }

    // Fazer login
    async login(credentials) {
        try {
            // Validar credenciais
            if (!this.validateLoginCredentials(credentials)) {
                throw new Error('Credenciais inválidas');
            }

            const response = await API.login(credentials);
            
            if (response.status === 'success') {
                // Salvar dados de autenticação
                this.token = response.token;
                this.user = response.data.usuario;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('userData', JSON.stringify(this.user));
                
                // Configurar refresh automático do token
                this.setupTokenRefresh();
                
                // Log da ação
                console.log('Login realizado com sucesso:', this.user.nome);
                
                return {
                    success: true,
                    user: this.user,
                    message: 'Login realizado com sucesso!'
                };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                message: error.message || 'Erro ao fazer login'
            };
        }
    }

    // Fazer registro
    async register(userData) {
        try {
            // Validar dados de registro
            if (!this.validateRegistrationData(userData)) {
                throw new Error('Dados de registro inválidos');
            }

            const response = await API.register(userData);
            
            if (response.status === 'success') {
                console.log('Registro realizado com sucesso');
                
                return {
                    success: true,
                    message: response.message || 'Cadastro realizado com sucesso! Aguarde aprovação.'
                };
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            return {
                success: false,
                message: error.message || 'Erro ao realizar cadastro'
            };
        }
    }

    // Fazer logout
    logout() {
        // Limpar dados locais
        this.clearAuth();
        
        // Parar timers
        this.stopTokenRefresh();
        this.stopSessionCheck();
        
        // Redirecionar para tela de login
        if (window.app) {
            window.app.showAuthScreen();
        }
        
        console.log('Logout realizado');
        Utils.showNotification('Logout realizado com sucesso', 'info');
    }

    // Limpar dados de autenticação
    clearAuth() {
        this.token = null;
        this.user = null;
        
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    }

    // Verificar se usuário está autenticado
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.user;
    }

    // Obter token atual
    getToken() {
        return this.token;
    }

    // Verificar permissões
    hasPermission(roles) {
        if (!this.user) return false;
        
        if (Array.isArray(roles)) {
            return roles.includes(this.user.role);
        }
        
        return this.user.role === roles;
    }

    // Verificar se é administrador
    isAdmin() {
        return this.hasPermission('admin');
    }

    // Verificar se é gerente
    isManager() {
        return this.hasPermission(['admin', 'gerente']);
    }

    // Atualizar dados do usuário
    updateUserData(newUserData) {
        if (newUserData) {
            this.user = { ...this.user, ...newUserData };
            localStorage.setItem('userData', JSON.stringify(this.user));
        }
    }

    // Verificar validade da sessão
    async checkSessionValidity() {
        if (!this.token) return false;

        try {
            // Fazer uma requisição simples para verificar se o token ainda é válido
            const response = await API.getMe();
            
            if (response.status === 'success') {
                // Atualizar dados do usuário se necessário
                this.updateUserData(response.data.usuario);
                return true;
            }
        } catch (error) {
            if (error.message.includes('expirada') || error.message.includes('inválido')) {
                console.log('Sessão expirada, fazendo logout');
                this.logout();
                return false;
            }
        }
        
        return this.isAuthenticated();
    }

    // Configurar verificação periódica de sessão
    startSessionCheck() {
        // Verificar a cada 5 minutos
        this.sessionCheckInterval = setInterval(() => {
            if (this.isAuthenticated()) {
                this.checkSessionValidity();
            }
        }, 5 * 60 * 1000);
    }

    // Parar verificação de sessão
    stopSessionCheck() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
    }

    // Configurar refresh automático do token (se implementado no backend)
    setupTokenRefresh() {
        // Por enquanto, apenas monitorar a validade
        // Se o backend implementar refresh tokens, adicionar lógica aqui
        this.stopTokenRefresh();
        
        // Verificar validade a cada hora
        this.refreshTimer = setInterval(() => {
            this.checkSessionValidity();
        }, 60 * 60 * 1000);
    }

    // Parar refresh do token
    stopTokenRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    // Lidar com mudanças no localStorage (múltiplas abas)
    handleStorageChange() {
        const newToken = localStorage.getItem('token');
        const newUserData = localStorage.getItem('userData');
        
        // Se token foi removido em outra aba, fazer logout
        if (!newToken && this.token) {
            console.log('Token removido em outra aba, fazendo logout');
            this.token = null;
            this.user = null;
            if (window.app) {
                window.app.showAuthScreen();
            }
            return;
        }
        
        // Se token foi adicionado em outra aba, atualizar dados
        if (newToken && !this.token) {
            console.log('Login detectado em outra aba, atualizando dados');
            this.loadStoredAuth();
            if (window.app) {
                window.app.checkAuth();
            }
        }
    }

    // Validações
    validateLoginCredentials(credentials) {
        if (!credentials) return false;
        
        const { email, senha } = credentials;
        
        if (!email || !senha) {
            return false;
        }
        
        if (!Utils.isValidEmail(email)) {
            throw new Error('Email inválido');
        }
        
        if (!Utils.isValidPassword(senha)) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
        }
        
        return true;
    }

    validateRegistrationData(userData) {
        if (!userData) return false;
        
        const { nome, email, senha, role } = userData;
        
        if (!nome || !email || !senha) {
            throw new Error('Todos os campos obrigatórios devem ser preenchidos');
        }
        
        if (!Utils.isValidName(nome)) {
            throw new Error('Nome deve ter pelo menos 2 caracteres');
        }
        
        if (!Utils.isValidEmail(email)) {
            throw new Error('Email inválido');
        }
        
        if (!Utils.isValidPassword(senha)) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
        }
        
        if (role && !['admin', 'gerente', 'operador'].includes(role)) {
            throw new Error('Cargo inválido');
        }
        
        return true;
    }

    // Obter informações de status da autenticação
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated(),
            user: this.user,
            hasToken: !!this.token,
            permissions: this.user ? {
                isAdmin: this.isAdmin(),
                isManager: this.isManager(),
                role: this.user.role
            } : null
        };
    }

    // Debug: obter informações detalhadas
    getDebugInfo() {
        return {
            token: this.token ? 'Present' : 'Missing',
            user: this.user ? {
                id: this.user.id,
                nome: this.user.nome,
                email: this.user.email,
                role: this.user.role,
                status: this.user.status
            } : 'Not loaded',
            timers: {
                refreshTimer: !!this.refreshTimer,
                sessionCheckInterval: !!this.sessionCheckInterval
            },
            localStorage: {
                token: !!localStorage.getItem('token'),
                userData: !!localStorage.getItem('userData')
            }
        };
    }

    // Método para forçar recarregamento dos dados do usuário
    async refreshUserData() {
        if (!this.isAuthenticated()) return false;

        try {
            const response = await API.getMe();
            
            if (response.status === 'success') {
                this.updateUserData(response.data.usuario);
                return true;
            }
        } catch (error) {
            console.error('Erro ao atualizar dados do usuário:', error);
        }
        
        return false;
    }

    // Método para verificar se precisa de aprovação
    needsApproval() {
        return this.user && this.user.status === 'pendente';
    }

    // Método para verificar se foi rejeitado
    isRejected() {
        return this.user && this.user.status === 'rejeitado';
    }

    // Método para verificar se está aprovado
    isApproved() {
        return this.user && this.user.status === 'aprovado';
    }

    // Método para lidar com diferentes status de usuário
    handleUserStatus() {
        if (!this.user) return 'login';

        switch (this.user.status) {
            case 'pendente':
                return 'pending';
            case 'rejeitado':
                return 'rejected';
            case 'aprovado':
                return 'approved';
            default:
                return 'unknown';
        }
    }

    // Limpeza ao destruir o gerenciador
    destroy() {
        this.stopTokenRefresh();
        this.stopSessionCheck();
        
        // Remover event listeners
        document.removeEventListener('visibilitychange', this.checkSessionValidity);
        window.removeEventListener('storage', this.handleStorageChange);
    }
}

// Criar instância global
window.AuthManager = new AuthManager();