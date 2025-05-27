// Users.js - Gerenciador de Usuários
class UsersManager {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
    }

    // Carregar lista de usuários
    async loadUsers() {
        try {
            const response = await API.getUsers();
            
            if (response.status === 'success') {
                this.users = response.data.usuarios;
                this.filteredUsers = [...this.users];
                this.renderUsersTable();
                this.updateUserStats();
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            this.showError('Erro ao carregar lista de usuários');
        }
    }

    // Renderizar tabela de usuários
renderUsersTable() {
    const tableBody = document.querySelector('#users-table tbody');
    if (!tableBody) return;

    if (this.filteredUsers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="empty-state">
                        <div class="icon">👥</div>
                        <h3>Nenhum usuário encontrado</h3>
                        <p>Não há usuários cadastrados no sistema.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Calcular paginação
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);

    tableBody.innerHTML = paginatedUsers.map(user => `
        <tr data-user-id="${user.id}">
            <td>
                <div class="user-info">
                    <strong>${user.nome}</strong>
                    <small class="user-id">ID: ${user.id}</small>
                </div>
            </td>
            <td>${user.email}</td>
            <td>
                <span class="badge badge-${this.getRoleBadgeClass(user.role)}">
                    ${this.getRoleDisplayName(user.role)}
                </span>
            </td>
            <td>
                <span class="status-badge status-${user.status}">
                    ${this.getStatusDisplayName(user.status)}
                </span>
            </td>
            <td>${user.empresa ? user.empresa.nome : 'Não associado'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" onclick="window.UsersManager.viewUser(${user.id})">
                        Ver
                    </button>
                    ${this.canApproveUser(user) ? `
                        <button class="btn btn-sm btn-success" onclick="window.UsersManager.approveUser(${user.id})">
                            Aprovar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.UsersManager.rejectUser(${user.id})">
                            Rejeitar
                        </button>
                    ` : ''}
                    ${this.canAssociateCompany(user) ? `
                        <button class="btn btn-sm btn-primary" onclick="window.UsersManager.showAssociateCompanyModal(${user.id})">
                            Empresa
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    this.renderPagination();
}

    // Renderizar paginação
    renderPagination() {
        const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        const paginationContainer = document.getElementById('users-pagination');
        
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <div class="pagination">
                <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                        onclick="UsersManager.goToPage(${this.currentPage - 1})">
                    ← Anterior
                </button>
        `;

        // Mostrar páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="UsersManager.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }

        paginationHTML += `
                <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                        onclick="UsersManager.goToPage(${this.currentPage + 1})">
                    Próxima →
                </button>
            </div>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    // Navegar para página
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderUsersTable();
        }
    }

    // Visualizar detalhes do usuário
    async viewUser(userId) {
        try {
            const response = await API.getUser(userId);
            
            if (response.status === 'success') {
                const user = response.data.usuario;
                this.showUserDetailsModal(user);
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            this.showError('Erro ao carregar detalhes do usuário');
        }
    }

    // Mostrar modal com detalhes do usuário
    showUserDetailsModal(user) {
        const modalContent = `
            <div class="user-details">
                <div class="user-header">
                    <h3>${user.nome}</h3>
                    <span class="status-badge status-${user.status}">
                        ${this.getStatusDisplayName(user.status)}
                    </span>
                </div>
                
                <div class="user-info-grid">
                    <div class="info-item">
                        <label>Email:</label>
                        <span>${user.email}</span>
                    </div>
                    <div class="info-item">
                        <label>Cargo:</label>
                        <span class="badge badge-${this.getRoleBadgeClass(user.role)}">
                            ${this.getRoleDisplayName(user.role)}
                        </span>
                    </div>
                    <div class="info-item">
                        <label>Empresa:</label>
                        <span>${user.empresa ? user.empresa.nome : 'Não associado'}</span>
                    </div>
                    <div class="info-item">
                        <label>Localização da Empresa:</label>
                        <span>${user.empresa ? user.empresa.localizacao : 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <label>Data de Cadastro:</label>
                        <span>${Utils.formatDate(user.criado_em)}</span>
                    </div>
                </div>
                
                ${this.canApproveUser(user) ? `
                    <div class="user-actions mt-2">
                        <h4>Ações Administrativas</h4>
                        <div class="action-buttons">
                            <button class="btn btn-success" onclick="UsersManager.approveUser(${user.id}); modal.close();">
                                Aprovar Usuário
                            </button>
                            <button class="btn btn-danger" onclick="UsersManager.rejectUser(${user.id}); modal.close();">
                                Rejeitar Usuário
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        modal.show(`Detalhes do Usuário`, modalContent);
    }

    // Aprovar usuário
    async approveUser(userId) {
        try {
            const response = await API.approveUser(userId, 'aprovado');
            
            if (response.status === 'success') {
                this.showSuccess('Usuário aprovado com sucesso!');
                await this.loadUsers(); // Recarregar lista
            }
        } catch (error) {
            console.error('Erro ao aprovar usuário:', error);
            this.showError('Erro ao aprovar usuário');
        }
    }

    // Rejeitar usuário
    async rejectUser(userId) {
        const confirmed = await this.showConfirmDialog(
            'Rejeitar Usuário',
            'Tem certeza que deseja rejeitar este usuário? Esta ação não pode ser desfeita.',
            'danger'
        );

        if (!confirmed) return;

        try {
            const response = await API.approveUser(userId, 'rejeitado');
            
            if (response.status === 'success') {
                this.showSuccess('Usuário rejeitado com sucesso!');
                await this.loadUsers(); // Recarregar lista
            }
        } catch (error) {
            console.error('Erro ao rejeitar usuário:', error);
            this.showError('Erro ao rejeitar usuário');
        }
    }

    // Mostrar modal para associar empresa
    async showAssociateCompanyModal(userId) {
        try {
            const [userResponse, companiesResponse] = await Promise.all([
                API.getUser(userId),
                API.getCompanies()
            ]);

            const user = userResponse.data.usuario;
            const companies = companiesResponse.data.empresas;

            const modalContent = `
                <form id="associate-company-form" class="modal-form">
                    <h4>Associar ${user.nome} a uma Empresa</h4>
                    
                    <div class="form-group">
                        <label for="company-select">Selecionar Empresa:</label>
                        <select id="company-select" required>
                            <option value="">-- Selecione uma empresa --</option>
                            ${companies.map(company => `
                                <option value="${company.id}" ${user.empresa_id === company.id ? 'selected' : ''}>
                                    ${company.nome} - ${company.localizacao}
                                </option>
                            `).join('')}
                            <option value="null">Remover associação</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <small class="text-muted">
                            Empresa atual: ${user.empresa ? user.empresa.nome : 'Não associado'}
                        </small>
                    </div>
                </form>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="modal.close()">Cancelar</button>
                    <button type="submit" form="associate-company-form" class="btn btn-primary">Salvar</button>
                </div>
            `;

            modal.show('Associar Empresa', modalContent);

            document.getElementById('associate-company-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.associateCompany(userId);
            });

        } catch (error) {
            console.error('Erro ao carregar dados para associação:', error);
            this.showError('Erro ao carregar dados');
        }
    }

    // Associar usuário à empresa
    async associateCompany(userId) {
        const companySelect = document.getElementById('company-select');
        const companyId = companySelect.value === 'null' ? null : companySelect.value;

        if (!companyId && companySelect.value !== 'null') {
            this.showError('Por favor, selecione uma empresa');
            return;
        }

        try {
            const response = await API.associateCompany(userId, companyId);
            
            if (response.status === 'success') {
                this.showSuccess('Associação realizada com sucesso!');
                modal.close();
                await this.loadUsers(); // Recarregar lista
            }
        } catch (error) {
            console.error('Erro ao associar empresa:', error);
            this.showError('Erro ao associar empresa');
        }
    }

    // Filtrar usuários
    filterUsers(searchTerm, statusFilter = 'all', roleFilter = 'all') {
        this.filteredUsers = this.users.filter(user => {
            const matchesSearch = !searchTerm || 
                user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            
            return matchesSearch && matchesStatus && matchesRole;
        });

        this.currentPage = 1; // Reset para primeira página
        this.renderUsersTable();
    }

    // Atualizar estatísticas de usuários
    updateUserStats() {
        const stats = {
            total: this.users.length,
            pending: this.users.filter(u => u.status === 'pendente').length,
            approved: this.users.filter(u => u.status === 'aprovado').length,
            rejected: this.users.filter(u => u.status === 'rejeitado').length
        };

        // Atualizar elementos se existirem
        const elements = {
            'users-total': stats.total,
            'users-pending': stats.pending,
            'users-approved': stats.approved,
            'users-rejected': stats.rejected
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    // Verificar se pode aprovar usuário
    canApproveUser(user) {
        return window.app?.hasPermission(['admin', 'gerente']) && user.status === 'pendente';
    }

    // Verificar se pode associar empresa
    canAssociateCompany(user) {
        return window.app?.hasPermission(['admin']);
    }

    // Obter nome de exibição do role
    getRoleDisplayName(role) {
        const roles = {
            admin: 'Administrador',
            gerente: 'Gerente',
            operador: 'Operador'
        };
        return roles[role] || role;
    }

    // Obter classe do badge do role
    getRoleBadgeClass(role) {
        const classes = {
            admin: 'danger',
            gerente: 'warning',
            operador: 'secondary'
        };
        return classes[role] || 'secondary';
    }

    // Obter nome de exibição do status
    getStatusDisplayName(status) {
        const statuses = {
            aprovado: 'Aprovado',
            pendente: 'Pendente',
            rejeitado: 'Rejeitado'
        };
        return statuses[status] || status;
    }

    // Exportar lista de usuários
    exportUsers() {
        const data = this.filteredUsers.map(user => ({
            nome: user.nome,
            email: user.email,
            cargo: this.getRoleDisplayName(user.role),
            status: this.getStatusDisplayName(user.status),
            empresa: user.empresa?.nome || 'Não associado',
            dataCadastro: Utils.formatDate(user.criado_em)
        }));

        Utils.exportToCSV(data, `usuarios-${new Date().toISOString().split('T')[0]}.csv`);
    }

    // Métodos auxiliares para UI
    showSuccess(message) {
        Utils.showNotification(message, 'success');
    }

    showError(message) {
        Utils.showNotification(message, 'error');
    }

    async showConfirmDialog(title, message, type = 'warning') {
        return new Promise((resolve) => {
            const modalContent = `
                <div class="confirmation-dialog">
                    <div class="icon ${type}">⚠️</div>
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <div class="action-buttons">
                        <button class="btn btn-outline" onclick="modal.close(); window.confirmResolve(false);">
                            Cancelar
                        </button>
                        <button class="btn btn-${type === 'danger' ? 'danger' : 'primary'}" onclick="modal.close(); window.confirmResolve(true);">
                            Confirmar
                        </button>
                    </div>
                </div>
            `;

            window.confirmResolve = resolve;
            modal.show('Confirmar Ação', modalContent);
        });
    }
}

// Criar instância global
window.UsersManager = new UsersManager();