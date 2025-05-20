const { Log } = require('../models');

// Função para registrar ações no log
const logAction = async (userId, action) => {
  try {
    await Log.create({
      usuario_id: userId,
      acao: action,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};

module.exports = { logAction };