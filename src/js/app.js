// App.js - Controlador principal da aplicação
class App {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        // Verificar se usuário está logado
        this.checkAuth();

        // Inicializar event listeners
        this.initEventListeners();

        // Inicializar componentes
        this.initComponents();
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.showMainApp();
                this.setupUserInterface();
                this.loadDashboard();
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                this.logout();
            }
        } else {
            this.showAuthScreen();
        }
    }

    initEventListeners() {
        // Auth form listeners
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Auth screen toggle
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterScreen();
        });

        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginScreen();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());

        // JSON Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTabSwitch(e));
        });

        // JSON Generation
        document.getElementById('generate-user-json')?.addEventListener('click', () => this.generateUserJson());
        document.getElementById('generate-group-json')?.addEventListener('click', () => this.generateGroupJson());

        // Company management
        document.getElementById('add-company-btn')?.addEventListener('click', () => this.showAddCompanyModal());

        // Log filtering
        document.getElementById('filter-logs')?.addEventListener('click', () => this.filterLogs());
    }

    initComponents() {
        // Inicializar modal
        window.modal = new Modal();

        // Configurar componentes baseados no role do usuário
        if (this.currentUser) {
            this.setupRoleBasedVisibility();
        }
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const messageContainer = document.getElementById('login-message');

        if (!email || !password) {
            this.showMessage(messageContainer, 'Por favor, preencha todos os campos.', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await API.post('/auth/login', {
                email: email,
                senha: password
            });

            if (response.status === 'success') {
                // Salvar token e dados do usuário
                localStorage.setItem('token', response.token);
                localStorage.setItem('userData', JSON.stringify(response.data.usuario));

                this.currentUser = response.data.usuario;
                this.showMainApp();
                this.setupUserInterface();
                this.loadDashboard();

                this.showMessage(messageContainer, 'Login realizado com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showMessage(messageContainer, error.message || 'Erro ao fazer login', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        const messageContainer = document.getElementById('register-message');

        if (!name || !email || !password) {
            this.showMessage(messageContainer, 'Por favor, preencha todos os campos.', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage(messageContainer, 'A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await API.post('/auth/register', {
                nome: name,
                email: email,
                senha: password,
                role: role
            });

            if (response.status === 'success') {
                this.showMessage(messageContainer, response.message || 'Cadastro realizado com sucesso! Aguarde aprovação.', 'success');

                // Limpar formulário
                document.getElementById('register-form').reset();

                // Voltar para tela de login após 3 segundos
                setTimeout(() => {
                    this.showLoginScreen();
                }, 3000);
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            this.showMessage(messageContainer, error.message || 'Erro ao realizar cadastro', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    handleNavigation(e) {
        e.preventDefault();

        const section = e.currentTarget.dataset.section;
        if (section) {
            this.showSection(section);
        }
    }

    showSection(sectionName) {
        // Atualizar navegação ativa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

        // Esconder todas as seções
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Mostrar seção atual
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            this.currentSection = sectionName;

            // Carregar dados da seção
            this.loadSectionData(sectionName);
        }
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'profile':
                await this.loadProfile();
                break;
            case 'users':
                if (this.hasPermission(['admin', 'gerente'])) {
                    await window.UsersManager.loadUsers();
                }
                break;
            case 'companies':
                if (this.hasPermission(['admin', 'gerente'])) {
                    await window.CompaniesManager.loadCompanies();
                }
                break;
            case 'logs':
                await this.loadLogs();
                break;
            case 'json-requests':
                // JSON requests não precisam carregar dados inicialmente
                break;
        }
    }

    async loadDashboard() {
        try {
            // Carregar estatísticas do dashboard
            const stats = await window.DashboardManager.loadStats();

            // Forçar atualização dos elementos
            setTimeout(() => {
                document.getElementById('total-users').textContent = stats.totalUsers || '0';
                document.getElementById('pending-users').textContent = stats.pendingUsers || '0';
                document.getElementById('total-companies').textContent = stats.totalCompanies || '0';
                document.getElementById('recent-logs').textContent = stats.recentLogs || '0';
            }, 100);

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    }

    async loadProfile() {
        try {
            const response = await API.get('/usuarios/me');

            if (response.status === 'success') {
                const user = response.data.usuario;
                const profileInfo = document.getElementById('profile-info');

                profileInfo.innerHTML = `
                    <div class="profile-details">
                        <h3>Informações Pessoais</h3>
                        <div class="info-row">
                            <label>Nome:</label>
                            <span>${user.nome}</span>
                        </div>
                        <div class="info-row">
                            <label>Email:</label>
                            <span>${user.email}</span>
                        </div>
                        <div class="info-row">
                            <label>Cargo:</label>
                            <span class="badge badge-primary">${this.getRoleDisplayName(user.role)}</span>
                        </div>
                        <div class="info-row">
                            <label>Status:</label>
                            <span class="status-badge status-${user.status}">${this.getStatusDisplayName(user.status)}</span>
                        </div>
                        <div class="info-row">
                            <label>Empresa:</label>
                            <span>${user.empresa ? user.empresa.nome : 'Não associado'}</span>
                        </div>
                        <div class="info-row">
                            <label>Membro desde:</label>
                            <span>${Utils.formatDate(user.criado_em)}</span>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        }
    }

    async loadLogs() {
        try {
            const response = await API.get('/logs');

            if (response.status === 'success') {
                const logsTableBody = document.querySelector('#logs-table tbody');

                if (response.data.logs.length === 0) {
                    logsTableBody.innerHTML = `
                        <tr>
                            <td colspan="3" class="text-center">Nenhum log encontrado</td>
                        </tr>
                    `;
                    return;
                }

                logsTableBody.innerHTML = response.data.logs.map(log => `
                    <tr>
                        <td>${Utils.formatDateTime(log.timestamp)}</td>
                        <td>${log.usuario ? log.usuario.nome : 'Sistema'}</td>
                        <td>${log.acao}</td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
        }
    }

    async filterLogs() {
        const startDate = document.getElementById('date-start').value;
        const endDate = document.getElementById('date-end').value;

        let url = '/logs';
        const params = new URLSearchParams();

        if (startDate) params.append('data_inicio', startDate);
        if (endDate) params.append('data_fim', endDate);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        try {
            const response = await API.get(url);

            if (response.status === 'success') {
                const logsTableBody = document.querySelector('#logs-table tbody');

                if (response.data.logs.length === 0) {
                    logsTableBody.innerHTML = `
                        <tr>
                            <td colspan="3" class="text-center">Nenhum log encontrado para o período selecionado</td>
                        </tr>
                    `;
                    return;
                }

                logsTableBody.innerHTML = response.data.logs.map(log => `
                    <tr>
                        <td>${Utils.formatDateTime(log.timestamp)}</td>
                        <td>${log.usuario ? log.usuario.nome : 'Sistema'}</td>
                        <td>${log.acao}</td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Erro ao filtrar logs:', error);
        }
    }

    async generateUserJson() {
        try {
            const response = await API.get('/simulacao-json/usuario');
            const output = document.getElementById('user-json-output');
            output.textContent = JSON.stringify(response, null, 2);
        } catch (error) {
            console.error('Erro ao gerar JSON do usuário:', error);
        }
    }

    async generateGroupJson() {
        try {
            const response = await API.get('/simulacao-json/grupo');
            const output = document.getElementById('group-json-output');
            output.textContent = JSON.stringify(response, null, 2);
        } catch (error) {
            console.error('Erro ao gerar JSON do grupo:', error);
        }
    }

    handleTabSwitch(e) {
        const tabName = e.target.dataset.tab;

        // Atualizar tabs ativos
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // Mostrar conteúdo da tab
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        document.getElementById(`${tabName}-tab`)?.classList.remove('hidden');
    }

    showAddCompanyModal() {
        const modalContent = `
        <form id="add-company-form" class="modal-form">
            <div class="form-group">
                <label for="company-name">Nome da Empresa *</label>
                <input type="text" id="company-name" required placeholder="Digite o nome da empresa">
            </div>
            <div class="form-group">
                <label for="company-location">Localização</label>
                <input type="text" id="company-location" placeholder="Ex: São Paulo, SP">
            </div>
        </form>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="modal.close()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="window.CompaniesManager.createCompany()">Salvar</button>
        </div>
    `;

        modal.show('Adicionar Empresa', modalContent);
    }

    setupUserInterface() {
        if (!this.currentUser) return;

        // Atualizar welcome message
        document.getElementById('user-welcome').textContent =
            `Bem-vindo, ${this.currentUser.nome}`;

        // Configurar visibilidade baseada em roles
        this.setupRoleBasedVisibility();
    }

    setupRoleBasedVisibility() {
        if (!this.currentUser) return;

        const userRole = this.currentUser.role;

        // Mostrar/esconder elementos baseados no role
        document.querySelectorAll('.admin-only').forEach(element => {
            if (userRole === 'admin') {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });

        document.querySelectorAll('.admin-gerente-only').forEach(element => {
            if (userRole === 'admin' || userRole === 'gerente') {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    }

    hasPermission(roles) {
        if (!this.currentUser) return false;
        return roles.includes(this.currentUser.role);
    }

    showAuthScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('register-screen').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('register-screen').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showRegisterScreen() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('register-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('register-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');

        // Carregar dados iniciais
        setTimeout(() => {
            this.loadDashboard();
        }, 200);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        this.currentUser = null;
        this.showAuthScreen();
    }

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }

    showMessage(container, message, type = 'info') {
        if (!container) return;

        container.textContent = message;
        container.className = `message-container ${type}`;
        container.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            container.style.display = 'none';
        }, 5000);
    }

    getRoleDisplayName(role) {
        const roles = {
            admin: 'Administrador',
            gerente: 'Gerente',
            operador: 'Operador'
        };
        return roles[role] || role;
    }

    getStatusDisplayName(status) {
        const statuses = {
            aprovado: 'Aprovado',
            pendente: 'Pendente',
            rejeitado: 'Rejeitado'
        };
        return statuses[status] || status;
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});