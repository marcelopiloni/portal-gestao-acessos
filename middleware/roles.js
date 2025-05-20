// Middleware para verificar permissões baseadas em papéis
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'Não autorizado. Faça login primeiro.'
      });
    }

    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso negado. Você não tem permissão para esta ação.'
      });
    }

    next();
  };
};

// Middleware para verificar se usuário é da mesma empresa
exports.sameCompany = async (req, res, next) => {
  try {
    const usuarioId = parseInt(req.params.id);
    
    // Admin pode acessar qualquer usuário
    if (req.usuario.role === 'admin') {
      return next();
    }
    
    // Se o ID do parâmetro for o mesmo do usuário logado, permitir acesso
    if (req.usuario.id === usuarioId) {
      return next();
    }
    
    // Para gerentes, verificar se o usuário alvo é da mesma empresa
    if (req.usuario.role === 'gerente') {
      const { Usuario } = require('../models');
      const targetUser = await Usuario.findByPk(usuarioId);
      
      if (!targetUser) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuário não encontrado'
        });
      }
      
      if (targetUser.empresa_id !== req.usuario.empresa_id) {
        return res.status(403).json({
          status: 'error',
          message: 'Acesso negado. Usuário não pertence à sua empresa.'
        });
      }
      
      return next();
    }
    
    // Operadores não podem acessar outros usuários
    return res.status(403).json({
      status: 'error',
      message: 'Acesso negado. Permissão insuficiente.'
    });
  } catch (error) {
    next(error);
  }
};