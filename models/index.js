const Usuario = require('./Usuario');
const Empresa = require('./Empresa');
const Log = require('./Log');

// Define relationships
Empresa.hasMany(Usuario, { 
  foreignKey: 'empresa_id',
  as: 'usuarios' 
});

Usuario.belongsTo(Empresa, { 
  foreignKey: 'empresa_id',
  as: 'empresa' 
});

Usuario.hasMany(Log, { 
  foreignKey: 'usuario_id',
  as: 'logs' 
});

Log.belongsTo(Usuario, { 
  foreignKey: 'usuario_id',
  as: 'usuario' 
});

module.exports = {
  Usuario,
  Empresa,
  Log
};