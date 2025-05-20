const { Empresa, Usuario } = require('../models');
const { logAction } = require('../utils/logger');

// Listar todas as empresas
exports.getEmpresas = async (req, res, next) => {
  try {
    const empresas = await Empresa.findAll();

    await logAction(req.usuario.id, 'Listagem de empresas');

    res.status(200).json({
      status: 'success',
      results: empresas.length,
      data: { empresas }
    });
  } catch (error) {
    next(error);
  }
};

// Obter uma empresa específica
exports.getEmpresa = async (req, res, next) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id, {
      include: [{ 
        model: Usuario, 
        as: 'usuarios',
        attributes: ['id', 'nome', 'email', 'role', 'status']
      }]
    });

    if (!empresa) {
      return res.status(404).json({
        status: 'error',
        message: 'Empresa não encontrada'
      });
    }

    await logAction(req.usuario.id, `Visualização da empresa ${empresa.id}`);

    res.status(200).json({
      status: 'success',
      data: { empresa }
    });
  } catch (error) {
    next(error);
  }
};

// Criar uma nova empresa
exports.createEmpresa = async (req, res, next) => {
  try {
    const { nome, localizacao } = req.body;

    const novaEmpresa = await Empresa.create({
      nome,
      localizacao
    });

    await logAction(req.usuario.id, `Criação da empresa ${novaEmpresa.id}`);

    res.status(201).json({
      status: 'success',
      data: { empresa: novaEmpresa }
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar uma empresa
exports.updateEmpresa = async (req, res, next) => {
  try {
    const { nome, localizacao } = req.body;

    const empresa = await Empresa.findByPk(req.params.id);

    if (!empresa) {
      return res.status(404).json({
        status: 'error',
        message: 'Empresa não encontrada'
      });
    }

    // Atualizar empresa
    empresa.nome = nome || empresa.nome;
    empresa.localizacao = localizacao || empresa.localizacao;
    
    await empresa.save();

    await logAction(req.usuario.id, `Atualização da empresa ${empresa.id}`);

    res.status(200).json({
      status: 'success',
      data: { empresa }
    });
  } catch (error) {
    next(error);
  }
};

// Excluir uma empresa
exports.deleteEmpresa = async (req, res, next) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);

    if (!empresa) {
      return res.status(404).json({
        status: 'error',
        message: 'Empresa não encontrada'
      });
    }

    // Verificar se há usuários associados
    const usuariosAssociados = await Usuario.count({ 
      where: { empresa_id: empresa.id } 
    });

    if (usuariosAssociados > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Não é possível excluir a empresa porque existem usuários associados a ela'
      });
    }

    await empresa.destroy();

    await logAction(req.usuario.id, `Exclusão da empresa ${req.params.id}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};