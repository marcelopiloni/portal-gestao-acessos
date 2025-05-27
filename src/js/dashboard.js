// Dashboard.js - Gerenciador do Dashboard
class DashboardManager {
    constructor() {
        this.stats = {
            totalUsers: 0,
            pendingUsers: 0,
            totalCompanies: 0,
            recentLogs: 0
        };
        this.refreshInterval = null;
    }

    // Carregar estatísticas do dashboard
    async loadStats() {
        try {
            const stats = await API.getDashboardStats();
            this.stats = stats;
            this.updateStatsDisplay();
            return stats;
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            return this.stats;
        }
    }

    // Atualizar exibição das estatísticas
    updateStatsDisplay() {
        const elements = {
            'total-users': this.stats.totalUsers,
            'pending-users': this.stats.pendingUsers,
            'total-companies': this.stats.totalCompanies,
            'recent-logs': this.stats.recentLogs
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, parseInt(element.textContent) || 0, value);
            }
        });
    }

    // Animar números das estatísticas
    animateNumber(element, from, to, duration = 1000) {
        const startTime = Date.now();
        const difference = to - from;

        const updateNumber = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Função de easing
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(from + (difference * easeOutCubic));
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    }

    // Configurar refresh automático
    startAutoRefresh(intervalMs = 300000) { // 5 minutos por padrão
        this.stopAutoRefresh();
        
        this.refreshInterval = setInterval(async () => {
            if (window.app && window.app.currentSection === 'dashboard') {
                await this.loadStats();
            }
        }, intervalMs);
    }

    // Parar refresh automático
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Carregar atividades recentes para o dashboard
    async loadRecentActivity() {
        try {
            const response = await API.getLogs();
            
            if (response.status === 'success') {
                const recentLogs = response.data.logs.slice(0, 10); // Últimos 10 logs
                this.displayRecentActivity(recentLogs);
            }
        } catch (error) {
            console.error('Erro ao carregar atividades recentes:', error);
        }
    }

    // Exibir atividades recentes
    displayRecentActivity(logs) {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        if (logs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📝</div>
                    <h3>Nenhuma atividade recente</h3>
                    <p>As atividades aparecerão aqui conforme forem sendo realizadas.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="activity-list">
                ${logs.map(log => `
                    <div class="activity-item">
                        <div class="activity-icon">
                            ${this.getActivityIcon(log.acao)}
                        </div>
                        <div class="activity-content">
                            <div class="activity-title">${log.acao}</div>
                            <div class="activity-meta">
                                <span class="activity-user">${log.usuario ? log.usuario.nome : 'Sistema'}</span>
                                <span class="activity-time">${Utils.formatTimeAgo(log.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Obter ícone para atividade
    getActivityIcon(action) {
        const icons = {
            'Login no sistema': '🔐',
            'Registro': '👤',
            'Criação': '➕',
            'Atualização': '✏️',
            'Exclusão': '🗑️',
            'Aprovação': '✅',
            'Rejeição': '❌',
            'Visualização': '👁️',
            'Listagem': '📋'
        };

        // Buscar por palavras-chave
        for (const [key, icon] of Object.entries(icons)) {
            if (action.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }

        return '📄'; // Ícone padrão
    }

    // Carregar métricas avançadas (se necessário)
    async loadAdvancedMetrics() {
        try {
            const [users, companies, logs] = await Promise.all([
                API.getUsers(),
                API.getCompanies(),
                API.getLogs()
            ]);

            const metrics = {
                userGrowth: this.calculateUserGrowth(users.data?.usuarios || []),
                companyDistribution: this.calculateCompanyDistribution(users.data?.usuarios || []),
                activityTrend: this.calculateActivityTrend(logs.data?.logs || [])
            };

            return metrics;
        } catch (error) {
            console.error('Erro ao carregar métricas avançadas:', error);
            return null;
        }
    }

    // Calcular crescimento de usuários
    calculateUserGrowth(users) {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        
        const thisMonth = users.filter(user => new Date(user.criado_em) >= lastMonth).length;
        const previousMonth = users.filter(user => {
            const userDate = new Date(user.criado_em);
            const prevMonth = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
            return userDate >= prevMonth && userDate < lastMonth;
        }).length;

        const growth = previousMonth > 0 ? ((thisMonth - previousMonth) / previousMonth) * 100 : 100;
        
        return {
            thisMonth,
            previousMonth,
            growth: Math.round(growth * 100) / 100
        };
    }

    // Calcular distribuição por empresa
    calculateCompanyDistribution(users) {
        const distribution = {};
        
        users.forEach(user => {
            const companyName = user.empresa?.nome || 'Sem empresa';
            distribution[companyName] = (distribution[companyName] || 0) + 1;
        });

        return Object.entries(distribution)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }

    // Calcular tendência de atividade
    calculateActivityTrend(logs) {
        const days = 7;
        const trend = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            
            const dayLogs = logs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= date && logDate < nextDate;
            });

            trend.push({
                date: date.toISOString().split('T')[0],
                count: dayLogs.length
            });
        }

        return trend;
    }

    // Renderizar gráfico simples (usando CSS)
    renderSimpleChart(containerId, data, type = 'bar') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxValue = Math.max(...data.map(d => d.count));
        
        container.innerHTML = `
            <div class="simple-chart">
                ${data.map(item => `
                    <div class="chart-item">
                        <div class="chart-bar" style="height: ${(item.count / maxValue) * 100}%"></div>
                        <div class="chart-label">${item.name || item.date}</div>
                        <div class="chart-value">${item.count}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Exportar dados do dashboard
    exportDashboardData() {
        const data = {
            stats: this.stats,
            exportDate: new Date().toISOString(),
            exportedBy: window.app?.currentUser?.nome || 'Desconhecido'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Configurar alertas baseados em métricas
    checkAlerts() {
        const alerts = [];

        // Alerta para muitos usuários pendentes
        if (this.stats.pendingUsers > 5) {
            alerts.push({
                type: 'warning',
                message: `Existem ${this.stats.pendingUsers} usuários aguardando aprovação`,
                action: () => window.app.showSection('users')
            });
        }

        // Alerta para baixa atividade
        if (this.stats.recentLogs < 10) {
            alerts.push({
                type: 'info',
                message: 'Baixa atividade no sistema nas últimas horas',
                action: () => window.app.showSection('logs')
            });
        }

        return alerts;
    }

    // Mostrar alertas
    displayAlerts() {
        const alerts = this.checkAlerts();
        const container = document.getElementById('dashboard-alerts');
        
        if (!container || alerts.length === 0) return;

        container.innerHTML = alerts.map(alert => `
            <div class="alert alert-${alert.type}">
                <span>${alert.message}</span>
                ${alert.action ? `<button class="btn btn-sm btn-outline ml-2" onclick="this.parentElement.remove()">Ver</button>` : ''}
            </div>
        `).join('');

        // Adicionar event listeners para ações
        alerts.forEach((alert, index) => {
            if (alert.action) {
                const alertElement = container.children[index];
                const button = alertElement.querySelector('button');
                if (button) {
                    button.addEventListener('click', alert.action);
                }
            }
        });
    }

    // Limpeza ao sair do dashboard
    cleanup() {
        this.stopAutoRefresh();
    }
}

// Criar instância global
window.DashboardManager = new DashboardManager();