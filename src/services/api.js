import { API_CONFIG, STORAGE_KEYS, MESSAGES } from '../utils/constants';

/**
 * Classe para gerenciar todas as requisições HTTP
 */
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = API_CONFIG.HEADERS;
  }

  /**
   * Obter token de autenticação do localStorage
   */
  getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Preparar headers da requisição
   */
  prepareHeaders(customHeaders = {}) {
    const token = this.getAuthToken();
    const headers = {
      ...this.defaultHeaders,
      ...customHeaders,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Tratamento de erros HTTP
   */
  handleError(error, response) {
    if (!response) {
      throw new Error(MESSAGES.ERROR.NETWORK);
    }

    const { status } = response;

    switch (status) {
      case 400:
        throw new Error(error.message || MESSAGES.ERROR.VALIDATION);
      case 401:
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
        throw new Error(MESSAGES.ERROR.UNAUTHORIZED);
      case 403:
        throw new Error(MESSAGES.ERROR.FORBIDDEN);
      case 404:
        throw new Error(MESSAGES.ERROR.NOT_FOUND);
      case 500:
      default:
        throw new Error(error.message || MESSAGES.ERROR.GENERIC);
    }
  }

  /**
   * Método base para fazer requisições HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: this.prepareHeaders(options.headers),
      ...options,
    };

    // Adicionar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      let data = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        this.handleError(data, response);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Tempo limite da requisição excedido');
      }
      
      if (error.message) {
        throw error;
      }
      
      throw new Error(MESSAGES.ERROR.NETWORK);
    }
  }

  /**
   * Métodos HTTP específicos
   */
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    
    return this.request(url);
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Upload de arquivos
   */
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Não definir Content-Type para FormData (o browser define automaticamente)
        ...this.prepareHeaders(),
        'Content-Type': undefined,
      },
    });
  }

  /**
   * Download de arquivos
   */
  async download(endpoint, filename) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.prepareHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer download do arquivo');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Verificar status da API
   */
  async healthCheck() {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Exportar instância única (Singleton)
export default new ApiService();