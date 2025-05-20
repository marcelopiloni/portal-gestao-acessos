const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'gerente', 'operador'),
    allowNull: false,
    defaultValue: 'operador'
  },
  status: {
    type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado'),
    allowNull: false,
    defaultValue: 'pendente'
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.senha_hash) {
        usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, 12);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('senha_hash')) {
        usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, 12);
      }
    }
  }
});

// Instance method to check password
Usuario.prototype.verificarSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha_hash);
};

module.exports = Usuario;