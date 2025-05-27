// Companies.js - Gerenciador de Empresas
class CompaniesManager {
    constructor() {
        this.companies = [];
        this.filteredCompanies = [];
    }

    // Carregar lista de empresas
    async loadCompanies() {
        try {
            const response = await API.getCompanies();

            if (response.status === 'success') {
                this.companies = response.data.empresas;
                this.filteredCompanies = [...this.companies];
                this.renderCompaniesTable();
                this.updateCompanyStats();
            }
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            this.showError('Erro ao carregar lista de empresas');
        }
    }

    // Renderizar tabela de empresas
    renderCompaniesTable() {
        const tableBody = document.querySelector('#companies-table tbody');
        if (!tableBody) return;

        if (this.filteredCompanies.length === 0) {
            const isAdmin = window.app?.hasPermission(['admin']);
            tableBody.innerHTML = `
            <tr>
                <td colspan="${isAdmin ? '4' : '3'}" class="text-center">
                    <div class="empty-state">
                        <div class="icon">🏢</div>
                        <h3>Nenhuma empresa encontrada</h3>
                        <p>Não há empresas cadastradas no sistema.</p>
                        ${isAdmin ? `
                            <button class="btn btn-primary mt-2" onclick="window.CompaniesManager.showCreateCompanyModal()">
                                Adicionar Primeira Empresa
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
            return;
        }

        const isAdmin = window.app?.hasPermission(['admin']);

        tableBody.innerHTML = this.filteredCompanies.map(company => `
        <tr data-company-id="${company.id}">
            <td>
                <div class="company-info">
                    <strong>${company.nome}</strong>
                    <small class="company-id">ID: ${company.id}</small>
                </div>
            </td>
            <td>${company.localizacao || 'Não informado'}</td>
            <td>
                <span class="badge badge-primary">
                    ${company.usuarios ? company.usuarios.length : 0} usuários
                </span>
            </td>
            ${isAdmin ? `
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="window.CompaniesManager.viewCompany(${company.id})">
                            Ver
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="window.CompaniesManager.showEditCompanyModal(${company.id})">
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.CompaniesManager.deleteCompany(${company.id})">
                            Excluir
                        </button>
                    </div>
                </td>
            ` : ''}
        </tr>
    `).join('');
    }

    // Visualizar detalhes da empresa
    async viewCompany(companyId) {
        try {
            const response = await API.getCompany(companyId);

            if (response.status === 'success') {
                const company = response.data.empresa;
                this.showCompanyDetailsModal(company);
            }
        } catch (error) {
            console.error('Erro ao carregar empresa:', error);
            this.showError('Erro ao carregar detalhes da empresa');
        }
    }

    // Mostrar modal com detalhes da empresa
    showCompanyDetailsModal(company) {
        const modalContent = `
            <div class="company-details">
                <div class="company-header">
                    <h3>${company.nome}</h3>
                    <span class="badge badge-primary">
                        ${company.usuarios ? company.usuarios.length : 0} usuários
                    </span>
                </div>
                
                <div class="company-info-grid">
                    <div class="info-item">
                        <label>Nome:</label>
                        <span>${company.nome}</span>
                    </div>
                    <div class="info-item">
                        <label>Localização:</label>
                        <span>${company.localizacao || 'Não informado'}</span>
                    </div>
                    <div class="info-item">
                        <label>ID:</label>
                        <span>${company.id}</span>
                    </div>
                </div>
                
                ${company.usuarios && company.usuarios.length > 0 ? `
                    <div class="company-users mt-2">
                        <h4>Usuários Associados</h4>
                        <div class="users-list">
                            ${company.usuarios.map(user => `
                                <div class="user-item">
                                    <div class="user-info">
                                        <strong>${user.nome}</strong>
                                        <span class="user-email">${user.email}</span>
                                    </div>
                                    <span class="badge badge-${this.getRoleBadgeClass(user.role)}">
                                        ${this.getRoleDisplayName(user.role)}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="no-users mt-2">
                        <p class="text-muted">Nenhum usuário associado a esta empresa.</p>
                    </div>
                `}
                
                ${window.app?.hasPermission(['admin']) ? `
                    <div class="company-actions mt-2">
                        <h4>Ações Administrativas</h4>
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="CompaniesManager.showEditCompanyModal(${company.id}); modal.close();">
                                Editar Empresa
                            </button>
                            <button class="btn btn-danger" onclick="CompaniesManager.deleteCompany(${company.id}); modal.close();">
                                Excluir Empresa
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        modal.show(`Detalhes da Empresa`, modalContent);
    }

    // Mostrar modal para criar empresa
    showCreateCompanyModal() {
        const modalContent = `
            <form id="create-company-form" class="modal-form">
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
                <button type="submit" form="create-company-form" class="btn btn-primary">Criar Empresa</button>
            </div>
        `;

        modal.show('Criar Nova Empresa', modalContent);

        document.getElementById('create-company-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createCompany();
        });
    }

    // Criar nova empresa
    async createCompany() {
        const name = document.getElementById('company-name').value.trim();
        const location = document.getElementById('company-location').value.trim();

        if (!name) {
            this.showError('Nome da empresa é obrigatório');
            return;
        }

        try {
            const response = await API.createCompany({
                nome: name,
                localizacao: location || null
            });

            if (response.status === 'success') {
                this.showSuccess('Empresa criada com sucesso!');
                modal.close();
                await this.loadCompanies(); // Recarregar lista
            }
        } catch (error) {
            console.error('Erro ao criar empresa:', error);
            this.showError('Erro ao criar empresa');
        }
    }

    // Mostrar modal para editar empresa
    async showEditCompanyModal(companyId) {
        try {
            const response = await API.getCompany(companyId);
            const company = response.data.empresa;

            const modalContent = `
                <form id="edit-company-form" class="modal-form">
                    <div class="form-group">
                        <label for="edit-company-name">Nome da Empresa *</label>
                        <input type="text" id="edit-company-name" required value="${company.nome}">
                    </div>
                    <div class="form-group">
                        <label for="edit-company-location">Localização</label>
                        <input type="text" id="edit-company-location" value="${company.localizacao || ''}">
                    </div>
                </form>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="modal.close()">Cancelar</button>
                    <button type="submit" form="edit-company-form" class="btn btn-primary">Salvar Alterações</button>
                </div>
            `;

            modal.show('Editar Empresa', modalContent);

            document.getElementById('edit-company-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateCompany(companyId);
            });

        } catch (error) {
            console.error('Erro ao carregar dados da empresa:', error);
            this.showError('Erro ao carregar dados da empresa');
        }
    }

    // Atualizar empresa
    async updateCompany(companyId) {
        const name = document.getElementById('edit-company-name').value.trim();
        const location = document.getElementById('edit-company-location').value.trim();

        if (!name) {
            this.showError('Nome da empresa é obrigatório');
            return;
        }

        try {
            const response = await API.updateCompany(companyId, {
                nome: name,
                localizacao: location || null
            });

            if (response.status === 'success') {
                this.showSuccess('Empresa atualizada com sucesso!');
                modal.close();
                await this.loadCompanies(); // Recarregar lista
            }
        } catch (error) {
            console.error('Erro ao atualizar empresa:', error);
            this.showError('Erro ao atualizar empresa');
        }
    }

    // Excluir empresa
    async deleteCompany(companyId) {
        const company = this.companies.find(c => c.id === companyId);
        if (!company) return;

        const hasUsers = company.usuarios && company.usuarios.length > 0;

        const confirmMessage = hasUsers
            ? `A empresa "${company.nome}" possui ${company.usuarios.length} usuário(s) associado(s). Não será possível excluí-la. Desassocie os usuários primeiro.`
            : `Tem certeza que deseja excluir a empresa "${company.nome}"? Esta ação não pode ser desfeita.`;

        if (hasUsers) {
            this.showError(confirmMessage);
            return;
        }

        const confirmed = await this.showConfirmDialog(
            'Excluir Empresa',
            confirmMessage,
            'danger'
        );

        if (!confirmed) return;

        try {
            const response = await API.deleteCompany(companyId);

            if (response.status === 'success') {
                this.showSuccess('Empresa excluída com sucesso!');
                await this.loadCompanies(); // Recarregar lista
            }
        } catch (error) {
            console.error('Erro ao excluir empresa:', error);
            this.showError(error.message || 'Erro ao excluir empresa');
        }
    }

    // Filtrar empresas
    filterCompanies(searchTerm) {
        this.filteredCompanies = this.companies.filter(company => {
            return !searchTerm ||
                company.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (company.localizacao && company.localizacao.toLowerCase().includes(searchTerm.toLowerCase()));
        });

        this.renderCompaniesTable();
    }

    // Atualizar estatísticas de empresas
    updateCompanyStats() {
        const stats = {
            total: this.companies.length,
            withUsers: this.companies.filter(c => c.usuarios && c.usuarios.length > 0).length,
            withoutUsers: this.companies.filter(c => !c.usuarios || c.usuarios.length === 0).length,
            totalUsers: this.companies.reduce((sum, c) => sum + (c.usuarios ? c.usuarios.length : 0), 0)
        };

        // Atualizar elementos se existirem
        const elements = {
            'companies-total': stats.total,
            'companies-with-users': stats.withUsers,
            'companies-without-users': stats.withoutUsers,
            'companies-total-users': stats.totalUsers
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    // Obter relatório das empresas
    generateCompaniesReport() {
        return this.companies.map(company => ({
            id: company.id,
            nome: company.nome,
            localizacao: company.localizacao || 'Não informado',
            usuariosAssociados: company.usuarios ? company.usuarios.length : 0,
            usuarios: company.usuarios ? company.usuarios.map(u => ({
                nome: u.nome,
                email: u.email,
                cargo: this.getRoleDisplayName(u.role),
                status: u.status
            })) : []
        }));
    }

    // Exportar lista de empresas
    exportCompanies() {
        const data = this.filteredCompanies.map(company => ({
            nome: company.nome,
            localizacao: company.localizacao || 'Não informado',
            usuariosAssociados: company.usuarios ? company.usuarios.length : 0,
            id: company.id
        }));

        Utils.exportToCSV(data, `empresas-${new Date().toISOString().split('T')[0]}.csv`);
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
                    <div class="icon ${type}">${type === 'danger' ? '⚠️' : '❓'}</div>
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

    // Buscar empresas com filtros avançados
    async searchCompanies(filters = {}) {
        try {
            // Se houver filtros específicos no backend, implementar aqui
            // Por enquanto, usar filtro local
            let filtered = [...this.companies];

            if (filters.name) {
                filtered = filtered.filter(c =>
                    c.nome.toLowerCase().includes(filters.name.toLowerCase())
                );
            }

            if (filters.location) {
                filtered = filtered.filter(c =>
                    c.localizacao && c.localizacao.toLowerCase().includes(filters.location.toLowerCase())
                );
            }

            if (filters.hasUsers !== undefined) {
                filtered = filtered.filter(c => {
                    const hasUsers = c.usuarios && c.usuarios.length > 0;
                    return filters.hasUsers ? hasUsers : !hasUsers;
                });
            }

            this.filteredCompanies = filtered;
            this.renderCompaniesTable();

        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
            this.showError('Erro ao realizar busca');
        }
    }
}

// Criar instância global
window.CompaniesManager = new CompaniesManager();