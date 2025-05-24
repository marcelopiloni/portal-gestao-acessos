import { useState, useEffect, useCallback } from 'react';
import { useNotification } from './useNotification';

/**
 * Hook personalizado para gerenciar requisições de API
 */
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useNotification();

  const {
    immediate = true,
    onSuccess,
    onError,
    showErrorNotification = true
  } = options;

  const execute = useCallback(async (...params) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...params);
      
      if (result.success) {
        setData(result.data || result);
        onSuccess?.(result);
        return result;
      } else {
        const errorMessage = result.error || 'Erro na requisição';
        setError(errorMessage);
        
        if (showErrorNotification) {
          showError(errorMessage);
        }
        
        onError?.(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro inesperado';
      setError(errorMessage);
      
      if (showErrorNotification) {
        showError(errorMessage);
      }
      
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showError, showErrorNotification]);

  const refresh = useCallback(() => {
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refresh,
    reset
  };
};

/**
 * Hook para operações CRUD
 */
export const useCrud = (service, options = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();

  const {
    showSuccessNotifications = true,
    showErrorNotifications = true
  } = options;

  const loadItems = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const result = await service.getAll(filters);
      if (result.success) {
        setItems(result.data || result.items || []);
        setError(null);
      } else {
        setError(result.error);
        if (showErrorNotifications) {
          showError(result.error);
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar dados';
      setError(errorMessage);
      if (showErrorNotifications) {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [service, showError, showErrorNotifications]);

  const createItem = useCallback(async (itemData) => {
    try {
      const result = await service.create(itemData);
      if (result.success) {
        setItems(prev => [...prev, result.data]);
        if (showSuccessNotifications) {
          showSuccess('Item criado com sucesso!');
        }
        return result;
      } else {
        if (showErrorNotifications) {
          showError(result.error);
        }
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao criar item';
      if (showErrorNotifications) {
        showError(errorMessage);
      }
      throw err;
    }
  }, [service, showSuccess, showError, showSuccessNotifications, showErrorNotifications]);

  const updateItem = useCallback(async (id, itemData) => {
    try {
      const result = await service.update(id, itemData);
      if (result.success) {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, ...result.data } : item
        ));
        if (showSuccessNotifications) {
          showSuccess('Item atualizado com sucesso!');
        }
        return result;
      } else {
        if (showErrorNotifications) {
          showError(result.error);
        }
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar item';
      if (showErrorNotifications) {
        showError(errorMessage);
      }
      throw err;
    }
  }, [service, showSuccess, showError, showSuccessNotifications, showErrorNotifications]);

  const deleteItem = useCallback(async (id) => {
    try {
      const result = await service.delete(id);
      if (result.success) {
        setItems(prev => prev.filter(item => item.id !== id));
        if (showSuccessNotifications) {
          showSuccess('Item excluído com sucesso!');
        }
        return result;
      } else {
        if (showErrorNotifications) {
          showError(result.error);
        }
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao excluir item';
      if (showErrorNotifications) {
        showError(errorMessage);
      }
      throw err;
    }
  }, [service, showSuccess, showError, showSuccessNotifications, showErrorNotifications]);

  return {
    items,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    refresh: loadItems
  };
};

/**
 * Hook para paginação
 */
export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};