/**
 * Funções utilitárias auxiliares
 */

/**
 * Formatar data no padrão brasileiro
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('pt-BR', defaultOptions);
};

/**
 * Formatar data e hora
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obter tempo relativo (ex: "2 horas atrás")
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now - target) / 1000);
  
  const intervals = {
    ano: 31536000,
    mês: 2592000,
    semana: 604800,
    dia: 86400,
    hora: 3600,
    minuto: 60
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} atrás`;
    }
  }
  
  return 'Agora mesmo';
};

/**
 * Capitalizar primeira letra
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalizar cada palavra
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Gerar iniciais de um nome
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Validar email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Gerar cor baseada em string (para avatares)
 */
export const getColorFromString = (str) => {
  if (!str) return '#ccc';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#AED581', '#FFB74D', '#F06292'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Copiar texto para clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback para browsers mais antigos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Download de arquivo
 */
export const downloadFile = (content, filename, contentType = 'text/plain') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Formatar número de bytes para formato legível
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Gerar ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Remover acentos de uma string
 */
export const removeAccents = (str) => {
  if (!str) return '';
  
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Busca fuzzy (busca aproximada)
 */
export const fuzzySearch = (needle, haystack) => {
  if (!needle || !haystack) return false;
  
  const needleLower = removeAccents(needle.toLowerCase());
  const haystackLower = removeAccents(haystack.toLowerCase());
  
  return haystackLower.includes(needleLower);
};

/**
 * Filtrar array de objetos por múltiplos campos
 */
export const filterObjects = (objects, searchTerm, fields) => {
  if (!searchTerm) return objects;
  
  return objects.filter(obj => 
    fields.some(field => {
      const value = getNestedValue(obj, field);
      return fuzzySearch(searchTerm, String(value));
    })
  );
};

/**
 * Obter valor aninhado de um objeto (ex: "user.company.name")
 */
export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Ordenar array de objetos
 */
export const sortObjects = (objects, field, direction = 'asc') => {
  return [...objects].sort((a, b) => {
    const aValue = getNestedValue(a, field);
    const bValue = getNestedValue(b, field);
    
    // Tratamento para valores nulos/undefined
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;
    
    // Comparação
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue, 'pt-BR', { numeric: true });
    } else {
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
};

/**
 * Paginar array
 */
export const paginate = (array, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return {
    items: array.slice(startIndex, endIndex),
    totalPages: Math.ceil(array.length / itemsPerPage),
    currentPage: page,
    totalItems: array.length,
    hasNextPage: endIndex < array.length,
    hasPrevPage: startIndex > 0
  };
};

/**
 * Agrupar array por campo
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = getNestedValue(item, key);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

/**
 * Aguardar por um tempo determinado
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry de função com backoff exponencial
 */
export const retry = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

/**
 * Truncar texto
 */
export const truncate = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Verificar se é dispositivo móvel
 */
export const isMobile = () => {
  return window.innerWidth <= 768;
};

/**
 * Verificar se é dispositivo touch
 */
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Obter informações do navegador
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  
  const browsers = {
    chrome: /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor),
    firefox: /Firefox/.test(userAgent),
    safari: /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor),
    edge: /Edge/.test(userAgent),
    ie: /Trident/.test(userAgent)
  };
  
  const browserName = Object.keys(browsers).find(key => browsers[key]) || 'unknown';
  
  return {
    name: browserName,
    userAgent,
    language: navigator.language,
    platform: navigator.platform
  };
};

/**
 * Calcular hash simples de string
 */
export const hashString = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
};

/**
 * Comparar duas versões (ex: "1.2.3" vs "1.2.4")
 */
export const compareVersions = (version1, version2) => {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  const maxLength = Math.max(v1parts.length, v2parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
};

/**
 * Escape HTML para prevenir XSS
 */
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Parse de query string
 */
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
};

/**
 * Construir query string
 */
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

/**
 * Deep clone de objeto
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

/**
 * Verificar se objetos são iguais (shallow comparison)
 */
export const shallowEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => obj1[key] === obj2[key]);
};

/**
 * Mesclar objetos profundamente
 */
export const deepMerge = (target, source) => {
  const result = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] != null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  });
  
  return result;
};