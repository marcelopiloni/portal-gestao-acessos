import apiService from './api';
import { ENDPOINTS } from '../utils/constants';

/**
 * Serviço para gerenciamento de empresas
 */
class CompanyService {
  /**
   * Obter lista de todas as empresas
   */
  async getCompanies() {
    try {
      const response = await apiService.get(ENDPOINTS.COMPANIES);
      return {
        success: true,
        companies: response.data?.empresas || [],
        total: response.results || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        companies: [],
        total: 0,
      };
    }
  }

  /**
   * Obter uma empresa específica por ID
   */
  async getCompanyById(id) {
    try {
      const response = await apiService.get(ENDPOINTS.COMPANY_BY_ID(id));
      return {
        success: true,
        company: response.data?.empresa || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        company: null,
      };
    }
  }

  /**
   * Criar nova empresa
   */
  async createCompany(companyData) {
    try {
      const validation = this.validateCompanyData(companyData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Dados inválidos',
          validationErrors: validation.errors,
        };
      }

      const response = await apiService.post(ENDPOINTS.COMPANIES, companyData);
      return {
        success: true,
        company: response.data?.empresa,
        message: 'Empresa criada com sucesso!',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Atualizar empresa existente
   */
  async updateCompany(id, companyData) {
    try {
      const validation = this.validateCompanyData(companyData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Dados inválidos',
          validationErrors: validation.errors,
        };
      }

      const response = await apiService.put(ENDPOINTS.COMPANY_BY_ID(id), companyData);
      return {
        success: true,
        company: response.data?.empresa,
        message: 'Empresa atualizada com sucesso!',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Excluir empresa
   */
  async deleteCompany(id) {
    try {
      await apiService.delete(ENDPOINTS.COMPANY_BY_ID(id));
      return {
        success: true,
        message: 'Empresa excluída com sucesso!',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obter empresas com estatísticas de usuários
   */
  async getCompaniesWithStats() {
    try {
      const [companiesResponse, usersResponse] = await Promise.all([
        apiService.get(ENDPOINTS.COMPANIES),
        apiService.get(ENDPOINTS.USERS),
      ]);

      const companies = companiesResponse.data?.empresas || [];
      const users = usersResponse.data?.usuarios || [];

      const companiesWithStats = companies.map(company => {
        const companyUsers = users.filter(user => user.empresa_id === company.id);
        return {
          ...company,
          totalUsers: companyUsers.length,
          activeUsers: companyUsers.filter(user => user.status === 'aprovado').length,
          pendingUsers: companyUsers.filter(user => user.status === 'pendente').length,
        };
      });

      return {
        success: true,
        companies: companiesWithStats,
        total: companiesWithStats.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        companies: [],
        total: 0,
      };
    }
  }

  /**
   * Buscar empresas por termo
   */
  async searchCompanies(searchTerm) {
    try {
      const response = await apiService.get(ENDPOINTS.COMPANIES);
      const companies = response.data?.empresas || [];
      
      const filteredCompanies = companies.filter(company => 
        company.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.localizacao && company.localizacao.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return {
        success: true,
        companies: filteredCompanies,
        total: filteredCompanies.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        companies: [],
        total: 0,
      };
    }
  }

  /**
   * Obter estatísticas gerais de empresas
   */
  async getCompanyStats() {
    try {
      const [companiesResponse, usersResponse] = await Promise.all([
        apiService.get(ENDPOINTS.COMPANIES),
        apiService.get(ENDPOINTS.USERS),
      ]);

      const companies = companiesResponse.data?.empresas || [];
      const users = usersResponse.data?.usuarios || [];

      const stats = {
        totalCompanies: companies.length,
        companiesWithUsers: companies.filter(company => 
          users.some(user => user.empresa_id === company.id)
        ).length,
        companiesWithoutUsers: companies.filter(company => 
          !users.some(user => user.empresa_id === company.id)
        ).length,
        averageUsersPerCompany: companies.length > 0 
          ? Math.round(users.filter(user => user.empresa_id).length / companies.length)
          : 0,
      };

      return {
        success: true,
        stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stats: {},
      };
    }
  }

  /**
   * Validar dados de empresa
   */
  validateCompanyData(companyData) {
    const errors = {};
    
    if (!companyData.nome || companyData.nome.trim().length < 2) {
      errors.nome = 'Nome da empresa deve ter pelo menos 2 caracteres';
    }
    
    if (companyData.localizacao && companyData.localizacao.trim().length < 2) {
      errors.localizacao = 'Localização deve ter pelo menos 2 caracteres';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Verificar se empresa pode ser excluída
   */
  async canDeleteCompany(id) {
    try {
      const usersResponse = await apiService.get(ENDPOINTS.USERS);
      const users = usersResponse.data?.usuarios || [];
      const hasUsers = users.some(user => user.empresa_id === id);
      
      return {
        canDelete: !hasUsers,
        reason: hasUsers ? 'Empresa possui usuários associados' : null,
      };
    } catch (error) {
      return {
        canDelete: false,
        reason: 'Erro ao verificar usuários associados',
      };
    }
  }
}

export default new CompanyService();