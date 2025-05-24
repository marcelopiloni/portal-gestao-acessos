import { VALIDATION_RULES } from './constants';

/**
 * Validadores para formulários
 */

/**
 * Validar campo obrigatório
 */
export const required = (value, fieldName = 'Campo') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} é obrigatório`;
  }
  return null;
};

/**
 * Validar email
 */
export const email = (value) => {
  if (!value) return null;
  
  if (!VALIDATION_RULES.EMAIL.PATTERN.test(value)) {
    return VALIDATION_RULES.EMAIL.MESSAGE;
  }
  return null;
};

/**
 * Validar senha
 */
export const password = (value) => {
  if (!value) return null;
  
  if (value.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return VALIDATION_RULES.PASSWORD.MESSAGE;
  }
  return null;
};

/**
 * Validar confirmação de senha
 */
export const confirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return null;
  
  if (password !== confirmPassword) {
    return 'Senhas não coincidem';
  }
  return null;
};

/**
 * Validar nome
 */
export const name = (value) => {
  if (!value) return null;
  
  if (value.trim().length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    return VALIDATION_RULES.NAME.MESSAGE;
  }
  return null;
};

/**
 * Validar nome da empresa
 */
export const companyName = (value) => {
  if (!value) return null;
  
  if (value.trim().length < VALIDATION_RULES.COMPANY.MIN_LENGTH) {
    return VALIDATION_RULES.COMPANY.MESSAGE;
  }
  return null;
};

/**
 * Validar múltiplos campos
 */
export const validateFields = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    
    for (const rule of fieldRules) {
      const error = rule(data[field]);
      if (error) {
        errors[field] = error;
        break; // Para na primeira validação que falhar
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validações específicas para usuário
 */
export const validateUser = (userData, isEditing = false) => {
  const rules = {
    nome: [required, name],
    email: [required, email],
    role: (value) => required(value, 'Função')
  };
  
  // Senha obrigatória apenas na criação
  if (!isEditing) {
    rules.senha = [required, password];
    rules.confirmSenha = (value) => confirmPassword(userData.senha, value);
  } else if (userData.senha) {
    // Se senha foi preenchida na edição, validar
    rules.senha = [password];
    rules.confirmSenha = (value) => confirmPassword(userData.senha, value);
  }
  
  return validateFields(userData, rules);
};

/**
 * Validações específicas para empresa
 */
export const validateCompany = (companyData) => {
  const rules = {
    nome: [required, companyName]
  };
  
  return validateFields(companyData, rules);
};

/**
 * Validações específicas para login
 */
export const validateLogin = (loginData) => {
  const rules = {
    email: [required, email],
    senha: (value) => required(value, 'Senha')
  };
  
  return validateFields(loginData, rules);
};