const { Log, Usuario } = require('../models');

// Listar logs (com filtros opcionais)
exports.getLogs = async (req, res, next) => {
  try {
    let where = {};
    const { usuario_id, acao, data_inicio, data_fim } = req.query;
    
    // Aplicar filtros
    if (usuario_id) where.usuario_id = usuario_id;
    if (acao) where.acao = acao;
    
    // Filtro por data
    if (data_inicio || data_fim) {
      where.timestamp = {};
      if (data_inicio) where.timestamp.$gte = new Date(data_inicio);
      if (data_fim) where.timestamp.$lte = new Date(data_fim);
    }
    
    // Restrição para gerentes - ver apenas logs de usuários da sua empresa
    if (req.usuario.role === 'gerente') {
      const usuariosDaEmpresa = await Usuario.findAll({
        where: { empresa_id: req.usuario.empresa_id },
        attributes: ['id']
      });
      
      const idsUsuarios = usuariosDaEmpresa.map(u => u.id);
      where.usuario_id = idsUsuarios;
    }
    
    // Restrição para operadores - ver apenas seus próprios logs
    if (req.usuario.role === 'operador') {
      where.usuario_id = req.usuario.id;
    }
    
    const logs = await Log.findAll({
      where,
      include: [{ 
        model: Usuario, 
        as: 'usuario',
        attributes: ['id', 'nome', 'email', 'role'] 
      }],
      order: [['timestamp', 'DESC']]
    });
    
    res.status(200).json({
      status: 'success',
      results: logs.length,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};