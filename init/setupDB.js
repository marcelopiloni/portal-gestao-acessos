require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { Usuario, Empresa } = require('../models');

// Script para inicializar o banco de dados com dados iniciais
const setupDatabase = async () => {
  try {
    // Sincronizar modelos com o banco de dados
    await sequelize.sync({ force: true });
    console.log('Banco de dados sincronizado');

    // Criar empresa padrão
    const empresa = await Empresa.create({
      nome: 'Empresa Padrão',
      localizacao: 'São Paulo, Brasil'
    });
    console.log('Empresa padrão criada');

    // Criar usuário administrador
    const senhaHash = await bcrypt.hash('admin123', 12);
    await Usuario.create({
      nome: 'Administrador',
      email: 'admin@example.com',
      senha_hash: senhaHash,
      role: 'admin',
      status: 'aprovado',
      empresa_id: empresa.id,
      criado_em: new Date()
    });
    console.log('Usuário administrador criado');

    console.log('Inicialização concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
};

setupDatabase();