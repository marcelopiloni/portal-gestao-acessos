const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Middleware para verificar o token JWT
exports.authenticate = async (req, res, next) => {
  try {
    // Verificar se o header de autorização existe
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Não autorizado. Token não fornecido.' 
      });
    }

    // Extrair e verificar o token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se o usuário existe
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Usuário não existe ou token inválido.' 
      });
    }

    // Verificar status do usuário
    if (usuario.status !== 'aprovado') {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso negado. Usuário não aprovado.'
      });
    }

    // Adicionar dados do usuário ao request
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Token inválido.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Token expirado.' 
      });
    }
    
    next(error);
  }
};