// API.js - Gerenciador de chamadas para a API
class APIManager {
    constructor() {
        this.baseURL = '/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    // Obter headers com token de autenticação
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            ...this.defaultHeaders,
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    // Método genérico para requisições
    async request(method, endpoint, data = null, customHeaders = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = { ...this.getAuthHeaders(), ...customHeaders };

        const config = {
            method: method.toUpperCase(),
            headers
        };

        if (data && (method.toLowerCase() !== 'get')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            
            // Se o token expirou ou é inválido
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Erro HTTP: ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error(`Erro na requisição ${method} ${endpoint}:`, error);
            throw error;
        }
    }

    // Métodos HTTP específicos
    async get(endpoint, customHeaders = {}) {
        return this.request('GET', endpoint, null, customHeaders);
    }

    async post(endpoint, data, customHeaders = {}) {
        return this.request('POST', endpoint, data, customHeaders);
    }

    async put(endpoint, data, customHeaders = {}) {
        return this.request('PUT', endpoint, data, customHeaders);
    }

    async patch(endpoint, data, customHeaders = {}) {
        return this.request('PATCH', endpoint, data, customHeaders);
    }

    async delete(endpoint, customHeaders = {}) {
        return this.request('DELETE', endpoint, null, customHeaders);
    }

    // Gerenciar token expirado
    handleUnauthorized() {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        
        // Redirecionar para login se não estiver na tela de auth
        if (window.app && !document.getElementById('login-screen').classList.contains('hidden')) {
            window.app.logout();
        }
    }

    // Auth endpoints
    async login(credentials) {
        return this.post('/auth/login', credentials);
    }

    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async debug() {
        return this.get('/auth/debug');
    }

    // User endpoints
    async getMe() {
        return this.get('/usuarios/me');
    }

    async getUsers() {
        return this.get('/usuarios');
    }

    async getUser(id) {
        return this.get(`/usuarios/${id}`);
    }

    async approveUser(id, status) {
        return this.patch(`/usuarios/${id}/aprovar`, { status });
    }

    async associateCompany(userId, companyId) {
        return this.patch(`/usuarios/${userId}/empresa`, { empresa_id: companyId });
    }

    // Company endpoints
    async getCompanies() {
        return this.get('/empresas');
    }

    async getCompany(id) {
        return this.get(`/empresas/${id}`);
    }

    async createCompany(companyData) {
        return this.post('/empresas', companyData);
    }

    async updateCompany(id, companyData) {
        return this.put(`/empresas/${id}`, companyData);
    }

    async deleteCompany(id) {
        return this.delete(`/empresas/${id}`);
    }

    // Logs endpoints
    async getLogs(filters = {}) {
        let endpoint = '/logs';
        const params = new URLSearchParams();
        
        if (filters.usuario_id) params.append('usuario_id', filters.usuario_id);
        if (filters.acao) params.append('acao', filters.acao);
        if (filters.data_inicio) params.append('data_inicio', filters.data_inicio);
        if (filters.data_fim) params.append('data_fim', filters.data_fim);
        
        if (params.toString()) {
            endpoint += '?' + params.toString();
        }
        
        return this.get(endpoint);
    }

    // JSON simulation endpoints
    async getUserJson() {
        return this.get('/simulacao-json/usuario');
    }

    async getGroupJson() {
        return this.get('/simulacao-json/grupo');
    }

    // Dashboard stats (combinação de várias APIs)
    async getDashboardStats() {
        try {
            const [users, companies, logs] = await Promise.allSettled([
                this.getUsers(),
                this.getCompanies(),
                this.getLogs()
            ]);

            const stats = {
                totalUsers: 0,
                pendingUsers: 0,
                totalCompanies: 0,
                recentLogs: 0
            };

            // Processar usuários
            if (users.status === 'fulfilled' && users.value.status === 'success') {
                const userData = users.value.data.usuarios;
                stats.totalUsers = userData.length;
                stats.pendingUsers = userData.filter(user => user.status === 'pendente').length;
            }

            // Processar empresas
            if (companies.status === 'fulfilled' && companies.value.status === 'success') {
                stats.totalCompanies = companies.value.data.empresas.length;
            }

            // Processar logs
            if (logs.status === 'fulfilled' && logs.value.status === 'success') {
                stats.recentLogs = logs.value.data.logs.length;
            }

            return stats;
        } catch (error) {
            console.error('Erro ao carregar estatísticas do dashboard:', error);
            return {
                totalUsers: 0,
                pendingUsers: 0,
                totalCompanies: 0,
                recentLogs: 0
            };
        }
    }

    // Método para upload de arquivos (se necessário no futuro)
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        const headers = { ...this.getAuthHeaders() };
        delete headers['Content-Type']; // Deixar o browser definir o Content-Type para FormData

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Erro HTTP: ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error(`Erro no upload para ${endpoint}:`, error);
            throw error;
        }
    }

    // Métodos de validação
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPassword(password) {
        return password && password.length >= 6;
    }

    // Método para verificar conectividade
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }

    // Método para retry automático em caso de falha de rede
    async requestWithRetry(method, endpoint, data = null, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                return await this.request(method, endpoint, data);
            } catch (error) {
                if (i === retries - 1) throw error;
                
                // Aguardar antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    // Interceptor para logs de debug (apenas em desenvolvimento)
    enableDebugMode() {
        const originalRequest = this.request.bind(this);
        
        this.request = async function(method, endpoint, data, customHeaders) {
            console.log(`🚀 ${method} ${endpoint}`, data ? { data } : '');
            
            const startTime = Date.now();
            try {
                const result = await originalRequest(method, endpoint, data, customHeaders);
                const duration = Date.now() - startTime;
                console.log(`✅ ${method} ${endpoint} (${duration}ms)`, result);
                return result;
            } catch (error) {
                const duration = Date.now() - startTime;
                console.error(`❌ ${method} ${endpoint} (${duration}ms)`, error);
                throw error;
            }
        };
    }
}

// Criar instância global da API
window.API = new APIManager();

// Habilitar modo debug em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.API.enableDebugMode();
}