const { Usuario, Empresa } = require('../models');
const { logAction } = require('../utils/logger');

// Obter informações do usuário logado
exports.getMe = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      include: [{ model: Empresa, as: 'empresa' }],
      attributes: { exclude: ['senha_hash'] }
    });

    res.status(200).json({
      status: 'success',
      data: { usuario }
    });
  } catch (error) {
    next(error);
  }
};

// Listar todos os usuários (com filtragem por empresa para gerentes)
exports.getUsuarios = async (req, res, next) => {
  try {
    let where = {};
    
    // Filtrar por empresa para gerentes
    if (req.usuario.role === 'gerente') {
      where.empresa_id = req.usuario.empresa_id;
    }
    
    const usuarios = await Usuario.findAll({
      where,
      include: [{ model: Empresa, as: 'empresa' }],
      attributes: { exclude: ['senha_hash'] }
    });

    await logAction(req.usuario.id, 'Listagem de usuários');

    res.status(200).json({
      status: 'success',
      results: usuarios.length,
      data: { usuarios }
    });
  } catch (error) {
    next(error);
  }
};

// Obter um usuário específico
exports.getUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Empresa, as: 'empresa' }],
      attributes: { exclude: ['senha_hash'] }
    });

    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    // Verificar permissões
    if (req.usuario.role === 'gerente' && usuario.empresa_id !== req.usuario.empresa_id) {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso negado. Usuário não pertence à sua empresa.'
      });
    }

    if (req.usuario.role === 'operador' && usuario.id !== req.usuario.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso negado. Você só pode visualizar seu próprio perfil.'
      });
    }

    await logAction(req.usuario.id, `Visualização do usuário ${usuario.id}`);

    res.status(200).json({
      status: 'success',
      data: { usuario }
    });
  } catch (error) {
    next(error);
  }
};

// Aprovar ou rejeitar um usuário
exports.aprovarUsuario = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['aprovado', 'rejeitado'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status inválido. Use "aprovado" ou "rejeitado".'
      });
    }
    
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }
    
    // Atualizar status
    usuario.status = status;
    await usuario.save();
    
    await logAction(
      req.usuario.id, 
      `${status === 'aprovado' ? 'Aprovação' : 'Rejeição'} do usuário ${usuario.id}`
    );
    
    res.status(200).json({
      status: 'success',
      message: `Usuário ${status === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso`,
      data: { 
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          status: usuario.status
        } 
      }
    });
  } catch (error) {
    next(error);
  }
};

// Associar usuário a uma empresa
exports.associarEmpresa = async (req, res, next) => {
  try {
    const { empresa_id } = req.body;
    
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se a empresa existe
    if (empresa_id) {
      const empresa = await Empresa.findByPk(empresa_id);
      if (!empresa) {
        return res.status(404).json({
          status: 'error',
          message: 'Empresa não encontrada'
        });
      }
    }
    
    // Atualizar empresa
    usuario.empresa_id = empresa_id;
    await usuario.save();
    
    await logAction(
      req.usuario.id, 
      `Associação do usuário ${usuario.id} à empresa ${empresa_id || 'nenhuma'}`
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Usuário associado à empresa com sucesso',
      data: { 
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          empresa_id: usuario.empresa_id
        } 
      }
    });
  } catch (error) {
    next(error);
  }
};